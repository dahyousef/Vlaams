/* Les données externes, épinglées : chaque fichier a son adresse, sa date, sa taille et son
   sha256, et vit dans .cache/ (ignoré par git), jamais dans un fichier versionné.

     const cache = require('./cache');
     cache.PINS                         les fichiers épinglés, par clé (« kaikki/nl.jsonl »)
     await cache.fetch(repo, names, { from, pins })   { ok, lines } : les fichiers nommés dans
                                        .cache/, vérifiés ; `from` copie d'un dossier au lieu de
                                        télécharger ; un nom est une clé ou son préfixe (« tatoeba »)
     cache.get(repo, key, pins)         le chemin d'un fichier en cache, à la bonne taille ; sinon
                                        une erreur qui dit la commande à lancer

   Un téléchargement se décompresse avec bzip2 (Git Bash et ubuntu l'ont), et un .tar se lit
   ici : aucun autre programme ne s'exécute sur ces fichiers. Un fichier dont le sha256
   diffère de l'épingle est effacé : la source a changé depuis sa date, et l'épingle est à
   refaire, dans une tâche, avec ce qui en dépend. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const http = require('http'), https = require('https');
const { spawnSync } = require('child_process');

const TATOEBA = 'https://downloads.tatoeba.org/exports/';
const PINS = {
  'kaikki/nl.jsonl': { url: 'https://kaikki.org/dictionary/Dutch/kaikki.org-dictionary-Dutch.jsonl', date: '2026-11-01', bytes: 257235436, sha256: '42aaed451d9997e358290e68b0ff723235e2cc2a683edd1d273759d70cef9776' },
  'tatoeba/eng_sentences_detailed.tsv': { url: TATOEBA + 'per_language/eng/eng_sentences_detailed.tsv.bz2', date: '2026-11-07', bytes: 198969137, sha256: 'c9bf156a539da9047818f4dc9544a9da6272f8d3df7ab7bc589622f242a32504' },
  'tatoeba/fra_sentences_detailed.tsv': { url: TATOEBA + 'per_language/fra/fra_sentences_detailed.tsv.bz2', date: '2026-11-07', bytes: 76213829, sha256: '7c1f4b55ba12f8724f98510e2cfcd2de60c8649973b6384cb965092604e3f7f3' },
  'tatoeba/nld-eng_links.tsv': { url: TATOEBA + 'per_language/nld/nld-eng_links.tsv.bz2', date: '2026-11-07', bytes: 2746200, sha256: '11cbbb31daa29afd576eba39bc30a16c5beb62f13d5a2504163d695f58f123dc' },
  'tatoeba/nld-fra_links.tsv': { url: TATOEBA + 'per_language/nld/nld-fra_links.tsv.bz2', date: '2026-11-07', bytes: 992641, sha256: 'efb18932e9abd6da10acc9d6d16ed23d7b37d42b864c4b428ce0267502beb81d' },
  'tatoeba/nld_sentences_detailed.tsv': { url: TATOEBA + 'per_language/nld/nld_sentences_detailed.tsv.bz2', date: '2026-11-07', bytes: 19573559, sha256: '02c745fc5bac63e035961b16f1a38f07f6d26241e558a55248442753dcf46a68' },
  'tatoeba/user_languages.csv': { url: TATOEBA + 'user_languages.tar.bz2', member: 'user_languages.csv', date: '2026-11-07', bytes: 2435399, sha256: 'c43d653c044704d726126ae2aba563329a8d1f22fd383e79c983aebec64388f0' }
};

const dirOf = repo => path.join(path.resolve(repo), '.cache');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/* Les clés que des noms désignent : une clé, ou toutes celles qui commencent par « nom/ ». */
function select(names, pins) {
  const keys = Object.keys(pins);
  if (!names.length) return { keys, unknown: [] };
  const unknown = names.filter(n => !keys.some(k => k === n || k.indexOf(n + '/') === 0));
  return { keys: keys.filter(k => names.some(n => k === n || k.indexOf(n + '/') === 0)), unknown };
}

function get(repo, key, pins) {
  const pin = (pins || PINS)[key];
  if (!pin) throw new Error('no pin ' + key);
  const file = path.join(dirOf(repo), key);
  if (!fs.existsSync(file) || fs.statSync(file).size !== pin.bytes) {
    throw new Error('.cache/' + key + ' is missing: run node tools/content/fetch.js . ' + key);
  }
  return file;
}

/* Une adresse, enregistrée dans `file`, redirections suivies (cinq au plus). */
function download(url, file, hops) {
  return new Promise((resolve, reject) => {
    const lib = url.indexOf('https:') === 0 ? https : http;
    lib.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if ((hops || 0) >= 5) { reject(new Error('too many redirects')); return; }
        download(new URL(res.headers.location, url).toString(), file, (hops || 0) + 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) { res.resume(); reject(new Error('HTTP ' + res.statusCode)); return; }
      const out = fs.createWriteStream(file);
      res.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
      res.on('error', reject);
    }).on('error', reject);
  });
}

/* Le membre `name` d'une archive tar (ustar), lu sans programme externe. */
function untar(tarFile, name, file) {
  const b = fs.readFileSync(tarFile);
  const field = (h, at, n) => h.subarray(at, at + n).toString('latin1').replace(/\0[\s\S]*$/, '');
  let at = 0;
  while (at + 512 <= b.length) {
    const h = b.subarray(at, at + 512);
    if (h.every(x => x === 0)) break;
    const size = parseInt(field(h, 124, 12).trim(), 8);
    if (field(h, 0, 100) === name) { fs.writeFileSync(file, b.subarray(at + 512, at + 512 + size)); return; }
    at += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error('no ' + name + ' in the archive');
}

/* bzip2 -dc archive > file, sans shell. */
function bunzip(archive, file) {
  const fd = fs.openSync(file, 'w');
  try {
    const r = spawnSync('bzip2', ['-dc', archive], { stdio: ['ignore', fd, 'pipe'] });
    if (r.error) throw new Error('bzip2: ' + r.error.code + ' (Git Bash and ubuntu have it on PATH)');
    if (r.status !== 0) throw new Error('bzip2: ' + String(r.stderr).trim().split('\n')[0]);
  } finally { fs.closeSync(fd); }
}

async function one(repo, key, pin, from) {
  const file = path.join(dirOf(repo), key), part = file + '.part';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) {
    if (fs.statSync(file).size === pin.bytes && sha256(file) === pin.sha256) return 'ok ' + key + ' (cached)';
    fs.unlinkSync(file);
  }
  try {
    if (from) {
      const seed = path.join(from, path.basename(key));
      if (!fs.existsSync(seed)) return 'fail ' + key + ': no ' + path.basename(key) + ' in ' + from;
      fs.copyFileSync(seed, part);
    } else {
      const archive = part + (/\.bz2$/.test(pin.url) ? '.bz2' : '');
      await download(pin.url, archive);
      if (/\.bz2$/.test(pin.url)) {
        const tar = pin.member ? part + '.tar' : part;
        bunzip(archive, tar);
        fs.unlinkSync(archive);
        if (pin.member) { untar(tar, pin.member, part); fs.unlinkSync(tar); }
      }
    }
    const got = sha256(part);
    if (got !== pin.sha256) {
      fs.unlinkSync(part);
      return 'fail ' + key + ': sha256 ' + got.slice(0, 12) + '…, pinned ' + pin.sha256.slice(0, 12) + '… on ' + pin.date + ': the source changed, and the pin is to redo in a task';
    }
    fs.renameSync(part, file);
    return 'ok ' + key + ' ' + pin.bytes + ' bytes, sha256 ' + pin.sha256.slice(0, 12) + '…';
  } catch (e) {
    [part, part + '.bz2', part + '.tar'].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    return 'fail ' + key + ': ' + e.message;
  }
}

async function fetch(repo, names, opts) {
  const pins = (opts && opts.pins) || PINS, from = opts && opts.from;
  const { keys, unknown } = select(names || [], pins);
  const lines = unknown.map(n => 'fail ' + n + ': no such pin');
  for (const key of keys) lines.push(await one(repo, key, pins[key], from));
  return { ok: !lines.some(l => /^fail /.test(l)), lines };
}

module.exports = { PINS, select, get, fetch };
