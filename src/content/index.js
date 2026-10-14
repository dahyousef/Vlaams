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
        flat.push(Object.assign({}, g, { unit: u.id, level: u.level, track: u.track, kind: 'pattern',
          open: (NL.content.openTasks || {})[g.id] || null }));
      });
    });
    NL.state.customs().forEach(c => flat.push(Object.assign({}, c, { kind: c.kind || 'word', unit: 'eigen', level: 'eigen', track: 'eigen' })));
    /* Palier par défaut, et détection des mots transparents : « de tram »,
       « de garage », « direct » sont offerts à un francophone. */
    flat.forEach(it => {
      it.tier = it.tier || 'produce';
      it.cognate = it.kind === 'word' &&
        NL.util.ratio(NL.util.bare(it.nl), NL.util.bareFr(it.fr)) > 0.62;
    });
    index = new Map(flat.map(it => [it.id, it]));
  }

  const allItems = () => { if (!flat) build(); return flat; };
  const refresh = () => { flat = null; index = null; };
  const byId = id => { if (!index) build(); return index.get(id) || null; };
  const unit = id => NL.content.units.find(u => u.id === id) || null;
  const itemsOf = uid => allItems().filter(it => it.unit === uid);

  /* Deux comptes, et pas de troisième. Rencontré : l'élément a été vu au moins
     une fois. Produit : il a passé l'échelon de l'écrit — en tenant compte du
     palier, puisqu'un mot du palier « reconnaître » plafonne à l'échelon 2. */
  const MET = it => NL.srs.stageOf(it) >= 0;
  const PRODUCED = it => NL.srs.stageOf(it) >= Math.min(NL.srs.PRODUCE, NL.srs.maxRung(it));

  /* Une unité ouvre la suivante quand les trois quarts de ses éléments ont été
     RENCONTRÉS. Le seuil portait sur un échelon qui demande au moins deux jours
     de bonnes réponses : une unité entièrement rencontrée n'ouvrait pas la
     suivante, et il ne restait alors rien de neuf à servir. */
  const GATE = 0.75;
  const gateSize = n => Math.ceil(n * GATE);

  const unitComplete = uid => {
    const items = itemsOf(uid);
    return items.filter(MET).length >= gateSize(items.length);
  };

  /* La frontière : on remonte depuis la première unité tant qu'elle est faite ;
     la première inachevée est la dernière ouverte. L'intervalle ouvert est donc
     contigu PAR CONSTRUCTION — « unité 10 fermée, 11 ouverte » devient
     impossible à produire, et pas seulement corrigé. */
  function frontier() {
    const us = NL.content.units;
    let i = 0;
    while (i < us.length - 1 && unitComplete(us[i].id)) i++;
    /* Une unité ouverte le reste : la frontière ne recule jamais, et le
       maximum atteint reste contigu. */
    const reached = Math.min(NL.state.meta().reached || 0, us.length - 1);
    if (i > reached) { NL.state.setMeta({ reached: i }); return i; }
    return reached;
  }

  function unitOpen(uid) {
    if (uid === 'eigen') return true;
    const i = NL.content.units.findIndex(u => u.id === uid);
    return i >= 0 && i <= frontier();
  }

  /* Des comptes, jamais de pourcentage : un compte bouge tous les jours, et ne
     peut pas être exact et muet à la fois. Voir docs/adr/0002.
       toOpen = combien d'éléments restent à rencontrer avant l'unité suivante */
  function unitProgress(uid) {
    const items = itemsOf(uid);
    const met = items.filter(MET).length;
    return {
      met, produce: items.filter(PRODUCED).length, total: items.length,
      toOpen: Math.max(0, gateSize(items.length) - met)
    };
  }

  function courseProgress() {
    const items = allItems().filter(it => it.unit !== 'eigen');
    return {
      met: items.filter(MET).length, produce: items.filter(PRODUCED).length, total: items.length,
      current: NL.content.units[frontier()] || null
    };
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

  Object.assign(NL.content, { allItems, refresh, byId, unit, itemsOf, unitOpen, unitComplete, frontier, unitProgress, courseProgress, met: MET, produced: PRODUCED, scenario, listenClips, fill, DEFAULTS });
})();
