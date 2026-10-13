/* Persistence. IndexedDB with an in-memory mirror so rendering stays synchronous,
   and a localStorage fallback for browsers or modes where IDB is unavailable. */
NL.state = (function () {
  'use strict';
  /* Storage keys deliberately keep their original spelling: renaming them would
     orphan every database and every backup file already out there. */
  const DB = 'vlaams-onderweg', VER = 1;
  const STORES = ['srs', 'meta', 'log', 'custom'];
  let db = null, useIDB = false;

  const LS = 'vlaams/fallback';
  const mem = { srs: new Map(), custom: new Map(), log: [] };

  const defaults = () => ({
    xp: 0, streak: 0, best: 0, lastDay: null, theme: 'system',
    placed: false, dailyGoal: 20, doneToday: 0, doneDay: null,
    mic: true, autoplay: true, showFlemish: true, unlocked: 1,
    scenariosDone: [], listenDone: [], firstRun: true,
    learnerName: '', town: '', company: '',
    pace: 'normal', exDay: null, exToday: 0, dataVersion: 3, lastEx: null,
    reached: 0,                // index of the furthest unit ever opened; never goes back
    resetAt: 0                 // l'instant de la dernière remise à zéro ; tout ce qui est plus ancien est effacé
  });
  let meta = defaults();

  /* Le journal garde deux mois de réponses au rythme le plus soutenu : c'est ce
     que l'écran des fautes relit. */
  const LOG_KEEP = 12000;

  /* Tout ce qui a été appris avec l'ancien moteur — retours à douze minutes,
     unités créditées par le test de niveau — est antérieur à cet instant. La
     date est FIXE, et non « maintenant » : un second appareil qui migre un jour
     plus tard effacerait sinon ce que le premier a appris entre-temps. */
  const ENGINE_EPOCH = Date.UTC(2026, 9, 13);

  /* Une seule fois par appareil : la progression de l'ancien moteur est effacée,
     ici et sur le serveur. Réglages, score et mots personnels survivent. */
  function migrate() {
    if ((meta.dataVersion || 1) >= 3) return false;
    const had = [...mem.srs.values()].some(r => (r.updatedAt || 0) < ENGINE_EPOCH);
    resetProgress(ENGINE_EPOCH);
    setMeta({ dataVersion: 3 });
    return had;
  }

  /* Remet la PROGRESSION à zéro : les fiches, le journal des réponses, la
     frontière, et les conversations et écoutes cochées — repartir de zéro en
     gardant « six conversations faites », ce n'est pas repartir de zéro.
     Réglages, score et mots personnels restent.
       before   n'efface que ce qui est antérieur à cet instant (défaut : tout)
       silent   la remise à zéro vient du serveur : elle n'y repart pas
     L'instant est gardé dans les réglages (resetAt) : c'est lui qui dit aux
     autres appareils que leur copie est périmée. */
  function resetProgress(before, silent) {
    const cut = before || Date.now();
    [...mem.srs.values()].forEach(r => { if ((r.updatedAt || 0) < cut) mem.srs.delete(r.id); });
    mem.log = mem.log.filter(l => l.t >= cut);
    if (useIDB) {
      try {
        const s = db.transaction('srs', 'readwrite').objectStore('srs');
        s.clear(); mem.srs.forEach(r => s.put(r));
        const l = db.transaction('log', 'readwrite').objectStore('log');
        l.clear(); mem.log.forEach(e => l.put(e));
      } catch (e) {}
    }
    setMeta({
      resetAt: Math.max(meta.resetAt || 0, cut), reached: 0, exDay: null, exToday: 0,
      scenariosDone: [], listenDone: []
    }, silent);
    if (!silent) emit('reset', cut);
  }

  function open() {
    return new Promise(resolve => {
      let req;
      try { req = indexedDB.open(DB, VER); } catch (e) { return resolve(loadLS()); }
      if (!req) return resolve(loadLS());
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('srs')) d.createObjectStore('srs', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('log')) d.createObjectStore('log', { autoIncrement: true });
        if (!d.objectStoreNames.contains('custom')) d.createObjectStore('custom', { keyPath: 'id' });
      };
      req.onerror = () => resolve(loadLS());
      req.onsuccess = e => {
        db = e.target.result; useIDB = true;
        Promise.all([all('srs'), all('custom'), get('meta', 'meta'), all('log')]).then(([s, c, m, l]) => {
          s.forEach(r => mem.srs.set(r.id, r));
          c.forEach(r => mem.custom.set(r.id, r));
          /* Le journal était enregistré mais jamais relu : le graphique de la
             semaine ne montrait que la séance en cours. */
          mem.log = (l || []).slice(-LOG_KEEP);
          if (m && m.v) meta = Object.assign(defaults(), m.v);
          resolve();
        }).catch(() => resolve(loadLS()));
      };
    });
  }

  function loadLS() {
    useIDB = false;
    try {
      const raw = JSON.parse(localStorage.getItem(LS) || '{}');
      (raw.srs || []).forEach(r => mem.srs.set(r.id, r));
      (raw.custom || []).forEach(r => mem.custom.set(r.id, r));
      if (raw.meta) meta = Object.assign(defaults(), raw.meta);
    } catch (e) { /* private mode: run from memory only */ }
  }
  const saveLS = NL.util.debounce(() => {
    if (useIDB) return;
    try {
      localStorage.setItem(LS, JSON.stringify({
        srs: [...mem.srs.values()], custom: [...mem.custom.values()], meta
      }));
    } catch (e) {}
  }, 400);

  const tx = (store, mode) => db.transaction(store, mode).objectStore(store);
  function get(store, key) {
    return new Promise((res, rej) => { const r = tx(store, 'readonly').get(key); r.onsuccess = () => res(r.result); r.onerror = rej; });
  }
  function all(store) {
    return new Promise((res, rej) => { const r = tx(store, 'readonly').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = rej; });
  }
  function put(store, val) {
    if (!useIDB) { saveLS(); return Promise.resolve(); }
    return new Promise(res => { const r = tx(store, 'readwrite').put(val); r.onsuccess = res; r.onerror = res; });
  }
  function clearAll() {
    mem.srs.clear(); mem.custom.clear(); mem.log = []; meta = defaults();
    if (!useIDB) { try { localStorage.removeItem(LS); } catch (e) {} return Promise.resolve(); }
    return Promise.all(STORES.map(s => new Promise(res => {
      const r = db.transaction(s, 'readwrite').objectStore(s).clear(); r.onsuccess = res; r.onerror = res;
    })));
  }

  /* ---- abonnés aux écritures ----
     La synchro écoute ici. Une écriture « silencieuse » vient du serveur : elle
     est appliquée localement sans être renvoyée, sinon chaque tirage deviendrait
     un envoi et deux appareils se renverraient la balle à l'infini. */
  const listeners = [];
  const onWrite = fn => listeners.push(fn);
  const emit = (type, value) => listeners.forEach(fn => { try { fn(type, value); } catch (e) {} });

  /* ---- SRS records ---- */
  const rec = id => mem.srs.get(id) || null;
  function setRec(r, silent) {
    if (!silent) r.updatedAt = Date.now();
    mem.srs.set(r.id, r); put('srs', r); saveLS();
    if (!silent) emit('rec', r);
  }
  const allRecs = () => [...mem.srs.values()];
  const seenCount = () => mem.srs.size;

  /* ---- meta ---- */
  const m = () => meta;
  function setMeta(patch, silent) {
    Object.assign(meta, patch);
    if (!silent) meta.updatedAt = Date.now();
    put('meta', { k: 'meta', v: meta }); saveLS();
    if (!silent) emit('meta', meta);
  }

  /* ---- review log, for the stats strip ---- */
  function logReview(entry, silent) {
    mem.log.push(entry);
    if (mem.log.length > LOG_KEEP) mem.log.shift();
    if (useIDB) { try { db.transaction('log', 'readwrite').objectStore('log').put(entry); } catch (e) {} }
    if (!silent) emit('log', entry);
  }
  const logs = () => mem.log;

  /* ---- user's own words ---- */
  function addCustom(w) {
    const r = Object.assign({ id: 'x-' + Date.now().toString(36), kind: 'word', unit: 'eigen', level: 'eigen' }, w);
    return putCustom(r);
  }
  function putCustom(r, silent) {
    if (!silent) r.updatedAt = Date.now();
    mem.custom.set(r.id, r); put('custom', r); saveLS();
    if (!silent) emit('custom', r);
    return r;
  }
  function delCustom(id, silent) {
    mem.custom.delete(id); mem.srs.delete(id);
    if (useIDB) {
      try { db.transaction('custom', 'readwrite').objectStore('custom').delete(id); } catch (e) {}
      try { db.transaction('srs', 'readwrite').objectStore('srs').delete(id); } catch (e) {}
    }
    saveLS();
    if (!silent) emit('custom-del', id);
  }
  const customs = () => [...mem.custom.values()];

  /* ---- backup ----
     Moving from the artifact URL to a hosted one is a different origin, which
     means a different database and an empty one. Without this, months of reviews
     vanish on the move. */
  function exportAll() {
    return {
      app: 'vlaams-onderweg', v: 1, at: Date.now(),
      meta, srs: [...mem.srs.values()], custom: [...mem.custom.values()],
      log: mem.log.slice(-2000)
    };
  }
  function importAll(data) {
    if (!data || data.app !== 'vlaams-onderweg' || !Array.isArray(data.srs)) return false;
    /* Restaurer une sauvegarde est une remise à zéro suivie d'un rechargement :
       les fiches sont datées de maintenant, sinon les autres appareils les
       prendraient pour de la progression effacée. */
    const stamp = Date.now();
    mem.srs.clear(); mem.custom.clear();
    data.srs.forEach(r => { if (r && r.id) { r.updatedAt = stamp; mem.srs.set(r.id, r); put('srs', r); } });
    (data.custom || []).forEach(r => { if (r && r.id) { mem.custom.set(r.id, r); put('custom', r); } });
    if (data.meta) meta = Object.assign(defaults(), data.meta);
    meta.resetAt = stamp; meta.updatedAt = stamp;
    put('meta', { k: 'meta', v: meta });
    mem.log = Array.isArray(data.log) ? data.log : [];
    saveLS();
    emit('reset', stamp);
    return true;
  }

  /* ---- day accounting ---- */
  function touchDay() {
    const d = NL.util.dayKey();
    if (meta.doneDay !== d) setMeta({ doneDay: d, doneToday: 0 });
  }
  function creditDay(newItems) {
    const d = NL.util.dayKey();
    const n = Math.max(1, newItems == null ? 1 : newItems);
    const patch = { doneDay: d, doneToday: (meta.doneDay === d ? meta.doneToday : 0) + n };
    if (meta.lastDay !== d) {
      patch.streak = (meta.lastDay && NL.util.dayDiff(meta.lastDay, d) === 1) ? meta.streak + 1 : 1;
      patch.lastDay = d;
      patch.best = Math.max(meta.best || 0, patch.streak);
    }
    setMeta(patch);
  }

  return { open, migrate, resetProgress, ENGINE_EPOCH, onWrite, rec, setRec, allRecs, seenCount, meta: m, setMeta, logReview, logs, addCustom, putCustom, delCustom, customs, clearAll, touchDay, creditDay, exportAll, importAll, get storage() { return useIDB ? 'IndexedDB' : 'localStorage'; } };
})();
