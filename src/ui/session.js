/* The session runner. Builds a queue from whatever the scheduler says is owed,
   runs it, grades it, and puts failures back on the end. */
NL.screens.sessie = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, EX = NL.ex;
  let L = null;

  const MAX_TASKS = NL.srs.MAX_TASKS;

  function blankTurn() {
    return { sel: null, picked: [], input: '', matchSel: null, matchGone: [], matchBad: null, speech: { phase: 'idle', tries: 0, selfRated: null } };
  }

  function start(source) {
    NL.state.touchDay();
    const m = NL.state.meta();
    const due = NL.srs.dueItems();
    let fresh, pool;

    if (source && source !== 'vandaag') {
      const items = NL.content.itemsOf(source);
      pool = items.filter(it => NL.srs.stageOf(it) >= 0 && NL.state.rec(it.id).due <= Date.now());
      fresh = items.filter(it => NL.srs.stageOf(it) < 0).slice(0, NL.srs.pace().fresh);
    } else {
      const left = NL.srs.budgetLeft();
      pool = due.slice(0, left);
      fresh = NL.srs.freshItems(Math.min(Math.max(0, left - pool.length), NL.srs.pace().fresh));
    }

    const queue = [];
    /* Brand-new items get met as a matching warm-up before anything is demanded. */
    const newWords = fresh.filter(it => it.kind !== 'pattern');
    if (newWords.length >= 4) {
      queue.push({ ex: 'match', task: EX.registry.match.build(newWords.slice(0, 5)), items: newWords.slice(0, 5) });
    }
    /* Grammar rules are nine items among four hundred, so uniform sampling buries
       them — a whole week could pass without one. Give them a guaranteed seat. */
    const pats = pool.filter(it => it.kind === 'pattern').slice(0, 2);
    const others = pool.filter(it => pats.indexOf(it) < 0).slice(0, MAX_TASKS - pats.length);
    /* Le gouverneur : on retient les deux derniers types servis pour qu'aucun
       ne se répète coup sur coup. */
    const rest = U.shuffle(pats.concat(others, fresh));
    const recent = [];
    rest.forEach(it => {
      const name = NL.srs.exerciseFor(it, new Set(recent));
      const ex = EX.get(name);
      try {
        queue.push({ ex: name, task: ex.build(it), items: [it] });
        recent.push(name);
        if (recent.length > 2) recent.shift();
      } catch (e) { /* un élément mal formé est simplement sauté */ }
    });

    /* Étalement : on garde l'échauffement en tête, puis on réordonne la suite
       pour qu'aucun type ne se retrouve collé à lui-même. */
    const head = queue.length && queue[0].ex === 'match' ? [queue.shift()] : [];
    const spread = [];
    while (queue.length) {
      const last = spread.length ? spread[spread.length - 1].ex : (head.length ? head[0].ex : null);
      let i = queue.findIndex(x => x.ex !== last);
      if (i < 0) i = 0;
      spread.push(queue.splice(i, 1)[0]);
    }
    queue.push.apply(queue, head.concat(spread));

    if (queue.length === 0) { L = null; return false; }

    L = Object.assign(blankTurn(), {
      source: source || 'vandaag', queue: queue.slice(0, MAX_TASKS + 1), at: 0,
      phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0, started: Date.now(), finished: false,
      newCount: fresh.length
    });
    return true;
  }

  const cur = () => L && L.queue[L.at];
  const active = () => !!(L && !L.finished);
  const abandon = () => { NL.speech.abort(); L = null; };

  function autoplay() {
    const c = cur();
    if (!c || NL.state.meta().autoplay === false) return;
    const ex = EX.get(c.ex);
    if (ex.auto) { const txt = ex.auto(c.task); if (txt) setTimeout(() => NL.speech.say(txt), 150); }
  }

  /* ---------------- grading ---------------- */
  function check() {
    const c = cur(); if (!c) return;
    const ex = EX.get(c.ex);
    if (!ex.ready(c.task, L)) return;
    const v = ex.judge(c.task, L);
    L.phase = v.ok ? 'ok' : 'no';
    L.lastSpoken = !!v.spoken;

    c.items.forEach(it => NL.srs.grade(it, v.ok, { spoken: v.spoken, ex: c.ex }));
    NL.srs.spend(1);

    if (v.ok) {
      L.right++;
      L.xp += c.ex === 'speak' ? 4 : 2;
      if (c.ex === 'speak') L.spoken++;
      NL.audio.ok();
    } else {
      L.wrong++;
      NL.audio.no();
      if (L.queue.length < MAX_TASKS + 6) L.queue.push({ ex: c.ex, task: c.task, items: c.items, retry: true });
    }
    NL.ui.render();
  }

  function next() {
    NL.speech.abort(); NL.speech.clearRecording();
    L.at++;
    Object.assign(L, blankTurn());
    L.phase = 'ask';
    if (L.at >= L.queue.length) return finish();
    NL.ui.render();
    autoplay();
  }

  function skip() {
    const c = cur(); if (!c) return;
    c.items.forEach(it => NL.srs.grade(it, false, { ex: c.ex }));
    NL.srs.spend(1);
    L.wrong++;
    L.phase = 'no';
    if (L.queue.length < MAX_TASKS + 6) L.queue.push({ ex: c.ex, task: c.task, items: c.items, retry: true });
    NL.audio.no();
    NL.ui.render();
  }

  function finish() {
    L.finished = true;
    const m = NL.state.meta();
    NL.state.setMeta({ xp: m.xp + L.xp });
    NL.state.creditDay(L.newCount);
    NL.audio.win();
    NL.ui.render();
  }

  /* ---------------- view ---------------- */
  function view() {
    const c = cur();
    const ex = EX.get(c.ex);
    const pct = Math.round(L.at / L.queue.length * 100);
    const it = c.items[0];
    const unit = NL.content.unit(it.unit);
    const stage = NL.srs.stageOf(it);

    return '<div class="lesson">' +
      '<div class="lesson-head">' +
      '<button class="iconbtn" data-act="quit" aria-label="' + NL.t.quitYes + '">' + NL.ui.I.x + '</button>' +
      '<div class="rail"><div class="rail-fill" style="width:' + Math.max(pct, 3) + '%"></div></div>' +
      '<span class="pill">' + (L.at + 1) + '/' + L.queue.length + '</span>' +
      '</div>' +

      '<div class="lesson-body"><div class="stage">' +
      '<div class="kicker"><span class="sub">' +
      esc(unit ? unit.name : 'Mes mots') +
      (c.retry ? ' · ' + NL.t.again2 : '') +
      '</span>' + esc(ex.kicker) + stagePips(stage, it) + '</div>' +
      ex.view(c.task, L, L.phase) +
      '</div></div>' +
      foot(c, ex) +
      '</div>';
  }

  function stagePips(stage, item) {
    const top = NL.srs.maxRung(item);
    const r = Math.max(0, stage);
    let s = '<span class="pips">';
    for (let i = 0; i < top; i++) s += '<i class="' + (i <= stage ? 'on' : '') + '"></i>';
    s += '<b>' + NL.t.rungs[Math.min(r, NL.t.rungs.length - 1)] + '</b>';
    return s + '</span>';
  }

  function foot(c, ex) {
    if (c.ex === 'match') {
      return '<div class="foot"><div class="foot-in">' +
        '<p class="foot-hint">' + NL.t.matchHint + '</p>' +
        '<button class="btn btn-ghost" data-skip="1">' + NL.t.skip + '</button></div></div>';
    }
    if (L.phase === 'ask') {
      const ready = ex.ready(c.task, L);
      return '<div class="foot"><div class="foot-in">' +
        '<button class="btn btn-ghost" data-skip="1">' + NL.t.skip + '</button>' +
        '<button class="btn btn-primary push" data-check="1"' + (ready ? '' : ' disabled') + '>' + NL.t.check + '</button>' +
        '</div></div>';
    }
    const ok = L.phase === 'ok';
    const ans = ex.answer(c.task);
    const it = c.items[0];
    const note = ok ? U.one(NL.t.praise)
      : NL.t.wrongTitle;
    const be = (it && it.be && NL.state.meta().showFlemish !== false) ? it.be : null;
    return '<div class="foot ' + (ok ? 'ok' : 'no') + '"><div class="foot-in">' +
      '<div class="verdict ' + (ok ? 'ok' : 'no') + '">' +
      '<span class="v-icon">' + (ok
        ? '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>') + '</span>' +
      '<div><h5>' + note + '</h5>' +
      (ans ? '<p><b>' + esc(ans) + '</b></p>' : '') +
      (be ? '<p class="v-be">' + NL.t.hereThey + ' <b>' + esc(be) + '</b></p>' : '') +
      (it && it.note ? '<p class="v-note">' + esc(it.note) + '</p>' : '') +
      '</div></div>' +
      '<button class="btn ' + (ok ? 'btn-good' : 'btn-bad') + ' push" data-next="1">' + NL.t.next + '</button>' +
      '</div></div>';
  }

  function emptyState() {
    return '<div class="lesson"><div class="lesson-head">' +
      '<button class="iconbtn" data-act="quit" aria-label="' + NL.t.back + '">' + NL.ui.I.x + '</button></div>' +
      '<div class="lesson-body"><div class="stage empty-stage">' +
      '<h2>' + NL.t.nothingDue + '</h2>' +
      '<p>' + NL.t.nothingDueBody + '</p>' +
      '<button class="btn btn-primary" data-go="leerpad">' + NL.t.nothingDueGo + '</button>' +
      '</div></div></div>';
  }

  function done() {
    const acc = (L.right + L.wrong) ? Math.round(L.right / (L.right + L.wrong) * 100) : 100;
    const mins = Math.max(1, Math.round((Date.now() - L.started) / 60000));
    const m = NL.state.meta();
    return '<div class="lesson"><div class="lesson-body"><div class="stage done-stage">' +
      '<div class="done-mark">' + (L.wrong === 0 ? '\u{1F3AF}' : '\u{2713}') + '</div>' +
      '<h2>' + (L.wrong === 0 ? NL.t.doneFlawless : NL.t.doneOk) + '</h2>' +
      '<p class="done-sub">' + (L.spoken > 0
        ? NL.t.doneSpoken(L.spoken)
        : NL.t.doneNoSpoken) + '</p>' +
      '<div class="tally">' +
      box('+' + L.xp, NL.t.tallyXp, 'gold') + box(acc + '%', NL.t.tallyRight, 'blue') +
      box(m.streak, NL.t.tallyDays, 'green') + box(mins + 'm', NL.t.tallyTime, '') +
      '</div>' +
      '<div class="done-actions">' +
      '<button class="btn btn-primary wide" data-act="again">' + NL.t.sessionMore + '</button>' +
      '<button class="btn btn-ghost wide" data-go="vandaag">' + NL.t.sessionBack + '</button>' +
      '</div></div></div></div>';
  }
  const box = (n, l, c) => '<div class="tally-box ' + c + '"><div class="t-n">' + n + '</div><div class="t-l">' + l + '</div></div>';

  /* ---------------- interaction ---------------- */
  function click(el, d) {
    if (d.act === 'quit') { if (L && !L.finished) NL.ui.openSheet('quit-session'); else { L = null; NL.ui.go('vandaag'); } return; }
    if (d.act === 'again') { L = null; start('vandaag'); NL.ui.render(); autoplay(); return; }
    if (d.check !== undefined) return check();
    if (d.next !== undefined) return next();
    if (d.skip !== undefined) return skip();
    if (!L || L.phase !== 'ask') return;

    const c = cur();
    if (d.opt !== undefined) {
      const i = +d.opt;
      if (c.task.opts && !c.task.opts[i]) return;   // no such option on screen
      L.sel = { i };
      NL.ui.render(); return;
    }
    if (d.pick !== undefined) { L.picked.push(+d.pick); NL.ui.render(); return; }
    if (d.unpick !== undefined) { L.picked = L.picked.filter(x => x !== +d.unpick); NL.ui.render(); return; }
    if (d.ins !== undefined) { L.input += d.ins; NL.ui.render(); return; }
    if (d.match !== undefined) return matchTap(d, c.task);
    if (d.mic !== undefined) return mic(d.mic, c.task);
    if (d.rec !== undefined) return recAction(d.rec, c.task);
    if (d.self !== undefined) {
      L.speech.selfRated = d.self === '1';
      NL.ui.render();
      return;
    }
  }

  function matchTap(d, task) {
    const id = d.match, k = +d.k, side = d.side;
    if (!L.matchSel) { L.matchSel = { id, k, side }; L.matchBad = null; NL.ui.render(); return; }
    if (L.matchSel.id === id) { L.matchSel = null; NL.ui.render(); return; }
    if (L.matchSel.side === side) { L.matchSel = { id, k, side }; NL.ui.render(); return; }
    if (L.matchSel.k === k) {
      L.matchGone.push(k); L.matchSel = null; NL.audio.ok();
      NL.speech.say(task.pairs[k].nl);
      if (L.matchGone.length >= task.pairs.length) { L.right++; L.xp += 2; setTimeout(next, 500); }
      NL.ui.render();
    } else {
      L.matchBad = id; L.matchSel = null; NL.audio.no();
      NL.ui.render();
      setTimeout(() => { if (L) { L.matchBad = null; NL.ui.render(); } }, 340);
    }
  }

  /* Record-and-compare: the speaking path when no recogniser exists. */
  function recAction(action, task) {
    const sp = L.speech;
    if (action === 'stop') { NL.speech.stopRecord(); return; }
    if (action === 'play') { NL.speech.playRecording(); return; }
    if (action === 'both') { NL.speech.playBoth(task.target); return; }

    sp.recState = 'rec'; sp.recErr = null;
    NL.audio.mic(); NL.ui.render();
    NL.speech.record({
      onstart: () => { sp.recTimer = setTimeout(() => NL.speech.stopRecord(), 7000); },
      onstop: () => {
        if (!L) return;
        clearTimeout(L.speech.recTimer);
        L.speech.recState = 'done';
        NL.ui.render();
      },
      onerror: kind => {
        if (!L) return;
        L.speech.recState = 'idle'; L.speech.recErr = kind;
        NL.ui.render();
      }
    });
  }

  function mic(action, task) {
    const sp = L.speech;
    if (action === 'stop') { NL.speech.abort(); sp.phase = 'idle'; NL.ui.render(); return; }
    sp.phase = 'listening'; sp.partial = ''; sp.error = null;
    NL.audio.mic();
    NL.ui.render();
    NL.speech.listen({
      onpartial: txt => { if (L && L.speech.phase === 'listening') { L.speech.partial = txt; NL.ui.render(); } },
      onerror: kind => {
        if (!L) return;
        L.speech.phase = 'idle'; L.speech.error = kind; L.speech.tries++;
        if (kind === 'denied' || kind === 'network' || kind === 'browser') L.speech.selfRated = null;
        NL.ui.render();
      },
      onend: (text, alts) => {
        if (!L || L.speech.phase !== 'listening') return;
        const res = NL.speech.score(alts && alts.length ? alts : [text], task.target);
        L.speech.phase = 'done';
        L.speech.tries++;
        L.speech.pct = res.pct;
        L.speech.parts = res.parts;
        L.speech.heard = res.heard;
        L.speech.ok = res.pass;
        if (res.pass) NL.audio.ok();
        NL.ui.render();
      }
    });
  }

  function input(el) {
    if (!el.classList.contains('textin') || !L) return;
    const c = cur(), ex = EX.get(c.ex);
    const before = ex.ready(c.task, L);
    L.input = el.value;
    const after = ex.ready(c.task, L);
    if (before !== after) {
      const btn = document.querySelector('[data-check]');
      if (btn) btn.disabled = !after;
    }
  }

  function key(e) {
    if (!L || L.finished) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (L.phase === 'ask') check(); else next();
      return;
    }
    if (L.phase !== 'ask') return;
    const c = cur(); if (!c) return;
    const typing = document.activeElement && document.activeElement.tagName === 'INPUT';
    if (/^[1-9]$/.test(e.key) && !typing) {
      const i = +e.key - 1;
      const b = document.querySelector('[data-opt="' + i + '"]') || document.querySelectorAll('.bank .tile')[i];
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
    }
    if (e.key === 'Backspace' && !typing && L.picked.length) { e.preventDefault(); L.picked.pop(); NL.ui.render(); }
    if (e.key === 'r' && !typing) { const s = document.querySelector('[data-say]'); if (s) { e.preventDefault(); s.click(); } }
    if (e.key === 'm' && !typing) { const s = document.querySelector('[data-mic]'); if (s) { e.preventDefault(); s.click(); } }
  }

  function after(a) {
    const inp = document.querySelector('.textin');
    if (inp && L && L.phase === 'ask') { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }

  return {
    render(a) {
      if (!L) {
        if (!start(a)) return emptyState();
        setTimeout(autoplay, 80);
      }
      if (L.finished) return done();
      return view();
    },
    click, input, key, after, active, abandon,
    /* Read-only, for the headless tests: they need the live task to answer it. */
    peek: () => cur(),
    begin(source) { L = null; if (start(source)) { setTimeout(autoplay, 60); return true; } return false; }
  };
})();
