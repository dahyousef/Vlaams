/* Les passages de texte d'un HTML et la langue que chacun déclare : celle de l'attribut
   lang le plus proche qui l'enveloppe, sinon celle de la racine. */
const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
function runs(html, rootLang) {
  const out = [], stack = [], re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const cur = () => (stack.length ? stack[stack.length - 1].lang : rootLang);
  const src = String(html);
  let last = 0, m;
  const flush = to => {
    const t = src.slice(last, to).replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
    if (t) out.push({ text: t, lang: cur() });
  };
  while ((m = re.exec(src))) {
    flush(m.index);
    last = m.index + m[0].length;
    if (m[0].charAt(1) === '!') continue;
    const name = m[2].toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { stack.length = i; break; }
    } else if (!VOID.test(name) && !/\/\s*$/.test(m[3])) {
      const l = /\slang="([^"]*)"/i.exec(m[3]);
      stack.push({ name, lang: l ? l[1] : cur() });
    }
  }
  flush(src.length);
  return out;
}
/* Combien de fois `sub` paraît dans `s` : un avis se dit une fois, pas deux. */
const count = (s, sub) => s.split(sub).length - 1;

/* Ce qu'une fonction des tables fr et en reçoit dans un test : un nombre par argument, pris
   dans `nums` ; paceNote, comme à l'écran, un rythme fait du premier et du dernier. */
const argsOf = (k, f, nums) => k === 'paceNote' ? [{ mins: nums[0], cap: nums[nums.length - 1] }] : nums.slice(0, f.length);

module.exports = { runs, count, argsOf };
