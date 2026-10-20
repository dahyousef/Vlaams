/* La langue d'affichage : un seul endroit la décide, un seul endroit l'applique.
   Absente des réglages, c'est l'anglais. Un changement ne s'applique jamais en
   pleine séance ni en pleine conversation : le shell n'appelle `apply` qu'en
   dehors d'elles, au premier écran dessiné ensuite. Le bandeau d'avis n'est pas
   enregistré : il se dit une fois, puis `seen` l'efface. Un changement venu d'un
   autre appareil le dit (`synced`) ; la marque, comme l'avis, n'est pas enregistrée. */
NL.lang = (function () {
  'use strict';
  let applied = null, notice = '', fromSync = false;

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
    document.documentElement.setAttribute('lang', l === 'en' ? 'en-GB' : 'fr');
    applied = l;
    if (!quiet) notice = bySync ? 'sync' : 'own';
    return true;
  }

  /* Enregistre le choix ; render() l'applique au premier écran hors séance. */
  function set(lang) {
    fromSync = false;
    NL.state.setMeta({ displayLang: lang });
  }

  /* sync.js : la fusion vient de changer la langue, l'avis dira qu'elle vient d'ailleurs. */
  const synced = () => { fromSync = true; };

  const text = () => notice === 'sync' ? NL.t.langSynced + ' ' + NL.t.langNotice : notice ? NL.t.langNotice : '';
  const seen = () => { notice = ''; };

  return { current, apply, set, synced, notice: text, seen };
})();
