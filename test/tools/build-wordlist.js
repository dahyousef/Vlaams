/* Construit la liste de formes néerlandaises que `test/content.js` consulte pour
   l'orthographe.

   On n'en tire que des FAITS — une forme existe, ou non — et jamais une
   définition : la liste n'impose donc aucune licence au dépôt. (Voir
   ATTRIBUTION.md.)

     node test/tools/build-wordlist.js

   Télécharge la liste d'OpenTaal (414 000 formes, flexions comprises), la met en
   minuscules, la trie et la compresse : 1,4 Mo versionné au lieu de 5. Elle ne
   se régénère que si le cours emploie un mot que le test ne connaît pas encore. */
const fs = require('fs'), path = require('path'), zlib = require('zlib'), https = require('https');
const SOURCE = 'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt';
const OUT = path.join(__dirname, '..', 'data', 'nl-words.txt.gz');

https.get(SOURCE, res => {
  if (res.statusCode !== 200) { console.log('FAIL: ' + SOURCE + ' → ' + res.statusCode); process.exit(1); }
  const chunks = [];
  res.on('data', c => chunks.push(c)).on('end', () => {
    const words = new Set();
    Buffer.concat(chunks).toString('utf8').split(/\r?\n/).forEach(w => { w = w.trim().toLowerCase(); if (w) words.add(w); });
    const sorted = [...words].sort();
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, zlib.gzipSync(Buffer.from(sorted.join('\n'), 'utf8'), { level: 9 }));
    console.log('formes : ' + sorted.length);
    console.log('écrit  : ' + OUT + '  (' + Math.round(fs.statSync(OUT).size / 1024) + ' Ko)');
  });
}).on('error', e => { console.log('FAIL: ' + e.message); process.exit(1); });
