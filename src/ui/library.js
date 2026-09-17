/* Woordenboek, Spiekbriefjes, the register table, and the sounds reference. */
(function () {
  'use strict';
  const U = NL.util, esc = U.esc, ICON = NL.ex.ICON;
  let query = '', filter = 'alles', adding = false;

  const pips = s => {
    let h = '<span class="pips sm">';
    for (let i = 0; i < NL.srs.MAX_STAGE; i++) h += '<i class="' + (i <= s ? 'on' : '') + '"></i>';
    return h + '</span>';
  };

  /* ---------------------------------------------------- Woordenboek */
  NL.screens.woorden = {
    render() {
      const all = NL.content.allItems();
      /* Your own words show from the moment you add them; the rest appear once met. */
      const seen = all.filter(it => NL.srs.stageOf(it) >= 0 || it.unit === 'eigen');
      const q = U.norm(query);
      let list = (filter === 'eigen' ? all.filter(it => it.unit === 'eigen')
        : filter === 'zwak' ? seen.filter(it => NL.srs.stageOf(it) < 3)
          : filter === 'sterk' ? seen.filter(it => NL.srs.stageOf(it) >= NL.srs.GRADUATED)
            : seen);
      if (q) list = all.filter(it => U.norm(it.nl).indexOf(q) >= 0 || U.norm(it.fr).indexOf(q) >= 0 || (it.be && U.norm(it.be).indexOf(q) >= 0));

      const groups = {};
      list.forEach(it => { (groups[it.unit] = groups[it.unit] || []).push(it); });

      let html = '<div class="wrap">' +
        '<section class="card lead slim"><span class="eyebrow">' + NL.t.wordsEyebrow + '</span>' +
        '<h1>' + NL.t.wordsTitle(seen.length) + '</h1>' +
        '<p>' + NL.t.wordsBody + '</p>' +
        '<button class="btn btn-blue" data-act="addform">' + NL.t.wordsAdd + '</button></section>';

      if (adding) {
        html += '<section class="card add-form">' +
          '<label>' + NL.t.wordsNl + '<input class="textin" id="add-nl" placeholder="de vergaderzaal"></label>' +
          '<label>' + NL.t.wordsFr + '<input class="textin" id="add-en" placeholder="la salle de réunion"></label>' +
          '<label>' + NL.t.wordsBe + ' <span class="muted">' + NL.t.wordsOptional + '</span><input class="textin" id="add-be" placeholder=""></label>' +
          '<div class="row"><button class="btn btn-good" data-act="addsave">' + NL.t.save + '</button>' +
          '<button class="btn btn-ghost" data-act="addcancel">' + NL.t.cancel + '</button></div></section>';
      }

      html += '<div class="filters">' +
        '<input class="search" id="wsearch" type="search" placeholder="' + NL.t.wordsSearch + '" value="' + esc(query) + '">' +
        [['alles', NL.t.wordsAll], ['zwak', NL.t.wordsWeak], ['sterk', NL.t.wordsStrong], ['eigen', NL.t.wordsMine]].map(([id, label]) =>
          '<button class="fchip' + (filter === id && !query ? ' on' : '') + '" data-act="filter" data-f="' + id + '">' + label + '</button>').join('') +
        '</div>';

      if (!list.length) {
        html += '<p class="empty">' + (query ? NL.t.wordsNoResult : NL.t.wordsNothing) + '</p>';
      } else {
        Object.keys(groups).forEach(uid => {
          const u = NL.content.unit(uid);
          html += '<div class="voc-head">' + esc(u ? u.name : 'Mes mots') + '</div>';
          groups[uid].forEach(it => {
            const s = NL.srs.stageOf(it);
            html += '<div class="vrow">' +
              '<button class="speaker tiny" data-say="' + esc(U.bare(it.nl)) + '" aria-label="' + NL.t.listen + '">' + ICON.speaker(17) + '</button>' +
              '<span class="v-nl">' + (it.art ? '<span class="art ' + it.art + '">' + it.art + '</span>' : '') +
              esc(U.bare(it.nl)) +
              (it.be && NL.state.meta().showFlemish !== false ? '<span class="v-be">' + NL.t.wordsHere + ' ' + esc(it.be) + '</span>' : '') +
              '</span>' +
              '<span class="v-en">' + esc(U.bareFr(it.fr)) + '</span>' +
              pips(s) +
              (it.unit === 'eigen' ? '<button class="iconbtn tiny" data-del="' + it.id + '" aria-label="' + NL.t.del + '">' + NL.ui.I.x + '</button>' : '') +
              '</div>';
          });
        });
      }
      return html + '</div>';
    },
    click(el, d) {
      if (d.act === 'addform') { adding = true; NL.ui.render(); return; }
      if (d.act === 'addcancel') { adding = false; NL.ui.render(); return; }
      if (d.act === 'filter') { filter = el.dataset.f; query = ''; NL.ui.render(); return; }
      if (d.act === 'addsave') {
        const nl = (document.getElementById('add-nl') || {}).value || '';
        const en = (document.getElementById('add-en') || {}).value || '';
        const be = (document.getElementById('add-be') || {}).value || '';
        if (!nl.trim() || !en.trim()) { NL.ui.toast(NL.t.wordsNeedBoth); return; }
        NL.state.addCustom({ nl: nl.trim(), fr: en.trim(), be: be.trim() || null, kind: nl.trim().split(/\s+/).length > 2 ? 'phrase' : 'word' });
        NL.content.refresh(); adding = false; NL.ui.render(); NL.ui.toast(NL.t.wordsAdded);
        return;
      }
      if (d.del) { NL.state.delCustom(d.del); NL.content.refresh(); NL.ui.render(); return; }
    },
    input(el) { if (el.id === 'wsearch') { query = el.value; NL.ui.render(); const s = document.getElementById('wsearch'); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } } }
  };

  /* ---------------------------------------------------- Spiekbriefjes */
  NL.screens.spiek = {
    render(id) {
      const sheets = NL.content.sheets;
      if (id) {
        const s = sheets.find(x => x.id === id);
        if (s) {
          return '<div class="wrap">' +
            '<button class="backlink" data-go="spiek">' + NL.ui.I.back + ' ' + NL.t.sheetsAll + '</button>' +
            '<section class="card lead slim"><span class="eyebrow">' + NL.t.sheetsEyebrow + '</span>' +
            '<h1>' + s.icon + ' ' + esc(s.title) + '</h1><p>' + esc(s.blurb) + '</p></section>' +
            s.groups.map(g => '<div class="sheet-group"><h4>' + esc(g.h) + '</h4>' +
              g.rows.map(r => '<button class="sheet-row" data-say="' + esc(r.nl) + '">' +
                '<span class="sr-say">' + ICON.speaker(16) + '</span>' +
                '<span class="sr-body"><b>' + esc(r.nl) + '</b><i>' + esc(r.fr) + '</i>' +
                (r.note ? '<em>' + esc(r.note) + '</em>' : '') + '</span></button>').join('') +
              '</div>').join('') +
            '</div>';
        }
      }
      return '<div class="wrap">' +
        '<section class="card lead slim"><span class="eyebrow">' + NL.t.sheetsEyebrow + '</span>' +
        '<h1>' + NL.t.sheetsTitle + '</h1>' +
        '<p>' + NL.t.sheetsBody + '</p></section>' +
        '<div class="cards">' + sheets.map(s =>
          '<button class="tile-card" data-sheetid="' + s.id + '">' +
          '<span class="tc-icon">' + s.icon + '</span>' +
          '<span class="tc-body"><b>' + esc(s.title) + '</b><i>' + esc(s.blurb) + '</i></span>' +
          '<span class="tc-cta">' + NL.t.open + '</span></button>').join('') + '</div></div>';
    },
    click(el, d) { if (d.sheetid) NL.ui.go('spiek', d.sheetid); }
  };

  /* ---------------------------------------------------- Register */
  NL.screens.register = {
    render() {
      return '<div class="wrap">' +
        '<section class="card lead slim"><span class="eyebrow">' + NL.t.regEyebrow + '</span>' +
        '<h1>' + NL.t.regTitle + '</h1>' +
        '<p>' + NL.t.regBody + '</p></section>' +
        '<div class="reg-table"><div class="reg-head"><span>' + NL.t.regStd + '</span><span>' + NL.t.regBe + '</span></div>' +
        NL.content.register.map(r =>
          '<div class="reg-row">' +
          '<button class="reg-cell std" data-say="' + esc(r.std) + '">' + esc(r.std) + '</button>' +
          '<button class="reg-cell be" data-say="' + esc(r.be) + '">' + esc(r.be) +
          (r.note ? '<em>' + esc(r.note) + '</em>' : '') + '</button>' +
          '</div>').join('') +
        '</div>' +

        '<h3 class="sec">' + NL.t.loansTitle + '</h3>' +
        '<section class="card lead slim"><p>' + NL.t.loansBody + '</p></section>' +
        '<div class="reg-table"><div class="reg-head"><span>Flamand</span><span>Français</span></div>' +
        NL.content.loans.map(r =>
          '<div class="reg-row">' +
          '<button class="reg-cell be" data-say="' + esc(r.nl) + '">' + esc(r.nl) + '</button>' +
          '<span class="reg-cell std">' + esc(r.fr) +
          (r.note ? '<em>' + esc(r.note) + '</em>' : '') + '</span>' +
          '</div>').join('') +
        '</div>' +

        '<h3 class="sec">' + NL.t.fauxTitle + '</h3>' +
        '<section class="card lead slim"><p>' + NL.t.fauxBody + '</p></section>' +
        '<div class="reg-table"><div class="reg-head"><span>Néerlandais</span><span>Sens réel</span></div>' +
        NL.content.faux.map(r =>
          '<div class="reg-row">' +
          '<button class="reg-cell be" data-say="' + esc(r.nl) + '">' + esc(r.nl) + '</button>' +
          '<span class="reg-cell std">' + esc(r.fr) + '<em>' + esc(r.trap) + '</em></span>' +
          '</div>').join('') +
        '</div></div>';
    }
  };

  /* ---------------------------------------------------- de / het */
  NL.screens.dehet = {
    render() {
      const col = (title, rules, cls) =>
        '<h3 class="sec">' + title + '</h3>' +
        rules.map(r => '<div class="rule-row ' + cls + '">' +
          '<b>' + esc(r.rule) + (r.sure ? '<span class="sure-tag">' + NL.t.dehetSure + '</span>' : '') + '</b>' +
          '<button class="rule-ex" data-say="' + esc(r.ex) + '">' + esc(r.ex) + '</button></div>').join('');
      return '<div class="wrap">' +
        '<section class="card lead slim"><span class="eyebrow">de / het</span>' +
        '<h1>' + NL.t.dehetTitle + '</h1><p>' + NL.t.dehetBody + '</p></section>' +
        col(NL.t.dehetHet, NL.content.hetRules, 'het') +
        col(NL.t.dehetDe, NL.content.deRules, 'de') +
        '</div>';
    }
  };

  /* ---------------------------------------------------- Klanken */
  NL.screens.klanken = {
    render() {
      return '<div class="wrap">' +
        '<section class="card lead slim"><span class="eyebrow">' + NL.t.soundsEyebrow + '</span>' +
        '<h1>' + NL.t.soundsTitle + '</h1>' +
        '<p>' + NL.t.soundsBody + '</p></section>' +
        NL.content.sounds.map(s =>
          '<div class="snd-row' + (s.good ? ' good' : s.warn ? ' warn' : '') + '"><div class="snd-head"><b>' + esc(s.g) + '</b><code>' + esc(s.ipa) + '</code>' +
          (s.good ? '<span class="snd-tag good">' + NL.t.soundsEasy + '</span>' : s.warn ? '<span class="snd-tag warn">' + NL.t.soundsWatch + '</span>' : '') + '</div>' +
          '<p>' + s.say + '</p></div>').join('') +
        '</div>';
    }
  };
})();
