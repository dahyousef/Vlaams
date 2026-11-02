/* Le sens et les textes : UN seul endroit les lit.
   Un élément porte son sens en deux langues côte à côte (`fr`, `en`) ; un texte
   (nom, note, règle…) est soit une chaîne française, soit une paire { fr, en }.
   Les écrans ne lisent jamais `x.fr` : ils passent par ici, et la langue lue
   est choisie en un point (`use`). Tant que personne n'appelle `use`, on lit le
   français : l'écran est celui d'avant. */
NL.gloss = (function () {
  'use strict';
  const U = NL.util;
  let lang = 'fr';

  const use = l => { lang = l === 'en' ? 'en' : 'fr'; };
  const current = () => lang;
  const other = l => l === 'en' ? 'fr' : 'en';

  /* Ce qui est lu dans `l` : une chaîne non vide, pas un trou. */
  const has = (x, l) => !!x && typeof x === 'object' && typeof x[l] === 'string' && x[l].trim() !== '';

  /* La langue dans laquelle `x` se lit : une chaîne simple est du français ;
     sinon la langue courante, ou l'autre si `x` n'a rien dans la courante. */
  function langOf(x) {
    if (typeof x === 'string') return 'fr';
    return has(x, lang) ? lang : other(lang);
  }

  /* Le texte à montrer. Une paire de texte ou un élément, indifféremment. Une
     note qui vaut `null` dans la langue lue n'a rien à dire à ce lecteur. */
  function of(x, l) {
    if (typeof x === 'string') return x;
    if (x == null) return '';
    const want = l || lang;
    if (x[want] === null) return '';
    const v = has(x, want) ? x[want] : x[other(want)];
    return typeof v === 'string' ? v : '';
  }

  /* Les langues lues, dans un ordre fixe. Un sens se copie langue par langue d'ici,
     et une troisième langue est une ligne de plus. */
  const LANGS = ['fr', 'en'];

  /* Le sens de `x`, dans chaque langue lue qu'il porte : un objet neuf. Un `null`
     reste (« rien à dire », voir `of`) ; une langue absente ne devient pas une clé. */
  function meaning(x) {
    const m = {};
    LANGS.forEach(l => { if (x && x[l] !== undefined) m[l] = x[l]; });
    return m;
  }

  const pair = g => typeof g === 'string' ? { fr: g } : meaning(g);

  /* Le sens sans son article : « le pain » → « pain », « the bread » → « bread ».
     Une phrase garde son premier mot, comme U.bareFr. */
  function bare(item, l) {
    const w = l || langOf(item);
    const s = typeof item === 'string' ? item : (item && typeof item[w] === 'string' ? item[w] : '');
    if (w === 'fr') return U.bareFr(s);
    if (/[.!?…]\s*$/.test(s)) return s;
    return s.replace(/^(?:the|an|a)\s+(?=\S)/i, '');
  }

  /* Les sens, séparés par « / », chacun normalisé. */
  const senses = (item, l) => has(item, l)
    ? bare(item, l).split(/\s*\/\s*/).map(U.norm).filter(Boolean) : [];

  /* Un sens sans ses précisions : « neuf (le nombre) » se lit « neuf ». */
  const plain = s => String(s).replace(/\s*\([^)]*\)/g, '').trim();

  /* Ce que disent deux textes de sens, précisions tombées : « café (le lieu) / le bistrot » et « café »
     disent la même chose à qui les lit côte à côte. */
  const readings = s => plain(s).split(/\s*\/\s*/).map(U.norm).filter(Boolean);
  function shareSense(a, b) {
    const rb = readings(b);
    return readings(a).some(x => rb.indexOf(x) >= 0);
  }
  const sameOption = (a, b, l) => shareSense(bare(a, l), bare(b, l));

  /* Le néerlandais se lit dans ce texte : même rapport pour un mot transparent et pour une option. */
  const looksLike = (item, w, s) => U.ratio(U.bare(item.nl), w === 'en' ? s.replace(/^to\s+(?=\S)/i, '') : s) > 0.62;
  /* Une précision française ne change pas ce à quoi le mot ressemble : « le serveur (informatique) »
     reste le mot de « server ». L'anglais garde la sienne : « half (before the hour) » est un faux ami. */
  const cognateIn = (item, w) => looksLike(item, w, w === 'en' ? bare(item, 'en') : plain(bare(item, 'fr')));

  /* Un sens parmi les options de « recall ». La précision qui le termine dit lequel à qui cherche le
     mot ; face au néerlandais elle n'a rien à départager, et l'option seule à en porter se choisirait
     sans connaître le mot. Le pied la montre. Elle reste dans trois cas : elle dit lequel de plusieurs
     sens (« pouvoir / savoir (faire) »), elle ne termine pas le sens (« I am forty (years old). »,
     un mot à soi), ou le mot sans elle se lirait comme son néerlandais sans le traduire : « half ». */
  function option(item, l) {
    const w = l || langOf(item), s = bare(item, w);
    if (s.indexOf('/') >= 0) return s;
    const cut = s.replace(/^(.*\S)\s*\([^()]*\)\s*$/, '$1');
    return cut !== s && item.kind === 'word' && looksLike(item, w, cut) && !cognateIn(item, w) ? s : cut;
  }

  /* Même sens pour la note et les frères : un sens français commun, ou le même
     néerlandais sans article. C'est la règle d'avant, et le français seul y décide. */
  function sameSense(a, b) {
    const fa = senses(a, 'fr'), fb = senses(b, 'fr');
    if (fa.some(x => fb.indexOf(x) >= 0)) return true;
    return U.norm(U.bare(a.nl)) === U.norm(U.bare(b.nl));
  }
  /* Pour les mauvaises options : le même sens dans l'une ou l'autre langue. */
  function sameMeaning(a, b) {
    if (sameSense(a, b)) return true;
    const ea = senses(a, 'en'), eb = senses(b, 'en');
    return ea.some(x => eb.indexOf(x) >= 0);
  }

  /* Des mots français qui finissent comme un infinitif sans en être un. */
  const NOT_VERBS = ['hier', 'entre', 'contre', 'propre', 'Flandre'];

  /* La nature du mot, grossièrement : « oui » face à « sorry / spreken / ja » se
     résout sans connaître le mot, parce qu'un verbe ne répond pas à « oui ». */
  function wordClass(x, l) {
    if (x.kind !== 'word') return x.kind;
    if (x.art) return 'noun';
    const w = l || langOf(x);
    const first = plain(bare(x, w)).split(/\s*\/\s*/)[0];
    if (w === 'en') {
      if (/^to\s+\S/.test(first) && /en$/.test(U.bare(x.nl))) return 'verb';
      return 'other';
    }
    if (/^\S+(er|ir|re|oir)$/.test(first) && first.indexOf('-') < 0 && NOT_VERBS.indexOf(first) < 0 && /en$/.test(U.bare(x.nl))) return 'verb';
    return 'other';
  }

  /* Un mot transparent : son néerlandais ressemble à son sens, dans la langue lue. */
  function cognate(item) {
    return item.kind === 'word' && cognateIn(item, langOf(item));
  }

  /* Une prose du cours qui porte des exemples en néerlandais : <span class="ex">, et toute balise
     class="nl" (<i class="nl">Morgen ik ga</i>), est du néerlandais, et le dit à un lecteur d'écran.
     C'est ici, et nulle part ailleurs, que cette règle s'applique : le cours n'écrit aucun lang="…". */
  const prose = html => String(html == null ? '' : html).replace(/<(\w+) class="(ex|nl)">/g, '<$1 class="$2"' + attr('nl') + '>');

  /* La balise de chaque langue, pour un lecteur d'écran : les langues lues et le néerlandais
     du cours. C'est la seule table : aucun autre fichier n'écrit lang="…". */
  const TAGS = { fr: 'fr', en: 'en-GB', nl: 'nl-BE' };
  /* La balise d'une langue : celle de la page (NL.lang), d'un sens, d'un passage néerlandais. */
  const tag = l => TAGS[l];
  /* L'attribut lang d'une langue, espace compris : attr('nl') pour du néerlandais. */
  const attr = l => ' lang="' + tag(l) + '"';
  /* L'attribut lang d'un sens ou d'un texte montré : la langue où il se lit. */
  const langAttr = x => attr(langOf(x));
  /* Une prose du cours en texte simple (une note, une règle, une consigne), lue par of() et
     échappée : ce qu'elle cite entre « » ou “ ” est du néerlandais, déclaré nl-BE. Les guillemets
     et les espaces qui les bordent restent dehors ; une citation vide ne déclare rien. */
  const QUOTES = /(«\s*)([^«»]*?[^\s«»])(\s*»)|(“\s*)([^“”]*?[^\s“”])(\s*”)/g;
  const mark = (open, inner, close) => open + '<span' + attr('nl') + '>' + inner + '</span>' + close;
  const quoted = x => U.esc(of(x)).replace(QUOTES, (m, a, q, b, c, r, d) => a !== undefined ? mark(a, q, b) : mark(c, r, d));

  return { LANGS, TAGS, prose, quoted, use, current, other, has, langOf, tag, attr, langAttr, of, meaning, pair, bare, senses, option, shareSense, sameOption, sameSense, sameMeaning, wordClass, cognate };
})();
