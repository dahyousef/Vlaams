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
