/* Cold start: empty database, first screen, first session answered CORRECTLY
   (not skipped), and the credit that should follow. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];

/* Opera, dans un cadre : ni reconnaissance vocale, ni voix. */
const B = browser.open({
  root: ROOT, seed: browser.SEED, ua: browser.UA.OPR, framed: true, blobs: true,
  location: { origin: 'https://claude.ai' }
});
const NL = B.NL, U = NL.util, app = B.app;
const answer = require('./lib/answer')(B);
let fails = 0;
const ok = (c, m) => { if (!c) { console.log('  FAIL: ' + m); fails++; } };

NL.state.open().then(() => {
  NL.content.refresh();
  NL.ui.bind(app);

  console.log('COLD START (Opera, artifact-like)');
  NL.ui.go('vandaag');
  const home = app.innerHTML;
  ok(!/test de niveau/i.test(home) && home.indexOf('placement') < 0, 'a blank account is still offered the placement test');
  ok(home.includes(NL.t.todayStart), 'no session button on a blank account');
  Object.keys(NL.tables.fr).forEach(k => { const f = NL.tables.fr[k], e = NL.tables.en[k]; if (typeof f === 'string' && f.length >= 12 && f !== e) ok(home.indexOf(f) < 0, 'the other language leaked onto the home screen: ' + k); });
  console.log('  home screen     ' + home.length + ' chars, session offered');
  console.log('  voice report    ' + NL.t[NL.speech.voiceInfo().noteKey].slice(0, 60) + '…');
  console.log('  mic verdict     listenBlocked=' + NL.speech.listenBlocked() + ', capability=' + NL.speech.capability().id);
  ok(NL.speech.listenBlocked() === 'browser', 'Opera should report no recogniser');
  ok(NL.speech.capability().id === 'self' || NL.speech.capability().id === 'compare', 'Opera speech capability should be compare or self');

  /* « -3 à revoir » : le total de la séance est plafonné à MAX_TASKS, le nombre
     de nouveaux ne l'était pas, et l'écran soustrayait l'un de l'autre. Sur une
     base vide, les nouveaux dépassent toujours le plafond : c'est ici que ça se
     voit. */
  console.log('\nPLAN DU JOUR');
  {
    const p0 = NL.srs.plan();
    console.log('  base vide        ' + p0.due + ' à revoir + ' + p0.fresh + ' nouveaux = ' + p0.total);
    ok(p0.fresh > 0, 'a blank account should have new material: ' + JSON.stringify(p0));
    ok(p0.due >= 0 && p0.fresh >= 0, 'negative figures on the home screen: ' + JSON.stringify(p0));
    ok(p0.due + p0.fresh === p0.total, 'the two halves must add up to the total: ' + JSON.stringify(p0));
    ok(p0.total <= NL.srs.MAX_TASKS, 'session longer than the cap: ' + JSON.stringify(p0));

    NL.srs.spend(NL.srs.pace().cap * 2);          // journée déjà bien remplie
    const p1 = NL.srs.plan();
    console.log('  budget épuisé    ' + p1.due + ' à revoir + ' + p1.fresh + ' nouveaux = ' + p1.total);
    ok(p1.due >= 0 && p1.fresh >= 0 && p1.total === 0, 'spent budget should offer nothing, got ' + JSON.stringify(p1));
    NL.state.setMeta({ exDay: null, exToday: 0 });
  }

  console.log('\nFIRST SESSION — answering correctly');
  NL.screens.sessie.begin('vandaag');
  NL.ui.go('sessie');

  const S = NL.screens.sessie;
  let turns = 0, kickers = {}, twins = 0;
  while (app.innerHTML.indexOf('done-stage') < 0 && turns++ < 60) {
    const html = app.innerHTML;
    const k = (html.match(/class="kicker"><span class="sub">[^<]*<\/span>([^<]*)/) || [])[1] || '(match)';
    kickers[k.trim()] = (kickers[k.trim()] || 0) + 1;

    /* Answer correctly: pick the option marked ok, place every tile, type the target. */
    if (html.includes('data-match=')) {
      /* Deux mots qui partagent une traduction se croisent : le mot A sur la
         carte « bonjour » de B, et inversement. À l'écran rien ne les distingue,
         donc c'est ce qu'un vrai utilisateur fait une fois sur deux. */
      const pairs = S.peek().task.pairs, done = new Set();
      for (let a = 0; a < pairs.length; a++) for (let b = a + 1; b < pairs.length; b++) {
        if (done.has(a) || done.has(b) || U.norm(pairs[a].gloss) !== U.norm(pairs[b].gloss)) continue;
        S.click({ dataset: {} }, { match: 'l' + a, k: String(a), side: 'l' });
        S.click({ dataset: {} }, { match: 'r' + b, k: String(b), side: 'r' });
        S.click({ dataset: {} }, { match: 'l' + b, k: String(b), side: 'l' });
        S.click({ dataset: {} }, { match: 'r' + a, k: String(a), side: 'r' });
        done.add(a); done.add(b); twins++;
      }
      for (let k2 = 0; k2 < pairs.length; k2++) {
        if (done.has(k2)) continue;
        S.click({ dataset: {} }, { match: 'l' + k2, k: String(k2), side: 'l' });
        S.click({ dataset: {} }, { match: 'r' + k2, k: String(k2), side: 'r' });
      }
      ok(!app.innerHTML.includes('data-match=') || S.peek().ex !== 'match', 'the matching board did not clear after every pair was matched');
      continue;
    }
    answer.right();
    answer.next(false);
  }
  console.log('  turns           ' + turns + (twins ? ', ' + twins + ' twin translation(s) matched crosswise' : ''));
  Object.keys(kickers).forEach(k => console.log('    ' + (k || '(match)').padEnd(32) + kickers[k]));
  ok(app.innerHTML.indexOf('done-stage') >= 0, 'session never reached the summary');

  const m = NL.state.meta();
  console.log('\nAFTER THE SESSION');
  console.log('  xp              ' + m.xp);
  console.log('  streak          ' + m.streak + ' (lastDay ' + m.lastDay + ')');
  console.log('  items seen      ' + NL.srs.counts().seen);
  ok(m.xp > 0, 'no XP credited');
  ok(m.streak === 1, 'streak not started');
  ok(NL.srs.counts().seen > 0, 'nothing recorded in the scheduler');

  console.log('\nLE DÉFI');
  {
    ok(S.defiReady(), 'after a first session the challenge should be unlocked');
    const xp0 = NL.state.meta().xp;
    ok(S.begin('defi'), 'the challenge did not start');
    NL.ui.go('sessie');
    const total = +app.innerHTML.match(/class="pill">\d+\/(\d+)</)[1];
    ok(total === 20 || total === NL.content.allItems().filter(i => NL.srs.stageOf(i) >= 1).length, 'the challenge should hold 20 exercises, got ' + total);
    ok(app.innerHTML.includes('class="lives"'), 'no lives shown in the challenge');
    /* Tout juste : vingt sur vingt, la série monte, un record s'écrit. */
    const kinds = {};
    for (let i = 0; i < 40 && !app.innerHTML.includes('done-stage'); i++) {
      kinds[S.peek().ex] = 1;
      ok(['pick', 'recall', 'match', 'speak', 'article', 'intrus'].indexOf(S.peek().ex) < 0, 'recognition or self-rated exercise in the challenge: ' + S.peek().ex);
      answer.right();
      ok(app.innerHTML.includes('foot ok'), 'the challenge rejected a correct answer (' + S.peek().ex + ')');
      if (i === 5) ok(/class="combo[^"]*"[^>]*>[^<]*6</.test(app.innerHTML), 'the combo counter is not shown after six in a row');
      S.click({ dataset: {} }, { next: '1' });
    }
    ok(app.innerHTML.includes('done-stage'), 'a flawless challenge never reached its summary');
    /* Un défi tient vingt exercices, ou moins quand moins d'éléments sont rencontrés : le titre dit ce qui a été joué. */
    const head = (app.innerHTML.match(/<h2>([^<]*)</) || [])[1] || '';
    ok(head.indexOf(String(total)) >= 0, 'a flawless challenge of ' + total + ' says « ' + head + ' »');
    ok(NL.state.meta().defiBest === total, 'the challenge record was not saved (' + NL.state.meta().defiBest + ')');
    ok(NL.state.meta().bestCombo >= total, 'the combo record was not saved (' + NL.state.meta().bestCombo + ')');
    const gained = NL.state.meta().xp - xp0;
    ok(gained > total * 3, 'the combo bonus did not add XP (' + gained + ' for ' + total + ')');
    console.log('  ' + total + '/' + total + ', types ' + Object.keys(kinds).join(', ') + ', +' + gained + ' XP, records saved');

    /* Trois fautes : fin immédiate, sans reprise. */
    S.begin('defi'); NL.ui.go('sessie');
    const len = S.peek() && app.innerHTML.match(/class="pill">\d+\/(\d+)</)[1];
    for (let k = 0; k < 3; k++) {
      S.click({ dataset: {} }, { skip: '1' });
      ok(app.innerHTML.match(/class="pill">\d+\/(\d+)</)[1] === len, 'a mistake in the challenge queued a retry');
      S.click({ dataset: {} }, { next: '1' });
    }
    ok(app.innerHTML.includes('done-stage'), 'three mistakes did not end the challenge');
    /* Fini sur trois fautes : trois réponses, pas la longueur du défi. */
    ok(app.innerHTML.includes(NL.t.defiScoreLine(0, 3)), 'after three answers, all wrong, the summary says « ' +
      ((app.innerHTML.match(/<p class="done-sub">([^<]*)</) || [])[1] || '') + ' »');
    ok(NL.state.meta().defiBest === total, 'a worse run overwrote the record');
    console.log('  three mistakes end it at once, no retries, record kept');
    S.abandon();
  }

  console.log('\nBACKUP ROUND TRIP');
  const dump = JSON.stringify(NL.state.exportAll());
  const before = NL.srs.counts().seen;
  NL.state.clearAll();
  ok(NL.srs.counts().seen === 0, 'wipe did not clear');
  ok(NL.state.importAll(JSON.parse(dump)), 'import rejected its own export');
  console.log('  ' + before + ' items exported, wiped, restored → ' + NL.srs.counts().seen);
  ok(NL.srs.counts().seen === before, 'restore lost items');

  /* « Passer » sur l'échauffement par paires : le premier écran d'un débutant.
     Il n'y avait plus de « Continuer », et chaque nouveau « Passer » ajoutait une
     reprise en recomptant cinq échecs. */
  console.log('\nSKIPPING THE WARM-UP');
  NL.state.clearAll(); NL.content.refresh();
  NL.screens.sessie.begin('vandaag'); NL.ui.go('sessie');
  if (S.peek() && S.peek().ex === 'match') {
    const len0 = S.peek() && app.innerHTML.match(/class="pill">\d+\/(\d+)</)[1];
    S.click({ dataset: {} }, { skip: '1' });
    ok(app.innerHTML.includes('data-next='), 'skipping the pairs leaves no way to continue');
    ok(!app.innerHTML.includes('data-skip='), 'the skip button is still offered after skipping');
    S.click({ dataset: {} }, { next: '1' });
    ok(!S.peek() || S.peek().ex !== 'match' || app.innerHTML.match(/class="pill">(\d+)\//)[1] !== '1', 'the session did not move past the skipped pairs');
    console.log('  skipped at 1/' + len0 + ', continue offered, session moved on');
  } else ok(false, 'a blank account should open on the pairs warm-up');
  S.abandon();

  console.log('\n' + (fails === 0 ? 'FIRST RUN IS CLEAN' : fails + ' PROBLEM(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
