/* La langue d'affichage : un seul endroit la décide, un seul endroit l'applique.
   Absente des réglages, c'est l'anglais. Un changement ne s'applique jamais en
   pleine séance ni en pleine conversation : le shell n'appelle `apply` qu'en
   dehors d'elles, au premier écran dessiné ensuite. Le bandeau d'avis n'est pas
   enregistré : il se dit une fois, puis `seen` l'efface. */
NL.lang = (function () {
  'use strict';
  let applied = null, notice = false;

  const current = () => NL.state.meta().displayLang === 'fr' ? 'fr' : 'en';

  function apply(quiet) {
    const l = current();
    if (l === applied) return false;
    Object.keys(NL.t).forEach(k => { delete NL.t[k]; });
    Object.assign(NL.t, NL.tables[l]);
    NL.gloss.use(l);
    NL.content.refresh();
    document.documentElement.setAttribute('lang', l === 'en' ? 'en-GB' : 'fr');
    applied = l;
    if (!quiet) notice = true;
    return true;
  }

  /* Enregistre le choix ; render() l'applique au premier écran hors séance. */
  function set(lang) {
    NL.state.setMeta({ displayLang: lang });
  }

  const text = () => notice ? NL.t.langNotice : '';
  const seen = () => { notice = false; };

  return { current, apply, set, notice: text, seen };
})();
