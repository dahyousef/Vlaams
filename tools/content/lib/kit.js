/* Le kit de répartition : Split, Check et Merge d'un genre de lignes de contenu, et leurs
   empreintes. Le contrat est celui de docs/agents/plan-runs/design-sitting.md (« The fan-out
   form ») et du tableau des fichiers de batch-controller.md ; ce qui est propre à un genre vit
   dans tools/content/kinds/<genre>.js, que loadKind() lit.

     const kit = require('./kit');
     kit.loadKind(repo, name)       le module d'un genre, vérifié
     kit.stamp(kind, src, NL)       l'empreinte d'une source : 8 hex
     kit.split(repo, kindDir)       { ok, lines } — écrit <lot>/input.json et split.txt
     kit.check(repo, batchDir)      { ok, lines } — n'écrit rien
     kit.merge(repo, kindDir)       { ok, lines } — écrit les tables du genre, ou rien
     kit.readKind(repo, kindDir)    { name, kind, lines, rows } — chaque ligne d'entrée du genre et ce
                                    que Merge en prend ; n'écrit rien (l'outil de lecture le lit)

   Les lignes imprimées sont en anglais : ce sont les agents du kit, qui travaillent sur des
   pages anglaises, qui les lisent. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { course } = require('./course');
const table = require('./table');

const FILES = ['input.json', 'draft.json', 'review.json', 'retry.json', 'retry-review.json', 'disputes.md', 'rulings.json', 'change.json'];
const KIT_FIELDS = ['id', 'stamp', 'unsure'];
const VERDICT = /^(keep|dispute: .*\S.*|for maintainer: .*\S.*)$/;

/* Le module d'un genre, vérifié : ce qu'il doit déclarer et ce qu'il peut déclarer sont
   ci-dessous. Le genre essai de test/tools/fanout.js en est un exemple. */
function loadKind(repo, name) {
  const file = path.join(path.resolve(repo), 'tools', 'content', 'kinds', name + '.js');
  if (!fs.existsSync(file)) throw new Error('no kind module tools/content/kinds/' + name + '.js');
  const kind = Object.assign({ optional: [], verdictFields: [], forMaintainer: () => '', checkVerdict: () => [], readWhole: () => '' }, require(file));
  const arrays = ['stamp', 'fields', 'optional', 'verdictFields', 'tables'];
  const fns = ['split', 'check', 'merge', 'forMaintainer', 'checkVerdict', 'readWhole'];
  arrays.forEach(k => { if (!Array.isArray(kind[k])) throw new Error('kind ' + name + ': ' + k + ' is not an array'); });
  fns.forEach(k => { if (typeof kind[k] !== 'function') throw new Error('kind ' + name + ': ' + k + ' is not a function'); });
  if (kind.write !== undefined && typeof kind.write !== 'function') throw new Error('kind ' + name + ': write is not a function');
  if (!kind.fields.length) throw new Error('kind ' + name + ': fields is empty');
  kind.fields.concat(kind.optional).forEach(f => {
    if (KIT_FIELDS.concat(['copies']).indexOf(f) >= 0) throw new Error('kind ' + name + ': ' + f + ' is the kit\'s own field');
  });
  kind.verdictFields.forEach(f => {
    if (f === 'id' || f === 'verdict') throw new Error('kind ' + name + ': ' + f + ' is the kit\'s own verdict field');
  });
  kind.name = name;
  return kind;
}

/* L'empreinte d'une source : ce dont ses lignes sont écrites, haché. Le néerlandais en est
   toujours, puisqu'il est la clé des tables ; puis chaque champ que le genre nomme dans
   `stamp`. Un champ se lit comme un écran le lit :
     'meaning'        le sens de l'élément, langue par langue (NL.gloss.of)
     une chaîne ou une paire { fr, en } (note, be…)   langue par langue (NL.gloss.of)
     absent           null
     une fonction     ce qu'elle rend de la source
     autre chose      tel quel
   Un champ récrit sans changer ce qui s'en lit, une chaîne devenue paire, garde son empreinte. */
function stamp(kind, src, NL) {
  const G = NL.gloss;
  const read = f => {
    if (typeof f === 'function') return f(src);
    if (f === 'meaning') return G.LANGS.map(l => G.of(src, l));
    const v = src[f];
    if (v === undefined) return null;
    if (typeof v === 'string' || (v && typeof v === 'object' && !Array.isArray(v) && ('fr' in v || 'en' in v))) return G.LANGS.map(l => G.of(v, l));
    return v;
  };
  const values = [src.nl].concat(kind.stamp.map(read));
  return crypto.createHash('sha1').update(JSON.stringify(values)).digest('hex').slice(0, 8);
}

const failed = lines => lines.some(l => /^fail /.test(l));
const writeJson = (file, v) => fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');

/* Split : la source coupée en lots, une fois. Un dossier déjà coupé (split.txt) n'est pas
   récrit : ses lignes sont imprimées telles quelles. Un lot vide n'est pas écrit, et
   split.txt, écrit en dernier, ne liste que les lots écrits. */
function split(repo, kindDir) {
  const name = path.basename(kindDir), list = path.join(kindDir, 'split.txt');
  if (fs.existsSync(list)) return { ok: true, lines: fs.readFileSync(list, 'utf8').split('\n').filter(Boolean) };
  let kind;
  try { kind = loadKind(repo, name); } catch (e) { return { ok: false, lines: ['fail ' + name + ' -: ' + e.message] }; }
  const C = course(repo);
  let batches;
  try { batches = kind.split(C, { repo: path.resolve(repo), kind, kindDir, course: () => C }); } catch (e) { return { ok: false, lines: ['fail ' + name + ' -: the kind\'s split threw: ' + e.message] }; }
  const lines = [], seen = new Map(), names = new Set();
  if (!Array.isArray(batches) || batches.some(b => !b || typeof b.batch !== 'string' || !Array.isArray(b.rows) || b.rows.some(r => !r || typeof r.id !== 'string'))) {
    return { ok: false, lines: ['fail ' + name + ' -: the kind\'s split returns a list of { batch, rows }, each row an object with its id'] };
  }
  batches.forEach(b => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(b.batch) || names.has(b.batch)) lines.push('fail ' + name + ' -: batch name « ' + b.batch + ' » is not a fresh name in lowercase letters, digits and dashes');
    names.add(b.batch);
    b.rows.forEach(r => {
      const src = C.byId(r.id);
      if (!src) lines.push('fail ' + name + ' ' + r.id + ': not an item (a copy, a pattern or an unknown id)');
      else if (seen.has(r.id)) lines.push('fail ' + name + ' ' + r.id + ': in batch ' + seen.get(r.id) + ' and in batch ' + b.batch);
      if ('stamp' in r || 'copies' in r) lines.push('fail ' + name + ' ' + r.id + ': stamp and copies are the kit\'s to write');
      seen.set(r.id, b.batch);
    });
  });
  if (failed(lines)) return { ok: false, lines };
  batches.filter(b => b.rows.length).forEach(b => {
    const rows = b.rows.map(r => {
      const src = C.byId(r.id), rest = Object.assign({}, r);
      delete rest.id;
      return Object.assign({ id: r.id, stamp: stamp(kind, src, C.NL), copies: src.copies.slice() }, rest);
    });
    fs.mkdirSync(path.join(kindDir, b.batch), { recursive: true });
    writeJson(path.join(kindDir, b.batch, 'input.json'), rows);
    lines.push(b.batch + ' ' + rows.length);
  });
  fs.mkdirSync(kindDir, { recursive: true });
  fs.writeFileSync(list, lines.map(l => l + '\n').join(''));
  return { ok: true, lines };
}

/* Un fichier JSON du lot : un tableau, ou une ligne `fail`. */
function readArray(dir, file, out) {
  let v;
  try { v = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); } catch (e) { out.push('fail ' + file + ' -: not JSON (' + e.message.split('\n')[0] + ')'); return null; }
  if (!Array.isArray(v)) { out.push('fail ' + file + ' -: not a JSON array'); return null; }
  if (v.some(x => !x || typeof x !== 'object' || Array.isArray(x) || typeof x.id !== 'string')) { out.push('fail ' + file + ' -: an entry is not an object with an id'); return null; }
  return v;
}

/* Les ids d'un fichier contre ceux qu'il doit avoir, dans l'ordre de l'entrée. Rend les
   entrées attendues, chacune une fois. */
function aligned(file, rows, ids, out) {
  const want = new Set(ids), seen = new Set(), good = [];
  rows.forEach(r => {
    if (!want.has(r.id)) out.push('fail ' + file + ' ' + r.id + ': not an entry this file holds');
    else if (seen.has(r.id)) out.push('fail ' + file + ' ' + r.id + ': twice');
    else { seen.add(r.id); good.push(r); }
  });
  ids.filter(id => !seen.has(id)).forEach(id => out.push('fail ' + file + ' ' + id + ': missing'));
  const order = ids.filter(id => seen.has(id));
  if (good.some((r, k) => r.id !== order[k])) out.push('fail ' + file + ' -: entries are not in the input\'s order');
  return good;
}

/* Une ligne écrite (brouillon, reprise, changement) : son empreinte, les champs du format, et
   les règles du genre. */
function checkRow(file, row, input, kind, ctx, out) {
  const before = out.length;
  if (row.stamp !== input.stamp) out.push('fail ' + file + ' ' + row.id + ': stamp ' + row.stamp + ', input has ' + input.stamp);
  kind.fields.forEach(f => { if (row[f] === undefined) out.push('fail ' + file + ' ' + row.id + ': missing field ' + f); });
  const known = KIT_FIELDS.concat(kind.fields, kind.optional);
  Object.keys(row).forEach(k => { if (known.indexOf(k) < 0) out.push('fail ' + file + ' ' + row.id + ': unknown field ' + k); });
  if ('unsure' in row && (typeof row.unsure !== 'string' || !row.unsure.trim() || /\n/.test(row.unsure))) out.push('fail ' + file + ' ' + row.id + ': unsure is a reason on one line');
  if (out.length > before) return;
  let reasons;
  try { reasons = kind.check(row, input, ctx); } catch (e) { reasons = ['the kind\'s check threw: ' + e.message]; }
  reasons.forEach(why => out.push('fail ' + file + ' ' + row.id + ': ' + why));
}

/* Un verdict : sa forme, « for maintainer » sur exactement les lignes que le format envoie au
   mainteneur, et les champs que le format ajoute au verdict. */
function checkVerdict(file, v, row, input, kind, ctx, out) {
  const known = ['id', 'verdict'].concat(kind.verdictFields);
  Object.keys(v).forEach(k => { if (known.indexOf(k) < 0) out.push('fail ' + file + ' ' + v.id + ': unknown field ' + k); });
  if (typeof v.verdict !== 'string' || !VERDICT.test(v.verdict)) { out.push('fail ' + file + ' ' + v.id + ': verdict is « keep », « dispute: <reason> » or « for maintainer: <reason> », on one line'); return; }
  const rule = kind.forMaintainer(row, input);
  const toMaintainer = /^for maintainer: /.test(v.verdict);
  if (rule && !toMaintainer) out.push('fail ' + file + ' ' + v.id + ': the format sends this row to the maintainer (' + rule + '): its verdict is « for maintainer: <reason> »');
  if (!rule && toMaintainer) out.push('fail ' + file + ' ' + v.id + ': « for maintainer » on a row the format does not send to the maintainer');
  let reasons;
  try { reasons = kind.checkVerdict(v, row, input, ctx); } catch (e) { reasons = ['the kind\'s verdict check threw: ' + e.message]; }
  reasons.forEach(why => out.push('fail ' + file + ' ' + v.id + ': ' + why));
}

const tally = vs => {
  const n = p => vs.filter(v => p.test(v.verdict)).length;
  const m = n(/^for maintainer: /);
  return n(/^keep$/) + ' keep, ' + n(/^dispute: /) + ' dispute' + (m ? ', ' + m + ' for maintainer' : '');
};

/* Les sections de disputes.md : « ## <id> » et les lignes qui suivent. */
function sections(text) {
  const out = [];
  text.split(/\r?\n/).forEach(l => {
    const m = /^## (\S+)\s*$/.exec(l);
    if (m) out.push({ id: m[1], lines: [] });
    else if (out.length) out[out.length - 1].lines.push(l);
  });
  return out;
}

/* Lit et vérifie tout le lot. Rend les lignes, et ce qui a été lu (pour Merge) : un fichier
   n'y figure que s'il passe. */
function readBatch(repo, batchDir) {
  const kindName = path.basename(path.dirname(batchDir)), batch = path.basename(batchDir);
  const lines = [], got = {};
  let kind;
  try { kind = loadKind(repo, kindName); } catch (e) { return { lines: ['fail ' + batch + ' -: ' + e.message], got, kind: null }; }
  let C = null;
  const ctx = { repo: path.resolve(repo), kind, kindDir: path.dirname(batchDir), batchDir, course: () => C || (C = course(repo)) };
  const has = f => fs.existsSync(path.join(batchDir, f));
  const step = (file, needs, body) => {
    if (!has(file)) return;
    if (needs.some(n => !got[n])) { lines.push('fail ' + file + ' -: ' + needs.filter(n => !got[n]).join(' and ') + ' missing or failing'); return; }
    const out = [];
    const v = body(out);
    lines.push.apply(lines, out.length ? out : [v.line]);
    if (!out.length) got[file] = v.value;
  };

  if (!has('input.json')) return { lines: ['fail input.json -: missing'], got, kind };
  step('input.json', [], out => {
    const rows = readArray(batchDir, 'input.json', out) || [];
    const ids = new Set();
    rows.forEach(r => {
      if (ids.has(r.id)) out.push('fail input.json ' + r.id + ': twice');
      ids.add(r.id);
      if (typeof r.stamp !== 'string' || !/^[0-9a-f]{8}$/.test(r.stamp)) out.push('fail input.json ' + r.id + ': stamp is not 8 hex');
      if (!Array.isArray(r.copies)) out.push('fail input.json ' + r.id + ': copies is not a list');
    });
    return { line: 'ok input.json ' + rows.length + ' rows', value: rows };
  });
  const input = got['input.json'] || [];
  const inputOf = new Map(input.map(r => [r.id, r]));
  const ids = pred => input.map(r => r.id).filter(pred);

  const rowsFile = (file, want) => out => {
    const rows = readArray(batchDir, file, out);
    if (rows) aligned(file, rows, want, out).forEach(r => checkRow(file, r, inputOf.get(r.id), kind, ctx, out));
    return { line: 'ok ' + file + ' ' + (rows || []).length + ' rows', value: rows };
  };
  const verdictsFile = (file, rowsOf) => out => {
    const rows = got[rowsOf], byId = new Map(rows.map(r => [r.id, r]));
    const vs = readArray(batchDir, file, out);
    if (vs) aligned(file, vs, rows.map(r => r.id), out).forEach(v => checkVerdict(file, v, byId.get(v.id), inputOf.get(v.id), kind, ctx, out));
    return { line: 'ok ' + file + ' ' + (vs ? tally(vs) : ''), value: vs };
  };
  const verdictOf = (file, id) => {
    const v = (got[file] || []).find(x => x.id === id);
    return v ? v.verdict : '';
  };

  step('draft.json', ['input.json'], rowsFile('draft.json', ids(() => true)));
  step('review.json', ['draft.json'], verdictsFile('review.json', 'draft.json'));
  step('retry.json', ['review.json'], rowsFile('retry.json', ids(id => /^dispute: /.test(verdictOf('review.json', id)))));
  step('retry-review.json', ['retry.json'], verdictsFile('retry-review.json', 'retry.json'));

  const disputed = ids(id => /^dispute: /.test(verdictOf('review.json', id)));
  step('disputes.md', disputed.length ? ['review.json', 'retry-review.json'] : ['review.json'], out => {
    const want = ids(id => /^for maintainer: /.test(verdictOf('review.json', id)) || /^(dispute|for maintainer): /.test(verdictOf('retry-review.json', id)));
    const secs = sections(fs.readFileSync(path.join(batchDir, 'disputes.md'), 'utf8')), seen = new Set();
    secs.forEach(s => {
      if (seen.has(s.id)) out.push('fail disputes.md ' + s.id + ': two sections');
      seen.add(s.id);
      if (want.indexOf(s.id) < 0) out.push('fail disputes.md ' + s.id + ': a section for a row that is not for the maintainer');
      ['Source:', 'Row:', 'First reader:'].forEach(h => {
        if (!s.lines.some(l => l.indexOf(h) === 0)) out.push('fail disputes.md ' + s.id + ': no « ' + h + ' » line');
      });
    });
    want.filter(id => !seen.has(id)).forEach(id => out.push('fail disputes.md ' + id + ': no section, and the row is for the maintainer'));
    return { line: 'ok disputes.md ' + secs.length + ' rows', value: secs.map(s => s.id) };
  });

  step('rulings.json', ['disputes.md'], out => {
    const rs = readArray(batchDir, 'rulings.json', out) || [];
    const secs = got['disputes.md'], seen = new Set();
    rs.forEach(r => {
      const bad = why => out.push('fail rulings.json ' + r.id + ': ' + why);
      if (seen.has(r.id)) bad('two rulings: the latest replaces the earlier one');
      seen.add(r.id);
      if (secs.indexOf(r.id) < 0) bad('no section in disputes.md');
      Object.keys(r).forEach(k => { if (['id', 'ruling', 'words', 'confirmed', 'date'].indexOf(k) < 0) bad('unknown field ' + k); });
      if (['keep', 'drop', 'change'].indexOf(r.ruling) < 0) bad('ruling is keep, drop or change');
      if (typeof r.confirmed !== 'boolean') bad('confirmed is true or false');
      if (r.ruling !== 'change' && r.confirmed !== true) bad('a ' + r.ruling + ' ruling is confirmed: true');
      if (r.ruling === 'change' && (typeof r.words !== 'string' || !r.words.trim())) bad('a change carries the maintainer\'s words');
      if (r.ruling !== 'change' && r.words !== null && typeof r.words !== 'string') bad('words is a string or null');
      if (typeof r.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) bad('date is YYYY-MM-DD');
    });
    secs.filter(id => !seen.has(id)).forEach(id => out.push('fail rulings.json ' + id + ': no ruling'));
    return { line: 'ok rulings.json ' + rs.length + ' rows', value: rs };
  });
  const ruling = id => (got['rulings.json'] || []).find(r => r.id === id);
  step('change.json', ['rulings.json'], rowsFile('change.json', ids(id => (ruling(id) || {}).ruling === 'change')));

  return { lines, got, kind, ctx, input };
}

/* Check : chaque fichier présent du lot, dans l'ordre du tableau ; un fichier inconnu est
   laissé de côté. */
function check(repo, batchDir) {
  const lines = readBatch(repo, batchDir).lines;
  return { ok: !failed(lines), lines };
}

/* Ce que Merge prend d'une ligne d'entrée : { row } (la ligne prise), { drop: true }, ou
   { why } quand elle n'est pas réglée. L'ordre est celui du contrat : le brouillon que la
   relecture garde ; sinon la reprise que la seconde relecture garde ; sinon la décision du
   mainteneur, keep (la reprise, ou le brouillon sans reprise), change confirmé (change.json)
   ou drop (rien). */
function settle(id, got) {
  const find = (file, x) => (got[file] || []).find(r => r.id === x);
  const draft = find('draft.json', id), review = find('review.json', id);
  const retry = find('retry.json', id), second = find('retry-review.json', id);
  const ruling = find('rulings.json', id);
  if (review && review.verdict === 'keep') return { row: draft, from: 'draft' };
  if (second && second.verdict === 'keep') return { row: retry, from: 'retry' };
  if (ruling && ruling.ruling === 'keep') return retry ? { row: retry, from: 'retry' } : { row: draft, from: 'draft' };
  if (ruling && ruling.ruling === 'drop') return { drop: true };
  if (ruling && ruling.ruling === 'change') {
    if (!ruling.confirmed) return { why: 'change not confirmed' };
    const change = find('change.json', id);
    return change ? { row: change, from: 'change' } : { why: 'change.json has no row' };
  }
  if (!got['draft.json']) return { why: 'no draft' };
  if (!review) return { why: 'no review' };
  if (/^dispute: /.test(review.verdict) && !retry) return { why: 'disputed, no retry' };
  if (retry && !second) return { why: 'no second review' };
  return { why: 'no ruling' };
}

/* Un genre lu lot par lot, sans rien écrire : { name, kind, lines, rows }. lines sont les
   lignes de Check de chaque lot, puis, pour un lot qui ne passe pas, « batch <lot> does not
   pass Check » ; rows ne tient alors rien de ce lot. Une ligne de rows : { input, batch,
   ruling } (la décision du mainteneur, ou null) et ce que settle() en prend. kind est null
   quand aucun lot n'a été lu. */
function readKind(repo, kindDir) {
  const name = path.basename(kindDir), list = path.join(kindDir, 'split.txt');
  if (!fs.existsSync(list)) return { name, kind: null, lines: ['fail ' + name + ' -: never split: run Split first'], rows: [] };
  const batches = fs.readFileSync(list, 'utf8').split('\n').filter(Boolean).map(l => l.split(' ')[0]);
  const lines = [], rows = [];
  let kind = null;
  batches.forEach(b => {
    const r = readBatch(repo, path.join(kindDir, b));
    kind = r.kind || kind;
    r.lines.forEach(l => lines.push(l));
    if (failed(r.lines)) { lines.push('fail ' + name + ' -: batch ' + b + ' does not pass Check'); return; }
    const ruling = id => (r.got['rulings.json'] || []).find(x => x.id === id) || null;
    r.input.forEach(input => rows.push(Object.assign({ input, batch: b, ruling: ruling(input.id) }, settle(input.id, r.got))));
  });
  return { name, kind, lines, rows };
}

/* Merge : chaque ligne réglée, ses valeurs écrites dans les tables du genre, sous le
   néerlandais de sa source. Refuse sans rien écrire : un genre jamais coupé, un lot qui ne
   passe pas Check, une ligne non réglée, une source qui a changé depuis Split, une valeur
   qu'une de ses tables ne sait pas écrire (table.literal). */
function merge(repo, kindDir) {
  const { name, kind, lines: read, rows } = readKind(repo, kindDir);
  if (failed(read)) return { ok: false, lines: read.filter(l => /^fail /.test(l)) };
  if (!rows.length) return { ok: true, lines: ['ok ' + name + ' 0 taken, 0 dropped'] };

  const C = course(repo), lines = [];
  const ctx = { repo: path.resolve(repo), kind, kindDir, course: () => C };
  rows.forEach(r => {
    if (r.why) { lines.push('fail ' + name + ' ' + r.input.id + ': unsettled, ' + r.why); return; }
    const src = C.byId(r.input.id);
    if (!src) { lines.push('fail ' + name + ' ' + r.input.id + ': no longer an item'); return; }
    const now = stamp(kind, src, C.NL);
    if (now !== r.input.stamp) lines.push('fail ' + name + ' ' + r.input.id + ': stale, stamped ' + r.input.stamp + ' at Split, the source now stamps ' + now);
    r.src = src;
  });
  if (failed(lines)) return { ok: false, lines };

  const taken = rows.filter(r => r.row);
  const changes = {};
  kind.tables.forEach(t => { changes[t] = {}; });
  taken.forEach(r => {
    const values = kind.merge(r.row, r.input, r.src, ctx);
    Object.keys(values).forEach(t => {
      if (!changes[t]) throw new Error('kind ' + name + ': merge wrote table ' + t + ', which its tables do not name');
      if (values[t] !== undefined) changes[t][r.src.nl] = values[t];
    });
  });
  const files = kind.tables.map(t => path.join(path.resolve(repo), 'src', 'content', t + '.js'));
  files.forEach(f => { if (!fs.existsSync(f)) lines.push('fail ' + name + ' -: no table file ' + path.relative(path.resolve(repo), f).split(path.sep).join('/')); });
  files.forEach(f => {
    if (!fs.existsSync(f)) return;
    try { table.load(f); } catch (e) { lines.push('fail ' + name + ' -: ' + e.message); }
  });
  if (failed(lines)) return { ok: false, lines };

  /* Toutes les tables se récrivent avant qu'une seule s'écrive. */
  const ready = kind.tables.map((t, k) => table.prepare(files[k], changes[t]));
  lines.push('ok ' + name + ' ' + taken.length + ' taken, ' + rows.filter(r => r.drop).length + ' dropped');
  ready.forEach((p, k) => {
    if (!p.same) fs.writeFileSync(files[k], p.text);
    lines.push('ok ' + kind.tables[k] + '.js ' + p.set + ' set, ' + p.removed + ' removed');
  });
  if (kind.write) (kind.write(taken.map(r => ({ id: r.input.id, row: r.row, input: r.input, src: r.src })), ctx) || []).forEach(l => lines.push(l));
  return { ok: true, lines };
}

module.exports = { FILES, loadKind, stamp, split, check, merge, settle, readKind };
