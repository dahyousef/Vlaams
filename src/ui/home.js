/* Aujourd'hui (la session du jour), Parcours (le programme) et Plus (le reste).
   Une décision par écran : l'action principale d'abord, le reste sous la ligne de flottaison. */
(function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;

  const pct = n => Math.max(0, Math.min(100, Math.round(n)));
  const bar = (p, cls) => '<span class="bar"><span class="bar-fill ' + (cls || '') + '" style="width:' + pct(p) + '%"></span></span>';

  /* ---------------------------------------------------- Aujourd'hui */
  NL.screens.vandaag = {
    render() {
      const m = NL.state.meta();
      const c = NL.srs.counts();
      const cp = NL.content.courseProgress();
      const p = NL.srs.plan();
      const fresh = p.fresh, total = p.total, mins = p.mins;
      const v = NL.speech.voiceInfo();

      let html = '<div class="wrap">';

      if (!m.placed && c.seen === 0) {
        html += '<section class="card lead">' +
          '<h1>' + t.firstTitle + '</h1>' +
          '<p>' + t.firstBody + '</p>' +
          '<div class="lead-actions">' +
          '<button class="btn btn-primary" data-go="placement">' + t.firstDoTest + '</button>' +
          '<button class="btn btn-ghost" data-act="skip-place">' + t.firstSkip + '</button>' +
          '</div></section>';
      }

      /* The one thing this screen is for. */
      html += '<section class="card session-card">' +
        '<span class="eyebrow">' + t.todayEyebrow + '</span>' +
        (total === 0
          ? '<h2>' + t.todayAllDone + '</h2><p class="sc-sub">' + t.todayAllDoneSub + '</p>' +
          '<button class="btn btn-blue wide big" data-go="praten">' + t.todayPractise + '</button>'
          : '<h2>' + t.todayReady(total) + '</h2>' +
          '<p class="sc-sub">' + t.todaySplit(Math.min(p.due, total - fresh), fresh, mins) + '</p>' +
          '<button class="btn btn-primary wide big" data-act="start">' + t.todayStart + '</button>') +
        '</section>';

      if (v.quality !== 'be') {
        html += '<button class="notice" data-go="doctor">' +
          '<b>' + (v.quality === 'nl' ? 'Voix du nord des Pays-Bas' : 'Aucune voix néerlandaise') + '</b>' +
          '<p>' + esc(v.note) + ' Touche ici pour tester et corriger.</p></button>';
      }

      html += '<div class="tri">' +
        stat(m.streak, t.statStreak(m.streak)) +
        stat(c.said, t.statSaid) +
        stat(cp.pct + '%', t.statCourse) +
        '</div>';

      html += '<h3 class="sec">' + t.morepractice + '</h3><div class="cards">';
      const scn = (NL.content.scenarios || []).filter(s => (m.scenariosDone || []).indexOf(s.id) < 0)[0] || NL.content.scenarios[0];
      html += tile(scn.icon, scn.title, scn.place, 'scn', scn.id);
      html += tile('\u{1F3A7}', t.listenTitle, t.listenUnderstandSub, 'go', 'luisteren');
      const sheet = NL.content.sheets[(m.doneToday || 0) > 0 ? 1 : 0];
      html += tile(sheet.icon, sheet.title, sheet.blurb, 'sheetid', sheet.id);
      html += '</div></div>';
      return html;
    },
    click(el, d) {
      if (d.act === 'start') { NL.screens.sessie.begin('vandaag'); NL.ui.go('sessie'); return; }
      if (d.act === 'skip-place') { NL.state.setMeta({ placed: true }); NL.ui.render(); return; }
      if (d.scn) { NL.ui.go('scenario', d.scn); return; }
      if (d.sheetid) { NL.ui.go('spiek', d.sheetid); return; }
    }
  };

  const stat = (n, l) => '<div class="stat-box"><div class="s-n">' + n + '</div><div class="s-l">' + esc(l) + '</div></div>';
  const tile = (icon, title, sub, key, val) =>
    '<button class="tile-card" data-' + key + '="' + esc(val) + '">' +
    '<span class="tc-icon">' + icon + '</span>' +
    '<span class="tc-body"><b>' + esc(title) + '</b><i>' + esc(sub) + '</i></span>' +
    '<span class="tc-cta">›</span></button>';

  /* ---------------------------------------------------- Parcours */
  NL.screens.leerpad = {
    render() {
      const cp = NL.content.courseProgress();
      let html = '<div class="wrap">' +
        '<section class="card lead slim">' +
        '<span class="eyebrow">' + t.pathEyebrow + '</span>' +
        '<h1>' + t.pathTitle + '</h1>' +
        '<p>' + t.pathBody + '</p>' +
        '<div class="prog-line">' + bar(cp.pct) + '<b>' + cp.pct + '%</b></div>' +
        '<p class="muted small">' + t.pathSolid(cp.strong, cp.total) + '</p>' +
        '</section>';

      NL.content.units.forEach(u => {
        const open = NL.content.unitOpen(u.id);
        const p = NL.content.unitProgress(u.id);
        const g = (u.grammar || []).map(id => (NL.content.patterns || []).find(x => x.id === id)).filter(Boolean);
        html += '<section class="unit-card' + (open ? '' : ' locked') + '">' +
          '<div class="uc-head">' +
          '<span class="uc-icon">' + u.icon + '</span>' +
          '<div class="uc-title"><span class="eyebrow">Unité ' + u.n + ' · ' + u.level + ' · ' + trackName(u.track) + '</span>' +
          '<h2>' + esc(u.name) + '<i class="uc-nl">' + esc(u.nlName || '') + '</i></h2></div>' +
          '<span class="uc-pct">' + p.pct + '%</span>' +
          '</div>' +
          '<p class="uc-blurb">' + esc(u.blurb) + '</p>' +
          '<div class="prog-line">' + bar(p.pct) + '<span class="muted small">' + t.unitSeen(p.seen, p.total) + '</span></div>' +
          (g.length ? '<div class="uc-gram">' + g.map(x =>
            '<button class="gram-chip" data-act="gram" data-id="' + x.id + '">' + esc(x.title) + '</button>').join('') + '</div>' : '') +
          (open
            ? '<button class="btn btn-blue" data-unit="' + u.id + '">' + (p.seen ? t.unitPractise : t.unitStart) + '</button>'
            : '<p class="uc-lock">' + t.unitLocked(u.n - 1) + '</p>') +
          '</section>';
      });
      return html + '</div>';
    },
    click(el, d) {
      if (d.unit) { NL.screens.sessie.begin(d.unit); NL.ui.go('sessie'); return; }
      if (d.act === 'gram') {
        const g = (NL.content.patterns || []).find(x => x.id === el.dataset.id);
        if (g) NL.ui.openSheet({ custom: NL.ui.card(esc(g.title),
          '<p class="rule">' + esc(g.rule) + '</p><div class="explain">' + g.explain + '</div>' +
          '<div class="ex-list">' + g.drills.slice(0, 3).map(d2 =>
            '<button class="ex-row" data-say="' + esc(d2.nl) + '"><b>' + esc(d2.nl) + '</b><i>' + esc(d2.fr) + '</i></button>').join('') + '</div>',
          '<button class="btn btn-ghost wide" data-close="1">' + t.close + '</button>') });
      }
    }
  };
  const trackName = tr => tr === 'werk' ? t.trackWork : tr === 'leven' ? t.trackLife : t.trackBoth;

  /* ---------------------------------------------------- Plus */
  NL.screens.meer = {
    render() {
      const c = NL.srs.counts();
      const m = NL.state.meta();
      const byDay = {};
      NL.state.logs().forEach(l => { const d = U.dayKey(l.t); byDay[d] = (byDay[d] || 0) + 1; });
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = U.dayKey(Date.now() - i * U.DAY);
        days.push({ d, n: byDay[d] || 0 });
      }
      const maxN = Math.max(1, ...days.map(x => x.n));

      return '<div class="wrap">' +
        '<div class="cards">' +
        tile('\u{1F4D2}', t.wordsEyebrow, c.seen + ' vus, ' + c.mature + ' solides', 'go', 'woorden') +
        tile('\u{1F4CB}', t.sheetsEyebrow, t.sheetsTitle, 'go', 'spiek') +
        tile('\u{1F1E7}\u{1F1EA}', t.regEyebrow, t.regTitle, 'go', 'register') +
        tile('\u{1F444}', t.soundsEyebrow, t.soundsTitle, 'go', 'klanken') +
        tile('\u{1F517}', 'de / het', t.dehetTitle, 'go', 'dehet') +
        tile('\u{1F50A}', t.docEyebrow, t.docTitle, 'go', 'doctor') +
        tile('\u{1F4CF}', 'Test de niveau', m.placed ? 'Le refaire' : 'Pas encore fait', 'go', 'placement') +
        '</div>' +

        '<h3 class="sec">' + t.weekTitle + '</h3>' +
        '<section class="card"><div class="spark">' +
        days.map(x => '<div class="spark-col" title="' + x.d + ' : ' + x.n + '">' +
          '<div class="spark-bar" style="height:' + Math.max(4, x.n / maxN * 62) + 'px"></div>' +
          '<span>' + t.days[new Date(x.d).getDay()] + '</span></div>').join('') +
        '</div>' +
        '<div class="mini-stats">' +
        '<span><b>' + c.learning + '</b> ' + t.statLearning + '</span>' +
        '<span><b>' + c.mature + '</b> ' + t.statStrong + '</span>' +
        '<span><b>' + c.said + '</b> ' + t.statSpoken + '</span>' +
        '<span><b>' + (m.best || 0) + '</b> ' + t.statBest + '</span>' +
        '<span><b>' + m.xp + '</b> XP</span>' +
        '</div></section></div>';
    },
    click(el, d) { if (d.sheetid) NL.ui.go('spiek', d.sheetid); }
  };
})();
