/* L'outil de lecture : ce que le mainteneur lit des lignes d'un espace de travail, avec ce que
   les tables du cours en tiennent à HEAD. N'écrit rien.

     const reading = require('./reading');
     reading.list(repo, ws)                 { ok, lines } — la liste du contrôle du contenu : par
                                            genre coupé, chaque ligne que son genre fait lire en
                                            entier (readWhole), chaque ligne que le mainteneur a
                                            réglée, et un échantillon des autres lignes prises
     reading.every(repo, ws, name)          { ok, lines } — chaque ligne d'un genre
     reading.unsentenced(repo, ws, opts)    { ok, lines } — les mots sans phrase d'exemple à HEAD,
                                            chacun avec sa ligne dans le genre opts.sentences
                                            (par défaut SENTENCES, « examples »)
     reading.size(n)                        la taille de l'échantillon de n lignes
     reading.pick(name, ids)                l'échantillon : les mêmes ids à chaque lecture

   Les genres sont les dossiers de <ws>/drafts qui ont un split.txt. Les lignes sont du
   Markdown, en anglais : le mainteneur les lit sur la page de sa porte. Un genre illisible
   (un lot qui ne passe pas Check, une ligne non réglée, un élément qui n'est plus, une table
   sans fichier) rend des lignes « fail » et rien d'autre. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const kit = require('./kit');
const table = require('./table');
const { course } = require('./course');

const SENTENCES = 'examples';
const INTRO = 'Read for the content check, at HEAD: every row its kind marks to read whole (a new Flemish form, a generated sentence), every row the maintainer ruled, and a sample of the other taken rows, 1 in 10 and at least 10 per kind, the same on every run. Under each row, what each of its kind\'s tables holds for it.';

/* L'échantillon : 1 ligne sur 10, au moins 10, au plus toutes. Ses lignes sont celles dont
   le sha1 de « <genre> <id> » est le plus petit : la même liste à chaque lecture, et une
   ligne ajoutée ne déplace pas les autres. */
const size = n => Math.min(n, Math.max(10, Math.ceil(n / 10)));
const rank = (name, id) => crypto.createHash('sha1').update(name + ' ' + id).digest('hex');
function pick(name, ids) {
  const chosen = new Set(ids.slice().sort((a, b) => rank(name, a) < rank(name, b) ? -1 : 1).slice(0, size(ids.length)));
  return ids.filter(id => chosen.has(id));
}

const failed = lines => lines.some(l => /^fail /.test(l));
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* Un genre lu pour le mainteneur : ses lignes réglées, chacune avec sa source, et les
   entrées de ses tables à HEAD. */
function read(repo, ws, name, C) {
  const r = kit.readKind(repo, path.join(path.resolve(ws), 'drafts', name));
  if (failed(r.lines)) return { lines: r.lines.filter(l => /^fail /.test(l)) };
  const lines = [], tables = r.kind ? r.kind.tables : [], entries = {};
  r.rows.forEach(x => {
    if (x.why) lines.push('fail ' + name + ' ' + x.input.id + ': unsettled, ' + x.why);
    else if (!C.byId(x.input.id)) lines.push('fail ' + name + ' ' + x.input.id + ': no longer an item');
    else x.src = C.byId(x.input.id);
  });
  tables.forEach(t => {
    const file = path.join(path.resolve(repo), 'src', 'content', t + '.js');
    if (fs.existsSync(file)) entries[t] = table.load(file).entries;
    else lines.push('fail ' + name + ' -: no table file src/content/' + t + '.js');
  });
  if (failed(lines)) return { lines };
  r.rows.forEach(x => { x.whole = x.row ? r.kind.readWhole(x.row, x.input, x.src) : ''; });
  return { lines, rows: r.rows, tables, entries };
}

/* Comment une ligne a été réglée. */
const settled = x => x.ruling
  ? 'ruled ' + x.ruling.ruling + ' on ' + x.ruling.date + (x.ruling.words ? ': ' + x.ruling.words : '')
  : x.from === 'draft' ? 'kept by the first reader' : 'kept by the second reader';

/* La ligne d'une source : son néerlandais, son id et son sens, langue par langue. */
const heading = (src, G) => '- `' + src.nl + '` (' + src.id + ') — ' + G.LANGS.map(l => G.of(src, l)).join(' · ');

/* Une ligne lue : sa source, pourquoi elle est là, puis ce que chaque table du genre tient
   sous son néerlandais, et le doute du rédacteur s'il en a dit un. */
function block(x, k, G, also) {
  const why = (x.whole ? [x.whole] : []).concat([settled(x)], also || []);
  const out = [heading(x.src, G), '  - ' + why.join('; ')];
  k.tables.forEach(t => out.push('  - ' + t + '.js: ' + (has(k.entries[t], x.src.nl) ? table.literal(k.entries[t][x.src.nl]) : 'no entry')));
  if (x.row && x.row.unsure) out.push('  - unsure: ' + x.row.unsure);
  return out;
}

const counts = rows => rows.length + ' rows: ' + rows.filter(x => x.row).length + ' taken, ' + rows.filter(x => x.drop).length + ' dropped.';

/* Les genres coupés de l'espace de travail, par ordre de nom. */
function kinds(ws) {
  const dir = path.join(path.resolve(ws), 'drafts');
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => fs.existsSync(path.join(dir, n, 'split.txt'))).sort() : [];
}

function list(repo, ws) {
  const names = kinds(ws);
  if (!names.length) return { ok: false, lines: ['fail reading -: no split kind in ' + path.join(path.resolve(ws), 'drafts')] };
  const C = course(repo), G = C.NL.gloss;
  const lines = ['# Reading list', '', INTRO], fails = [];
  names.forEach(name => {
    const k = read(repo, ws, name, C);
    if (failed(k.lines)) { k.lines.forEach(l => fails.push(l)); return; }
    const ruled = k.rows.filter(x => x.ruling);
    const whole = k.rows.filter(x => !x.ruling && x.whole);
    const others = k.rows.filter(x => x.row && !x.ruling && !x.whole);
    const sampled = new Set(pick(name, others.map(x => x.input.id)));
    lines.push('', '## ' + name, '', counts(k.rows) + ' Listed: ' + ruled.length + ' ruled, ' + whole.length + ' read whole, ' + sampled.size + ' sampled of ' + others.length + ' others.');
    const listed = k.rows.filter(x => x.ruling || x.whole || sampled.has(x.input.id));
    if (listed.length) lines.push('');
    listed.forEach(x => block(x, k, G, sampled.has(x.input.id) ? ['sampled'] : []).forEach(l => lines.push(l)));
  });
  return fails.length ? { ok: false, lines: fails } : { ok: true, lines };
}

function every(repo, ws, name) {
  const C = course(repo), G = C.NL.gloss;
  const k = read(repo, ws, name, C);
  if (failed(k.lines)) return { ok: false, lines: k.lines };
  const lines = ['# ' + name + ': every row', '', counts(k.rows)];
  if (k.rows.length) lines.push('');
  k.rows.forEach(x => block(x, k, G).forEach(l => lines.push(l)));
  return { ok: true, lines };
}

function unsentenced(repo, ws, opts) {
  const name = (opts && opts.sentences) || SENTENCES;
  const C = course(repo), G = C.NL.gloss;
  const k = read(repo, ws, name, C);
  if (failed(k.lines)) return { ok: false, lines: k.lines };
  const byId = new Map(k.rows.map(x => [x.input.id, x]));
  const words = C.sources.filter(s => s.kind === 'word' && !(s.drills && s.drills.length));
  const lines = ['# Words without a sentence', '', words.length + ' words have no example sentence. Under each, its row in drafts/' + name + '.'];
  if (words.length) lines.push('');
  words.forEach(s => {
    const x = byId.get(s.id);
    lines.push(heading(s, G));
    if (!x) { lines.push('  - ' + name + ': no row'); return; }
    if (x.drop) { lines.push('  - ' + name + ': ' + settled(x)); return; }
    const rest = Object.assign({}, x.row);
    delete rest.id;
    delete rest.stamp;
    lines.push('  - ' + name + ': ' + JSON.stringify(rest) + '; ' + settled(x));
  });
  return { ok: true, lines };
}

module.exports = { SENTENCES, size, pick, list, every, unsentenced };
