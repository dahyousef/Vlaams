/* The exercise types. Each exposes the same five functions so the session runner
   never needs to know which one it is holding. */
NL.ex = (function () {
  'use strict';
  const U = NL.util, esc = U.esc;

  /* ---------------- shared bits of view ---------------- */
  const ICON = {
    speaker: (s) => '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9.5h3.2L12 5.2v13.6L7.2 14.5H4v-5Z"/><path d="M15.2 8.6a4.7 4.7 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M17.8 6a8.2 8.2 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    turtle: () => '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9.5h3L11 6v12L7 14.5H4v-5Z"/><path d="M14.4 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.2 17.6 19.8 19.2M18.2 6.4 19.8 4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    mic: (s) => '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 17.5v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  const speakerRow = (text, opts) => {
    opts = opts || {};
    return '<div class="speaker-row">' +
      '<button class="speaker" data-say="' + esc(text) + '" aria-label="' + NL.t.listen + '">' + ICON.speaker(26) + '</button>' +
      '<button class="speaker slow" data-say="' + esc(text) + '" data-slow="1" aria-label="' + NL.t.slow + '">' + ICON.turtle() + '</button>' +
      (opts.show ? '<div class="sentence"><span' + NL.gloss.attr('nl') + '>' + esc(text) + '</span>' + flemish(opts.be, text) + '</div>' : '') +
      '</div>';
  };

  const flemish = (be, std) => (be && NL.state.meta().showFlemish !== false && U.norm(be) !== U.norm(std))
    ? '<span class="be-line"><span class="be-tag">' + NL.t.beTag + '</span><span' + NL.gloss.attr('nl') + '>' + esc(be) + '</span></span>' : '';

  /* `lang` : l'attribut de la langue des libellés, NL.gloss.attr('nl') pour du néerlandais, NL.gloss.langAttr pour des sens. */
  function optList(opts, L, phase, lang) {
    return '<div class="opts">' + opts.map((o, i) => {
      let cls = '';
      if (phase === 'ask') cls = (L.sel && L.sel.i === i) ? ' sel' : '';
      else if (o.ok) cls = ' ok';
      else if (L.sel && L.sel.i === i) cls = ' no';
      return '<button class="opt' + cls + '" data-opt="' + i + '"' + (phase === 'ask' ? '' : ' disabled') + '>' +
        '<span class="opt-key">' + (i + 1) + '</span><span' + lang + '>' + esc(o.label) + '</span></button>';
    }).join('') + '</div>';
  }

  function tileArea(task, L, phase) {
    const src = task.bank;
    const chosen = L.picked.map(i =>
      '<button class="tile"' + NL.gloss.attr('nl') + ' data-unpick="' + i + '"' + (phase === 'ask' ? '' : ' disabled') + '>' + esc(src[i]) + '</button>').join('');
    const bank = src.map((w, i) => {
      const used = L.picked.indexOf(i) >= 0;
      return '<button class="tile' + (used ? ' spent' : '') + '"' + NL.gloss.attr('nl') + ' data-pick="' + i + '"' +
        (phase === 'ask' && !used ? '' : ' disabled') + '>' + esc(w) + '</button>';
    }).join('');
    return '<div class="answer-area' + (L.picked.length ? '' : ' hint') + '">' + chosen + '</div>' +
      '<div class="bank">' + tileShuffleGuard(bank) + '</div>';
  }
  const tileShuffleGuard = html => html || '<span class="muted">—</span>';

  const said = (task, L) => L.picked.map(i => task.bank[i]).join(' ');
  /* Le libellé de l'option choisie, null sans choix. */
  const chosenLabel = (task, L) => L.sel && task.opts[L.sel.i] ? task.opts[L.sel.i].label : null;

  /* Une note de prononciation se dit en mots reconnus, pas en pourcentage. */
  const wordScore = parts => NL.t.wordsHeard((parts || []).filter(p => p.ok).length, (parts || []).length);

  /* Ce que la réponse tapée accepte pour un élément : la cible, ses variantes
     flamandes (une par virgule pour un mot, la phrase entière pour une phrase) et
     sa liste « also ». Un mot se tape avec ou sans article, comme la cible. */
  function accepted(item) {
    const word = item.kind === 'word';
    return U.uniq([item.nl].concat(NL.content.beVariants(item), item.also || [])
      .map(x => U.norm(word ? U.bare(x) : x)).filter(Boolean));
  }
  /* Les éléments qui disent la même chose : taper l'un est juste pour l'autre. */
  const siblings = item => NL.content.allItems().filter(x => x.id !== item.id && x.nl && NL.gloss.sameSense(x, item));
  /* Les réponses acceptées (`list`) comprennent-elles le néerlandais de `b` ? */
  const accepts = (list, b) => list.indexOf(U.norm(U.bare(b.nl))) >= 0;

  /* Les mauvaises réponses décident de la difficulté d'un QCM. Tirées au hasard
     dans l'unité, elles s'éliminent sans connaître le mot : la bonne est la plus
     longue, ou la seule avec le bon article, ou la seule du bon champ lexical.
     On les choisit donc PROCHES de la bonne réponse — même genre, longueur
     comparable, graphie voisine — pour qu'il faille vraiment savoir.
     "field" : 'nl' pour des mots néerlandais, 'gloss' pour des sens. Les sens se
     jugent dans la langue lue de l'élément : on ne pose jamais contre des
     éléments qui n'ont rien dans cette langue. */
  function others(item, n, field) {
    const lang = NL.gloss.langOf(item);
    const label = x => field === 'gloss' ? NL.gloss.bare(x, lang) : U.bare(x.nl);
    const cls = NL.gloss.wordClass(item, lang);
    const target = label(item), tn = U.norm(target), len = target.length;

    let pool = NL.content.itemsOf(item.unit).filter(x => x.id !== item.id && x.kind === item.kind && NL.gloss.has(x, lang));
    /* Unité trop maigre : on élargit aux éléments déjà rencontrés ailleurs,
       jamais à ceux qui n'ont pas encore été introduits. */
    if (pool.length < n + 3) {
      pool = pool.concat(NL.content.allItems().filter(x =>
        x.kind === item.kind && x.unit !== item.unit && x.id !== item.id && NL.gloss.has(x, lang) && NL.srs.isSeen(x)));
    }
    /* Un leurre ne doit jamais être une autre bonne réponse. « bonjour » se dit
       « hallo » ET « goeiedag » : proposer les deux, c'est en compter un faux.
       On compare chaque sens (« s'il vous plaît / voilà » en a deux), dans les
       deux langues : c'est NL.gloss.sameMeaning. Le lexique sépare les sens par
       « / » ; une virgule, elle, appartient à la phrase et ne sépare rien. Ni un
       synonyme, ni une réponse que l'un des deux accepte : « dag » face à
       « bonjour » ne doit pas offrir « hallo » comme faux. */
    const mine = accepted(item);
    pool = pool.filter(x => U.norm(label(x)) !== tn && !NL.gloss.sameMeaning(x, item) && !accepts(mine, x) && !accepts(accepted(x), item));

    const score = x => {
      const s = label(x);
      let sc = 0;
      if (item.art && x.art && x.art === item.art) sc += 3;        // pas de tri par de/het
      if (NL.gloss.wordClass(x, lang) === cls) sc += 3;            // pas de tri par nature
      const gap = Math.abs(s.length - len) / Math.max(len, 1);
      sc += gap < 0.2 ? 3 : gap < 0.45 ? 2 : gap < 0.7 ? 1 : 0;    // pas de tri par longueur
      const d = U.lev(U.norm(s), tn);
      if (d <= Math.max(2, Math.round(len * 0.4))) sc += 2;        // voisin à l'œil et à l'oreille
      return sc;
    };

    /* On garde le peloton de tête puis on tire dedans : proche sans être
       toujours le même trio pour un mot donné. */
    const ranked = U.shuffle(pool).sort((a, b) => score(b) - score(a));
    const short = ranked.slice(0, Math.max(n, Math.min(ranked.length, n * 3)));
    return U.uniq(U.sample(short, n).map(label)).slice(0, n);
  }
  function bankFor(sentence, item, extra) {
    const right = U.tiles(sentence);
    const pool = [];
    NL.content.itemsOf(item.unit).forEach(x => {
      if (x.id === item.id || x.kind !== 'phrase') return;
      U.tiles(x.nl).forEach(t => pool.push(t));
    });
    const noise = U.sample(
      U.uniq(pool).filter(t => !right.some(r => U.norm(r) === U.norm(t))),
      Math.min(extra == null ? 4 : extra, 5)
    );
    return U.shuffle(right.concat(noise));
  }

  /* Picks a content word worth hiding: the longest, least function-like token. */
  function gapWord(sentence, forced) {
    const ts = U.tiles(sentence);
    if (forced && ts.some(t => U.norm(t) === U.norm(forced))) return ts.find(t => U.norm(t) === U.norm(forced));
    const stop = ['de', 'het', 'een', 'ik', 'je', 'ge', 'is', 'en', 'in', 'op', 'te', 'dat', 'niet', 'u', 'van'];
    const cands = ts.filter(t => stop.indexOf(U.norm(t)) < 0 && t.length > 2);
    return (cands.length ? cands : ts).sort((a, b) => b.length - a.length)[0];
  }

  /* ---------------- the types ----------------
     Chaque type dit en quoi il pose (`asks`) et en quoi il répond (`answers`) :
     'nl' du néerlandais, 'gloss' un sens dans sa langue, null les deux mêlés. Il
     dit aussi ce que la personne a donné (`given`) : l'option choisie, les tuiles,
     le texte tapé ou entendu, null quand rien ne se compare à la réponse. Le pied
     de la séance lit `answers` et `given` ; test/lang.js refuse un type sans les trois. */
  const R = {};

  R.pick = {
    id: 'pick', get kicker() { return NL.t.exPick; },
    asks: 'gloss', answers: 'nl',
    given: chosenLabel,
    build(item) {
      const right = U.bare(item.nl);
      /* Quatre options, pas trois : au hasard on tombe juste une fois sur quatre. */
      const opts = U.shuffle([{ label: right, ok: true }].concat(
        others(item, 3, 'nl').map(l => ({ label: l, ok: false }))));
      return { type: 'pick', item, prompt: NL.gloss.bare(item), opts };
    },
    view(t, L, phase) {
      return '<p class="sentence prompt"' + NL.gloss.langAttr(t.item) + '>' + esc(t.prompt) + '</p>' + optList(t.opts, L, phase, NL.gloss.attr('nl'));
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => U.bare(t.item.nl)
  };

  R.recall = {
    id: 'recall', get kicker() { return NL.t.exRecall; },
    asks: 'nl', answers: 'gloss',
    given: chosenLabel,
    build(item) {
      const opts = U.shuffle([{ label: NL.gloss.bare(item), ok: true }].concat(
        others(item, 3, 'gloss').map(l => ({ label: l, ok: false }))));
      return { type: 'recall', item, opts };
    },
    view(t, L, phase) {
      return speakerRow(U.bare(t.item.nl), { show: true, be: t.item.be }) + optList(t.opts, L, phase, NL.gloss.langAttr(t.item));
    },
    auto: t => U.bare(t.item.nl),
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => NL.gloss.bare(t.item)
  };

  R.article = {
    id: 'article', get kicker() { return NL.t.exArticle; },
    asks: 'nl', answers: 'nl',
    given: chosenLabel,
    build: item => ({ type: 'article', item, opts: [{ label: 'de', ok: item.art === 'de' }, { label: 'het', ok: item.art === 'het' }] }),
    view(t, L, phase) {
      const n = U.bare(t.item.nl);
      return '<div class="speaker-row">' +
        '<button class="speaker" data-say="' + esc(t.item.art + ' ' + n) + '" aria-label="' + NL.t.listen + '">' + ICON.speaker(26) + '</button>' +
        '<div class="sentence">&hellip;&nbsp;<span' + NL.gloss.attr('nl') + '>' + esc(n) + '</span><span class="gloss"' + NL.gloss.langAttr(t.item) + '>' + esc(NL.gloss.bare(t.item)) + '</span></div></div>' +
        optList(t.opts, L, phase, NL.gloss.attr('nl'));
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => t.item.art + ' ' + U.bare(t.item.nl)
  };

  R.bank = {
    id: 'bank', get kicker() { return NL.t.exBank; },
    asks: 'gloss', answers: 'nl',
    given: said,
    build(item) {
      const d = (item.drills && item.drills.length) ? U.one(item.drills) : Object.assign({ nl: item.nl }, NL.gloss.meaning(item));
      return { type: 'bank', item, drill: d, target: d.nl, bank: bankFor(d.nl, item) };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt"' + NL.gloss.langAttr(t.drill) + '>' + esc(NL.gloss.of(t.drill)) + '</div>' + tileArea(t, L, phase);
    },
    ready: (t, L) => L.picked.length > 0,
    judge: (t, L) => ({ ok: U.norm(said(t, L)) === U.norm(t.target) }),
    answer: t => t.target
  };

  R.order = {
    id: 'order', get kicker() { return NL.t.exOrder; },
    asks: 'gloss', answers: 'nl',
    given: said,
    build(item) {
      const d = U.one(item.drills || [Object.assign({ nl: item.nl }, NL.gloss.meaning(item))]);
      return { type: 'order', item, drill: d, target: d.nl, bank: U.shuffle(U.tiles(d.nl)) };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt"' + NL.gloss.langAttr(t.drill) + '>' + esc(NL.gloss.of(t.drill)) + '</div>' +
        '<div class="rule-chip"' + NL.gloss.langAttr(t.item.rule) + '>' + NL.gloss.quoted(t.item.rule) + '</div>' + tileArea(t, L, phase);
    },
    ready: (t, L) => L.picked.length > 0,
    judge: (t, L) => ({ ok: U.norm(said(t, L)) === U.norm(t.target) }),
    answer: t => t.target
  };

  R.cloze = {
    id: 'cloze', get kicker() { return NL.t.exCloze; },
    asks: 'nl', answers: 'nl',
    given: chosenLabel,
    build(item) {
      const d = item.drills ? U.one(item.drills) : Object.assign({ nl: item.nl }, NL.gloss.meaning(item));
      /* Pour un mot, le trou tombe sur le mot enseigné, pas sur le plus long de
         la phrase : sinon on drille « gemeentehuis » en cachant « morgen ». */
      const forced = d.gap ||
        (item.kind === 'word' && U.tiles(U.bare(item.nl)).length === 1 ? U.bare(item.nl) : null);
      const gap = gapWord(d.nl, forced);
      /* Les leurres du texte à trous sortaient des mots de l'unité, articles et
         pronoms compris : « Het » face à « gemeentehuis » ne trompe personne et
         se raye sans lire la phrase. On ne garde que des mots pleins, et de
         longueur comparable au mot caché. */
      const FILLERS = ['het', 'de', 'een', 'ik', 'je', 'ge', 'gij', 'wij', 'hij', 'zij', 'ze', 'we',
        'is', 'ben', 'zijn', 'heb', 'hebt', 'heeft', 'en', 'in', 'op', 'aan', 'te', 'van', 'met',
        'voor', 'bij', 'naar', 'dat', 'dit', 'die', 'deze', 'niet', 'geen', 'om', 'zo', 'ook',
        'wel', 'uw', 'mijn', 'er', 'u', 'al'];
      const pool = U.uniq(NL.content.itemsOf(item.unit)
        .flatMap(x => U.tiles(x.nl || '').concat((x.drills || []).flatMap(d => U.tiles(d.nl))))
        .filter(w => w.length > 2 && U.norm(w) !== U.norm(gap) && FILLERS.indexOf(U.norm(w)) < 0));
      const near = pool.slice().sort((a, b) =>
        Math.abs(a.length - gap.length) - Math.abs(b.length - gap.length));
      const opts = U.shuffle([{ label: gap, ok: true }].concat(
        U.sample(near.slice(0, Math.max(8, Math.min(near.length, 14))), 3).map(l => ({ label: l, ok: false }))));
      return { type: 'cloze', item, drill: d, gap, opts, shown: d.nl.replace(new RegExp('(^|\\s)' + gap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=\\s|$|[.,!?])'), '$1     ') };
    },
    view(t, L, phase) {
      return '<div class="sentence cloze-line"' + NL.gloss.attr('nl') + '>' + esc(t.shown).replace(/ +/, '<span class="gap">' + (phase === 'ask' ? '' : esc(t.gap)) + '</span>') + '</div>' +
        '<div class="gloss-line"' + NL.gloss.langAttr(t.drill) + '>' + esc(NL.gloss.of(t.drill)) + '</div>' + optList(t.opts, L, phase, NL.gloss.attr('nl'));
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => t.gap
  };

  R.dictation = {
    id: 'dictation', get kicker() { return NL.t.exDictation; },
    asks: 'nl', answers: 'nl',
    given: (t, L) => t.bank ? said(t, L) : L.input,
    build(item) {
      const target = item.kind === 'word' ? U.bare(item.nl) : item.nl;
      return { type: 'dictation', item, target, bank: item.kind === 'word' ? null : bankFor(target, item, 3) };
    },
    view(t, L, phase) {
      const head = speakerRow(t.target, { show: phase !== 'ask', be: t.item.be });
      if (t.bank) return head + tileArea(t, L, phase);
      return head + '<input class="textin" type="text" value="' + esc(L.input) + '" autocomplete="off" ' +
        'autocapitalize="off" spellcheck="false" placeholder="' + NL.t.heardWhat + '"' + (phase === 'ask' ? '' : ' disabled') + '>';
    },
    auto: t => t.target,
    ready: (t, L) => t.bank ? L.picked.length > 0 : L.input.trim().length > 0,
    judge(t, L) {
      const got = t.bank ? said(t, L) : L.input;
      if (t.bank) return { ok: U.norm(got) === U.norm(t.target) };
      const ok = U.typedOk(got, t.target);
      return { ok, close: !ok && U.typedOk(got, t.target, 1) };
    },
    answer: t => t.target
  };

  R.type = {
    id: 'type', get kicker() { return NL.t.exType; },
    asks: 'gloss', answers: 'nl',
    given: (t, L) => L.input,
    build(item) {
      return { type: 'type', item, target: item.kind === 'word' ? U.bare(item.nl) : (item.drills ? item.nl : item.nl), prompt: item.kind === 'word' ? NL.gloss.bare(item) : NL.gloss.of(item) };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt"' + NL.gloss.langAttr(t.item) + '>' + esc(t.prompt) + '</div>' +
        '<input class="textin" type="text" value="' + esc(L.input) + '" autocomplete="off" autocapitalize="off" ' +
        'spellcheck="false" placeholder="' + NL.t.typeHere + '"' + (phase === 'ask' ? '' : ' disabled') + '>' +
        '<div class="hintline"><span>' + NL.t.specialLetters + '</span>' +
        ['é', 'ë', 'ï', 'ö', 'è', 'ij'].map(c => '<button class="chip" data-ins="' + c + '">' + c + '</button>').join('') +
        '</div>';
    },
    ready: (t, L) => L.input.trim().length > 0,
    /* Juste si l'entrée vaut l'une des réponses de l'élément, ou de celle d'un
       autre élément au même sens (alors `other` : le panneau nomme le mot
       demandé). « Presque » se mesure contre toutes, à une lettre. */
    judge(t, L) {
      const own = accepted(t.item);
      if (own.some(a => U.typedOk(L.input, a))) return { ok: true };
      const others = [];
      siblings(t.item).forEach(x => accepted(x).forEach(a => others.push(a)));
      if (others.some(a => U.typedOk(L.input, a))) return { ok: true, other: true };
      return { ok: false, close: own.concat(others).some(a => U.typedOk(L.input, a, 1)) };
    },
    answer: t => t.target
  };

  R.speak = {
    id: 'speak', get kicker() { return NL.t.exSpeak; },
    asks: 'nl', answers: 'nl',
    given: (t, L) => L.speech.heard || null,
    build(item) {
      return { type: 'speak', item, target: item.kind === 'word' ? U.bare(item.nl) : item.nl, prompt: item.kind === 'word' ? NL.gloss.bare(item) : NL.gloss.of(item) };
    },
    view(t, L, phase) {
      const sp = L.speech;
      const blocked = NL.speech.listenBlocked();
      let panel;

      if (blocked) {
        panel = recordPanel(sp, t.target, blocked);
      } else if (sp.phase === 'listening') {
        panel = '<div class="mic-panel live"><button class="mic big listening" data-mic="stop" aria-label="' + NL.t.stop + '">' + ICON.mic(34) + '</button>' +
          '<p class="mic-why">' + NL.t.micListening + '</p>' +
          NL.ui.ifText(sp.partial, 'p', 'heard', 'nl') + '</div>';
      } else if (sp.phase === 'done') {
        panel = '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
          '<div class="score-row"><span class="score">' + wordScore(sp.parts) + '</span>' +
          '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
          '<p class="word-diff"' + NL.gloss.attr('nl') + '>' + sp.parts.map(p =>
            '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
          (sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;<span' + NL.gloss.attr('nl') + '>' + esc(sp.heard) + '</span>&rdquo;</p>' : '') +
          (!sp.ok && sp.tries < 3 ? '<div class="mic-actions"><button class="btn btn-blue" data-mic="start">' + NL.t.micRetry(3 - sp.tries) + '</button></div>' : '') +
          /* Trois refus : le micro n'entend peut-être simplement pas ce mot-là.
             Sans cette issue, l'élément serait redemandé chaque jour sans jamais monter. */
          (!sp.ok && sp.tries >= 3 ? selfRate(sp) : '') +
          '</div>';
      } else {
        panel = '<div class="mic-panel"><button class="mic big" data-mic="start" aria-label="' + NL.t.speak + '">' + ICON.mic(34) + '</button>' +
          '<p class="mic-why">' + (sp.error ? esc(micError(sp.error)) : NL.t.micTap) + '</p>' +
          (sp.error ? selfRate(sp) : '') + '</div>';
      }

      /* « Je ne peux pas parler » : proposé tant que rien n'a été tenté. Une fois
         la réponse donnée, c'est une réponse. */
      const untried = phase === 'ask' && sp.selfRated == null && sp.phase !== 'done' && sp.phase !== 'listening' &&
        sp.recState !== 'rec' && sp.recState !== 'done';
      const hush = untried ? '<div class="mic-actions"><button class="btn btn-ghost" data-quiet="1">' + NL.t.cantSpeak + '</button></div>' : '';

      return '<div class="sentence prompt"><span' + NL.gloss.attr('nl') + '>' + esc(t.target) + '</span>' + flemish(t.item.be, t.target) + '</div>' +
        '<div class="gloss-line"' + NL.gloss.langAttr(t.item) + '>' + esc(t.prompt) + '</div>' +
        speakerRow(t.target, {}) + panel + hush;
    },
    ready(t, L) {
      const sp = L.speech;
      return sp.phase === 'done' || sp.selfRated != null;
    },
    judge(t, L) {
      const sp = L.speech;
      const ok = sp.selfRated != null ? !!sp.selfRated : !!sp.ok;
      return { ok, spoken: ok };
    },
    answer: t => t.target
  };

  /* No recogniser available. Record yourself instead and compare against the
     model — no service needed, works offline, works in Opera. Falls through to
     honest self-rating when even the microphone is out of reach. */
  function recordPanel(sp, target, blocked) {
    const T = NL.t;
    const hardStop = !NL.speech.canRecord() ||
      ['framed', 'denied', 'nomic', 'blocked', 'format'].indexOf(sp.recErr) >= 0;

    if (hardStop) {
      return '<div class="mic-panel offline">' +
        '<p class="mic-why">' + (sp.recErr ? recErr(sp.recErr) : blocked === 'offline' ? T.micOffline : T.micNoBrowser) + '</p>' +
        (sp.selfRated == null
          ? '<div class="mic-actions"><button class="btn btn-good" data-self="1">' + T.micSaidIt + '</button>' +
          '<button class="btn btn-ghost" data-self="0">' + T.micNotYet + '</button></div>'
          : '<p class="mic-verdict">' + (sp.selfRated ? T.micNotedOk : T.micNotedNo) + '</p>') +
        '</div>';
    }
    if (sp.recState === 'rec') {
      return '<div class="mic-panel live">' +
        '<button class="mic big listening" data-rec="stop" aria-label="' + T.recStop + '">' + ICON.mic(32) + '</button>' +
        '<p class="mic-why">' + T.recStop + '</p></div>';
    }
    if (sp.recState === 'done') {
      return '<div class="mic-panel compare">' +
        '<div class="mic-actions">' +
        '<button class="btn" data-say="' + esc(target) + '">' + T.recModel + '</button>' +
        '<button class="btn" data-rec="play">' + T.recYours + '</button>' +
        '<button class="btn btn-blue" data-rec="both">' + T.recBoth + '</button>' +
        '</div>' +
        '<p class="mic-why">' + T.recHint + '</p>' +
        (sp.selfRated == null
          ? '<div class="mic-actions"><button class="btn btn-ghost" data-rec="start">' + T.recAgain + '</button>' +
          '<button class="btn btn-good" data-self="1">' + T.micSaidIt + '</button>' +
          '<button class="btn btn-ghost" data-self="0">' + T.micNotYet + '</button></div>'
          : '<p class="mic-verdict">' + (sp.selfRated ? T.micNotedOk : T.micNotedNo) + '</p>') +
        '</div>';
    }
    return '<div class="mic-panel">' +
      '<button class="mic big" data-rec="start" aria-label="' + T.recRecord + '">' + ICON.mic(34) + '</button>' +
      '<p class="mic-why">' + T.recRecord + ' — ' + T.recHint + '</p></div>';
  }

  /* Le message d'erreur du micro promet « évalue-toi toi-même » : il faut donc
     les boutons qui le permettent, sinon la seule issue est de passer. */
  const selfRate = sp => sp.selfRated == null
    ? '<div class="mic-actions"><button class="btn btn-good" data-self="1">' + NL.t.micSaidIt + '</button>' +
    '<button class="btn btn-ghost" data-self="0">' + NL.t.micNotYet + '</button></div>'
    : '<p class="mic-verdict">' + (sp.selfRated ? NL.t.micNotedOk : NL.t.micNotedNo) + '</p>';

  const recErr = k => k === 'framed'
    ? NL.t.recErrFramed
    : k === 'denied' ? NL.t.micDenied
      : k === 'nomic' ? NL.t.recErrNoMic
        : NL.t.recErrOther;

  function micError(kind) {
    return kind === 'denied' ? NL.t.micDenied
      : kind === 'silence' ? NL.t.micSilence
        : kind === 'network' ? NL.t.micNetwork
          : NL.t.micFail;
  }

  /* ---------------- les types exigeants ---------------- */

  /* Trois mots partagent un article, un non. Transforme de/het en raisonnement
     au lieu d'un pile ou face. */
  R.intrus = {
    id: 'intrus', get kicker() { return NL.t.exIntrus; },
    asks: 'nl', answers: 'nl',
    given: chosenLabel,
    build(item) {
      const pool = NL.content.allItems().filter(x => x.kind === 'word' && x.art && x.id !== item.id);
      const same = U.sample(pool.filter(x => x.art === item.art), 2);
      const other = U.sample(pool.filter(x => x.art !== item.art), 1)[0];
      const opts = U.shuffle(
        [item].concat(same).map(x => ({ label: U.bare(x.nl), ok: false }))
          .concat([{ label: U.bare(other.nl), ok: true, art: other.art }]));
      /* Le mot qui n'est pas à sa place reste dans l'exercice : c'est son sens que donne le pied. */
      return { type: 'intrus', item, odd: other, opts, art: item.art };
    },
    view(t, L, phase) {
      return '<p class="sentence prompt">' + NL.t.intrusAsk(t.art) + '</p>' +
        optList(t.opts, L, phase, NL.gloss.attr('nl'));
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => (t.opts.find(o => o.ok) || {}).label || ''
  };

  /* Une faute est plantée dans la phrase : trouve-la. Le transfert vers la
     relecture de tes propres mails est direct. */
  R.corrige = {
    id: 'corrige', get kicker() { return NL.t.exCorrige; },
    asks: 'nl', answers: 'nl',
    given: () => null,
    build(item) {
      const toks = U.tiles(item.nl);
      const i = 1 + ((Math.random() * Math.max(1, toks.length - 2)) | 0);
      const bad = toks.slice();
      const j = Math.min(i + 1, bad.length - 1);
      const tmp = bad[i]; bad[i] = bad[j]; bad[j] = tmp;
      return { type: 'corrige', item, bad, faulty: i, other: j, target: item.nl };
    },
    view(t, L, phase) {
      return '<div class="gloss-line"' + NL.gloss.langAttr(t.item) + '>' + esc(NL.gloss.of(t.item)) + '</div>' +
        '<div class="corrige">' + t.bad.map((w, i) => {
          let cls = '';
          if (phase !== 'ask') { if (i === t.faulty || i === t.other) cls = ' bad'; }
          else if (L.sel && L.sel.i === i) cls = ' sel';
          return '<button class="ctok' + cls + '"' + NL.gloss.attr('nl') + ' data-opt="' + i + '"' + (phase === 'ask' ? '' : ' disabled') + '>' + esc(w) + '</button>';
        }).join('') + '</div>' +
        (phase !== 'ask' ? '<p class="corrige-fix"' + NL.gloss.attr('nl') + '>' + esc(t.target) + '</p>' : '');
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!L.sel && (L.sel.i === t.faulty || L.sel.i === t.other) }),
    answer: t => t.target
  };

  /* Les deux mauvaises réponses de « Comment le dit-on ici ? ». Elles sont écrites pour l'élément
     (src/content/decoys.js) : deux fautes qu'un apprenant ferait, aussi flamandes à l'œil que la
     bonne. Tirées parmi les formes flamandes des autres éléments, elles parlaient d'autre chose, et
     la bonne se devinait sans rien savoir. Un élément sans leurres écrits (un mot à soi, ou une
     table pas encore remplie) les tire encore là : la forme que l'exercice propose pour un autre
     élément, jamais une qui serait juste ici, ni une forme que l'élément accepte (« salut », qui
     ouvre la liste de tot ziens, est aussi à hallo), ni celle d'un élément au même sens
     (goeiendag face à hallo). */
  function vlaamsDecoys(item) {
    if (item.decoys) return item.decoys;
    const mine = accepted(item), first = x => NL.content.beVariants(x)[0];
    const key = item.kind === 'word' ? f => U.norm(U.bare(f)) : U.norm;
    const any = NL.content.allItems().filter(x => x.be && x.id !== item.id && NL.srs.supports(x, 'vlaams') &&
      !NL.gloss.sameMeaning(x, item) && mine.indexOf(key(first(x))) < 0);
    /* Une phrase contre deux mots isolés se devine sans rien savoir : les
       leurres viennent d'abord du même genre d'élément. */
    const labels = xs => U.uniq(xs.map(first));
    const same = labels(any.filter(x => x.kind === item.kind));
    /* Une bonne option seule à porter un article (« een pintje » face à « hey » et « toe »), ou
       seule à n'en pas porter, se devine aussi : les leurres en ont d'abord un, ou aucun, comme elle. */
    const art = f => U.norm(U.bare(f)) !== U.norm(f), like = same.filter(f => art(f) === art(first(item)));
    return U.sample([like, same].find(xs => xs.length >= 2) || labels(any), 2);
  }

  /* La phrase standard est donnée : comment la dit-on ici ? Unique à cette app,
     et la donnée existe déjà sur chaque élément. Un mot y propose la première forme
     de sa liste (« hey » pour hallo, dont la liste est « hey, salut »). */
  R.vlaams = {
    id: 'vlaams', get kicker() { return NL.t.exVlaams; },
    asks: 'nl', answers: 'nl',
    given: chosenLabel,
    build(item) {
      const opts = U.shuffle([{ label: NL.content.beVariants(item)[0], ok: true }]
        .concat(vlaamsDecoys(item).map(label => ({ label, ok: false }))));
      return { type: 'vlaams', item, opts };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt"' + NL.gloss.attr('nl') + '>' + esc(t.item.nl) + '</div>' +
        '<div class="gloss-line"' + NL.gloss.langAttr(t.item) + '>' + esc(NL.gloss.of(t.item)) + '</div>' + optList(t.opts, L, phase, NL.gloss.attr('nl'));
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => NL.content.beVariants(t.item)[0]
  };

  /* Les lettres d'un mot, accents compris. Dans une regex, `\w` et `\b` ne voient que
     l'ASCII : « geïnstalleerd » s'y coupe à « ï », et « één » n'y est pas un mot. Le
     barème récrit `\w`, `\W`, `\b` et `\B` sur ces lettres-ci (latin accentué, marques
     combinantes), hors des crochets ; entre crochets, `\w` seul. Un navigateur qui ne
     connaît pas le regard arrière garde la regex telle qu'écrite. */
  const LETTER = 'A-Za-z0-9_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u024F\\u0300-\\u036F';
  const IN = '[' + LETTER + ']';
  const WIDE = {
    w: IN, W: '[^' + LETTER + ']',
    b: '(?:(?<!' + IN + ')(?=' + IN + ')|(?<=' + IN + ')(?!' + IN + '))',
    B: '(?:(?<=' + IN + ')(?=' + IN + ')|(?<!' + IN + ')(?!' + IN + '))'
  };
  function wide(rx) {
    const src = rx.source;
    let out = '', inClass = false;
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (c === '\\') {
        const e = src[++i];
        out += inClass ? (e === 'w' ? LETTER : '\\' + e) : (WIDE[e] || '\\' + e);
        continue;
      }
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      out += c;
    }
    try { return new RegExp(out, rx.flags); } catch (e) { return rx; }
  }

  /* Une suite de mots entiers, dans l'ordre, parmi les mots de la réponse : « in »
     n'est pas dans « kind », et « om half » n'est pas dans « kom half ». */
  const hasRun = (words, run) => run.length > 0 && words.some((_, i) => run.every((y, j) => words[i + j] === y));

  /* Réponse libre, notée sur ce qu'elle CONTIENT et non sur sa formulation.
     Hors ligne, sans IA. C'est le passage de la reproduction à la composition. */
  function rubric(task, text) {
    const s = String(text || ''), w = U.words(s), met = [];
    (task.need || []).forEach(n => {
      if (n.rx && wide(n.rx).test(s)) { met.push(n.what); return; }
      if (n.any && n.any.some(a => hasRun(w, U.words(a)))) { met.push(n.what); return; }
      if (n.min && w.length >= n.min) { met.push(n.what); return; }
    });
    return met;
  }
  R.open = {
    id: 'open', get kicker() { return NL.t.exOpen; },
    asks: 'gloss', answers: 'nl',
    given: () => null,
    build: item => ({ type: 'open', item, task: item.open }),
    view(t, L, phase) {
      const met = phase === 'ask' ? null : rubric(t.task, L.input);
      return '<p class="sentence prompt"' + NL.gloss.langAttr(t.task.ask) + '>' + NL.gloss.quoted(t.task.ask) + '</p>' +
        '<textarea class="textin open-box" rows="3" spellcheck="false" ' +
        'placeholder="' + esc(NL.t.openPlaceholder) + '"' + (phase === 'ask' ? '' : ' disabled') + '>' +
        esc(L.input) + '</textarea>' +
        '<div class="need-list">' + (t.task.need || []).map(n => {
          const on = met ? met.indexOf(n.what) >= 0 : null;
          return '<span class="need' + (on === null ? '' : on ? ' ok' : ' no') + '"' + NL.gloss.langAttr(n.what) + '>' + NL.gloss.quoted(n.what) + '</span>';
        }).join('') + '</div>' +
        (phase !== 'ask' ? '<p class="model-answer"><i>' + NL.t.openModel + '</i> <span' + NL.gloss.attr('nl') + '>' + esc(t.task.model) + '</span></p>' : '');
    },
    ready: (t, L) => U.words(L.input).length >= 3,
    judge: (t, L) => ({ ok: rubric(t.task, L.input).length === (t.task.need || []).length }),
    answer: t => t.task.model
  };

  R.match = {
    id: 'match', get kicker() { return NL.t.exMatch; },
    asks: null, answers: null,
    given: () => null,
    build(items) {
      const pairs = items.slice(0, 5).map(it => ({ id: it.id, nl: U.bare(it.nl), gloss: NL.gloss.bare(it), lang: NL.gloss.langOf(it), item: it }));
      return {
        type: 'match', pairs, items,
        left: U.shuffle(pairs.map((p, i) => ({ t: p.nl, k: i, s: 'l' }))),
        right: U.shuffle(pairs.map((p, i) => ({ t: p.gloss, k: i, s: 'r' })))
      };
    },
    view(t, L) {
      const cell = c => {
        const id = c.s + c.k, gone = L.matchGone.indexOf(id) >= 0;
        const sel = L.matchSel && L.matchSel.id === id, bad = L.matchBad === id;
        return '<button class="pair' + (gone ? ' gone' : '') + (sel ? ' sel' : '') + (bad ? ' shake' : '') + '"' +
          ' data-match="' + id + '" data-k="' + c.k + '" data-side="' + c.s + '"' + (gone ? ' disabled' : '') + '>' +
          '<span class="pair-n">' + (c.s === 'l' ? 'NL' : t.pairs[c.k].lang.toUpperCase()) + '</span>' + '<span' + (c.s === 'l' ? NL.gloss.attr('nl') : NL.gloss.langAttr(t.pairs[c.k].item)) + '>' + esc(c.t) + '</span></button>';
      };
      let rows = '';
      for (let i = 0; i < t.pairs.length; i++) rows += cell(t.left[i]) + cell(t.right[i]);
      return '<div class="pairs">' + rows + '</div>';
    },
    /* matchGone retient les cartes par côté (« l3 », « r0 ») et non par paire :
       deux mots peuvent partager une traduction, et la carte choisie n'est alors
       pas forcément celle d'origine. */
    ready: (t, L) => L.matchGone.length >= t.pairs.length * 2,
    judge: () => ({ ok: true }),
    /* Affiché si l'on passe : les paires elles-mêmes, pas un pied vide. */
    answer: t => t.pairs.map(p => p.nl + ' = ' + p.gloss).join(' · '),
    /* Deux cartes vont ensemble si leurs TEXTES correspondent : « goeiedag » et
       « hallo » disent tous deux « bonjour », et l'écran ne permet pas de savoir
       quel « bonjour » était le sien. */
    fits(t, lk, rk) {
      const a = t.pairs[lk], b = t.pairs[rk];
      return lk === rk || U.norm(a.gloss) === U.norm(b.gloss) || U.norm(a.nl) === U.norm(b.nl);
    }
  };

  /* La ligne « Ici on dit » : les formes flamandes de l'élément, sans celle qui
     répète le néerlandais standard ni ce qui est déjà à l'écran (`shown` : la
     réponse, et ce que la personne a donné), sauf `keepSame` — dans « Comment
     le dit-on ici ? » la variante EST la réponse. En
     gras, ce qui change par rapport au standard ; la ponctuation reste dehors. */
  const PUNCT = '[.,!?;:"()…]*';
  function boldForm(item, form) {
    const diff = U.diffWords(item.nl, form);
    let n = 0, out = '', open = false;
    form.split(/\s+/).filter(Boolean).forEach(tok => {
      const m = tok.match(new RegExp('^(' + PUNCT + ')(.*?)(' + PUNCT + ')$'));
      const lead = m[1], core = m[2], trail = m[3];
      const d = U.norm(core) ? diff[n++] : null;
      const changed = !!d && (!d.ok || d.close);
      const sep = out ? ' ' : '';
      if (changed && open && !lead) out += ' ' + esc(core);
      else {
        if (open) { out += '</b>'; open = false; }
        if (changed) { out += sep + esc(lead) + '<b>' + esc(core); open = true; }
        else out += sep + esc(lead + core + trail);
      }
      if (changed && trail) { out += '</b>' + esc(trail); open = false; }
    });
    return out + (open ? '</b>' : '');
  }
  function hereLine(item, shown, keepSame) {
    if (!item || !item.be) return '';
    const own = U.norm(U.bare(item.nl)), seen = [].concat(shown).filter(s => s != null).map(s => U.norm(U.bare(s)));
    const forms = NL.content.beVariants(item).filter(f => keepSame || (U.norm(U.bare(f)) !== own && seen.indexOf(U.norm(U.bare(f))) < 0));
    if (!forms.length) return '';
    return '<p class="v-be">' + NL.t.hereThey + ' ' + forms.map(f => '<span' + NL.gloss.attr('nl') + '>' + boldForm(item, f) + '</span>').join(', ') + '</p>';
  }

  /* L'explication d'un élément, que le pied montre sous son sens : sa note. On la lit ici et nulle
     part ailleurs ; le pied la rend par NL.ui.ifProse, qui déclare nl-BE ce qu'elle cite. */
  const explanation = item => (item && item.note) || null;

  return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, recordPanel, selfRate, wordScore, hereLine, rubric, explanation, accepted };
})();
