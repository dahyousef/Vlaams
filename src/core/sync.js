/* Synchronisation avec Supabase.

   L'appareil reste la source de vérité immédiate : chaque écriture part d'abord
   dans IndexedDB, comme avant, puis dans une boîte d'envoi persistée. La boîte
   se vide vers la base dès qu'il y a du réseau. Dans le train, rien ne change ;
   au retour, tout rattrape.

   Conflits : par élément, la révision la plus récente gagne. Pour les réglages,
   une fusion champ par champ — l'XP d'un appareil ne doit pas effacer celle de
   l'autre.

   Sans configuration (pas d'URL Supabase au build), tout ce module est inerte et
   l'app fonctionne en local exactement comme avant. */
NL.sync = (function () {
  'use strict';
  const cfg = window.NL_CONFIG || {};
  const lib = window.supabase;
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && lib && lib.createClient);

  const QKEY = 'vlaams/outbox';
  const OWNER = 'vlaams/owner';
  const PAGE = 1000;
  const LOG_DAYS = 45;

  let client = null, user = null;
  let state = enabled ? 'idle' : 'off';     // off | idle | syncing | error | offline
  let lastSync = null, lastError = null, timer = null, flushing = null;
  const subs = [];

  /* ---------------- boîte d'envoi ---------------- */
  const empty = () => ({ recs: {}, customs: {}, meta: false, logs: [] });
  let box = load();
  function load() {
    try { return Object.assign(empty(), JSON.parse(localStorage.getItem(QKEY) || '{}')); }
    catch (e) { return empty(); }
  }
  function persist() { try { localStorage.setItem(QKEY, JSON.stringify(box)); } catch (e) {} }
  const pending = () => Object.keys(box.recs).length + Object.keys(box.customs).length +
    (box.meta ? 1 : 0) + box.logs.length;

  const owner = () => { try { return localStorage.getItem(OWNER); } catch (e) { return null; } };
  const setOwner = id => { try { id ? localStorage.setItem(OWNER, id) : localStorage.removeItem(OWNER); } catch (e) {} };

  function notify() { subs.forEach(fn => { try { fn(status()); } catch (e) {} }); }
  const onChange = fn => subs.push(fn);

  /* Chaque écriture locale atterrit ici. On ne garde que la dernière version
     d'un élément : dix révisions hors ligne ne font qu'une ligne à envoyer. */
  NL.state.onWrite((type, v) => {
    if (!enabled) return;
    if (type === 'rec') box.recs[v.id] = 1;
    else if (type === 'meta') box.meta = true;
    else if (type === 'custom') box.customs[v.id] = 1;
    else if (type === 'custom-del') box.customs[v] = 'deleted';
    else if (type === 'log') { box.logs.push(v); if (box.logs.length > 5000) box.logs.shift(); }
    persist();
    schedule();
  });

  function queueAll() {
    NL.state.allRecs().forEach(r => { box.recs[r.id] = 1; });
    NL.state.customs().forEach(c => { box.customs[c.id] = 1; });
    NL.state.logs().forEach(l => box.logs.push(l));
    box.meta = true;
    persist();
  }

  function schedule(ms) {
    if (!user) return;
    clearTimeout(timer);
    timer = setTimeout(() => flush(), ms == null ? 2500 : ms);
  }

  /* ---------------- connexion ---------------- */
  async function init() {
    if (!enabled) return null;
    client = lib.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
    });
    client.auth.onAuthStateChange((event, session) => {
      const next = session && session.user;
      if (event === 'SIGNED_IN' && next && (!user || user.id !== next.id)) {
        user = next;
        adopt().then(() => { notify(); if (NL.ui && NL.ui.onAuth) NL.ui.onAuth(); });
      }
      if (event === 'SIGNED_OUT') { user = null; notify(); }
    });
    try {
      const { data } = await client.auth.getSession();
      user = data && data.session ? data.session.user : null;
    } catch (e) { user = null; }
    if (user) adopt().then(notify, notify);   // l'interface s'affiche sans attendre le réseau
    window.addEventListener('online', () => { state = 'idle'; notify(); flush(); });
    window.addEventListener('offline', () => { state = 'offline'; notify(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
      else if (user) pull().then(() => flush());   // retour sur l'onglet : rattraper les autres appareils
    });
    setInterval(() => flush(), 60000);
    return user;
  }

  /* Rattache les données de cet appareil au compte connecté.
     - appareil vierge ou déjà à ce compte : on tire puis on pousse ;
     - progression anonyme : elle est adoptée par le compte ;
     - un AUTRE compte avait utilisé cet appareil : ses données sont effacées
       d'abord, pour ne jamais mélanger deux personnes. */
  /* Le retour du lien magique déclenche à la fois l’événement de connexion et
     getSession : un seul rattachement par compte. */
  let adopting = null, adoptedFor = null;
  function adopt() {
    if (adoptedFor === user.id && adopting) return adopting;
    adoptedFor = user.id;
    adopting = doAdopt().catch(e => { adoptedFor = null; throw e; });
    return adopting;
  }
  async function doAdopt() {
    const prev = owner();
    if (prev && prev !== user.id) {
      await NL.state.clearAll();
      box = empty(); persist();
    } else if (!prev && NL.state.seenCount() + NL.state.customs().length > 0) {
      queueAll();
    }
    setOwner(user.id);
    await pull();
    await flush();
  }

  async function signIn(email) {
    if (!enabled) return { error: 'off' };
    const { error } = await client.auth.signInWithOtp({
      email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true }
    });
    return { error: error ? error.message : null };
  }

  /* Le code à six chiffres : indispensable quand le lien s'ouvre dans un autre
     navigateur que celui où tu l'as demandé — cas courant avec Outlook. */
  async function verifyCode(email, token) {
    if (!enabled) return { error: 'off' };
    const { data, error } = await client.auth.verifyOtp({ email, token: String(token).trim(), type: 'email' });
    if (error) return { error: error.message };
    if (data && data.user && (!user || user.id !== data.user.id)) { user = data.user; await adopt(); notify(); }
    return { error: null };
  }

  /* Déconnexion : on envoie ce qui reste, puis on efface l'appareil pour que la
     personne suivante ne voie rien. */
  async function signOut() {
    if (!enabled || !user) return;
    try { await flush(); } catch (e) {}
    await client.auth.signOut();
    await NL.state.clearAll();
    box = empty(); persist(); setOwner(null);
    user = null; adopting = null; adoptedFor = null; notify();
  }

  /* ---------------- tirer ---------------- */
  async function selectAll(table, filter) {
    const rows = [];
    for (let from = 0; ; from += PAGE) {
      let q = client.from(table).select('*');
      if (filter) q = filter(q);
      const { data, error } = await q.range(from, from + PAGE - 1);
      if (error) throw error;
      rows.push.apply(rows, data || []);
      if (!data || data.length < PAGE) return rows;
    }
  }

  async function pull() {
    if (!user) return;
    state = 'syncing'; notify();
    try {
      const recs = await selectAll('srs_records');
      recs.forEach(row => {
        const local = NL.state.rec(row.item_id);
        if (box.recs[row.item_id] && local && (local.updatedAt || 0) >= row.updated_at) return;
        if (!local || (local.updatedAt || 0) < row.updated_at) {
          NL.state.setRec(Object.assign({}, row.data, { id: row.item_id, updatedAt: row.updated_at }), true);
        }
      });

      const words = await selectAll('custom_words');
      words.forEach(row => {
        const local = NL.state.customs().find(c => c.id === row.id);
        if ((local && (local.updatedAt || 0) >= row.updated_at) || box.customs[row.id]) return;
        if (row.deleted) { if (local) NL.state.delCustom(row.id, true); }
        else NL.state.putCustom(Object.assign({}, row.data, { id: row.id, updatedAt: row.updated_at }), true);
      });

      const metaRows = await selectAll('user_meta');
      if (metaRows[0]) {
        const merged = mergeMeta(NL.state.meta(), metaRows[0].data);
        NL.state.setMeta(merged, true);
        if (JSON.stringify(merged) !== JSON.stringify(metaRows[0].data)) { box.meta = true; persist(); }
      } else {
        box.meta = true; persist();
      }

      const since = Date.now() - LOG_DAYS * 86400000;
      const have = new Set(NL.state.logs().map(l => l.t + '|' + l.id));
      const logs = await selectAll('review_log', q => q.gte('t', since));
      logs.sort((a, b) => a.t - b.t).forEach(row => {
        if (!have.has(row.t + '|' + row.item_id)) NL.state.logReview(row.data, true);
      });

      NL.content.refresh();
      done();
    } catch (e) { fail(e); }
  }

  /* ---------------- pousser ---------------- */
  function flush() {
    if (!user || !enabled) return Promise.resolve();
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { state = 'offline'; notify(); return Promise.resolve(); }
    if (flushing) return flushing;
    flushing = doFlush().finally(() => { flushing = null; });
    return flushing;
  }

  async function doFlush() {
    if (!pending()) { done(); return; }
    state = 'syncing'; notify();
    /* On prend un instantané et on vide la boîte : ce qui s'écrit PENDANT
       l'envoi repart dans une boîte neuve au lieu d'être effacé par erreur. */
    const snap = box; box = empty(); persist();
    try {
      const uid = user.id;
      const recRows = Object.keys(snap.recs).map(id => NL.state.rec(id)).filter(Boolean).map(r => ({
        user_id: uid, item_id: r.id, data: r, updated_at: r.updatedAt || Date.now()
      }));
      for (let i = 0; i < recRows.length; i += 500) {
        const { error } = await client.from('srs_records').upsert(recRows.slice(i, i + 500), { onConflict: 'user_id,item_id' });
        if (error) throw error;
      }

      const now = Date.now();
      const wordRows = Object.keys(snap.customs).map(id => {
        if (snap.customs[id] === 'deleted') return { user_id: uid, id, data: {}, deleted: true, updated_at: now };
        const c = NL.state.customs().find(x => x.id === id);
        return c ? { user_id: uid, id, data: c, deleted: false, updated_at: c.updatedAt || now } : null;
      }).filter(Boolean);
      if (wordRows.length) {
        const { error } = await client.from('custom_words').upsert(wordRows, { onConflict: 'user_id,id' });
        if (error) throw error;
      }

      if (snap.meta) {
        /* Les réglages se fusionnent avec la copie du serveur AVANT l'envoi :
           l'XP gagnée ailleurs pendant que cet appareil était hors ligne reste. */
        const { data: remote, error: readErr } = await client.from('user_meta').select('*').range(0, 0);
        if (readErr) throw readErr;
        if (remote && remote[0]) NL.state.setMeta(mergeMeta(NL.state.meta(), remote[0].data), true);
        const m = NL.state.meta();
        const { error } = await client.from('user_meta').upsert(
          { user_id: uid, data: m, updated_at: m.updatedAt || now }, { onConflict: 'user_id' });
        if (error) throw error;
      }

      const logRows = snap.logs.filter(l => l && l.id && l.t).map(l => ({ user_id: uid, t: l.t, item_id: l.id, data: l }));
      for (let i = 0; i < logRows.length; i += 500) {
        const { error } = await client.from('review_log').upsert(logRows.slice(i, i + 500),
          { onConflict: 'user_id,t,item_id', ignoreDuplicates: true });
        if (error) throw error;
      }
      done();
    } catch (e) {
      /* Échec : on remet l'instantané dans la boîte, fusionné avec ce qui est
         arrivé entre-temps. Rien n'est perdu ; on réessaie plus tard. */
      Object.assign(snap.recs, box.recs);
      Object.assign(snap.customs, box.customs);
      snap.meta = snap.meta || box.meta;
      snap.logs = snap.logs.concat(box.logs);
      box = snap; persist();
      fail(e);
      schedule(30000);
    }
  }

  function done() { state = 'idle'; lastSync = Date.now(); lastError = null; notify(); }
  function fail(e) {
    state = (typeof navigator !== 'undefined' && navigator.onLine === false) ? 'offline' : 'error';
    lastError = (e && e.message) || String(e);
    notify();
  }

  /* ---------------- fusion des réglages ---------------- */
  /* Le cumul se prend au maximum, les listes s'unissent, la série suit le jour
     le plus récent, et le reste — thème, rythme, prénom — revient à la version
     modifiée en dernier. */
  function mergeMeta(a, b) {
    a = a || {}; b = b || {};
    const newer = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
    const out = Object.assign({}, newer === a ? b : a, newer);
    out.xp = Math.max(a.xp || 0, b.xp || 0);
    out.best = Math.max(a.best || 0, b.best || 0, a.streak || 0, b.streak || 0);
    const la = a.lastDay || '', lb = b.lastDay || '';
    if (la !== lb) { const w = la > lb ? a : b; out.lastDay = w.lastDay; out.streak = w.streak; }
    else out.streak = Math.max(a.streak || 0, b.streak || 0);
    ['doneDay', 'exDay'].forEach(k => {
      const cnt = k === 'doneDay' ? 'doneToday' : 'exToday';
      const da = a[k] || '', db = b[k] || '';
      if (da === db) out[cnt] = Math.max(a[cnt] || 0, b[cnt] || 0);
      else { const w = da > db ? a : b; out[k] = w[k]; out[cnt] = w[cnt]; }
    });
    ['scenariosDone', 'listenDone'].forEach(k => {
      out[k] = Array.from(new Set([].concat(a[k] || [], b[k] || [])));
    });
    out.placed = !!(a.placed || b.placed);
    out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
    return out;
  }

  function status() {
    return { enabled, state, user: user ? { id: user.id, email: user.email } : null, pending: pending(), lastSync, lastError };
  }

  return {
    enabled, init, signIn, verifyCode, signOut, pull, flush, queueAll, status, onChange, mergeMeta,
    get user() { return user; }
  };
})();
