/* Le docteur audio. Il ne décrit pas les problèmes : il les teste.
   Sur Opera, c'est cet écran qui explique pourquoi le micro ne note rien et
   comment récupérer une voix flamande en deux minutes. */
NL.screens.doctor = (function () {
  'use strict';
  const esc = NL.util.esc, t = NL.t;
  const TEST = 'Goeiemorgen, alles goed met u?';
  let S = { heard: null, mic: null, micKey: '', rec: 'idle' };

  /* Le titre et la note de ce que l'appareil sait faire de la parole : deux clés de NL.t,
     lues au dessin comme home.js et shell.js lisent t[v.noteKey], car la langue a pu changer. */
  const TIERS = {
    full: { labelKey: 'tierFull', noteKey: 'tierFullNote' },
    scored: { labelKey: 'tierScored', noteKey: 'tierScoredNote' },
    novoice: { labelKey: 'tierNoVoice', noteKey: 'tierNoVoiceNote' },
    refused: { labelKey: 'tierRefused', noteKey: 'tierRefusedNote' },
    compare: { labelKey: 'tierCompare', noteKey: 'tierCompareNote' },
    self: { labelKey: 'tierSelf', noteKey: 'tierSelfNote' }
  };

  function voiceRows() {
    const vs = (NL.speech.voices() || []).filter(v => /^nl/i.test(v.lang));
    if (!vs.length) return '<p class="doc-bad">' + t.docNoVoice + '</p>';
    return '<ul class="doc-list">' + vs.map(v =>
      '<li class="' + (/BE/i.test(v.lang) ? 'good' : '') + '"><b>' + esc(v.name) + '</b><span>' + esc(v.lang) +
      ' · ' + (/BE/i.test(v.lang) ? t.docVoiceBe : t.docVoiceNl) + '</span></li>').join('') + '</ul>';
  }

  /* Ce que l'app a vu casser sur CET appareil. Sur un téléphone il n'y a pas de
     console : sans cette liste, tout ce qu'on peut rapporter est « ça ne marche
     plus ». Rien ne quitte l'appareil — c'est à copier et à envoyer soi-même. */
  function errorBlock() {
    const list = NL.errlog.all();
    if (!list.length) return '<p class="muted small">' + t.errNone + '</p>';
    return '<p class="muted small">' + t.errCount(list.length) + '</p>' +
      '<textarea class="backup-box" id="err-out" readonly spellcheck="false">' + esc(NL.errlog.text()) + '</textarea>' +
      '<div class="row"><button class="btn btn-blue" data-act="errcopy">' + t.errCopy + '</button>' +
      '<button class="btn btn-ghost" data-act="errclear">' + t.errClear + '</button></div>';
  }

  function render() {
    const v = NL.speech.voiceInfo();
    const tier = NL.speech.tier();
    const info = TIERS[tier.id];
    const allVoices = (NL.speech.voices() || []).length;

    return '<div class="lesson"><div class="lesson-head">' +
      '<button class="iconbtn" data-act="back" aria-label="' + t.back + '">' + NL.ui.I.back + '</button>' +
      '<div class="head-title"><b>' + t.docEyebrow + '</b><i>' + t.docTitle + '</i></div>' +
      '</div>' +
      '<div class="lesson-body"><div class="stage doc">' +

      '<section class="doc-tier ' + tier.id + '">' +
      '<span class="eyebrow">' + t.docTierTitle + '</span>' +
      '<h2>' + t[info.labelKey] + '</h2><p>' + t[info.noteKey] + '</p>' +
      (tier.framed ? '<p class="doc-framed">' + t.docFramed + '</p>' : '') +
      '</section>' +

      '<section class="doc-block">' +
      '<h4>' + t.docBrowser + '</h4>' +
      '<p class="doc-line"><b>' + esc(NL.speech.browserName()) + '</b>' +
      (NL.speech.noService() === 'opera' ? ' — ' + t.docNoServiceOpera
        : NL.speech.noService() === 'ios' ? ' — ' + t.docNoServiceIos : '') + '</p>' +
      '</section>' +

      '<section class="doc-block">' +
      '<h4>' + t.docVoices + ' <span class="muted">(' + t.docVoicesTotal(allVoices) + ')</span></h4>' +
      voiceRows() +
      '<div class="row"><button class="btn btn-blue" data-act="play">' + t.docPlayTest + '</button>' +
      '<button class="btn" data-act="recheck">' + t.docRecheck + '</button></div>' +
      (S.heard === null
        ? '<p class="doc-ask">' + t.docHeard + ' <button class="chip" data-act="heard-yes">' + t.yes + '</button> <button class="chip" data-act="heard-no">' + t.no + '</button></p>'
        : '<p class="doc-verdict ' + (S.heard ? 'good' : 'bad') + '">' +
        (S.heard ? t.docHeardYes : t.docHeardNo) + '</p>') +
      '</section>' +

      '<section class="doc-block">' +
      '<h4>' + t.docMic + '</h4>' +
      '<div class="row">' +
      '<button class="btn btn-blue" data-act="' + (S.rec === 'rec' ? 'recstop' : 'rec') + '">' +
      (S.rec === 'rec' ? t.recStop : t.docMicTest) + '</button>' +
      (NL.speech.hasRecording() ? '<button class="btn" data-act="playrec">' + t.recYours + '</button>' : '') +
      '</div>' +
      (S.micKey ? '<p class="doc-verdict ' + (S.mic ? 'good' : 'bad') + '">' + esc(t[S.micKey]) + '</p>' : '') +
      '</section>' +

      '<section class="doc-block"><h4>' + t.errTitle + '</h4>' + errorBlock() + '</section>' +

      (v.quality !== 'be'
        ? '<section class="doc-fix">' +
        '<h4>' + t.docFixTitle + '</h4>' +
        '<ol>' + t.docFixSteps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
        '<p class="muted small">' + t.docFixNote + '</p>' +
        '<button class="btn btn-primary wide" data-act="recheck">' + t.docRecheck + '</button>' +
        '</section>'
        : '<section class="doc-fix good"><h4>' + t.docFixDone + '</h4>' +
        '<p class="muted small">' + t.docFixDoneBody(esc(v.name || '')) + '</p></section>') +

      '</div></div></div>';
  }

  return {
    render,
    click(el, d) {
      if (d.act === 'back') { NL.ui.go('meer'); return; }
      if (d.act === 'play') { S.heard = null; NL.speech.say(TEST); NL.ui.render(); return; }
      if (d.act === 'heard-yes') { S.heard = true; NL.ui.render(); return; }
      if (d.act === 'heard-no') { S.heard = false; NL.ui.render(); return; }
      if (d.act === 'recheck') { NL.speech.rescanVoices(); S.heard = null; NL.ui.render(); NL.ui.toast(t.docRechecked); return; }
      if (d.act === 'playrec') { NL.speech.playRecording(); return; }
      if (d.act === 'errclear') { NL.errlog.clear(); NL.ui.render(); return; }
      if (d.act === 'errcopy') {
        NL.ui.copy(NL.errlog.text(), document.getElementById('err-out'))
          .then(good => NL.ui.toast(good ? t.errCopied : t.errCopyByHand));
        return;
      }
      if (d.act === 'recstop') { NL.speech.stopRecord(); return; }
      if (d.act === 'rec') {
        S.rec = 'rec'; S.micKey = 'docSpeakNow'; S.mic = null; NL.ui.render();
        NL.speech.record({
          onstart: () => { setTimeout(() => { if (S.rec === 'rec') NL.speech.stopRecord(); }, 3000); },
          onstop: url => {
            S.rec = 'idle';
            S.mic = !!url;
            S.micKey = url ? 'docRecOk' : 'docRecNone';
            NL.ui.render();
          },
          onerror: kind => {
            S.rec = 'idle'; S.mic = false;
            S.micKey = kind === 'framed'
              ? 'docRecFramed'
              : kind === 'denied' ? 'docRecDenied'
                : kind === 'nomic' ? 'docRecNoMic'
                  : 'docRecOther';
            NL.ui.render();
          }
        });
      }
    },
    key(e) { if (e.key === 'Escape') NL.ui.go('meer'); }
  };
})();
