/* Le décor de la passe d'apprenant : la page construite servie en local, et Chrome habillé
   en Safari sur iPhone (390×844, tactile, fr-BE), avec une reconnaissance vocale factice qui
   se comporte comme celle de Safari.
     node tools/learner-pass/<script>.js [dossier qui contient index.html]     (le dépôt par défaut) */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.join(ROOT, p);
      fs.readFile(f, (e, b) => {
        if (e) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
        r.end(b);
      });
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}

/* Safari sur iPhone tel qu'il s'est comporté en octobre 2026 : des résultats provisoires
   seulement, jamais marqués finals, pas de fin avant stop(), et un onend asynchrone.
   window.__say est ce que l'apprenant « dit » ; window.__selfEnd fait finir l'écoute seule.
   La synthèse vocale ne parle pas : elle note chaque phrase dans window.__log (« tts:… »). */
const INIT = `
(() => {
  window.__log = [];
  class FakeSR {
    constructor() { this.lang = ''; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1; this._live = false; }
    start() {
      this._live = true; window.__log.push('sr.start');
      setTimeout(() => {
        if (!this._live) return;
        const t = window.__say || '';
        if (!t || !this.onresult) return;
        const res = [{ transcript: t, confidence: 0.9 }]; res.isFinal = false;
        this.onresult({ resultIndex: 0, results: [res] });
        window.__log.push('sr.interim:' + t);
      }, 250);
      if (window.__selfEnd) setTimeout(() => { if (this._live) { this._live = false; this.onend && this.onend(); } }, 900);
    }
    stop() { window.__log.push('sr.stop'); if (!this._live) return; this._live = false; setTimeout(() => { this.onend && this.onend(); }, 60); }
    abort() { window.__log.push('sr.abort'); if (!this._live) return; this._live = false; setTimeout(() => { this.onend && this.onend(); }, 10); }
  }
  window.webkitSpeechRecognition = FakeSR;
  try { delete window.SpeechRecognition; } catch (e) {}
  if (window.speechSynthesis) {
    window.speechSynthesis.speak = u => { window.__log.push('tts:' + u.text); setTimeout(() => { u.onend && u.onend({}); }, 30); };
  }
})();`;

/* Ouvre la page sur une base vide. `errors` recueille les erreurs et avertissements de la console. */
async function open() {
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) throw new Error(ROOT + ' ne contient pas index.html : lancer sh build.sh');
  const server = await serve();
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'fr-BE' });
  await context.addInitScript(INIT);
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.NL && NL.ui && NL.ui.route);
  return { page, errors, close: async () => { await browser.close(); server.close(); } };
}

/* Le verdict d'un script : chaque problème sur sa ligne, et 1 s'il y en a. */
function verdict(problems, clean) {
  problems.forEach(p => console.log('  PROBLEM: ' + p));
  console.log('\n' + (problems.length ? problems.length + ' PROBLEM(S)' : clean));
  process.exit(problems.length ? 1 : 0);
}

module.exports = { open, verdict, sleep, ROOT, SHOTS };
