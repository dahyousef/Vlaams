/* La langue d'affichage : un seul endroit la décide, un seul endroit l'applique.
   Absente des réglages, c'est l'anglais. Un changement ne s'applique jamais en
   pleine séance ni en pleine conversation : le shell n'appelle `apply` qu'en
   dehors d'elles, au premier écran dessiné ensuite. Le bandeau d'avis n'est pas
   enregistré : il se dit une fois, puis `seen` l'efface. Un changement venu d'un
   autre appareil le dit (`fromAccount`) ; la marque, comme l'avis, n'est pas enregistrée. */
NL.lang = (function () {
  'use strict';
  /* notice : les clés de NL.t que l'avis dit, dans l'ordre ; vide, il n'y a pas d'avis. */
  let applied = null, notice = [], fromSync = false;

  const current = () => NL.state.meta().displayLang === 'fr' ? 'fr' : 'en';

  function apply(quiet) {
    /* La marque de synchro vaut pour l'appel suivant, qu'il change la langue ou non. */
    const bySync = fromSync; fromSync = false;
    const l = current();
    if (l === applied) return false;
    Object.keys(NL.t).forEach(k => { delete NL.t[k]; });
    Object.assign(NL.t, NL.tables[l]);
    NL.gloss.use(l);
    NL.content.refresh();
    document.documentElement.setAttribute('lang', NL.gloss.tag(l));
    applied = l;
    if (!quiet) notice = bySync ? ['langSynced', 'langNotice'] : ['langNotice'];
    return true;
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

  const text = () => notice.map(k => NL.t[k]).join(' ');
  const seen = () => { notice = []; };

  return { current, apply, set, fromAccount, notice: text, seen };
})();
