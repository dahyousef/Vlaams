/* Vlaams — small shared helpers. No dependencies. */
window.NL = window.NL || {};
NL.util = (function () {
  'use strict';

  const esc = s => String(s == null ? '' : s)
    .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const shuffle = a => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const one = a => a[(Math.random() * a.length) | 0];
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const uniq = a => [...new Set(a)];

  /* Comparison. Accents are kept (Dutch uses them), punctuation and case are not. */
  const norm = s => String(s || '').toLowerCase()
    .replace(/[’‘´`]/g, "'").replace(/[“”]/g, '"')
    .replace(/[.,!?;:"()…]/g, '')
    .replace(/\s+/g, ' ').trim();

  const words = s => norm(s).split(' ').filter(Boolean);
  /* Tiles keep their visible punctuation off, but the display string stays intact. */
  const tiles = s => String(s).split(/\s+/).map(t => t.replace(/[.,!?;:"()]/g, '')).filter(Boolean);

  const bare = nl => String(nl).replace(/^(de|het|een)\s+/i, '');
  /* Strips the French article so a gloss can be shown bare in a tile or an option. */
  const bareFr = fr => String(fr).replace(/^(les|le|la|un|une|des|du|de la|de l’|l’)\s?/i, '');

  function lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) {
        row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = row;
    }
    return prev[b.length];
  }
  const near = (a, b, tol) => {
    a = norm(a); b = norm(b);
    if (a === b) return true;
    const d = lev(a, b);
    return d <= (tol == null ? Math.max(1, Math.floor(b.length / 8)) : tol);
  };
  const ratio = (a, b) => {
    a = norm(a); b = norm(b);
    const m = Math.max(a.length, b.length);
    return m ? 1 - lev(a, b) / m : 1;
  };

  /* Aligns what was heard against what was expected, word by word. */
  function diffWords(said, target) {
    const S = words(said), T = words(target);
    const used = new Array(S.length).fill(false);
    return T.map((t, i) => {
      let bestJ = -1, bestR = 0;
      const from = Math.max(0, i - 2), to = Math.min(S.length, i + 3);
      for (let j = from; j < to; j++) {
        if (used[j]) continue;
        const r = ratio(S[j], t);
        if (r > bestR) { bestR = r; bestJ = j; }
      }
      if (bestR >= 0.72 && bestJ >= 0) { used[bestJ] = true; return { word: t, ok: true, heard: S[bestJ], close: bestR < 0.99 }; }
      return { word: t, ok: false, heard: bestJ >= 0 && bestR > 0.4 ? S[bestJ] : null };
    });
  }

  const dayKey = (d) => {
    const x = d ? new Date(d) : new Date();
    return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

  const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
  function ago(ms) {
    const d = Math.abs(ms);
    if (d < HOUR) return Math.max(1, Math.round(d / MIN)) + ' min';
    if (d < DAY) return Math.round(d / HOUR) + ' u';
    if (d < 60 * DAY) return Math.round(d / DAY) + ' d';
    return Math.round(d / (30 * DAY)) + ' mnd';
  }

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  return { esc, shuffle, sample, one, clamp, uniq, norm, words, tiles, bare, bareFr, lev, near, ratio, diffWords, dayKey, dayDiff, ago, debounce, MIN, HOUR, DAY };
})();
