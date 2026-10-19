/* Le journal d'erreurs local.

   Sur un téléphone il n'y a pas de console : quand un écran meurt, tout ce qu'on
   peut rapporter est « ça ne marche plus ». Ce journal garde les vingt dernières
   erreurs, sur l'appareil et nulle part ailleurs — il n'est ni synchronisé ni
   envoyé. L'écran « Son et micro » les affiche et permet de les copier. */
NL.errlog = (function () {
  'use strict';
  const KEY = 'vlaams/errors', KEEP = 20;

  const all = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };

  /* `where` dit d'où vient l'erreur quand ce n'est pas la fenêtre elle-même. */
  function note(err, where) {
    const list = all();
    list.push({
      t: Date.now(), where: where || '', route: (NL.ui && NL.ui.route) || '',
      msg: String((err && err.message) || err).slice(0, 300),
      stack: String((err && err.stack) || '').split('\n').slice(0, 4).join('\n').slice(0, 600)
    });
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-KEEP))); } catch (e) {}
  }

  const clear = () => { try { localStorage.removeItem(KEY); } catch (e) {} };

  /* Le texte à copier : une erreur par paragraphe, la plus récente en dernier. */
  const text = () => all().map(e =>
    new Date(e.t).toISOString() + ' [' + (e.route || '?') + (e.where ? ' · ' + e.where : '') + '] ' + e.msg +
    (e.stack ? '\n' + e.stack : '')).join('\n\n');

  function watch() {
    window.addEventListener('error', e => note((e && e.error) || (e && e.message), 'window'));
    window.addEventListener('unhandledrejection', e => note(e && e.reason, 'promise'));
  }

  return { note, all, clear, text, watch, KEEP };
})();
