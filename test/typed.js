/* Ce qu'une réponse tapée accepte, et ce que dit le panneau après « Vérifier ».

   Le 17 octobre, sur l'iPhone, « dag », « hallo », « hallo » et « dank u » ont
   été refusés en « Écris-le en néerlandais » et comptés contre leur élément :
   le juge ne connaissait qu'une orthographe. Et le panneau répétait ce qu'il
   montrait déjà. Voir l'issue #29.

   Chaque réponse est tapée à l'écran, comme le ferait la personne, dans une
   séance qui ne sert que l'élément voulu : la séance des fautes ne sert que ce
   qu'on a raté, à l'échelon où il se trouve. NL.srs prépare l'élément et relit
   ce que la réponse lui a fait. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];
const T0 = Date.parse('2026-10-17T16:00:00Z');
const HOUR = 3600000, DAY = 24 * HOUR;

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const OPTS = { root: ROOT, now: T0, ua: browser.UA.EDG, byId: 'stub', media: true };
const B = browser.open(Object.assign({ seed: browser.SEED }, OPTS));
const NL = B.NL, S = NL.screens.sessie, U = NL.util, t = NL.t;
const answer = require('./lib/answer')(B);

const { text, joined } = require('./lib/langs');
const fresh = () => { S.abandon(); NL.state.clearAll(); NL.content.refresh(); B.clock.set(T0); };
const find = nl => NL.content.allItems().find(x => x.nl === nl);
const say = s => '« ' + s + ' »';

/* L'élément, seul, dans l'exercice voulu. Le dernier exercice servi est
   l'autre de l'échelon : il ne reste donc que celui qu'on demande, ou un tirage
   qu'on refait jusqu'à le tomber. */
function ask(it, ex, rung, lastEx) {
  NL.srs.seed(it, rung);
  const r = NL.state.rec(it.id);
  r.due = T0 - HOUR; r.lastEx = lastEx; r.said = true;
  NL.state.setRec(r);
  NL.state.logReview({ id: it.id, t: T0 - DAY, ok: false, stage: rung, kind: it.kind, ex: 'type' });
  for (let k = 0; k < 40; k++) {
    S.abandon();
    NL.screens.fouten.click({ dataset: {} }, { act: 'start' });
    const c = S.peek();
    if (c && c.ex === ex && c.items[0].id === it.id) return true;
  }
  return false;
}
const askTyped = it => it.kind === 'word' ? ask(it, 'type', 2, 'dictation') : ask(it, 'type', 3, 'speak');

/* Le panneau qui suit « Vérifier », et ce que la réponse a laissé à l'élément.
   `answer` est la ligne de réponse en gras, null quand le panneau ne la montre pas. */
function verdict(it) {
  const html = B.app.innerHTML, at = html.indexOf('<div class="foot');
  const foot = at >= 0 ? html.slice(at) : '';
  const be = (foot.match(/<p class="v-be">([\s\S]*?)<\/p>/) || [null, null])[1];
  const line = (foot.match(/<p><b[^>]*>([\s\S]*?)<\/b><\/p>/) || [null, null])[1];
  const r = NL.srs.recOf(it);
  return {
    right: foot.indexOf('<div class="foot ok"') === 0, foot, text: text(foot),
    be: be === null ? null : text(be),
    answer: line === null ? null : text(line),
    bold: be === null ? [] : (be.match(/<b>([\s\S]*?)<\/b>/g) || []).map(b => text(b)).join(' ').split(' ').filter(Boolean).map(U.norm),
    rec: { stage: NL.srs.stageOf(it), lapses: r.lapses, reps: r.reps, interval: r.interval, ease: r.ease, said: r.said, retired: !!r.retired }
  };
}

function typed(which, input) {
  fresh();
  const it = typeof which === 'string' ? find(which) : NL.content.byId(which.id);
  if (!it) { ok(false, 'setup: no item ' + say(typeof which === 'string' ? which : which.id)); return null; }
  if (!askTyped(it)) { ok(false, 'setup: ' + say(it.nl) + ' is never asked in « Écris-le en néerlandais »'); return null; }
  answer.type(input);
  answer.click({ check: '1' });
  const v = verdict(it);
  v.it = it;
  S.abandon();
  return v;
}
const targetOf = it => it.kind === 'word' ? U.bare(it.nl) : it.nl;

/* Les formes que le panneau présente comme justes : toutes celles qu'imprime
   « Ici on dit », et la liste also. Lues dans le HTML du panneau : c'est ce
   que la personne voit. Chaque forme flamande y est son propre passage en
   nl-BE, lu tel quel ; le cours se lit, lui, en coupant sa liste aux
   virgules. Les deux côtés ne se lisent pas de la même façon : un panneau
   qui fondrait la liste en un seul passage ne passerait pas pour juste. */
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const formsOf = it => {
  const be = (NL.ex.hereLine(it, '', true).match(/<span lang="nl-BE">[\s\S]*?<\/span>/g) || []).map(s => decode(joined(s)).trim());
  return be.map(f => ['be', f]).concat((it.also || []).map(f => ['also', f]));
};

NL.state.open().then(() => {
  console.log('\nRÉPONSES TAPÉES');

  /* Une bonne réponse laisse l'élément comme le laisse la cible tapée : un
     échelon de plus, aucune rechute. */
  const right = (nl, input, why) => {
    const v = typed(nl, input);
    if (!v) return null;
    ok(v.right, say(input) + ' for ' + say(U.bareFr(v.it.fr)) + ' (' + say(nl) + ', ' + why + ') is marked wrong');
    ok(v.text.indexOf(t.almost) < 0 || !v.right, say(input) + ' is right and the panel says « ' + t.almost + ' »');
    const twin = typed(nl, targetOf(v.it));
    if (twin) {
      const start = v.it.kind === 'word' ? 2 : 3;
      ok(v.rec.stage === start + 1 && v.rec.lapses === 0,
        say(input) + ' for ' + say(nl) + ' leaves it on rung ' + v.rec.stage + ' with ' + v.rec.lapses + ' lapse(s): a right answer leaves it on rung ' + (start + 1) + ' with none');
      ok(JSON.stringify(v.rec) === JSON.stringify(twin.rec),
        say(input) + ' leaves ' + say(nl) + ' as ' + JSON.stringify(v.rec) + ', the exact answer as ' + JSON.stringify(twin.rec));
    }
    return v;
  };

  /* Les réponses justes que le contenu ne tenait pas : le champ also. */
  right('goeiedag', 'dag', 'also');
  right('dag', 'hallo', 'also');
  right('dag', 'goeiedag', 'also: bonjour et salut, le même salut');
  right('dank u wel', 'dank u', 'also');
  right('dank u wel', 'bedankt', 'also');
  console.log('  also           « dag », « hallo », « dank u », « bedankt »');

  /* La variante flamande de l'élément lui-même. */
  right('dank u wel', 'merci', 'its be variant');
  right('natuurlijk', 'tuurlijk', 'its be variant');
  right('Ik ben Nederlands aan het leren.', 'Ik ben Nederlands aan het leren, hè', 'its be variant');
  console.log('  be             « merci », « tuurlijk », la phrase en « hè »');

  /* La réponse d'un autre élément au même sens : décision A du 17 octobre. Le
     panneau nomme le mot que cet élément enseigne. */
  {
    const v = right('goeiedag', 'hallo', 'same sense as hallo');
    if (v) {
      ok(v.text.indexOf('goeiedag') >= 0, '« hallo » for goeiedag: the panel does not name « goeiedag »: ' + v.text);
      ok(!!t.askedFor && v.text.indexOf(t.askedFor + ' goeiedag') >= 0,
        '« hallo » for goeiedag: the panel does not say that « goeiedag » was the word asked for (NL.t.askedFor): ' + v.text);
    }
    const own = typed('goeiedag', 'goeiedag');
    if (own) ok(!t.askedFor || own.text.indexOf(t.askedFor) < 0, 'the exact answer is told « ' + t.askedFor + ' »: ' + own.text);
    console.log('  même sens      « hallo » pour goeiedag, et le panneau nomme goeiedag');
  }

  /* Ce qui reste faux, et le « Presque » mesuré contre chaque réponse acceptée. */
  {
    const v = typed('dank u wel', 'dag');
    if (v) {
      ok(!v.right, '« dag » for « merci » is marked right');
      ok(v.text.indexOf(t.almost) < 0, '« dag » for « merci » reads « ' + t.almost + ' »');
      ok(v.rec.lapses === 1, '« dag » for « merci » did not count as a wrong answer: ' + JSON.stringify(v.rec));
    }
    [['dank u wel', 'dak u', 'one letter off « dank u » (also)'],
      ['dank u wel', 'merco', 'one letter off « merci » (be)']].forEach(([nl, input, why]) => {
      const w = typed(nl, input);
      if (!w) return;
      ok(!w.right, say(input) + ' for ' + say(nl) + ' is marked right: a short word is spelt exactly');
      ok(w.text.indexOf(t.almost) >= 0, say(input) + ' for ' + say(nl) + ', ' + why + ', does not read « ' + t.almost + ' »: ' + w.text);
    });
    console.log('  faux           « dag » pour merci ; « dak u » et « merco » lisent « Presque »');
  }

  /* La dictée demande ce qu'on a entendu : elle garde sa seule cible. */
  {
    fresh();
    const it = find('dank u wel');
    if (!ask(it, 'dictation', 2, 'type')) ok(false, 'setup: dank u wel is never dictated');
    else {
      answer.type('merci');
      answer.click({ check: '1' });
      ok(!verdict(it).right, 'dictation took « merci » for « dank u wel »: it asks for what was heard');
      S.abandon();
    }
    console.log('  dictée         une seule cible');
  }

  console.log('\nTOUT LE COURS');
  /* Tout le cours, pas seulement les réponses du 17 octobre : pour chaque
     élément, sa cible puis chaque forme que le panneau présente comme juste,
     tapées à l'écran. « Écris-le en néerlandais » est sur l'échelle de chaque
     sorte d'élément : il peut tous les demander. Chaque forme est juste et
     laisse l'élément comme la cible (#32). Par l'écran plutôt que par le juge :
     mesuré le 18 octobre, une réponse tapée coûte 11 ms, et le cours entier se
     tape en quelques secondes. */
  {
    const all = NL.content.allItems();
    /* « Ici on dit » montre la variante flamande telle que le cours l'écrit : pour un mot,
       chaque forme de sa liste ; pour une phrase, toute la phrase, sa ponctuation collée au
       mot qu'elle suit. */
    const misread = all.filter(it => it.be).map(it => ({
      id: it.id,
      shown: formsOf(it).filter(([src]) => src === 'be').map(([, f]) => f),
      written: it.kind === 'word' ? it.be.split(',').map(s => s.trim()).filter(Boolean) : [it.be]
    })).filter(m => JSON.stringify(m.shown) !== JSON.stringify(m.written));
    ok(misread.length === 0, 'setup: « ' + t.hereThey + ' » shows the be variant otherwise than the course writes it for ' + misread.length + ' item(s), e.g. ' +
      misread.slice(0, 3).map(m => m.id + ' ' + JSON.stringify(m.shown) + ' for ' + JSON.stringify(m.written)).join(', '));
    let forms = 0;
    all.forEach(it => {
      const target = targetOf(it), start = it.kind === 'word' ? 2 : 3;
      const twin = typed(it, target);
      if (!twin) return;
      ok(twin.right && twin.rec.stage === start + 1 && twin.rec.lapses === 0,
        'the exact answer ' + say(target) + ' for ' + it.id + ' is marked ' + (twin.right ? 'right' : 'wrong') + ' and leaves it on rung ' + twin.rec.stage + ' with ' + twin.rec.lapses + ' lapse(s)');
      formsOf(it).forEach(([src, f]) => {
        forms++;
        const v = typed(it, f);
        if (!v) return;
        ok(v.right, say(f) + ', which the panel presents as right (' + src + '), is marked wrong for ' + it.id + ' ' + say(it.nl));
        if (v.right) ok(JSON.stringify(v.rec) === JSON.stringify(twin.rec),
          say(f) + ' (' + src + ') leaves ' + it.id + ' as ' + JSON.stringify(v.rec) + ', the exact answer as ' + JSON.stringify(twin.rec));
      });
    });
    console.log('  cours entier   ' + all.length + ' cibles et ' + forms + ' formes du panneau, justes et notées comme la cible');
  }

  console.log('\nLEURRES');
  /* Deux éléments ne font qu'une réponse quand l'un accepte la réponse de
     l'autre : « dag » n'est jamais un leurre pour « bonjour », ni « hallo » pour
     « salut ». */
  {
    const offered = {};
    for (let seed = 1; seed <= 6; seed++) {
      const b = browser.open(Object.assign({ seed }, OPTS));
      const all = b.NL.content.allItems();
      [['goeiedag', 'pick'], ['dag', 'pick'], ['dag', 'recall'], ['dank u wel', 'recall']].forEach(([nl, ex]) => {
        const it = all.find(x => x.nl === nl), key = nl + ' ' + ex;
        offered[key] = offered[key] || new Set();
        for (let k = 0; k < 60; k++) b.NL.ex.get(ex).build(it).opts.filter(o => !o.ok).forEach(o => offered[key].add(o.label));
      });
    }
    const never = (key, labels) => labels.forEach(l =>
      ok(!offered[key].has(l), key + ' offers ' + say(l) + ' as a wrong option, though it is a right answer'));
    never('goeiedag pick', ['dag', 'hallo']);
    never('dag pick', ['hallo', 'goeiedag']);
    never('dag recall', ['bonjour']);
    console.log('  pick et recall, six graines × 60 tirages : ni « dag » ni « hallo » face à « bonjour »');
  }

  console.log('\nLE PANNEAU');
  /* « Comment le dit-on ici ? » : passé, la variante est la réponse, une seule
     fois, et ce qui change par rapport à la phrase standard du sujet est en gras.
     Même sans la ligne flamande dans les réglages : c'est la réponse. Choisie,
     elle est déjà à l'écran : le panneau ne la redit pas. */
  [true, false].forEach(showFlemish => ['right', 'wrong'].forEach(how => {
    fresh();
    NL.state.setMeta({ showFlemish });
    const it = find('Ik ben Nederlands aan het leren.');
    if (!ask(it, 'vlaams', 1, 'bank')) { ok(false, 'setup: the hè sentence is never asked in « Comment le dit-on ici ? »'); return; }
    answer[how]();
    const v = verdict(it), be = U.norm(it.be);
    const times = U.norm(v.text).split(be).length - 1;
    const at = '« Comment le dit-on ici ? » (showFlemish ' + showFlemish + ', ' + how + ')';
    ok(v.right === (how === 'right'), at + ' gives the wrong verdict');
    if (how === 'right') ok(times === 0 && v.be === null && v.answer === null, at + ' repeats the option just chosen: ' + v.text);
    else {
      ok(times === 1, at + ' shows the be variant ' + times + ' times: ' + v.text);
      ok(JSON.stringify(v.bold) === JSON.stringify(['hè']), at + ' puts ' + JSON.stringify(v.bold) + ' in bold, not « hè » alone: ' + v.text);
    }
    S.abandon();
  }));
  NL.state.setMeta({ showFlemish: true });
  console.log('  vlaams         choisie, rien de redit ; passée, la variante une fois, « hè » en gras');

  {
    const spoor = typed('Op welk spoor?', 'Op welk spoor?');
    if (spoor) ok(spoor.be === null && spoor.text.indexOf(t.hereThey) < 0, '« Op welk spoor? » still shows « ' + t.hereThey + ' »: ' + spoor.text);

    const he = typed('Ik ben Nederlands aan het leren.', 'Ik ben Nederlands aan het leren.');
    if (he) {
      ok(he.be !== null && U.norm(he.be).indexOf(U.norm('Ik ben Nederlands aan het leren, hè.')) >= 0, 'the hè sentence has no « ' + t.hereThey + ' » line: ' + he.text);
      ok(JSON.stringify(he.bold) === JSON.stringify(['hè']), 'the hè sentence puts ' + JSON.stringify(he.bold) + ' in bold, not « hè » alone');
    }
    const da = typed('Sorry, ik heb dat niet verstaan.', 'Sorry, ik heb dat niet verstaan.');
    if (da) ok(JSON.stringify(da.bold.slice().sort()) === JSON.stringify(['da', 'nie']), '« Sorry, ik heb da nie verstaan. » puts ' + JSON.stringify(da.bold) + ' in bold, not « da » and « nie »');

    const ja = typed('ja', 'ja');
    if (ja) ok(ja.be !== null && U.norm(ja.be) === U.norm(t.hereThey + ' jaja'), '`ja` shows « ' + (ja.be || '(no line)') + ' », not « ' + t.hereThey + ' jaja »');

    const dank = typed('dank u wel', 'dank u wel');
    if (dank) ok(dank.text.indexOf(t.alsoSaid + ' dank u, bedankt') >= 0, '`dank u wel` does not show « ' + t.alsoSaid + ' dank u, bedankt »: ' + dank.text);
    console.log('  ici on dit     rien pour « Op welk spoor? », « hè », « da nie », « jaja » ; on dit aussi');

    /* Une bonne réponse n'est pas redite. Tapée telle quelle, la ligne en gras
       disparaît et « Ici on dit » garde l'autre forme. Tapée en flamand, la
       réponse standard reste et la forme tapée ne revient pas. Fausse, tout reste. */
    const same = typed('nog eens', 'nog eens');
    if (same) ok(same.right && same.answer === null && same.be !== null && U.norm(same.be) === U.norm(t.hereThey + ' nog is'),
      '`nog eens` typed right shows « ' + same.answer + ' » in bold and « ' + same.be + ' », not only « ' + t.hereThey + ' nog is »: ' + same.text);
    const asBe = typed('nog eens', 'nog is');
    if (asBe) ok(asBe.right && asBe.answer === 'nog eens' && asBe.be === null,
      '`nog is` typed for `nog eens` shows « ' + asBe.answer + ' » in bold and « ' + asBe.be + ' », not « nog eens » alone: ' + asBe.text);
    const off = typed('nog eens', 'nog');
    if (off) ok(!off.right && off.answer === 'nog eens' && off.be !== null,
      '`nog` typed for `nog eens` is marked right, or loses its answer line or « ' + t.hereThey + ' »: ' + off.text);
    console.log('  pas redit      « nog eens » tapé juste, en flamand, faux');
  }

  console.log('\n' + checks + ' contrôles, ' + fails + ' en échec');
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('FAIL: ' + (e && e.stack || e)); process.exit(1); });
