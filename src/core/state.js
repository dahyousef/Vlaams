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

  /* Tout ce qui a été appris avec l'ancien moteur — retours à douze minutes,
     unités créditées par le test de niveau — est antérieur à cet instant. La
     date est FIXE, et non « maintenant » : un second appareil qui migre un jour
     plus tard effacerait sinon ce que le premier a appris entre-temps. C'est
     aussi un plancher : tout appareil de cette version naît après la migration. */
  const ENGINE_EPOCH = Date.UTC(2026, 9, 13);

  const defaults = () => ({
    xp: 0, streak: 0, best: 0, lastDay: null, theme: 'system',
    placed: false, dailyGoal: 20, doneToday: 0, doneDay: null,
    mic: true, autoplay: true, showFlemish: true, unlocked: 1,
    scenariosDone: [], listenDone: [], firstRun: true,
    learnerName: '', town: '', company: '',
    pace: 'normal', exDay: null, exToday: 0, dataVersion: 3, lastEx: null,
    reached: 0,                // index of the furthest unit ever opened; never goes back
    resetAt: ENGINE_EPOCH,     // l'instant de la dernière remise à zéro ; ce qui descend d'une plus ancienne est effacé
    progress: { reached: 0, scenariosDone: [], listenDone: [] }   // la copie de confiance, voir setMeta
  });
  let meta = defaults();

  /* Le journal garde deux mois de réponses au rythme le plus soutenu : c'est ce
     que l'écran des fautes relit. */
  const LOG_KEEP = 12000;

  const progressOf = x => ({
    reached: x.reached || 0,
    scenariosDone: (x.scenariosDone || []).slice(), listenDone: (x.listenDone || []).slice()
  });

  /* La progression de l'ancien moteur est effacée, ici et sur le serveur.
     Réglages, score et mots personnels survivent.
     dataVersion ne suffit pas à dire si c'est fait : la version précédente
     recopie les réglages d'un appareil qui a migré sans rien effacer chez elle.
     Ce sont donc les données qui le disent. Une fiche ou une ligne de journal
     qui descend d'avant le plancher — sans `base`, elle vient de la version
     précédente — est effacée ; une frontière ou des listes qui ne sont plus
     égales à `progress` ont été réécrites par la version précédente, et
     reprennent la copie de confiance. Rend vrai quand quelque chose a été
     effacé ; la seconde fois, il n'y a plus rien à effacer. */
  function migrate() {
    const floor = Math.max(meta.resetAt || 0, ENGINE_EPOCH);
    const old = x => (x.base || 0) < floor;
    const trusted = progressOf(meta.progress || {});
    const rewritten = JSON.stringify(progressOf(meta)) !== JSON.stringify(trusted);
    const had = rewritten || [...mem.srs.values()].some(old) || mem.log.some(old);
    if (had) drop(floor);
    if (had || (meta.dataVersion || 1) < 3 || (meta.resetAt || 0) < floor) {
      setMeta(Object.assign({ dataVersion: 3, resetAt: floor }, trusted));
    }
    /* Le serveur n'efface que ce qui précède l'époque, jamais une date plus
       récente : ce qu'un autre appareil a appris depuis sur ce moteur reste. */
    if (had) emit('reset', ENGINE_EPOCH);
    return had;
  }

  /* Remet la PROGRESSION à zéro : les fiches, le journal des réponses, la
     frontière, et les conversations et écoutes cochées — repartir de zéro en
     gardant « six conversations faites », ce n'est pas repartir de zéro.
     Réglages, score et mots personnels restent, et le compteur du jour aussi :
     une remise à zéro efface la progression, pas l'effort déjà fait aujourd'hui.
       before  n'efface que ce qui descend d'une remise à zéro antérieure à cet instant (défaut : tout)
       silent   la remise à zéro vient du serveur : elle n'y repart pas
     L'instant est gardé dans les réglages (resetAt) : c'est lui qui dit aux
     autres appareils que leur copie est périmée. */
  function resetProgress(before, silent) {
    const cut = before || Date.now();
    drop(cut);
    setMeta({
      resetAt: Math.max(meta.resetAt || 0, cut), reached: 0, scenariosDone: [], listenDone: []
    }, silent);
    if (!silent) emit('reset', cut);
  }

  /* La coupe se fait sur `base`, la remise à zéro dont chaque fiche et chaque
     ligne descend, et non sur sa date : un appareil périmé qui répond hors
     ligne après une remise à zéro faite ailleurs écrit des fiches datées
     d'après, mais bâties sur des échelons effacés. Sans `base`, une donnée vient
     de la version précédente : elle compte pour 0. */
  function drop(cut) {
    [...mem.srs.values()].forEach(r => { if ((r.base || 0) < cut) mem.srs.delete(r.id); });
    mem.log = mem.log.filter(l => (l.base || 0) >= cut);
    rewrite();
  }
  /* withCustom : les mots personnels aussi (une restauration les remplace ; une
     remise à zéro les garde). */
  function rewrite(withCustom) {
    if (useIDB) {
      try {
        const s = db.transaction('srs', 'readwrite').objectStore('srs');
        s.clear(); mem.srs.forEach(r => s.put(r));
        const l = db.transaction('log', 'readwrite').objectStore('log');
        l.clear(); mem.log.forEach(e => l.put(e));
        if (withCustom) {
          const c = db.transaction('custom', 'readwrite').objectStore('custom');
          c.clear(); mem.custom.forEach(r => c.put(r));
        }
      } catch (e) {}
    }
    saveLS();
  }

  /* Une progression anonyme rejoint un compte telle quelle : elle descend
     désormais de la dernière remise à zéro du compte. L'instant peut reculer,
     et c'est voulu : une remise à zéro faite ici sans compte ne devient pas
     celle du compte. Silencieux : la synchro envoie tout juste après. */
  function rebase(at) {
    mem.srs.forEach(r => { r.base = at; });
    mem.log.forEach(l => { l.base = at; });
    rewrite();
    setMeta({ resetAt: at }, true);
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
      /* Le journal aussi : sans lui, « Ce qui résiste » repartait vide à chaque
         rechargement sur le repli. */
      mem.log = (raw.log || []).slice(-LOG_KEEP);
    } catch (e) { /* private mode: run from memory only */ }
  }
  /* Le repli n'a que quelques Mo : il ne garde que les dernières lignes du journal. */
  const LS_LOG_KEEP = 3000;
  const saveLS = NL.util.debounce(() => {
    if (useIDB) return;
    try {
      localStorage.setItem(LS, JSON.stringify({
        srs: [...mem.srs.values()], custom: [...mem.custom.values()], meta,
        log: mem.log.slice(-LS_LOG_KEEP)
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
  /* La langue d'affichage est un choix de l'appareil, pas de la progression : des réglages
     reconstruits sans langue gardent celle de l'appareil. */
  const withDeviceLang = next => {
    if (!next.displayLang && meta.displayLang) next.displayLang = meta.displayLang;
    return next;
  };
  function clearAll() {
    mem.srs.clear(); mem.custom.clear(); mem.log = [];
    meta = withDeviceLang(defaults());
    const lang = meta.displayLang;
    /* La langue reste aussi sur l'appareil, pour le rechargement qui suit une déconnexion. Écrite
       en silence : sans emit ni updatedAt, elle ne passe pas devant les réglages d'un compte. */
    const keep = () => { if (lang) setMeta({ displayLang: lang }, true); };
    if (!useIDB) { try { localStorage.removeItem(LS); } catch (e) {} keep(); return Promise.resolve(); }
    return Promise.all(STORES.map(s => new Promise(res => {
      const r = db.transaction(s, 'readwrite').objectStore(s).clear(); r.onsuccess = res; r.onerror = res;
    }))).then(keep);
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
  function setRec(r, silent, at) {
    /* `base` : la remise à zéro en vigueur quand la fiche est écrite ici. Une
       fiche venue du serveur garde la sienne. `at` : l'instant dont la fiche
       date, quand ce n'est pas celui de l'écriture — un repli d'alias date de
       la plus récente des fiches qu'il replie (srs.js). */
    if (!silent) { r.updatedAt = at || Date.now(); r.base = meta.resetAt; }
    mem.srs.set(r.id, r); put('srs', r); saveLS();
    if (!silent) emit('rec', r);
  }
  const allRecs = () => [...mem.srs.values()];
  const seenCount = () => mem.srs.size;

  /* ---- meta ---- */
  const m = () => meta;
  function setMeta(patch, silent) {
    Object.assign(meta, patch);
    /* La frontière et les listes voyagent aussi dans `progress`, que seule
       cette version écrit. La version précédente la recopie telle quelle et
       réécrit le premier niveau par maximum et union : ce qu'elle a touché se
       reconnaît à ce que les deux ne sont plus égaux. */
    meta.progress = progressOf(meta);
    if (!silent) meta.updatedAt = Date.now();
    put('meta', { k: 'meta', v: meta }); saveLS();
    if (!silent) emit('meta', meta);
  }

  /* ---- review log, for the stats strip ---- */
  function logReview(entry, silent) {
    if (!silent) entry.base = meta.resetAt;
    mem.log.push(entry);
    if (mem.log.length > LOG_KEEP) mem.log.shift();
    if (useIDB) { try { db.transaction('log', 'readwrite').objectStore('log').put(entry); } catch (e) {} }
    else saveLS();
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
      log: mem.log.slice()      // tout le journal : il tient au plus LOG_KEEP lignes
    };
  }
  /* Une sauvegarde exportée avant ENGINE_EPOCH vient de l'ancien moteur : sa
     progression n'a plus de sens, et la migration l'effacerait au chargement. */
  const isOldBackup = data => !!data && (data.at || 0) < ENGINE_EPOCH;
  function importAll(data) {
    if (!data || data.app !== 'vlaams-onderweg' || !Array.isArray(data.srs)) return false;
    /* Restaurer une sauvegarde est une remise à zéro suivie d'un rechargement :
       les fiches et les lignes sont datées de maintenant et descendent de cet
       instant, sinon les autres appareils et la migration les prendraient pour
       de la progression effacée. Une sauvegarde de l'ancien moteur rend ce
       qu'une remise à zéro garde — réglages hors progression, score, mots
       personnels — et ni fiche ni ligne de journal. */
    const old = isOldBackup(data);
    const stamp = Date.now();
    mem.srs.clear(); mem.custom.clear();
    if (!old) data.srs.forEach(r => { if (r && r.id) { r.updatedAt = stamp; r.base = stamp; mem.srs.set(r.id, r); } });
    (data.custom || []).forEach(r => { if (r && r.id) mem.custom.set(r.id, r); });
    mem.log = !old && Array.isArray(data.log) ? data.log : [];
    mem.log.forEach(l => { if (l && typeof l === 'object') l.base = stamp; });
    /* Les trois magasins sont réécrits en entier : écrire les fiches restaurées
       par-dessus laissait dans IndexedDB celles d'après la sauvegarde, et
       l'ancien journal, que la migration effaçait au chargement suivant en
       annonçant que le moteur avait changé ; un mot ajouté après la sauvegarde
       revenait de même. */
    rewrite(true);
    /* Une sauvegarde d'avant la langue d'affichage n'efface pas le choix de l'appareil. */
    if (data.meta) meta = withDeviceLang(Object.assign(defaults(), data.meta));
    setMeta(Object.assign({ resetAt: stamp, updatedAt: stamp },
      old ? { dataVersion: 3, reached: 0, scenariosDone: [], listenDone: [] } : {}), true);
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

  return { open, migrate, resetProgress, rebase, ENGINE_EPOCH, onWrite, rec, setRec, allRecs, seenCount, meta: m, setMeta, logReview, logs, addCustom, putCustom, delCustom, customs, clearAll, touchDay, creditDay, exportAll, importAll, isOldBackup, get storage() { return useIDB ? 'IndexedDB' : 'localStorage'; } };
})();
