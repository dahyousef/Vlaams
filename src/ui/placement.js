/* Le test de placement, en échelle et non en éventail.
   L'ancienne version étalait 20 questions sur 12 unités : une seule bonne réponse
   sur quatre choix — 25% au hasard — créditait une unité entière. D'où douze
   unités à 33% avec « 0 élément bien ancré ».
   Ici on monte unité par unité : 4 questions, 3 bonnes pour créditer, arrêt à la
   première échouée. Le hasard passe une unité 5% du temps au lieu de 75%, et
   trois d'affilée une fois sur huit mille. */
NL.screens.placement = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;
  const PER_UNIT = 4, TO_PASS = 3, SEED_RUNG = 3;
  let T = null;

  function begin() {
    T = { ui: 0, q: [], at: 0, hits: 0, credited: [], seeded: 0, phase: 'ask', sel: null, done: false, asked: 0 };
    loadUnit();
  }

  function loadUnit() {
    const u = NL.content.units[T.ui];
    if (!u) return finish();
    const pool = NL.content.itemsOf(u.id).filter(i => i.kind !== 'pattern');
    if (pool.length < PER_UNIT) return finish();
    /* La dernière question se tape : reconnaître parmi quatre ne prouve pas
       qu'on sait le mot. Un mot simple, pour que ce soit un test et non une dictée. */
    const typeable = U.shuffle(pool.filter(i => i.kind === 'word' && U.tiles(U.bare(i.nl)).length === 1));
    const typed = typeable[0] || null;
    T.q = U.sample(pool.filter(i => i !== typed), PER_UNIT - (typed ? 1 : 0)).concat(typed ? [typed] : []);
    T.typedAt = typed ? PER_UNIT - 1 : -1;
    T.at = 0; T.hits = 0; T.phase = 'ask'; T.sel = null;
    buildOpts();
  }

  const isTyped = () => T.at === T.typedAt;

  function buildOpts() {
    const it = T.q[T.at];
    T.input = ''; T.typedOk = null;
    /* Même règle que les exercices : aucun leurre ne peut être une autre bonne
       réponse. « collega » existe dans deux unités, et « collègue » affiché deux
       fois dont un compté faux ferait échouer une unité à tort. */
    const right = U.bareFr(it.fr);
    const pool = NL.content.allItems().filter(x =>
      x.id !== it.id && x.kind === it.kind && x.unit !== 'eigen' &&
      U.norm(U.bareFr(x.fr)) !== U.norm(right) && !NL.ex.sameSense(x, it));
    const wrong = [];
    U.shuffle(pool).forEach(x => {
      const l = U.bareFr(x.fr);
      if (wrong.length < 3 && !wrong.some(w => U.norm(w) === U.norm(l))) wrong.push(l);
    });
    T.opts = U.shuffle([{ label: right, ok: true }].concat(wrong.map(l => ({ label: l, ok: false }))));
    T.sel = null;
  }

  function answer(i) {
    T.sel = i; T.phase = 'shown'; T.asked++;
    if ((T.opts[i] || {}).ok) { T.hits++; NL.audio.ok(); } else NL.audio.no();
    NL.ui.render();
  }

  function submitTyped() {
    if (!T.input.trim()) return;
    const target = U.bare(T.q[T.at].nl);
    T.typedOk = U.typedOk(T.input, target);
    T.phase = 'shown'; T.asked++;
    if (T.typedOk) { T.hits++; NL.audio.ok(); } else NL.audio.no();
    NL.ui.render();
  }

  function next() {
    T.at++;
    if (T.at < T.q.length) { T.phase = 'ask'; buildOpts(); NL.ui.render(); return; }
    /* Bilan de l'unité : créditée, ou fin du test. */
    if (T.hits >= TO_PASS) {
      const u = NL.content.units[T.ui];
      NL.content.itemsOf(u.id).forEach(it => {
        if (it.kind === 'pattern' || NL.state.rec(it.id)) return;
        NL.srs.seed(it, Math.min(SEED_RUNG, NL.srs.maxRung(it)));
        T.seeded++;
      });
      T.credited.push(u);
      T.ui++;
      loadUnit();
      NL.ui.render();
      return;
    }
    finish();
  }

  function finish() {
    T.done = true;
    NL.state.setMeta({ placed: true });
    NL.audio.win();
    NL.ui.render();
  }

  function render() {
    if (!T) begin();
    if (T.done) return summary();
    const it = T.q[T.at];
    const u = NL.content.units[T.ui];
    const pct = Math.round(T.at / T.q.length * 100);

    return '<div class="lesson">' +
      '<div class="lesson-head">' +
      '<button class="iconbtn" data-act="exit" aria-label="' + t.quitYes + '">' + NL.ui.I.x + '</button>' +
      '<div class="rail"><div class="rail-fill" style="width:' + Math.max(pct, 4) + '%"></div></div>' +
      '<span class="pill">' + (T.at + 1) + '/' + PER_UNIT + '</span></div>' +
      '<div class="lesson-body"><div class="stage">' +
      '<div class="kicker"><span class="sub">' + esc(u.name) + ' · ' + t.placeEyebrow + '</span>' + (isTyped() ? t.placeTypeQ : t.placeQ) + '</div>' +
      (isTyped() ? typedBody(it) : choiceBody(it)) +
      '<p class="place-note">' + t.placeRule(TO_PASS, PER_UNIT) + '</p>' +
      '</div></div>' +
      '<div class="foot"><div class="foot-in">' +
      (T.phase === 'shown'
        ? '<button class="btn btn-primary push" data-act="next">' + t.next + '</button>'
        : '<button class="btn btn-ghost" data-act="dunno">' + t.dunno + '</button>' +
          (isTyped() ? '<button class="btn btn-primary push" data-act="submit"' + (T.input.trim() ? '' : ' disabled') + '>' + t.placeSubmit + '</button>' : '')) +
      '</div></div></div>';
  }

  function typedBody(it) {
    const target = U.bare(it.nl);
    return '<p class="sentence prompt">' + esc(U.bareFr(it.fr)) + '</p>' +
      '<input class="textin" id="place-in" type="text" value="' + esc(T.input) + '" autocomplete="off" autocapitalize="off" ' +
      'spellcheck="false" placeholder="' + t.typeHere + '"' + (T.phase === 'shown' ? ' disabled' : '') + '>' +
      (T.phase === 'shown'
        ? '<p class="place-verdict ' + (T.typedOk ? 'ok' : 'no') + '">' + (T.typedOk ? U.one(t.praise) : t.wrongTitle) + ' <b>' + esc(target) + '</b></p>'
        : '');
  }

  function choiceBody(it) {
    return NL.ex.speakerRow(U.bare(it.nl), { show: true, be: it.be }) +
      '<div class="opts">' + T.opts.map((o, i) => {
        let cls = '';
        if (T.phase === 'shown') { if (o.ok) cls = ' ok'; else if (T.sel === i) cls = ' no'; }
        return '<button class="opt' + cls + '" data-opt="' + i + '"' + (T.phase === 'shown' ? ' disabled' : '') + '>' +
          '<span class="opt-key">' + (i + 1) + '</span><span>' + esc(o.label) + '</span></button>';
      }).join('') + '</div>';
  }

  function summary() {
    const n = T.credited.length;
    /* On repart de l'unité ÉCHOUÉE, pas de la dernière réussie ; et si tout est
       passé, il n'y a pas d'arrêt à annoncer. */
    const stopAt = NL.content.units[T.ui];
    const where = stopAt ? t.placeStops(esc(stopAt.name)) : t.placeAll(n);
    return '<div class="lesson"><div class="lesson-body"><div class="stage done-stage">' +
      '<div class="done-mark">\u{1F4CF}</div>' +
      '<h2>' + (n === 0 ? t.placeLow : n >= 4 ? t.placeHigh : t.placeMid) + '</h2>' +
      '<p class="done-sub">' + (n === 0
        ? t.placeNone
        : t.placeSeeded(T.seeded) + ' ' + where) + '</p>' +
      '<div class="tally">' +
      '<div class="tally-box blue"><div class="t-n">' + n + '</div><div class="t-l">' + t.placeUnits + '</div></div>' +
      '<div class="tally-box gold"><div class="t-n">' + T.seeded + '</div><div class="t-l">' + t.placeAdvanced + '</div></div>' +
      '<div class="tally-box green"><div class="t-n">' + T.asked + '</div><div class="t-l">' + t.placeAsked + '</div></div>' +
      '</div>' +
      '<button class="btn btn-primary wide" data-act="go">' + t.placeFirst + '</button>' +
      '<button class="btn btn-ghost wide" data-go="vandaag">' + t.placeLater + '</button>' +
      '</div></div></div>';
  }

  return {
    render,
    click(el, d) {
      if (d.act === 'exit') { T = null; NL.ui.go('vandaag'); return; }
      if (d.act === 'go') { T = null; NL.screens.sessie.begin('vandaag'); NL.ui.go('sessie'); return; }
      if (d.act === 'next') { next(); return; }
      if (d.act === 'dunno') { T.phase = 'shown'; T.sel = -1; T.typedOk = false; T.asked++; NL.audio.no(); NL.ui.render(); return; }
      if (d.act === 'submit' && T.phase === 'ask') { submitTyped(); return; }
      if (d.opt !== undefined && T.phase === 'ask') answer(+d.opt);
    },
    input(el) {
      if (!T || el.id !== 'place-in') return;
      const had = !!T.input.trim();
      T.input = el.value;
      const b = document.querySelector('[data-act="submit"]');
      if (b && had !== !!T.input.trim()) b.disabled = !T.input.trim();
    },
    after() {
      const inp = document.getElementById('place-in');
      if (inp && T && T.phase === 'ask') { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    },
    key(e) {
      if (!T || T.done) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (T.phase === 'ask' && isTyped()) { submitTyped(); return; }
        const b = document.querySelector('[data-act="next"]'); if (b) b.click(); return;
      }
      if (document.activeElement && document.activeElement.id === 'place-in') return;
      if (/^[1-4]$/.test(e.key) && T.phase === 'ask') {
        const b = document.querySelector('[data-opt="' + (+e.key - 1) + '"]'); if (b) b.click();
      }
    },
    reset() { T = null; },
    /* Read-only, for the headless tests. */
    peek: () => (T && !T.done ? { item: T.q[T.at], opts: T.opts, typed: isTyped(), hits: T.hits, credited: T.credited.length } : null)
  };
})();
