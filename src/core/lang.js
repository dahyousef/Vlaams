/* La langue d'affichage : un seul endroit la décide, un seul endroit l'applique.
   Absente des réglages, c'est l'anglais. `apply` l'applique sans rien dire : le
   démarrage l'appelle. `applyAndTell` l'applique et lève l'avis : le shell l'appelle,
   jamais en pleine séance ni en pleine conversation, au premier écran dessiné ensuite.
   Le bandeau d'avis n'est pas enregistré : il se dit une fois, puis `seen` l'efface,
   jamais dans le tour où il s'est levé. Un changement venu d'un autre appareil le dit
   (`fromAccount`) ; la marque, comme l'avis, n'est pas enregistrée. */
NL.lang = (function () {
  'use strict';
  /* noticeKeys : les clés de NL.t que l'avis dit, dans l'ordre ; vide, il n'y a pas d'avis.
     tickOver : le tour où l'avis s'est levé est fini ; seen() peut alors l'effacer. */
  let applied = null, noticeKeys = [], tickOver = false, fromSync = false;

  const current = () => NL.state.meta().displayLang === 'fr' ? 'fr' : 'en';

  /* Rend vrai si la langue de l'écran a changé. La marque de synchro vaut pour
     l'appel suivant, qu'il change la langue ou non. */
  function apply() {
    fromSync = false;
    const l = current();
    if (l === applied) return false;
    Object.keys(NL.t).forEach(k => { delete NL.t[k]; });
    Object.assign(NL.t, NL.tables[l]);
    NL.gloss.use(l);
    NL.content.refresh();
    document.documentElement.setAttribute('lang', NL.gloss.tag(l));
    applied = l;
    return true;
  }

  function applyAndTell() {
    const bySync = fromSync;
    if (!apply()) return;
    noticeKeys = bySync ? ['langSynced', 'langNotice'] : ['langNotice'];
    /* render() dessine l'avis dans le tour où il se lève. Un avis dessiné puis
       remplacé dans ce même tour n'a pas été vu : seen() ne l'efface qu'au tour d'après. */
    tickOver = false;
    setTimeout(() => { tickOver = true; }, 0);
  }

  /* Enregistre le choix ; render() l'applique au premier écran hors séance. */
  function set(lang) {
    fromSync = false;
    NL.state.setMeta({ displayLang: lang });
  }

  /* sync.js écrit par `write` les réglages venus du compte. Une langue qui change
     ainsi vient d'un autre appareil : l'avis le dira. */
  function fromAccount(write) {
    const before = current();
    write();
    if (current() !== before) fromSync = true;
  }

  const text = () => noticeKeys.map(k => NL.t[k]).join(' ');
  const seen = () => { if (tickOver) noticeKeys = []; };

  return { current, apply, applyAndTell, set, fromAccount, notice: text, seen };
})();
