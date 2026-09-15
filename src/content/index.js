/* Flattens the curriculum into addressable items and answers questions about
   progress. Every learnable thing gets a stable id; the scheduler works in ids. */
NL.content = NL.content || {};
(function () {
  'use strict';
  let flat = null, index = null, RAW = null;

  /* The course ships neutral so it can live in a public repository, and becomes
     yours through three settings. Content carries {naam}, {stad} and {bedrijf};
     they are substituted once, here, so no screen has to think about it. */
  const DEFAULTS = { naam: 'Tom', stad: 'Gent', bedrijf: 'Novatech' };
  function fill(s) {
    if (typeof s !== 'string' || s.indexOf('{') < 0) return s;
    const m = NL.state.meta();
    return s
      .replace(/\{naam\}/g, m.learnerName || DEFAULTS.naam)
      .replace(/\{stad\}/g, m.town || DEFAULTS.stad)
      .replace(/\{bedrijf\}/g, m.company || DEFAULTS.bedrijf);
  }
  function deepFill(v) {
    if (typeof v === 'string') return fill(v);
    if (Array.isArray(v)) return v.map(deepFill);
    if (v && typeof v === 'object') {
      const o = {};
      Object.keys(v).forEach(k => { o[k] = deepFill(v[k]); });
      return o;
    }
    return v;
  }
  const TOKENED = ['units', 'patterns', 'scenarios', 'sheets', 'hetRules'];

  function build() {
    if (!RAW) {
      RAW = {};
      TOKENED.forEach(k => { RAW[k] = JSON.parse(JSON.stringify(NL.content[k] || [])); });
    }
    TOKENED.forEach(k => { NL.content[k] = deepFill(RAW[k]); });

    flat = [];
    /* A pattern can be referenced by several units; it belongs to the first one
       that teaches it, and must appear exactly once or it gets drilled twice. */
    const claimed = new Set();
    NL.content.units.forEach(u => {
      (u.words || []).forEach((w, i) => flat.push(Object.assign({}, w, {
        id: u.id + ':w' + i, unit: u.id, level: u.level, track: u.track, kind: 'word'
      })));
      (u.phrases || []).forEach((p, i) => flat.push(Object.assign({}, p, {
        id: u.id + ':p' + i, unit: u.id, level: u.level, track: u.track, kind: 'phrase'
      })));
      (u.grammar || []).forEach(gid => {
        if (claimed.has(gid)) return;
        const g = (NL.content.patterns || []).find(x => x.id === gid);
        if (!g) return;
        claimed.add(gid);
        flat.push(Object.assign({}, g, { unit: u.id, level: u.level, track: u.track, kind: 'pattern' }));
      });
    });
    NL.state.customs().forEach(c => flat.push(Object.assign({}, c, { kind: c.kind || 'word', unit: 'eigen', level: 'eigen', track: 'eigen' })));
    index = new Map(flat.map(it => [it.id, it]));
  }

  const allItems = () => { if (!flat) build(); return flat; };
  const refresh = () => { flat = null; index = null; };
  const byId = id => { if (!index) build(); return index.get(id) || null; };
  const unit = id => NL.content.units.find(u => u.id === id) || null;
  const itemsOf = uid => allItems().filter(it => it.unit === uid);

  /* A unit opens once most of the one before it has been met at least once. */
  function unitOpen(uid) {
    if (uid === 'eigen') return true;
    const i = NL.content.units.findIndex(u => u.id === uid);
    if (i <= 0) return i === 0;
    const prev = NL.content.units[i - 1];
    const items = itemsOf(prev.id);
    if (!items.length) return true;
    const met = items.filter(it => NL.srs.stageOf(it) >= 1).length;
    return met / items.length >= 0.8;
  }

  function unitProgress(uid) {
    const items = itemsOf(uid);
    if (!items.length) return { pct: 0, seen: 0, strong: 0, total: 0 };
    let seen = 0, strong = 0, sum = 0;
    items.forEach(it => {
      const s = NL.srs.stageOf(it);
      if (s >= 0) seen++;
      if (s >= NL.srs.GRADUATED) strong++;
      sum += Math.max(0, s);
    });
    return { pct: Math.round(sum / (items.length * NL.srs.MAX_STAGE) * 100), seen, strong, total: items.length };
  }

  function courseProgress() {
    const items = allItems().filter(it => it.unit !== 'eigen');
    let sum = 0, strong = 0;
    items.forEach(it => {
      const s = Math.max(0, NL.srs.stageOf(it));
      sum += s;
      if (s >= NL.srs.GRADUATED) strong++;
    });
    return { pct: Math.round(sum / (items.length * NL.srs.MAX_STAGE) * 100), strong, total: items.length };
  }

  const scenario = id => (NL.content.scenarios || []).find(s => s.id === id) || null;

  /* Listening material is generated from what the scenarios already say, so
     comprehension practice always uses sentences a real person would utter. */
  function listenClips() {
    const out = [];
    (NL.content.scenarios || []).forEach(s => {
      s.steps.forEach((st, i) => {
        if (!st.them) return;
        out.push({
          id: s.id + ':l' + i, nl: st.them.nl, be: st.them.be || st.them.nl, fr: st.them.fr,
          from: s.title, icon: s.icon, track: s.track
        });
      });
    });
    return out;
  }

  Object.assign(NL.content, { allItems, refresh, byId, unit, itemsOf, unitOpen, unitProgress, courseProgress, scenario, listenClips, fill, DEFAULTS });
})();
