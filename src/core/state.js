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
    pace: 'normal', exDay: null, exToday: 0, dataVersion: 2
  });
  let meta = defaults();

  /* Une seule fois : la progression fabriquée par l'ancien test de placement
     — des unités entières créditées sur une réponse chanceuse — est effacée.
     XP, série, réglages et mots personnels survivent. */
  function migrate() {
    if ((meta.dataVersion || 1) >= 2) return false;
    mem.srs.clear();
    if (useIDB) { try { db.transaction('srs', 'readwrite').objectStore('srs').clear(); } catch (e) {} }
    setMeta({ dataVersion: 2, placed: false, exDay: null, exToday: 0 });
    return true;
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
        Promise.all([all('srs'), all('custom'), get('meta', 'meta')]).then(([s, c, m]) => {
          s.forEach(r => mem.srs.set(r.id, r));
          c.forEach(r => mem.custom.set(r.id, r));
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

  /* ---- SRS records ---- */
  const rec = id => mem.srs.get(id) || null;
  function setRec(r) { mem.srs.set(r.id, r); put('srs', r); saveLS(); }
  const allRecs = () => [...mem.srs.values()];
  const seenCount = () => mem.srs.size;

  /* ---- meta ---- */
  const m = () => meta;
  function setMeta(patch) {
    Object.assign(meta, patch);
    put('meta', { k: 'meta', v: meta }); saveLS();
  }

  /* ---- review log, for the stats strip ---- */
  function logReview(entry) {
    mem.log.push(entry);
    if (mem.log.length > 4000) mem.log.shift();
    if (useIDB) { try { db.transaction('log', 'readwrite').objectStore('log').put(entry); } catch (e) {} }
  }
  const logs = () => mem.log;

  /* ---- user's own words ---- */
  function addCustom(w) {
    const r = Object.assign({ id: 'x-' + Date.now().toString(36), kind: 'word', unit: 'eigen', level: 'eigen' }, w);
    mem.custom.set(r.id, r); put('custom', r); saveLS();
    return r;
  }
  function delCustom(id) {
    mem.custom.delete(id); mem.srs.delete(id);
    if (useIDB) {
      try { db.transaction('custom', 'readwrite').objectStore('custom').delete(id); } catch (e) {}
      try { db.transaction('srs', 'readwrite').objectStore('srs').delete(id); } catch (e) {}
    }
    saveLS();
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
    mem.srs.clear(); mem.custom.clear();
    data.srs.forEach(r => { if (r && r.id) { mem.srs.set(r.id, r); put('srs', r); } });
    (data.custom || []).forEach(r => { if (r && r.id) { mem.custom.set(r.id, r); put('custom', r); } });
    if (data.meta) { meta = Object.assign(defaults(), data.meta); put('meta', { k: 'meta', v: meta }); }
    mem.log = Array.isArray(data.log) ? data.log : [];
    saveLS();
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

  return { open, migrate, rec, setRec, allRecs, seenCount, meta: m, setMeta, logReview, logs, addCustom, delCustom, customs, clearAll, touchDay, creditDay, exportAll, importAll, get storage() { return useIDB ? 'IndexedDB' : 'localStorage'; } };
})();
