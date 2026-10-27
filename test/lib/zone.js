/* Un bloc de suite dans un fuseau horaire, écrit une fois.

     const { inZone, offsets } = require('./lib/zone');
     inZone(nom, fn)  lance fn() avec process.env.TZ = nom, puis remet le fuseau de départ par
                      son nom, même si fn() lève : effacer TZ ne le rendrait pas, Node garde le
                      dernier. fn() est synchrone ; inZone rend ce qu'elle rend.
     offsets()        les décalages UTC de janvier et de juillet, « -60 / -120 » à Bruxelles :
                      relevés avant et après un bloc, ils disent que le reste de la suite tourne
                      là où il a commencé.

   Le Date de la page (test/lib/browser.js) hérite de celui de Node : il suit le même fuseau. */
const offsets = () => [Date.UTC(2026, 0, 15), Date.UTC(2026, 6, 15)].map(t => new Date(t).getTimezoneOffset()).join(' / ');

function inZone(name, fn) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  process.env.TZ = name;
  try { return fn(); } finally { process.env.TZ = zone; }
}

module.exports = { inZone, offsets };
