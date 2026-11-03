/* Les fiches de règle : le parcours, puis chaque pastille de règle (data-act="gram") touchée, et la
   feuille qui s'ouvre vérifiée à 390 px : le titre, la règle, l'explication et ses exemples sont
   là, et rien ne déborde. Les pastilles sont lues sur la page et le compte attendu vient du
   contenu : une règle de plus ne change rien ici.
     node tools/learner-pass/rules.js [dossier] */
const { open, verdict, sleep } = require('./common');

/* Ce que la page montre de la feuille ouverte. Tourne dans la page. */
function measureSheet() {
  const card = document.querySelector('.sheet-card');
  if (!card) return null;
  const text = sel => { const e = card.querySelector(sel); return e && e.getClientRects().length ? (e.textContent || '').trim() : ''; };
  const wide = Array.from(card.querySelectorAll('*')).filter(e => {
    const r = e.getBoundingClientRect();
    return r.width && r.right > window.innerWidth + 1;
  }).slice(0, 5).map(e => e.tagName + '.' + e.className + ' ' + (e.textContent || '').trim().slice(0, 30));
  return {
    title: text('h3'), rule: text('.rule'), explain: text('.explain'),
    rows: Array.from(card.querySelectorAll('.ex-row')).filter(e => e.getClientRects().length && (e.textContent || '').trim()).length,
    sw: document.documentElement.scrollWidth, cardOver: card.scrollWidth - card.clientWidth, wide
  };
}

/* Ce qui manque à la feuille d'une règle ; `want.rows` : ses exemples, trois au plus (la feuille n'en montre pas plus). */
function judgeSheet(id, m, want) {
  if (!m) return [id + ': no sheet opened'];
  const out = [];
  if (!m.title) out.push(id + ': the sheet has no title');
  if (!m.rule) out.push(id + ': the sheet shows no rule');
  if (!m.explain) out.push(id + ': the sheet shows no explanation');
  if (m.rows < want.rows) out.push(id + ': the sheet shows ' + m.rows + ' drill row(s), the rule has ' + want.rows);
  if (m.sw > 391 || m.cardOver > 1 || m.wide.length) out.push(id + ': wider than 390 px (' + m.sw + ', sheet over by ' + m.cardOver + ') ' + JSON.stringify(m.wide));
  return out;
}

async function main() {
  const A = await open();
  const p = A.page, problems = A.errors.map(e => 'console, before the rules: ' + e);
  /* Les règles que le cours liste sur ses unités : le compte attendu, avec leurs exemples. */
  const want = await p.evaluate(() => {
    const rules = {};
    let chips = 0;
    NL.content.units.forEach(u => (u.grammar || []).forEach(id => {
      const g = (NL.content.patterns || []).find(x => x.id === id);
      if (g) { rules[id] = Math.min(3, g.drills.length); chips++; }
    }));
    return { rules, chips };
  });
  await p.evaluate(() => NL.ui.go('leerpad'));
  await sleep(250);
  const chips = await p.evaluate(() => Array.from(document.querySelectorAll('[data-act="gram"]')).map(e => e.dataset.id));
  /* Une règle listée sur plusieurs unités a une pastille par unité et une seule feuille : une ligne par règle. */
  const ids = chips.filter((id, i) => chips.indexOf(id) === i);
  const rules = Object.keys(want.rules);
  console.log('RULES ' + ids.length + ' (' + chips.length + ' chips on the leerpad; the course lists ' + rules.length + ' rules on ' + want.chips + ' unit cards)');
  if (chips.length !== want.chips) problems.push('the leerpad shows ' + chips.length + ' rule chips, the course lists ' + want.chips);
  rules.filter(id => ids.indexOf(id) < 0).forEach(id => problems.push(id + ': listed by the course, no chip on the leerpad'));
  for (const id of ids) {
    const errsBefore = A.errors.length;
    await p.evaluate(i => { const e = document.querySelector('[data-act="gram"][data-id="' + i + '"]'); if (e) e.scrollIntoView({ block: 'center' }); }, id);
    await p.click('[data-act="gram"][data-id="' + id + '"]', { timeout: 3000 }).catch(e => { problems.push(id + ': tap failed: ' + e.message.split('\n')[0]); });
    await sleep(300);
    const m = await p.evaluate(measureSheet);
    const found = judgeSheet(id, m, { rows: want.rules[id] === undefined ? 1 : want.rules[id] });
    console.log('  RULE ' + id + ' « ' + (m ? m.title : '') + ' » rows ' + (m ? m.rows : 0) + ' width ' + (m ? m.sw : 0) + (found.length ? ' -> ' + found.length + ' fault(s)' : ' ok'));
    found.forEach(f => problems.push(f));
    A.errors.slice(errsBefore).forEach(e => problems.push(id + ': console ' + e));
    await p.click('[data-close="1"]', { timeout: 2000 }).catch(() => { problems.push(id + ': the sheet has no close button that works'); });
    await sleep(200);
  }
  await A.close();
  verdict(problems, 'EVERY RULE SHEET OPENS');
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { measureSheet, judgeSheet };
