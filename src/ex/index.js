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
      '<button class="speaker" data-say="' + esc(text) + '" aria-label="Écouter">' + ICON.speaker(26) + '</button>' +
      '<button class="speaker slow" data-say="' + esc(text) + '" data-slow="1" aria-label="Lentement">' + ICON.turtle() + '</button>' +
      (opts.show ? '<div class="sentence">' + esc(text) + flemish(opts.be, text) + '</div>' : '') +
      '</div>';
  };

  const flemish = (be, std) => (be && NL.state.meta().showFlemish !== false && U.norm(be) !== U.norm(std))
    ? '<span class="be-line"><span class="be-tag">ici</span>' + esc(be) + '</span>' : '';

  function optList(opts, L, phase) {
    return '<div class="opts">' + opts.map((o, i) => {
      let cls = '';
      if (phase === 'ask') cls = (L.sel && L.sel.i === i) ? ' sel' : '';
      else if (o.ok) cls = ' ok';
      else if (L.sel && L.sel.i === i) cls = ' no';
      return '<button class="opt' + cls + '" data-opt="' + i + '"' + (phase === 'ask' ? '' : ' disabled') + '>' +
        '<span class="opt-key">' + (i + 1) + '</span><span>' + esc(o.label) + '</span></button>';
    }).join('') + '</div>';
  }

  function tileArea(task, L, phase) {
    const src = task.bank;
    const chosen = L.picked.map(i =>
      '<button class="tile" data-unpick="' + i + '"' + (phase === 'ask' ? '' : ' disabled') + '>' + esc(src[i]) + '</button>').join('');
    const bank = src.map((w, i) => {
      const used = L.picked.indexOf(i) >= 0;
      return '<button class="tile' + (used ? ' spent' : '') + '" data-pick="' + i + '"' +
        (phase === 'ask' && !used ? '' : ' disabled') + '>' + esc(w) + '</button>';
    }).join('');
    return '<div class="answer-area' + (L.picked.length ? '' : ' hint') + '">' + chosen + '</div>' +
      '<div class="bank">' + tileShuffleGuard(bank) + '</div>';
  }
  const tileShuffleGuard = html => html || '<span class="muted">—</span>';

  const said = (task, L) => L.picked.map(i => task.bank[i]).join(' ');

  /* Les mauvaises réponses décident de la difficulté d'un QCM. Tirées au hasard
     dans l'unité, elles s'éliminent sans connaître le mot : la bonne est la plus
     longue, ou la seule avec le bon article, ou la seule du bon champ lexical.
     On les choisit donc PROCHES de la bonne réponse — même genre, longueur
     comparable, graphie voisine — pour qu'il faille vraiment savoir. */
  /* Un leurre ne doit jamais être une autre bonne réponse. « bonjour » se dit
     « hallo » ET « goeiedag » : proposer les deux, c'est en compter un faux.
     On compare chaque sens (« s'il vous plaît / voilà » en a deux), dans les
     deux langues. Le lexique sépare les sens par « / » ; une virgule, elle,
     appartient à la phrase et ne sépare rien. */
  const senses = s => String(s || '').split(/\s*\/\s*/).map(U.norm).filter(Boolean);
  function sameSense(a, b) {
    const fa = senses(U.bareFr(a.fr)), fb = senses(U.bareFr(b.fr));
    if (fa.some(x => fb.indexOf(x) >= 0)) return true;
    return U.norm(U.bare(a.nl)) === U.norm(U.bare(b.nl));
  }

  function others(item, n, field) {
    const label = x => field === 'fr' ? U.bareFr(x.fr) : U.bare(x.nl);
    const target = label(item), tn = U.norm(target), len = target.length;

    let pool = NL.content.itemsOf(item.unit).filter(x => x.id !== item.id && x.kind === item.kind);
    /* Unité trop maigre : on élargit aux éléments déjà rencontrés ailleurs,
       jamais à ceux qui n'ont pas encore été introduits. */
    if (pool.length < n + 3) {
      pool = pool.concat(NL.content.allItems().filter(x =>
        x.kind === item.kind && x.unit !== item.unit && x.id !== item.id && NL.srs.isSeen(x)));
    }
    pool = pool.filter(x => U.norm(label(x)) !== tn && !sameSense(x, item));

    const score = x => {
      const s = label(x);
      let sc = 0;
      if (item.art && x.art && x.art === item.art) sc += 3;        // pas de tri par de/het
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

  /* ---------------- the types ---------------- */
  const R = {};

  R.pick = {
    id: 'pick', kicker: NL.t.exPick,
    build(item) {
      const right = U.bare(item.nl);
      const opts = U.shuffle([{ label: right, ok: true }].concat(
        others(item, 2, 'nl').map(l => ({ label: l, ok: false }))));
      return { type: 'pick', item, prompt: U.bareFr(item.fr), opts };
    },
    view(t, L, phase) {
      return '<p class="sentence prompt">' + esc(t.prompt) + '</p>' + optList(t.opts, L, phase);
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => U.bare(t.item.nl)
  };

  R.recall = {
    id: 'recall', kicker: NL.t.exRecall,
    build(item) {
      const opts = U.shuffle([{ label: U.bareFr(item.fr), ok: true }].concat(
        others(item, 2, 'fr').map(l => ({ label: l, ok: false }))));
      return { type: 'recall', item, opts };
    },
    view(t, L, phase) {
      return speakerRow(U.bare(t.item.nl), { show: true, be: t.item.be }) + optList(t.opts, L, phase);
    },
    auto: t => U.bare(t.item.nl),
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => U.bareFr(t.item.fr)
  };

  R.article = {
    id: 'article', kicker: NL.t.exArticle,
    build: item => ({ type: 'article', item, opts: [{ label: 'de', ok: item.art === 'de' }, { label: 'het', ok: item.art === 'het' }] }),
    view(t, L, phase) {
      const n = U.bare(t.item.nl);
      return '<div class="speaker-row">' +
        '<button class="speaker" data-say="' + esc(t.item.art + ' ' + n) + '" aria-label="Écouter">' + ICON.speaker(26) + '</button>' +
        '<div class="sentence">&hellip;&nbsp;' + esc(n) + '<span class="gloss">' + esc(U.bareFr(t.item.fr)) + '</span></div></div>' +
        optList(t.opts, L, phase);
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => t.item.art + ' ' + U.bare(t.item.nl)
  };

  R.bank = {
    id: 'bank', kicker: NL.t.exBank,
    build(item) {
      const d = (item.drills && item.drills.length) ? U.one(item.drills) : { nl: item.nl, fr: item.fr };
      return { type: 'bank', item, drill: d, target: d.nl, bank: bankFor(d.nl, item) };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt">' + esc(t.drill.fr) + '</div>' + tileArea(t, L, phase);
    },
    ready: (t, L) => L.picked.length > 0,
    judge: (t, L) => ({ ok: U.norm(said(t, L)) === U.norm(t.target) }),
    answer: t => t.target
  };

  R.order = {
    id: 'order', kicker: NL.t.exOrder,
    build(item) {
      const d = U.one(item.drills || [{ nl: item.nl, fr: item.fr }]);
      return { type: 'order', item, drill: d, target: d.nl, bank: U.shuffle(U.tiles(d.nl)) };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt">' + esc(t.drill.fr) + '</div>' +
        '<div class="rule-chip">' + esc(t.item.rule || '') + '</div>' + tileArea(t, L, phase);
    },
    ready: (t, L) => L.picked.length > 0,
    judge: (t, L) => ({ ok: U.norm(said(t, L)) === U.norm(t.target) }),
    answer: t => t.target
  };

  R.cloze = {
    id: 'cloze', kicker: NL.t.exCloze,
    build(item) {
      const d = item.drills ? U.one(item.drills) : { nl: item.nl, fr: item.fr };
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
        U.sample(near.slice(0, Math.max(6, Math.min(near.length, 12))), 2).map(l => ({ label: l, ok: false }))));
      return { type: 'cloze', item, drill: d, gap, opts, shown: d.nl.replace(new RegExp('(^|\\s)' + gap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=\\s|$|[.,!?])'), '$1     ') };
    },
    view(t, L, phase) {
      return '<div class="sentence cloze-line">' + esc(t.shown).replace(/ +/, '<span class="gap">' + (phase === 'ask' ? '' : esc(t.gap)) + '</span>') + '</div>' +
        '<div class="gloss-line">' + esc(t.drill.fr) + '</div>' + optList(t.opts, L, phase);
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => t.gap
  };

  R.dictation = {
    id: 'dictation', kicker: NL.t.exDictation,
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
      return { ok: t.bank ? U.norm(got) === U.norm(t.target) : U.near(got, t.target, 1) };
    },
    answer: t => t.target
  };

  R.type = {
    id: 'type', kicker: NL.t.exType,
    build(item) {
      return { type: 'type', item, target: item.kind === 'word' ? U.bare(item.nl) : (item.drills ? item.nl : item.nl), prompt: item.kind === 'word' ? U.bareFr(item.fr) : item.fr };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt">' + esc(t.prompt) + '</div>' +
        '<input class="textin" type="text" value="' + esc(L.input) + '" autocomplete="off" autocapitalize="off" ' +
        'spellcheck="false" placeholder="' + NL.t.typeHere + '"' + (phase === 'ask' ? '' : ' disabled') + '>' +
        '<div class="hintline"><span>' + NL.t.specialLetters + '</span>' +
        ['é', 'ë', 'ï', 'ö', 'è', 'ij'].map(c => '<button class="chip" data-ins="' + c + '">' + c + '</button>').join('') +
        '</div>';
    },
    ready: (t, L) => L.input.trim().length > 0,
    judge: (t, L) => ({ ok: U.near(L.input, t.target, 1) }),
    answer: t => t.target
  };

  R.speak = {
    id: 'speak', kicker: NL.t.exSpeak,
    build(item) {
      return { type: 'speak', item, target: item.kind === 'word' ? U.bare(item.nl) : item.nl, prompt: item.kind === 'word' ? U.bareFr(item.fr) : item.fr };
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
          (sp.partial ? '<p class="heard">' + esc(sp.partial) + '</p>' : '') + '</div>';
      } else if (sp.phase === 'done') {
        panel = '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
          '<div class="score-row"><span class="score">' + sp.pct + '%</span>' +
          '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
          '<p class="word-diff">' + sp.parts.map(p =>
            '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
          (sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;' + esc(sp.heard) + '&rdquo;</p>' : '') +
          (!sp.ok && sp.tries < 3 ? '<div class="mic-actions"><button class="btn btn-blue" data-mic="start">' + NL.t.micRetry(3 - sp.tries) + '</button></div>' : '') +
          '</div>';
      } else {
        panel = '<div class="mic-panel"><button class="mic big" data-mic="start" aria-label="' + NL.t.speak + '">' + ICON.mic(34) + '</button>' +
          '<p class="mic-why">' + (sp.error ? esc(micError(sp.error)) : NL.t.micTap) + '</p>' +
          (sp.error ? selfRate(sp) : '') + '</div>';
      }

      return '<div class="sentence prompt">' + esc(t.target) + flemish(t.item.be, t.target) + '</div>' +
        '<div class="gloss-line">' + esc(t.prompt) + '</div>' +
        speakerRow(t.target, {}) + panel;
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
    ? 'Le micro est bloqué parce que cette page tourne dans un cadre intégré. Ouvre la version hébergée pour t’enregistrer — ici, évalue-toi.'
    : k === 'denied' ? NL.t.micDenied
      : k === 'nomic' ? 'Aucun micro détecté. Dis la phrase à voix haute et évalue-toi.'
        : 'L’enregistrement n’est pas possible ici. Dis-la à voix haute et évalue-toi.';

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
    id: 'intrus', kicker: NL.t.exIntrus,
    build(item) {
      const pool = NL.content.allItems().filter(x => x.kind === 'word' && x.art && x.id !== item.id);
      const same = U.sample(pool.filter(x => x.art === item.art), 2);
      const other = U.sample(pool.filter(x => x.art !== item.art), 1)[0];
      const opts = U.shuffle(
        [item].concat(same).map(x => ({ label: U.bare(x.nl), ok: false }))
          .concat([{ label: U.bare(other.nl), ok: true, art: other.art }]));
      return { type: 'intrus', item, opts, art: item.art };
    },
    view(t, L, phase) {
      return '<p class="sentence prompt">Trois de ces mots prennent <b>' + t.art + '</b>. Lequel non&nbsp;?</p>' +
        optList(t.opts, L, phase);
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => (t.opts.find(o => o.ok) || {}).label || ''
  };

  /* Une faute est plantée dans la phrase : trouve-la. Le transfert vers la
     relecture de tes propres mails est direct. */
  R.corrige = {
    id: 'corrige', kicker: NL.t.exCorrige,
    build(item) {
      const toks = U.tiles(item.nl);
      const i = 1 + ((Math.random() * Math.max(1, toks.length - 2)) | 0);
      const bad = toks.slice();
      const j = Math.min(i + 1, bad.length - 1);
      const tmp = bad[i]; bad[i] = bad[j]; bad[j] = tmp;
      return { type: 'corrige', item, bad, faulty: i, other: j, target: item.nl };
    },
    view(t, L, phase) {
      return '<div class="gloss-line">' + esc(t.item.fr) + '</div>' +
        '<div class="corrige">' + t.bad.map((w, i) => {
          let cls = '';
          if (phase !== 'ask') { if (i === t.faulty || i === t.other) cls = ' bad'; }
          else if (L.sel && L.sel.i === i) cls = ' sel';
          return '<button class="ctok' + cls + '" data-opt="' + i + '"' + (phase === 'ask' ? '' : ' disabled') + '>' + esc(w) + '</button>';
        }).join('') + '</div>' +
        (phase !== 'ask' ? '<p class="corrige-fix">' + esc(t.target) + '</p>' : '');
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!L.sel && (L.sel.i === t.faulty || L.sel.i === t.other) }),
    answer: t => t.target
  };

  /* La phrase standard est donnée : comment la dit-on ici ? Unique à cette app,
     et la donnée existe déjà sur chaque élément. */
  R.vlaams = {
    id: 'vlaams', kicker: NL.t.exVlaams,
    build(item) {
      const any = NL.content.allItems().filter(x =>
        x.be && x.id !== item.id && U.norm(x.be) !== U.norm(x.nl) && U.norm(x.be) !== U.norm(item.be));
      /* Une phrase contre deux mots isolés se devine sans rien savoir : les
         leurres viennent d'abord du même genre d'élément. */
      const same = any.filter(x => x.kind === item.kind);
      const pool = same.length >= 2 ? same : any;
      const opts = U.shuffle([{ label: item.be, ok: true }]
        .concat(U.sample(pool, 2).map(x => ({ label: x.be, ok: false }))));
      return { type: 'vlaams', item, opts };
    },
    view(t, L, phase) {
      return '<div class="sentence prompt">' + esc(t.item.nl) + '</div>' +
        '<div class="gloss-line">' + esc(t.item.fr) + '</div>' + optList(t.opts, L, phase);
    },
    ready: (t, L) => !!L.sel,
    judge: (t, L) => ({ ok: !!(L.sel && (t.opts[L.sel.i] || {}).ok) }),
    answer: t => t.item.be
  };

  /* Réponse libre, notée sur ce qu'elle CONTIENT et non sur sa formulation.
     Hors ligne, sans IA. C'est le passage de la reproduction à la composition. */
  function rubric(task, text) {
    const s = String(text || ''), w = U.words(s), met = [];
    (task.need || []).forEach(n => {
      if (n.rx && n.rx.test(s)) { met.push(n.what); return; }
      if (n.any && n.any.some(a => U.norm(s).indexOf(U.norm(a)) >= 0)) { met.push(n.what); return; }
      if (n.min && w.length >= n.min) { met.push(n.what); return; }
    });
    return met;
  }
  R.open = {
    id: 'open', kicker: NL.t.exOpen,
    build: item => ({ type: 'open', item, task: item.open }),
    view(t, L, phase) {
      const met = phase === 'ask' ? null : rubric(t.task, L.input);
      return '<p class="sentence prompt">' + esc(t.task.ask) + '</p>' +
        '<textarea class="textin open-box" rows="3" spellcheck="false" ' +
        'placeholder="' + esc(NL.t.openPlaceholder) + '"' + (phase === 'ask' ? '' : ' disabled') + '>' +
        esc(L.input) + '</textarea>' +
        '<div class="need-list">' + (t.task.need || []).map(n => {
          const on = met ? met.indexOf(n.what) >= 0 : null;
          return '<span class="need' + (on === null ? '' : on ? ' ok' : ' no') + '">' + esc(n.what) + '</span>';
        }).join('') + '</div>' +
        (phase !== 'ask' ? '<p class="model-answer"><i>' + NL.t.openModel + '</i> ' + esc(t.task.model) + '</p>' : '');
    },
    ready: (t, L) => U.words(L.input).length >= 3,
    judge: (t, L) => ({ ok: rubric(t.task, L.input).length === (t.task.need || []).length }),
    answer: t => t.task.model
  };

  R.match = {
    id: 'match', kicker: NL.t.exMatch,
    build(items) {
      const pairs = items.slice(0, 5).map(it => ({ id: it.id, nl: U.bare(it.nl), fr: U.bareFr(it.fr), item: it }));
      return {
        type: 'match', pairs, items,
        left: U.shuffle(pairs.map((p, i) => ({ t: p.nl, k: i, s: 'l' }))),
        right: U.shuffle(pairs.map((p, i) => ({ t: p.fr, k: i, s: 'r' })))
      };
    },
    view(t, L) {
      const cell = c => {
        const id = c.s + c.k, gone = L.matchGone.indexOf(id) >= 0;
        const sel = L.matchSel && L.matchSel.id === id, bad = L.matchBad === id;
        return '<button class="pair' + (gone ? ' gone' : '') + (sel ? ' sel' : '') + (bad ? ' shake' : '') + '"' +
          ' data-match="' + id + '" data-k="' + c.k + '" data-side="' + c.s + '"' + (gone ? ' disabled' : '') + '>' +
          '<span class="pair-n">' + (c.s === 'l' ? 'NL' : 'FR') + '</span>' + esc(c.t) + '</button>';
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
    answer: t => t.pairs.map(p => p.nl + ' = ' + p.fr).join(' · '),
    /* Deux cartes vont ensemble si leurs TEXTES correspondent : « goeiedag » et
       « hallo » disent tous deux « bonjour », et l'écran ne permet pas de savoir
       quel « bonjour » était le sien. */
    fits(t, lk, rk) {
      const a = t.pairs[lk], b = t.pairs[rk];
      return lk === rk || U.norm(a.fr) === U.norm(b.fr) || U.norm(a.nl) === U.norm(b.nl);
    }
  };

  return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, recordPanel, selfRate, sameSense };
})();
