/* Écrit les fichiers que la séance de contrôle de l'anglais lit.
     node test/tools/check-files.js . <dossier-de-sortie>
     node test/tools/check-files.js .      les contrôles seuls, sans rien écrire : run-all.sh le lance ainsi
   glosses.tsv   id kind unit nl be fr en     (un élément intégré par ligne)
   blind.tsv     les mêmes lignes sans `en`, pour la passe à l'aveugle
   sentences.tsv where nl fr en              (phrases d'exemple et répliques de scénario)
   prose.tsv     where fr en                 (toute autre paire de texte)
   interface.tsv key fr en                   (chaque clé de l'une ou l'autre table)
   Chaque `where` est le chemin que donne owed() dans test/lib/prose.js. Sort avec 1 si
   glosses.tsv et owed() ne comptent pas les mêmes gloses, ou si une ligne de prose.tsv ou
   d'interface.tsv a un côté vide que le contenu n'explique pas, ou lit « undefined ». */
const fs = require('fs'), path = require('path');
const browser = require('../lib/browser');
const { COLLECTIONS, raw, owed, at, owedTables } = require('../lib/prose');
const { argsOf } = require('../lib/langs');
const ROOT = process.argv[2] || path.join(__dirname, '..', '..');
const OUT = process.argv[3];

const B = browser.open({ root: ROOT, seed: browser.SEED, skip: [browser.APP] });
const NL = B.NL;
/* Le cours tel qu'il est écrit, avant la première construction. */
const RAW = raw(NL.content);

/* Une cellule tient sur une ligne : ni tabulation ni saut de ligne. */
const cell = x => (x === null || x === undefined ? '' : String(x)).replace(/[\t\r\n]+/g, ' ');
const line = cols => cols.map(cell).join('\t');

/* Le texte français ou anglais d'une valeur : une paire, ou une chaîne (français seul). */
const side = (v, l) => (v && typeof v === 'object') ? v[l] : (l === 'fr' ? v : '');

const GLOSS = /^(units\[\d+\]\.(words|phrases)\[\d+\]|patterns\[\d+\])\.fr$/;
const SENTENCE = /(\.drills\[\d+\]|scenarios\[\d+\]\.steps\[\d+\]\.(them|you\.choices\[\d+\](\.reply)?))\.fr$/;

/* Un mot ou une phrase listé dans deux unités est un seul élément, construit au premier
   listage : la glose du second n'a pas de ligne dans glosses.tsv, et test/content.js vérifie
   qu'elle dit ce que dit le premier. Elle se compte à part. */
const LISTING = /^units\[(\d+)\]\.(word|phrase)s\[(\d+)\]\.fr$/;
const isAlias = where => {
  const m = LISTING.exec(where);
  const id = m ? RAW.units[+m[1]].id + ':' + m[2][0] + m[3] : null;
  return !!id && !!NL.content.byId(id) && NL.content.byId(id).id !== id;
};

NL.state.open().then(() => {
  NL.content.refresh();
  const places = [];
  COLLECTIONS.forEach(k => owed(RAW[k], k, '', places));
  /* La note d'un mot vit dans src/content/notes.js : son chemin est byDutch.notes["hallo"]. */
  owedTables(RAW, places);

  const files = { 'glosses.tsv': [], 'blind.tsv': [], 'sentences.tsv': [], 'prose.tsv': [], 'interface.tsv': [] };
  /* Les lignes dont un côté est vide sans que le contenu le veuille, ou qui lisent « undefined ». */
  const holes = [];

  NL.content.allItems().filter(it => it.unit !== 'eigen').forEach(it => {
    files['glosses.tsv'].push(line([it.id, it.kind, it.unit, it.nl, it.be, it.fr, it.en]));
    files['blind.tsv'].push(line([it.id, it.kind, it.unit, it.nl, it.be, it.fr]));
  });

  let glossPlaces = 0, aliasPlaces = 0;
  places.forEach(r => {
    if (GLOSS.test(r.where)) { if (isAlias(r.where)) aliasPlaces++; else glossPlaces++; return; }
    if (SENTENCE.test(r.where)) {
      const o = at(RAW, r.where.replace(/\.fr$/, ''));
      files['sentences.tsv'].push(line([r.where, o.nl, o.fr, o.en]));
      return;
    }
    /* Un `where` en `.fr` désigne le français d'un objet qui porte aussi l'anglais : on lit l'objet. */
    const v = at(RAW, r.where.replace(/\.fr$/, ''));
    files['prose.tsv'].push(line([r.where, side(v, 'fr'), side(v, 'en')]));
    /* Un anglais vide n'est voulu que là où le contenu le met à `null` (une note sans rien pour un lecteur anglais). */
    if (!cell(side(v, 'fr')) || (!cell(side(v, 'en')) && !(v && v.en === null))) holes.push('prose.tsv ' + r.where);
  });

  const T = NL.tables;
  /* Ce que chaque fonction reçoit, test/lib/langs.js le dit : un nombre par argument, paceNote un rythme. */
  const NUMS = [3, 7, 12];
  const show = (t, k) => {
    const v = t[k];
    if (typeof v === 'function') return v.apply(null, argsOf(k, v, NUMS));
    if (typeof v === 'string') return v;
    return JSON.stringify(v);
  };
  const own = (t, k) => Object.prototype.hasOwnProperty.call(t, k);
  Object.keys(T.fr).concat(Object.keys(T.en).filter(k => !own(T.fr, k))).forEach(k => {
    const fr = cell(show(T.fr, k)), en = cell(show(T.en, k));
    files['interface.tsv'].push(line([k, fr, en]));
    if (!fr || !en || /undefined/.test(fr + en)) holes.push('interface.tsv ' + k);
  });

  if (OUT) fs.mkdirSync(OUT, { recursive: true });
  Object.keys(files).forEach(f => {
    if (OUT) fs.writeFileSync(path.join(OUT, f), files[f].join('\n') + '\n', 'utf8');
    console.log(f + '  ' + files[f].length + ' lignes');
  });
  const sum = files['glosses.tsv'].length + files['sentences.tsv'].length + files['prose.tsv'].length;
  console.log('glosses + sentences + prose = ' + sum + ' ; owed() liste ' + places.length + ' endroits (' + glossPlaces + ' de gloses, ' + aliasPlaces + ' d’alias)');
  /* Chaque endroit hors gloses donne sa ligne : seules les gloses se comptent de deux côtés. */
  const glosses = files['glosses.tsv'].length;
  if (glosses !== glossPlaces) console.log('ÉCART : glosses.tsv a ' + glosses + ' lignes, owed() ' + glossPlaces + ' endroits de gloses');
  holes.forEach(h => console.log('TROU : ' + h));
  process.exit(glosses === glossPlaces && !holes.length ? 0 : 1);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
