/* Ce qui résiste : les éléments le plus souvent ratés, et une séance pour les
   attaquer. Tout vient du journal des réponses, enregistré depuis le premier
   jour et qu'aucun écran n'avait jamais relu. */
NL.screens.fouten = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;
  const SHOWN = 40;

  function render() {
    const list = NL.srs.mistakes();
    let html = '<div class="wrap">' +
      '<section class="card lead slim"><span class="eyebrow">' + t.missEyebrow + '</span>' +
      '<h1>' + (list.length ? t.missTitle(list.length) : t.missEyebrow) + '</h1>' +
      '<p>' + (list.length ? t.missBody : t.missNone) + '</p>' +
      (list.length ? '<button class="btn btn-primary" data-act="start">' +
        t.missStart(Math.min(list.length, NL.srs.MAX_TASKS)) + '</button>' : '') +
      '</section>';

    list.slice(0, SHOWN).forEach(x => {
      const it = x.item;
      html += '<div class="vrow">' +
        '<button class="speaker tiny" data-say="' + esc(U.bare(it.nl)) + '" aria-label="' + t.listen + '">' + NL.ex.ICON.speaker(17) + '</button>' +
        '<span class="v-nl"' + NL.gloss.attr('nl') + '>' + (it.art ? '<span class="art ' + it.art + '">' + it.art + '</span>' : '') + esc(U.bare(it.nl)) + '</span>' +
        '<span class="v-en"' + NL.gloss.langAttr(it) + '>' + esc(NL.gloss.bare(it)) + '</span>' +
        '<span class="muted small">' + t.missRow(x.wrong, x.wrong + x.right) + '</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  return {
    render,
    click(el, d) {
      if (d.act !== 'start') return;
      if (NL.screens.sessie.begin('fouten')) NL.ui.go('sessie');
    }
  };
})();
