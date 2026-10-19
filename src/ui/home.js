/* Aujourd'hui (la session du jour), Parcours (le programme) et Plus (le reste).
   Une décision par écran : l'action principale d'abord, le reste sous la ligne de flottaison. */
(function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;

  /* ---------------------------------------------------- Aujourd'hui */
  NL.screens.vandaag = {
    render() {
      const m = NL.state.meta();
      const cp = NL.content.courseProgress();
      const p = NL.srs.plan();
      const fresh = p.fresh, total = p.total, mins = p.mins;
      const v = NL.speech.voiceInfo();

      let html = '<div class="wrap">';

      /* The one thing this screen is for. Elle nomme l'unité — ou les deux, quand
         la séance en couvre plusieurs : un libellé ne dit jamais une demi-vérité. */
      html += '<section class="card session-card">' +
        '<span class="eyebrow">' + t.todayEyebrow + (p.units ? ' · ' + esc(NL.ui.unitLabel(p.units)) : '') + '</span>' +
        (total === 0 && p.left === 0 && NL.srs.dueItems().length > 0
          ? '<h2>' + t.budgetDone + '</h2>' +
          '<button class="btn btn-blue wide big" data-go="praten">' + t.todayPractise + '</button>'
          : total === 0
          ? '<h2>' + t.todayAllDone + '</h2><p class="sc-sub">' + t.todayAllDoneSub + '</p>' +
          '<button class="btn btn-blue wide big" data-go="praten">' + t.todayPractise + '</button>'
          : '<h2>' + t.todayReady(total) + '</h2>' +
          '<p class="sc-sub">' + t.todaySplit(p.due, fresh, mins) + '</p>' +
          '<button class="btn btn-primary wide big" data-act="start">' + t.todayStart + '</button>') +
        '</section>';

      if (v.quality !== 'be') {
        html += '<button class="notice" data-go="doctor">' +
          '<b>' + (v.quality === 'nl' ? 'Voix du nord des Pays-Bas' : 'Aucune voix néerlandaise') + '</b>' +
          '<p>' + esc(v.note) + ' Touche ici pour tester et corriger.</p></button>';
      }

      /* La série enregistrée ne change qu'à la séance suivante : un jour sauté, elle est déjà coupée.
         Même compte des jours que creditDay(), qui ne la prolonge que depuis la veille. */
      const streak = m.lastDay && U.dayDiff(m.lastDay, U.dayKey()) <= 1 ? m.streak : 0;
      html += '<div class="tri">' +
        stat(streak, t.statStreak(streak)) +
        stat(cp.met, t.statMet) +
        stat(cp.produce, t.statProduce) +
        '</div>';

      html += '<h3 class="sec">' + t.morepractice + '</h3><div class="cards">';
      html += defiTile(m);
      const scn = (NL.content.scenarios || []).filter(s => (m.scenariosDone || []).indexOf(s.id) < 0)[0] || NL.content.scenarios[0];
      html += tile(scn.icon, NL.gloss.of(scn.title), NL.gloss.of(scn.place), 'scn', scn.id);
      html += tile('\u{1F3A7}', t.listenTitle, t.listenUnderstandSub, 'go', 'luisteren');
      const sheet = NL.content.sheets[(m.doneToday || 0) > 0 ? 1 : 0];
      html += tile(sheet.icon, NL.gloss.of(sheet.title), NL.gloss.of(sheet.blurb), 'sheetid', sheet.id);
      html += '</div></div>';
      return html;
    },
    click(el, d) {
      if (d.act === 'start') { NL.screens.sessie.begin('vandaag'); NL.ui.go('sessie'); return; }
      if (d.act === 'defi') return openDefi();
      if (d.scn) { NL.ui.go('scenario', d.scn); return; }
      if (d.sheetid) { NL.ui.go('spiek', d.sheetid); return; }
    }
  };

  /* Le défi : visible dès le début, verrouillé tant qu'il n'y a pas de quoi le remplir. */
  function defiTile(m) {
    const ready = NL.screens.sessie.defiReady();
    return '<button class="tile-card defi' + (ready ? '' : ' locked') + '" data-act="defi">' +
      '<span class="tc-icon">⚡</span>' +
      '<span class="tc-body"><b>' + t.defiTitle + '</b><i>' +
      (ready ? (m.defiBest ? t.defiSubBest(m.defiBest) : t.defiSub) : t.defiLocked(NL.screens.sessie.DEFI_MIN)) +
      '</i></span><span class="tc-cta">›</span></button>';
  }
  function openDefi() {
    if (!NL.screens.sessie.defiReady()) { NL.ui.toast(t.defiLocked(NL.screens.sessie.DEFI_MIN)); return; }
    NL.screens.sessie.begin('defi'); NL.ui.go('sessie');
  }

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
        '<p class="muted small">' + t.courseCounts(cp.met, cp.produce, cp.total) + '</p>' +
        '</section>';

      NL.content.units.forEach(u => {
        const open = NL.content.unitOpen(u.id);
        const isNow = cp.current && cp.current.id === u.id;
        const p = NL.content.unitProgress(u.id);
        const g = (u.grammar || []).map(id => (NL.content.patterns || []).find(x => x.id === id)).filter(Boolean);
        html += '<section class="unit-card' + (open ? '' : ' locked') + (isNow ? ' now' : '') + '">' +
          (isNow ? '<span class="now-tag">' + t.currentUnit + '</span>' : '') +
          '<div class="uc-head">' +
          '<span class="uc-icon">' + u.icon + '</span>' +
          '<div class="uc-title"><span class="eyebrow">Unité ' + u.n + ' · ' + u.level + ' · ' + trackName(u.track) + '</span>' +
          '<h2>' + esc(NL.gloss.of(u.name)) + '<i class="uc-nl">' + esc(u.nlName || '') + '</i></h2></div>' +
          '<span class="uc-pct">' + p.met + '/' + p.total + '</span>' +
          '</div>' +
          '<p class="uc-blurb">' + esc(NL.gloss.of(u.blurb)) + '</p>' +
          '<p class="muted small">' + t.unitCounts(p.met, p.produce, p.total) + '</p>' +
          /* Le seuil est un compte à rebours, pas un mystère. */
          (open && p.toOpen > 0 && u !== NL.content.units[NL.content.units.length - 1]
            ? '<p class="uc-gate">' + t.unitGate(p.toOpen) + '</p>' : '') +
          (g.length ? '<div class="uc-gram">' + g.map(x =>
            '<button class="gram-chip" data-act="gram" data-id="' + x.id + '">' + esc(NL.gloss.of(x.title)) + '</button>').join('') + '</div>' : '') +
          (open
            ? '<button class="btn btn-blue" data-unit="' + u.id + '">' + (p.met ? t.unitPractise : t.unitStart) + '</button>'
            : '<p class="uc-lock">' + t.unitLocked(u.n - 1) + '</p>') +
          '</section>';
      });
      return html + '</div>';
    },
    click(el, d) {
      if (d.unit) { NL.screens.sessie.begin(d.unit); NL.ui.go('sessie'); return; }
      if (d.act === 'gram') {
        const g = (NL.content.patterns || []).find(x => x.id === el.dataset.id);
        if (g) NL.ui.openSheet({ custom: NL.ui.card(esc(NL.gloss.of(g.title)),
          '<p class="rule">' + esc(NL.gloss.of(g.rule)) + '</p><div class="explain">' + NL.gloss.of(g.explain) + '</div>' +
          '<div class="ex-list">' + g.drills.slice(0, 3).map(d2 =>
            '<button class="ex-row" data-say="' + esc(d2.nl) + '"><b>' + esc(d2.nl) + '</b><i>' + esc(NL.gloss.of(d2)) + '</i></button>').join('') + '</div>',
          '<button class="btn btn-ghost wide" data-close="1">' + t.close + '</button>') });
      }
    }
  };
  const trackName = tr => tr === 'werk' ? t.trackWork : tr === 'leven' ? t.trackLife : t.trackBoth;

  /* ---------------------------------------------------- Plus */
  NL.screens.meer = {
    render() {
      const c = NL.srs.counts();
      const cp = NL.content.courseProgress();
      const mine = NL.content.allItems().filter(it => it.unit === 'eigen').length;
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
        defiTile(m) +
        tile('\u{1F4D2}', t.wordsEyebrow, t.wordsTile(cp.met, cp.produce), 'go', 'woorden') +
        tile('\u{1F3AF}', t.missEyebrow, t.missTile(NL.srs.mistakes().length), 'go', 'fouten') +
        tile('\u{1F4CB}', t.sheetsEyebrow, t.sheetsTitle, 'go', 'spiek') +
        tile('\u{1F1E7}\u{1F1EA}', t.regEyebrow, t.regTitle, 'go', 'register') +
        tile('\u{1F444}', t.soundsEyebrow, t.soundsTitle, 'go', 'klanken') +
        tile('\u{1F517}', 'de / het', t.dehetTitle, 'go', 'dehet') +
        tile('\u{1F50A}', t.docEyebrow, t.docTitle, 'go', 'doctor') +
        '</div>' +

        '<h3 class="sec">' + t.weekTitle + '</h3>' +
        '<section class="card"><div class="spark">' +
        days.map(x => '<div class="spark-col" title="' + x.d + ' : ' + x.n + '">' +
          '<div class="spark-bar" style="height:' + Math.max(4, x.n / maxN * 62) + 'px"></div>' +
          '<span>' + t.days[new Date(x.d).getDay()] + '</span></div>').join('') +
        '</div>' +
        '<div class="mini-stats">' +
        '<span><b>' + cp.met + '</b> ' + t.statMet + '</span>' +
        '<span><b>' + cp.produce + '</b> ' + t.statProduced + '</span>' +
        (mine ? '<span><b>' + mine + '</b> ' + t.statMine + '</span>' : '') +
        '<span><b>' + c.said + '</b> ' + t.statSpoken + '</span>' +
        '<span><b>' + (m.best || 0) + '</b> ' + t.statBest + '</span>' +
        '<span><b>' + (m.bestCombo || 0) + '</b> ' + t.statCombo + '</span>' +
        '<span><b>' + (m.defiBest || 0) + '</b> ' + t.statDefi + '</span>' +
        '<span><b>' + m.xp + '</b> XP</span>' +
        '</div></section></div>';
    },
    click(el, d) {
      if (d.sheetid) NL.ui.go('spiek', d.sheetid);
      if (d.act === 'defi') openDefi();
    }
  };
})();
