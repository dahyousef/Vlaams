/* Le faux navigateur, en UN exemplaire.

   Il y en avait six, un par suite, et ils avaient divergé : un seul connaissait
   la reconnaissance vocale, un seul la visibilité de l'onglet, deux truquaient
   l'horloge chacun à sa façon. Un test qui passe parce que SON navigateur ne
   sait pas faire ce que le vrai fait ne prouve rien.

   Tout est éteint par défaut : chaque suite allume ce dont elle a besoin, et ce
   qu'elle allume se lit en tête de fichier.

     const browser = require('./lib/browser');
     browser.SEED        la graine des suites ; SEED=… dans l'environnement en rejoue une autre
     browser.UA          des userAgent nommés : OPR, EDG, IOS (Chrome sur iPhone), SAF (Safari sur iPhone)
     browser.APP         la source qui démarre l'app ; skip: [browser.APP] la laisse de côté
     browser.sources(root)  les sources de build.sh, dans son ordre
     browser.rng(seed)   un hasard qui se rejoue : la même graine, les mêmes nombres

     const B = browser.open({ root: ROOT, seed: browser.SEED, now: T0 });   ses options : au-dessus de open()
     B.NL            l'application chargée
     B.app           l'élément #app (lire B.app.innerHTML)
     B.store         le localStorage
     B.idb           le contenu de l'IndexedDB — si `idb` est donné
     B.listeners     tous les écouteurs posés, par type d'événement
     B.tap(d)        un clic sur un élément dont le dataset est d, tel que le shell le reçoit
     B.fields        la valeur de chaque champ qu'un écran lit (B.fields['add-nl'] = '…') — si `byId` vaut 'stub'
     B.clock         l'horloge : now(), set(ms), advance(ms) — si `now` est donné
     B.spoken        ce que la synthèse vocale a prononcé — si `voices` est donné
     B.tick()        la fin du tour : les minuteurs mis de côté partent — si `timers` vaut 'held'
     B.waiting()     combien de minuteurs attendent B.tick() — si `timers` vaut 'held' */
const fs = require('fs'), path = require('path'), vm = require('vm');

/* Générateur déterministe : un test qui échoue au hasard vaut moins que pas de
   test du tout. La graine rend chaque exécution reproductible, en local comme
   en CI, et un échec devient donc un vrai signal. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = Number(process.env.SEED || 20260917);

const UA = {
  OPR: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 OPR/106.0',
  EDG: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 Edg/120.0',
  /* iPhone : Chrome est Safari par-dessous et n'a pas de reconnaissance. */
  IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120 Mobile/15E148 Safari/604.1',
  SAF: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
};

/* Un IndexedDB minimal, sur demande seulement (opts.idb). Des magasins clé →
   valeur ; la clé est prise dans l'objet (keyPath) ou générée (autoIncrement,
   jamais remise à zéro par clear, comme le vrai) ; getAll rend les valeurs dans
   l'ordre des clés. Chaque requête s'applique au moment où elle est faite, donc
   dans l'ordre, et répond plus tard ; écrire dans une transaction en lecture
   seule ou ouvrir un magasin absent échoue. Ni curseur, ni index, ni
   annulation de transaction : l'app ne s'en sert pas. Donner le même objet à
   une seconde page, c'est recharger : le contenu survit. */
function fakeIndexedDB(data) {
  const copy = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const later = fn => { Promise.resolve().then(fn); };
  const request = run => {
    const r = { result: undefined, error: null, onsuccess: null, onerror: null };
    try { r.result = run(); later(() => { if (r.onsuccess) r.onsuccess({ target: r }); }); }
    catch (e) { r.error = e; later(() => { if (r.onerror) r.onerror({ target: r }); }); }
    return r;
  };
  const inKeyOrder = rows => [...rows.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(e => copy(e[1]));
  return {
    open(name, version) {
      const base = data[name] || (data[name] = { version: 0, stores: {} });
      const conn = {
        objectStoreNames: { contains: n => !!base.stores[n] },
        createObjectStore(n, o) { base.stores[n] = { keyPath: (o && o.keyPath) || null, seq: 0, rows: new Map() }; },
        transaction(names, mode) {
          [].concat(names).forEach(n => { if (!base.stores[n]) throw new Error('NotFoundError: ' + n); });
          return {
            objectStore(n) {
              const s = base.stores[n];
              const write = fn => () => { if (mode !== 'readwrite') throw new Error('ReadOnlyError'); return fn(); };
              return {
                get: k => request(() => copy(s.rows.get(k))),
                getAll: () => request(() => inKeyOrder(s.rows)),
                put: v => request(write(() => { const k = s.keyPath ? v[s.keyPath] : ++s.seq; s.rows.set(k, copy(v)); return k; })),
                delete: k => request(write(() => { s.rows.delete(k); })),
                clear: () => request(write(() => { s.rows.clear(); }))
              };
            }
          };
        }
      };
      const r = { result: conn, error: null, onsuccess: null, onerror: null, onupgradeneeded: null };
      later(() => {
        if (version > base.version) { base.version = version; if (r.onupgradeneeded) r.onupgradeneeded({ target: r }); }
        if (r.onsuccess) r.onsuccess({ target: r });
      });
      return r;
    }
  };
}

/* L'ordre de chargement est celui de build.sh, lu dans build.sh : une seule liste. */
const sources = root => fs.readFileSync(path.join(root, 'build.sh'), 'utf8')
  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);

/* La source qui démarre l'app, la dernière de build.sh. Une suite qui ne veut que le cours
   et l'état la laisse de côté (skip: [browser.APP]), et prepare passe juste avant elle. */
const APP = 'src/app.js';

/* opts :
     root       dossier du dépôt (obligatoire)
     files      liste de sources à charger ; par défaut, celle de build.sh
     skip       sources à ne pas charger (ex. [browser.APP] : le cours et l'état, sans l'app)
     prepare    fonction (NL), appelée une fois les autres sources chargées, juste avant
                src/app.js : la suite y change le cours ou l'état avant le démarrage. Une page
                qui ne charge pas src/app.js n'a pas ce moment : le demander échoue
     seed       graine de Math.random ; absente, le hasard est le vrai
     now        horloge de départ en ms ; absente, l'horloge est la vraie
     timers     'sync' (défaut) : setTimeout s'exécute tout de suite ; 'real' : le vrai ;
                'held' : il attend B.tick(), comme un vrai minuteur attend la fin du tour
     onTimerError  ce que devient une erreur dans un minuteur 'sync' (défaut : elle est ignorée) ;
                avec un autre mode, open() échoue ('held' laisse l'erreur sortir de B.tick())
     ua         navigator.userAgent
     voices     tableau de voix → speechSynthesis existe ; absent, il n'existe pas
     recogniser true → webkitSpeechRecognition existe (ctx.__saidNext, ctx.__denyNext)
     media      true → micro (refusé), MediaRecorder, presse-papiers, FileReader
     blobs      true → Blob, URL, Audio
     framed     true → la page tourne dans un cadre (window.top n'est pas window)
     byId       'stub' : getElementById rend un champ pour tout identifiant, de valeur B.fields[id] ; défaut : null
     location   champs ajoutés à location
     store      un localStorage existant (rechargement de page)
     idb        true → un IndexedDB vide ; un objet → celui d'une page précédente (B.idb) ;
                absent, indexedDB n'existe pas et l'app se rabat sur localStorage
     config     window.NL_CONFIG ; supabase : window.supabase */
function open(opts) {
  const store = opts.store || {};
  const idb = opts.idb ? (opts.idb === true ? {} : opts.idb) : null;
  const listeners = {};
  const spoken = [];
  const listen = (t, f) => { (listeners[t] = listeners[t] || []).push(f); };

  function mkEl(tag) {
    return {
      tagName: (tag || 'div').toUpperCase(), innerHTML: '', value: '', disabled: false,
      scrollTop: 0, dataset: {}, files: [], style: {}, children: [],
      classList: { _s: new Set(), contains(n) { return this._s.has(n); }, add(n) { this._s.add(n); }, remove(n) { this._s.delete(n); } },
      addEventListener: listen,
      removeEventListener() {}, setSelectionRange() {}, focus() {}, select() {}, click() {},
      setAttribute() {}, removeAttribute() {}, remove() {}, appendChild() {},
      insertAdjacentHTML() {}, matches: () => false, closest: () => null, contains: () => true,
      querySelector: () => null, querySelectorAll: () => [],
      getBoundingClientRect: () => ({ width: 400, height: 600, top: 0, left: 0 })
    };
  }
  const app = mkEl('div');
  const fields = {};

  const fakeClock = opts.now != null;
  const clock = {
    t: fakeClock ? opts.now : 0,
    now() { return fakeClock ? clock.t : Date.now(); },
    set(ms) { clock.t = ms; },
    advance(ms) { clock.t += ms; }
  };
  class FakeDate extends Date {
    constructor(...a) { if (!a.length) super(clock.t); else super(...a); }
    static now() { return clock.t; }
  }

  let M = Math;
  if (opts.seed != null) { M = Object.create(Math); M.random = rng(opts.seed); }

  /* Une erreur dans un minuteur. 'sync' le fait partir dans l'appel même à setTimeout : levée là,
     elle tomberait dans le code de l'app, ce qu'un vrai minuteur ne fait jamais ; elle est ignorée,
     ou remise à onTimerError s'il est donné. 'held' le fait partir dans tick(), que la suite
     appelle : la première erreur du tour en sort, une fois tous ses minuteurs partis, et la suite
     échoue. onTimerError ne sert qu'à 'sync' : donné avec un autre mode, open() échoue en le
     nommant, au lieu de le laisser attendre une erreur qui ne lui viendra pas. */
  const onTimerError = opts.onTimerError || (() => {});
  /* 'held' : un minuteur attend tick() et part alors avec les autres, dans l'ordre où ils ont
     été posés ; clearTimeout le retire, même pendant tick(). Un minuteur posé pendant tick()
     attend le suivant. Un mode inconnu échoue ici, en se nommant, au lieu de devenir 'sync'. */
  const held = new Map();
  let lastTimer = 0;
  const tick = () => {
    const errors = [];
    Array.from(held.keys()).forEach(id => {
      const f = held.get(id);
      if (held.delete(id)) { try { f(); } catch (e) { errors.push(e); } }
    });
    if (errors.length) throw errors[0];
  };
  const waiting = () => held.size;
  const modes = {
    sync: { set: f => { try { f(); } catch (e) { onTimerError(e); } return 0; }, clear: () => {} },
    held: { set: f => { held.set(++lastTimer, f); return lastTimer; }, clear: id => { held.delete(id); } },
    real: { set: setTimeout, clear: clearTimeout }
  };
  const timers = modes[opts.timers || 'sync'];
  if (!timers) throw new Error('browser.open : le mode de minuteurs « ' + opts.timers + ' » n\'existe pas (' + Object.keys(modes).join(', ') + ')');
  if (opts.onTimerError && timers !== modes.sync) throw new Error('browser.open : onTimerError ne sert qu\'aux minuteurs \'sync\', pas aux minuteurs « ' + opts.timers + ' »');

  const ctx = {
    console,
    setTimeout: timers.set,
    clearTimeout: timers.clear,
    setInterval: () => 0, clearInterval() {}, requestAnimationFrame: f => f(),
    Math: M, Date: fakeClock ? FakeDate : Date,
    JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    navigator: { onLine: true },
    location: Object.assign({ hash: '', protocol: 'https:', origin: 'https://vlaams.example', pathname: '/' }, opts.location || {}),
    document: {
      readyState: 'complete', visibilityState: 'visible',
      documentElement: { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; } },
      getElementById: id => (id === 'app' ? app : opts.byId === 'stub' ? Object.assign(mkEl('input'), { value: fields[id] || '' }) : null),
      querySelector: () => null, querySelectorAll: () => [],
      addEventListener: listen,
      activeElement: { tagName: 'BODY' }, createElement: mkEl, body: { appendChild() {} },
      execCommand: () => true
    },
    addEventListener: listen, removeEventListener() {}
  };
  if (opts.ua) ctx.navigator.userAgent = opts.ua;

  if (opts.voices) {
    ctx.speechSynthesis = {
      getVoices: () => opts.voices,
      speak: u => { spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); if (u.onend) u.onend(); },
      cancel() {}, addEventListener() {}
    };
    ctx.SpeechSynthesisUtterance = function (t) { this.text = t; };
  }
  if (opts.blobs || opts.media) {
    ctx.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
    ctx.Blob = function (parts) { this.size = (parts && parts[0] || '').length; };
    ctx.Audio = function () { return { play: () => Promise.resolve(), onended: null }; };
  }
  if (opts.media) {
    ctx.FileReader = function () { this.readAsText = () => { if (this.onload) this.onload(); }; };
    ctx.navigator.mediaDevices = { getUserMedia: () => Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })) };
    ctx.navigator.clipboard = { writeText: () => Promise.resolve() };
    ctx.MediaRecorder = function () {};
  }
  /* iOS expose l'API même là où elle ne marche pas : le stub aussi. */
  if (opts.recogniser) {
    ctx.webkitSpeechRecognition = function () {
      this.start = () => {
        /* Le navigateur refuse le micro : erreur puis fin, comme Chrome et Edge. */
        if (ctx.__denyNext) {
          ctx.__denyNext = false;
          if (this.onerror) this.onerror({ error: 'not-allowed' });
          if (this.onend) this.onend();
          return;
        }
        const said = ctx.__saidNext || '';
        if (this.onresult) this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: said }], { isFinal: true, length: 1 })] });
        if (this.onend) this.onend();
      };
      this.abort = () => {};
    };
  }
  if (idb) ctx.indexedDB = fakeIndexedDB(idb);
  if (opts.config) ctx.NL_CONFIG = opts.config;
  if (opts.supabase) ctx.supabase = opts.supabase;

  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  ctx.top = opts.framed ? {} : ctx;
  vm.createContext(ctx);

  const skip = opts.skip || [];
  const files = (opts.files || sources(opts.root)).filter(f => skip.indexOf(f) < 0);
  if (opts.prepare && files.indexOf(APP) < 0) throw new Error('browser.open : prepare attend ' + APP + ', que cette page ne charge pas');
  files.forEach(f => {
    if (f === APP && opts.prepare) opts.prepare(ctx.NL);
    try { vm.runInContext(fs.readFileSync(path.join(opts.root, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
  });

  const tap = d => (listeners.click || []).forEach(f => f({ target: { closest: () => ({ dataset: d }) } }));

  return { ctx, NL: ctx.NL, app, store, idb, listeners, spoken, clock, mkEl, tap, tick, waiting, fields, random: M.random };
}

module.exports = { open, rng, sources, UA, SEED, APP };
