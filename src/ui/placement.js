/* The placement check. Five years of ambient Dutch means real passive vocabulary;
   this finds it and seeds the scheduler, so week one is not spent on "de man". */
NL.screens.placement = (function () {
  'use strict';
  const U = NL.util, esc = U.esc;
  let T = null;
  const N = 20;

  function begin() {
    const all = NL.content.allItems().filter(it => it.kind !== 'pattern' && it.unit !== 'eigen');
    /* Sample across the whole course, weighted to later units so the ceiling is found. */
    const byUnit = {};
    all.forEach(it => (byUnit[it.unit] = byUnit[it.unit] || []).push(it));
    const units = NL.content.units.map(u => u.id).filter(id => byUnit[id]);
    const per = Math.max(1, Math.round(N / units.length));
    let q = [];
    units.forEach(id => { q = q.concat(U.sample(byUnit[id], per)); });
    q = U.shuffle(q).slice(0, N);

    T = { q, at: 0, sel: null, phase: 'ask', hits: {}, seenUnits: {}, right: 0, done: false };
    buildOpts();
  }

  function buildOpts() {
    const it = T.q[T.at];
    const pool = NL.content.allItems().filter(x => x.id !== it.id && x.kind === it.kind && x.unit !== 'eigen');
    T.opts = U.shuffle([{ label: U.bareFr(it.fr), ok: true }]
      .concat(U.sample(pool, 3).map(x => ({ label: U.bareFr(x.fr), ok: false }))));
    T.sel = null;
  }

  function answer(i) {
    const it = T.q[T.at];
    const ok = T.opts[i].ok;
    T.sel = i; T.phase = 'shown';
    T.seenUnits[it.unit] = (T.seenUnits[it.unit] || 0) + 1;
    if (ok) { T.right++; T.hits[it.unit] = (T.hits[it.unit] || 0) + 1; NL.audio.ok(); } else NL.audio.no();
    NL.ui.render();
  }

  function next() {
    T.at++; T.phase = 'ask'; T.sel = null;
    if (T.at >= T.q.length) return apply();
    buildOpts();
    NL.ui.render();
  }

  /* A unit you mostly recognised gets seeded at stage 2 — you know it receptively,
     which is real, but not the same as being able to say it. Everything still has
     to climb to the spoken rung. */
  function apply() {
    let seeded = 0, unitsSeeded = 0;
    Object.keys(T.seenUnits).forEach(uid => {
      const acc = (T.hits[uid] || 0) / T.seenUnits[uid];
      if (acc >= 0.7) {
        unitsSeeded++;
        NL.content.itemsOf(uid).forEach(it => {
          if (it.kind === 'pattern') return;
          if (NL.state.rec(it.id)) return;
          NL.srs.seed(it, 2); seeded++;
        });
      } else if (acc >= 0.4) {
        NL.content.itemsOf(uid).forEach(it => {
          if (it.kind === 'pattern' || NL.state.rec(it.id)) return;
          if (Math.random() < 0.5) { NL.srs.seed(it, 1); seeded++; }
        });
      }
    });
    T.seeded = seeded; T.unitsSeeded = unitsSeeded; T.done = true;
    NL.state.setMeta({ placed: true });
    NL.audio.win();
    NL.ui.render();
  }

  function render() {
    if (!T) { begin(); }
    if (T.done) return summary();
    const it = T.q[T.at];
    const pct = Math.round(T.at / T.q.length * 100);

    return '<div class="lesson">' +
      '<div class="lesson-head">' +
      '<button class="iconbtn" data-act="exit" aria-label="' + NL.t.quitYes + '">' + NL.ui.I.x + '</button>' +
      '<div class="rail"><div class="rail-fill" style="width:' + Math.max(pct, 3) + '%"></div></div>' +
      '<span class="pill">' + (T.at + 1) + '/' + T.q.length + '</span></div>' +
      '<div class="lesson-body"><div class="stage">' +
      '<div class="kicker"><span class="sub">' + NL.t.placeEyebrow + '</span>' + NL.t.placeQ + '</div>' +
      NL.ex.speakerRow(U.bare(it.nl), { show: true, be: it.be }) +
      '<div class="opts">' + T.opts.map((o, i) => {
        let cls = '';
        if (T.phase === 'shown') { if (o.ok) cls = ' ok'; else if (T.sel === i) cls = ' no'; }
        return '<button class="opt' + cls + '" data-opt="' + i + '"' + (T.phase === 'shown' ? ' disabled' : '') + '>' +
          '<span class="opt-key">' + (i + 1) + '</span><span>' + esc(o.label) + '</span></button>';
      }).join('') + '</div>' +
      '</div></div>' +
      '<div class="foot"><div class="foot-in">' +
      (T.phase === 'shown'
        ? '<button class="btn btn-primary push" data-act="next">' + NL.t.next + '</button>'
        : '<button class="btn btn-ghost" data-act="dunno">' + NL.t.dunno + '</button>') +
      '</div></div></div>';
  }

  function summary() {
    const pct = Math.round(T.right / T.q.length * 100);
    const verdict = pct >= 75 ? NL.t.placeHigh
      : pct >= 45 ? NL.t.placeMid
        : NL.t.placeLow;
    return '<div class="lesson"><div class="lesson-body"><div class="stage done-stage">' +
      '<div class="done-mark">\u{1F4CF}</div><h2>' + verdict + '</h2>' +
      '<p class="done-sub">' + (T.seeded
        ? NL.t.placeSeeded(T.seeded)
        : NL.t.placeNone) + '</p>' +
      '<div class="tally">' +
      '<div class="tally-box blue"><div class="t-n">' + pct + '%</div><div class="t-l">' + NL.t.placeRecognised + '</div></div>' +
      '<div class="tally-box gold"><div class="t-n">' + (T.seeded || 0) + '</div><div class="t-l">' + NL.t.placeAdvanced + '</div></div>' +
      '</div>' +
      '<button class="btn btn-primary wide" data-act="go">' + NL.t.placeFirst + '</button>' +
      '<button class="btn btn-ghost wide" data-go="vandaag">' + NL.t.placeLater + '</button>' +
      '</div></div></div>';
  }

  return {
    render,
    click(el, d) {
      if (d.act === 'exit') { T = null; NL.ui.go('vandaag'); return; }
      if (d.act === 'go') { T = null; NL.screens.sessie.begin('vandaag'); NL.ui.go('sessie'); return; }
      if (d.act === 'next') { next(); return; }
      if (d.act === 'dunno') { T.phase = 'shown'; T.seenUnits[T.q[T.at].unit] = (T.seenUnits[T.q[T.at].unit] || 0) + 1; NL.audio.no(); NL.ui.render(); return; }
      if (d.opt !== undefined && T.phase === 'ask') answer(+d.opt);
    },
    key(e) {
      if (!T || T.done) return;
      if (e.key === 'Enter') { e.preventDefault(); const b = document.querySelector('[data-act="next"]'); if (b) b.click(); return; }
      if (/^[1-4]$/.test(e.key) && T.phase === 'ask') { const b = document.querySelector('[data-opt="' + (+e.key - 1) + '"]'); if (b) b.click(); }
    },
    reset() { T = null; }
  };
})();
