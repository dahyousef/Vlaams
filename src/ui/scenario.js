/* Praten: the scenario list, and the player that makes you say your turn out loud. */
(function () {
  'use strict';
  const U = NL.util, esc = U.esc, ICON = NL.ex.ICON;
  let P = null;

  /* ---------------------------------------------------- list */
  NL.screens.praten = {
    render() {
      const m = NL.state.meta();
      const done = m.scenariosDone || [];
      const groups = [
        { t: NL.t.talkLife, s: NL.t.talkLifeSub, track: 'leven' },
        { t: NL.t.talkWork, s: NL.t.talkWorkSub, track: 'werk' }
      ];
      let html = '<div class="wrap">' +
        '<section class="card lead slim"><span class="eyebrow">' + NL.t.talkEyebrow + '</span>' +
        '<h1>' + NL.t.talkTitle + '</h1>' +
        '<p>' + NL.t.talkBody + '</p></section>';

      groups.forEach(g => {
        html += '<h3 class="sec">' + g.t + '<span class="sec-sub">' + esc(g.s) + '</span></h3>';
        (NL.content.scenarios || []).filter(s => s.track === g.track).forEach(s => {
          const isDone = done.indexOf(s.id) >= 0;
          html += '<button class="scn-card' + (isDone ? ' done' : '') + '" data-scn="' + s.id + '">' +
            '<span class="scn-icon">' + s.icon + '</span>' +
            '<span class="scn-body">' +
            '<span class="eyebrow">' + esc(s.place) + '</span>' +
            '<b>' + esc(s.title) + '</b>' +
            '<i>' + esc(s.blurb) + '</i></span>' +
            '<span class="scn-go">' + (isDone ? NL.t.talkDone : NL.t.start) + '</span></button>';
        });
      });
      return html + '</div>';
    },
    click(el, d) { if (d.scn) NL.ui.go('scenario', d.scn); }
  };

  /* ---------------------------------------------------- player */
  function open(id) {
    const scn = NL.content.scenario(id);
    if (!scn) return false;
    P = { scn, at: 0, phase: 'them', log: [], choice: null, speech: fresh(), spoken: 0, tried: 0 };
    advanceThem();
    return true;
  }
  const fresh = () => ({ phase: 'idle', tries: 0, selfRated: null, partial: '' });

  /* Plays one `them` line into the transcript — one at a time, so the audio never
     stacks up — then works out whose turn it is. */
  function advanceThem() {
    if (P.at < P.scn.steps.length && P.scn.steps[P.at].them) {
      const t = P.scn.steps[P.at].them;
      P.log.push({ who: 'them', nl: t.nl, be: t.be, fr: t.fr });
      P.at++;
      say(t.be || t.nl);
    }
    P.phase = P.at < P.scn.steps.length && P.scn.steps[P.at].them ? 'them'
      : P.at < P.scn.steps.length ? 'choose' : 'done';
    if (P.phase === 'done') finish();
  }

  function say(text, slow) {
    if (NL.state.meta().autoplay === false && !slow) return;
    setTimeout(() => NL.speech.say(text, { rate: slow ? 0.62 : 1 }), 120);
  }

  function finish() {
    const m = NL.state.meta();
    const done = (m.scenariosDone || []).slice();
    if (done.indexOf(P.scn.id) < 0) done.push(P.scn.id);
    NL.state.setMeta({ scenariosDone: done, xp: m.xp + 12 });
    NL.state.creditDay();
    NL.audio.win();
  }

  NL.screens.scenario = {
    render(id) {
      if (!P || (id && P.scn.id !== id)) { if (!open(id)) return '<div class="wrap"><p class="empty">Cette conversation n’existe pas.</p></div>'; }
      const s = P.scn;
      const step = P.scn.steps[P.at];

      const transcript = P.log.map(b => {
        if (b.who === 'them') {
          return '<div class="bub them">' +
            '<button class="bub-say" data-say="' + esc(b.be || b.nl) + '" aria-label="' + NL.t.replay + '">' + ICON.speaker(17) + '</button>' +
            '<div><p class="bub-nl">' + esc(b.be || b.nl) + '</p>' +
            (b.be && U.norm(b.be) !== U.norm(b.nl) ? '<p class="bub-std">' + NL.t.scnStd + ' ' + esc(b.nl) + '</p>' : '') +
            '<p class="bub-en">' + esc(b.fr) + '</p></div></div>';
        }
        return '<div class="bub you"><div><p class="bub-nl">' + esc(b.nl) + '</p>' +
          '<p class="bub-en">' + esc(b.fr) + '</p>' +
          (b.pct != null ? '<p class="bub-score">' + b.pct + '% prononcé</p>' : '') + '</div></div>';
      }).join('');

      let panel = '';
      if (P.phase === 'them') {
        panel = '<button class="btn btn-blue wide" data-step="next">' + NL.t.next + '</button>';
      } else if (P.phase === 'choose') {
        panel = '<p class="ask">' + esc(step.you.ask) + '</p>' +
          (step.you.hint ? '<p class="ask-hint">' + esc(step.you.hint) + '</p>' : '') +
          '<div class="choices">' + step.you.choices.map((c, i) =>
            '<button class="choice" data-choice="' + i + '"><b>' + esc(c.nl) + '</b><i>' + esc(c.fr) + '</i></button>').join('') +
          '</div>';
      } else if (P.phase === 'speak') {
        const c = step.you.choices[P.choice];
        panel = '<div class="say-now"><p class="say-target">' + esc(c.nl) + '</p>' +
          '<p class="say-en">' + esc(c.fr) + '</p>' +
          '<button class="speaker slow inline" data-say="' + esc(c.nl) + '" data-slow="1" aria-label="' + NL.t.slow + '">' + ICON.turtle() + '</button></div>' +
          micPanel(P.speech, c.nl) +
          (c.note ? '<p class="say-note">' + esc(c.note) + '</p>' : '');
      } else if (P.phase === 'done') {
        panel = '<div class="scn-done"><h2>' + NL.t.scnOver + '</h2>' +
          '<p>' + esc(s.outro) + '</p>' +
          '<div class="tally"><div class="tally-box gold"><div class="t-n">+12</div><div class="t-l">XP</div></div>' +
          '<div class="tally-box blue"><div class="t-n">' + P.spoken + '/' + P.tried + '</div><div class="t-l">' + NL.t.micSaidIt + '</div></div></div>' +
          '<button class="btn btn-primary wide" data-step="again">' + NL.t.replay + '</button>' +
          '<button class="btn btn-ghost wide" data-step="back">' + NL.t.scnBack + '</button></div>';
      }

      return '<div class="lesson">' +
        '<div class="lesson-head">' +
        '<button class="iconbtn" data-step="back" aria-label="' + NL.t.back + '">' + NL.ui.I.back + '</button>' +
        '<div class="head-title"><b>' + esc(s.title) + '</b><i>' + esc(s.place) + '</i></div>' +
        '<span class="pill">' + Math.min(P.at + 1, s.steps.length) + '/' + s.steps.length + '</span>' +
        '</div>' +
        '<div class="lesson-body"><div class="stage chat">' + transcript + '</div></div>' +
        '<div class="foot chat-foot"><div class="foot-in col">' + panel + '</div></div>' +
        '</div>';
    },

    click(el, d) {
      if (d.step === 'back') { P = null; NL.ui.go('praten'); return; }
      if (d.step === 'again') { const id = P.scn.id; P = null; open(id); NL.ui.render(); return; }
      if (d.step === 'next') { advanceThem(); NL.ui.render(); return; }
      if (d.choice !== undefined) {
        if (P.phase !== 'choose') return;
        P.choice = +d.choice; P.phase = 'speak'; P.speech = fresh(); P.tried++;
        NL.ui.render(); return;
      }
      /* Everything below belongs to your speaking turn and must not fire outside it. */
      if (P.phase !== 'speak') return;
      if (d.mic !== undefined) return mic(d.mic);
      if (d.rec !== undefined) return recAction(d.rec);
      if (d.self !== undefined) { P.speech.selfRated = d.self === '1'; commit(d.self === '1', null); return; }
      if (d.act === 'accept') { commit(!!P.speech.ok, P.speech.pct); return; }
    },
    key(e) {
      if (!P) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        const b = document.querySelector('[data-step="next"],[data-act="accept"]');
        if (b) b.click();
      }
      if (e.key === 'm') { const b = document.querySelector('[data-mic]'); if (b) { e.preventDefault(); b.click(); } }
      if (/^[1-3]$/.test(e.key) && P.phase === 'choose') {
        const b = document.querySelector('[data-choice="' + (+e.key - 1) + '"]');
        if (b) b.click();
      }
    }
  };

  function commit(ok, pct) {
    const step = P.scn.steps[P.at];
    if (!step || !step.you || P.choice == null) return;
    const c = step.you.choices[P.choice];
    if (ok) P.spoken++;
    P.log.push({ who: 'you', nl: c.nl, fr: c.fr, pct: pct });
    P.at++;
    if (c.reply) {
      P.log.push({ who: 'them', nl: c.reply.nl, be: c.reply.be, fr: c.reply.fr });
      say(c.reply.be || c.reply.nl);
      P.phase = P.at < P.scn.steps.length ? (P.scn.steps[P.at].them ? 'them' : 'choose') : 'done';
      if (P.phase === 'done') finish();
      NL.ui.render();
      return;
    }
    advanceThem();
    NL.ui.render();
  }

  function recAction(action) {
    const sp = P.speech;
    const target = P.scn.steps[P.at].you.choices[P.choice].nl;
    if (action === 'stop') { NL.speech.stopRecord(); return; }
    if (action === 'play') { NL.speech.playRecording(); return; }
    if (action === 'both') { NL.speech.playBoth(target); return; }
    sp.recState = 'rec'; sp.recErr = null; NL.audio.mic(); NL.ui.render();
    NL.speech.record({
      onstart: () => { sp.recTimer = setTimeout(() => NL.speech.stopRecord(), 7000); },
      onstop: () => { if (!P) return; clearTimeout(P.speech.recTimer); P.speech.recState = 'done'; NL.ui.render(); },
      onerror: k => { if (!P) return; P.speech.recState = 'idle'; P.speech.recErr = k; NL.ui.render(); }
    });
  }

  function mic(action) {
    const sp = P.speech;
    const step = P.scn.steps[P.at];
    const target = step.you.choices[P.choice].nl;
    if (action === 'stop') { NL.speech.abort(); sp.phase = 'idle'; NL.ui.render(); return; }
    sp.phase = 'listening'; sp.partial = ''; sp.error = null;
    NL.audio.mic(); NL.ui.render();
    NL.speech.listen({
      onpartial: t => { if (P && P.speech.phase === 'listening') { P.speech.partial = t; NL.ui.render(); } },
      onerror: k => { if (!P) return; P.speech.phase = 'idle'; P.speech.error = k; P.speech.tries++; NL.ui.render(); },
      onend: (text, alts) => {
        if (!P || P.speech.phase !== 'listening') return;
        const r = NL.speech.score(alts && alts.length ? alts : [text], target);
        Object.assign(P.speech, { phase: 'done', tries: P.speech.tries + 1, pct: r.pct, parts: r.parts, heard: r.heard, ok: r.pass });
        if (r.pass) NL.audio.ok(); else NL.audio.no();
        NL.ui.render();
      }
    });
  }

  /* Shared look with the speak exercise, so the microphone always behaves the same. */
  function micPanel(sp, target) {
    const blocked = NL.speech.listenBlocked();
    if (blocked) return NL.ex.recordPanel(sp, target, blocked);
    if (sp.phase === 'listening') {
      return '<div class="mic-panel live"><button class="mic big listening" data-mic="stop" aria-label="' + NL.t.stop + '">' + ICON.mic(32) + '</button>' +
        '<p class="mic-why">' + NL.t.micListening + '</p>' + (sp.partial ? '<p class="heard">' + esc(sp.partial) + '</p>' : '') + '</div>';
    }
    if (sp.phase === 'done') {
      return '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
        '<div class="score-row"><span class="score">' + sp.pct + '%</span>' +
        '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
        '<p class="word-diff">' + sp.parts.map(p =>
          '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
        (sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;' + esc(sp.heard) + '&rdquo;</p>' : '') +
        '<div class="mic-actions">' +
        (!sp.ok && sp.tries < 3 ? '<button class="btn btn-blue" data-mic="start">' + NL.t.replay + '</button>' : '') +
        '<button class="btn ' + (sp.ok ? 'btn-good' : 'btn-ghost') + '" data-act="accept">' + (sp.ok ? NL.t.next : NL.t.micAnyway) + '</button>' +
        '</div></div>';
    }
    return '<div class="mic-panel"><button class="mic big" data-mic="start" aria-label="' + NL.t.speak + '">' + ICON.mic(32) + '</button>' +
      '<p class="mic-why">' + (sp.error ? esc(errText(sp.error)) : NL.t.micTap) + '</p></div>';
  }
  const errText = k => k === 'denied' ? NL.t.micDenied
    : k === 'silence' ? NL.t.micSilence
      : k === 'network' ? NL.t.micNetwork : NL.t.micFail;
})();
