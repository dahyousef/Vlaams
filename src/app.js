/* Boot. Storage first, because every screen reads from it synchronously. */
(function () {
  'use strict';
  function start() {
    const root = document.getElementById('app');
    NL.state.open().then(() => {
      const wiped = NL.state.migrate();
      NL.content.refresh();
      NL.state.touchDay();
      NL.ui.bind(root);
      NL.ui.boot();
      if (wiped) NL.ui.toast(NL.t.migrated);
      /* Compte : l'app s'affiche d'abord avec les données locales, la synchro
         suit en arrière-plan. Sans compte ni refus explicite, on propose la
         connexion une fois. */
      NL.sync.init().then(user => {
        if (NL.sync.enabled && !user && !NL.screens.compte.skipped()) NL.ui.go('compte');
      });
      NL.sync.onChange(() => {
        const r = NL.ui.route;
        if (r === 'sessie' || r === 'scenario' || r === 'placement') return;
        if (r === 'compte' && !NL.sync.user) return;   // ne pas effacer l'adresse en cours de saisie
        NL.ui.render();
      });
      /* Voice lists arrive late in some browsers; repaint once they do. */
      if ('speechSynthesis' in window) {
        setTimeout(() => { NL.speech.rescanVoices(); NL.ui.render(); }, 700);
      }
    });
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
