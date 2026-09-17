/* Luisteren: Flemish at full speed with no text, then shadowing.
   Comprehension is the skill that decides whether a conversation survives. */
NL.screens.luisteren = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, ICON = NL.ex.ICON;
  let S = null;

  function begin(mode) {
    const clips = U.shuffle(NL.content.listenClips()).slice(0, 8);
    S = { mode, clips, at: 0, phase: 'play', sel: null, right: 0, plays: 0, speech: { phase: 'idle', tries: 0 }, done: false };
    build();
    setTimeout(play, 200);
  }

  function build() {
    const c = S.clips[S.at];
    const pool = NL.content.listenClips().filter(x => x.id !== c.id);
    S.opts = U.shuffle([{ label: c.fr, ok: true }].concat(
      U.sample(pool, 2).map(x => ({ label: x.fr, ok: false }))));
    S.plays = 0;
  }

  const play = (slow) => { const c = S.clips[S.at]; if (!c) return; S.plays++; NL.speech.say(c.be || c.nl, { rate: slow ? 0.6 : 1 }); };

  function answer(i) {
    S.sel = i;
    const ok = S.opts[i].ok;
    S.phase = 'shown';
    if (ok) { S.right++; NL.audio.ok(); } else NL.audio.no();
    NL.ui.render();
  }

  function next() {
    NL.speech.abort();
    S.at++;
    S.phase = 'play'; S.sel = null; S.speech = { phase: 'idle', tries: 0 };
    if (S.at >= S.clips.length) {
      S.done = true;
      const m = NL.state.meta();
      NL.state.setMeta({ xp: m.xp + 8 });
      NL.state.creditDay();
      NL.audio.win();
      NL.ui.render();
      return;
    }
    build();
    NL.ui.render();
    setTimeout(() => play(), 180);
  }

  function render() {
    if (!S) return menu();
    if (S.done) return summary();
    const c = S.clips[S.at];
    const pct = Math.round(S.at / S.clips.length * 100);

    let body;
    if (S.mode === 'begrijpen') {
      body = '<div class="listen-stage">' +
        '<button class="mic big play' + (S.phase === 'play' ? ' pulse' : '') + '" data-act="play" aria-label="' + NL.t.listen + '">' + ICON.speaker(36) + '</button>' +
        '<div class="listen-actions">' +
        '<button class="btn btn-ghost" data-act="replay">' + NL.t.replay + '</button>' +
        '<button class="btn btn-ghost" data-act="slow">' + NL.t.slow + '</button>' +
        '</div>' +
        (S.phase === 'shown'
          ? '<div class="reveal"><p class="rev-nl">' + esc(c.be || c.nl) + '</p>' +
          (c.be && U.norm(c.be) !== U.norm(c.nl) ? '<p class="rev-std">' + NL.t.scnStd + ' ' + esc(c.nl) + '</p>' : '') +
          '<p class="rev-src">' + NL.t.listenFrom + ' &ldquo;' + esc(c.from) + '&rdquo;</p></div>'
          : '<p class="listen-hint">' + NL.t.listenNoText + '</p>') +
        '</div>' +
        '<div class="opts">' + S.opts.map((o, i) => {
          let cls = '';
          if (S.phase === 'shown') { if (o.ok) cls = ' ok'; else if (S.sel === i) cls = ' no'; }
          return '<button class="opt' + cls + '" data-opt="' + i + '"' + (S.phase === 'shown' ? ' disabled' : '') + '>' +
            '<span class="opt-key">' + (i + 1) + '</span><span>' + esc(o.label) + '</span></button>';
        }).join('') + '</div>';
    } else {
      const sp = S.speech;
      body = '<div class="listen-stage">' +
        '<button class="mic big play" data-act="play" aria-label="' + NL.t.listen + '">' + ICON.speaker(36) + '</button>' +
        '<p class="rev-nl">' + esc(c.be || c.nl) + '</p>' +
        '<p class="rev-en">' + esc(c.fr) + '</p>' +
        '<div class="listen-actions"><button class="btn btn-ghost" data-act="slow">' + NL.t.slow + '</button></div>' +
        '</div>' + shadowPanel(sp);
    }

    return '<div class="lesson">' +
      '<div class="lesson-head">' +
      '<button class="iconbtn" data-act="exit" aria-label="' + NL.t.back + '">' + NL.ui.I.back + '</button>' +
      '<div class="rail"><div class="rail-fill" style="width:' + Math.max(pct, 3) + '%"></div></div>' +
      '<span class="pill">' + (S.at + 1) + '/' + S.clips.length + '</span></div>' +
      '<div class="lesson-body"><div class="stage">' +
      '<div class="kicker"><span class="sub">' + (S.mode === 'begrijpen' ? NL.t.listenUnderstand : NL.t.listenRepeat) + ' &middot; ' + esc(c.from) + '</span>' +
      (S.mode === 'begrijpen' ? NL.t.listenWhatSaid : NL.t.listenRepeatTitle) + '</div>' +
      body + '</div></div>' +
      '<div class="foot"><div class="foot-in">' +
      (S.phase === 'shown' || S.mode === 'nazeggen'
        ? '<button class="btn btn-primary push" data-act="next">' + NL.t.next + '</button>'
        : '<button class="btn btn-ghost" data-act="giveup">' + NL.t.dunno + '</button>') +
      '</div></div></div>';
  }

  function shadowPanel(sp) {
    if (NL.speech.listenBlocked()) {
      return '<div class="mic-panel offline"><p class="mic-why">' + NL.t.micNoBrowser + '</p></div>';
    }
    if (sp.phase === 'listening') {
      return '<div class="mic-panel live"><button class="mic big listening" data-act="micstop">' + ICON.mic(32) + '</button>' +
        '<p class="mic-why">' + NL.t.micListening + '</p>' + (sp.partial ? '<p class="heard">' + esc(sp.partial) + '</p>' : '') + '</div>';
    }
    if (sp.phase === 'done') {
      return '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
        '<div class="score-row"><span class="score">' + sp.pct + '%</span>' +
        '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
        '<p class="word-diff">' + sp.parts.map(p => '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
        '<div class="mic-actions"><button class="btn btn-blue" data-act="mic">' + NL.t.replay + '</button></div></div>';
    }
    return '<div class="mic-panel"><button class="mic big" data-act="mic">' + ICON.mic(32) + '</button>' +
      '<p class="mic-why">' + NL.t.micTap + '</p></div>';
  }

  function menu() {
    return '<div class="wrap">' +
      '<section class="card lead slim"><span class="eyebrow">' + NL.t.listenEyebrow + '</span>' +
      '<h1>' + NL.t.listenTitle + '</h1>' +
      '<p>' + NL.t.listenBody + '</p></section>' +
      '<div class="cards">' +
      '<button class="tile-card" data-act="begrijpen"><span class="tc-icon">\u{1F3A7}</span>' +
      '<span class="tc-body"><b>' + NL.t.listenUnderstand + '</b><i>' + NL.t.listenUnderstandSub + '</i></span>' +
      '<span class="tc-cta">' + NL.t.start + '</span></button>' +
      '<button class="tile-card" data-act="nazeggen"><span class="tc-icon">\u{1F5E3}</span>' +
      '<span class="tc-body"><b>' + NL.t.listenRepeat + '</b><i>' + NL.t.listenRepeatSub + '</i></span>' +
      '<span class="tc-cta">' + NL.t.start + '</span></button>' +
      '</div></div>';
  }

  function summary() {
    const pct = Math.round(S.right / S.clips.length * 100);
    return '<div class="lesson"><div class="lesson-body"><div class="stage done-stage">' +
      '<div class="done-mark">\u{1F3A7}</div><h2>' + NL.t.listenDone + '</h2>' +
      '<p class="done-sub">' + (S.mode === 'begrijpen'
        ? (pct >= 70 ? NL.t.listenGoodEar : NL.t.listenHardEar)
        : NL.t.listenShadowDone) + '</p>' +
      '<div class="tally">' +
      (S.mode === 'begrijpen' ? '<div class="tally-box blue"><div class="t-n">' + pct + '%</div><div class="t-l">' + NL.t.listenUnderstood + '</div></div>' : '') +
      '<div class="tally-box gold"><div class="t-n">+8</div><div class="t-l">XP</div></div></div>' +
      '<button class="btn btn-primary wide" data-act="menu">' + NL.t.listenMore + '</button>' +
      '<button class="btn btn-ghost wide" data-go="vandaag">' + NL.t.back + '</button>' +
      '</div></div></div>';
  }

  function mic(action) {
    const c = S.clips[S.at];
    if (action === 'stop') { NL.speech.abort(); S.speech.phase = 'idle'; NL.ui.render(); return; }
    S.speech = { phase: 'listening', tries: S.speech.tries, partial: '' };
    NL.audio.mic(); NL.ui.render();
    NL.speech.listen({
      onpartial: t => { if (S && S.speech.phase === 'listening') { S.speech.partial = t; NL.ui.render(); } },
      onerror: () => { if (S) { S.speech.phase = 'idle'; NL.ui.render(); } },
      onend: (text, alts) => {
        if (!S || S.speech.phase !== 'listening') return;
        const r = NL.speech.score(alts && alts.length ? alts : [text], c.nl);
        Object.assign(S.speech, { phase: 'done', tries: S.speech.tries + 1, pct: r.pct, parts: r.parts, heard: r.heard, ok: r.pass });
        if (r.pass) NL.audio.ok();
        NL.ui.render();
      }
    });
  }

  return {
    render,
    click(el, d) {
      if (d.act === 'begrijpen' || d.act === 'nazeggen') { begin(d.act); NL.ui.render(); return; }
      if (d.act === 'menu') { S = null; NL.ui.render(); return; }
      if (d.act === 'exit') { NL.speech.abort(); S = null; NL.ui.go('luisteren'); return; }
      if (!S) return;
      if (d.act === 'play' || d.act === 'replay') { play(); return; }
      if (d.act === 'slow') { play(true); return; }
      if (d.act === 'next') { next(); return; }
      if (d.act === 'giveup') { S.phase = 'shown'; NL.audio.no(); NL.ui.render(); return; }
      if (d.act === 'mic') { mic('start'); return; }
      if (d.act === 'micstop') { mic('stop'); return; }
      if (d.opt !== undefined && S.phase !== 'shown') { answer(+d.opt); return; }
    },
    key(e) {
      if (!S || S.done) return;
      if (e.key === 'Enter') { e.preventDefault(); const b = document.querySelector('[data-act="next"]'); if (b) b.click(); return; }
      if (e.key === 'r' || e.key === ' ') { e.preventDefault(); play(); return; }
      if (/^[1-3]$/.test(e.key) && S.phase !== 'shown' && S.mode === 'begrijpen') {
        const b = document.querySelector('[data-opt="' + (+e.key - 1) + '"]'); if (b) b.click();
      }
    }
  };
})();
