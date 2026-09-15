/* Le docteur audio. Il ne décrit pas les problèmes : il les teste.
   Sur Opera, c'est cet écran qui explique pourquoi le micro ne note rien et
   comment récupérer une voix flamande en deux minutes. */
NL.screens.doctor = (function () {
  'use strict';
  const esc = NL.util.esc, t = NL.t;
  const TEST = 'Goeiemorgen, alles goed met u?';
  let S = { heard: null, mic: null, micMsg: '', rec: 'idle' };

  const TIERS = {
    full: { label: 'Complet', note: 'Voix flamande et reconnaissance vocale : tout fonctionne, y compris la notation automatique de ce que tu dis.' },
    scored: { label: 'Noté, accent du nord', note: 'La reconnaissance fonctionne, mais la voix est néerlandaise du nord. Installe la voix flamande ci-dessous et tu passes au niveau complet.' },
    compare: { label: 'Enregistre et compare', note: 'Pas de reconnaissance ici — c’est le cas d’Opera, qui n’a pas ce service. Tu peux quand même t’enregistrer et te comparer au modèle, ce qui est une vraie méthode de travail.' },
    self: { label: 'Auto-évaluation', note: 'Ni reconnaissance ni enregistrement disponibles. Les exercices oraux te demandent de dire la phrase puis de te juger honnêtement. Ça marche, mais une page hébergée hors d’un cadre te donnerait mieux.' }
  };

  function voiceRows() {
    const vs = (NL.speech.voices() || []).filter(v => /^nl/i.test(v.lang));
    if (!vs.length) return '<p class="doc-bad">' + t.docNoVoice + '</p>';
    return '<ul class="doc-list">' + vs.map(v =>
      '<li class="' + (/BE/i.test(v.lang) ? 'good' : '') + '"><b>' + esc(v.name) + '</b><span>' + esc(v.lang) +
      (/BE/i.test(v.lang) ? ' · flamande' : ' · nord') + '</span></li>').join('') + '</ul>';
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
      '<h2>' + info.label + '</h2><p>' + info.note + '</p>' +
      (tier.framed ? '<p class="doc-framed">Cette page tourne dans un cadre intégré (le lien claude.ai). Certains navigateurs refusent le micro dans ce cas, quelle que soit ton autorisation. Le fichier hébergé à toi n’a pas cette limite.</p>' : '') +
      '</section>' +

      '<section class="doc-block">' +
      '<h4>' + t.docBrowser + '</h4>' +
      '<p class="doc-line"><b>' + esc(NL.speech.browserName()) + '</b>' +
      (NL.speech.browserName() === 'Opera' ? ' — pas de service de reconnaissance vocale. Ce n’est pas réparable côté code.' : '') + '</p>' +
      '</section>' +

      '<section class="doc-block">' +
      '<h4>' + t.docVoices + ' <span class="muted">(' + allVoices + ' au total)</span></h4>' +
      voiceRows() +
      '<div class="row"><button class="btn btn-blue" data-act="play">' + t.docPlayTest + '</button>' +
      '<button class="btn" data-act="recheck">' + t.docRecheck + '</button></div>' +
      (S.heard === null
        ? '<p class="doc-ask">' + t.docHeard + ' <button class="chip" data-act="heard-yes">' + t.yes + '</button> <button class="chip" data-act="heard-no">' + t.no + '</button></p>'
        : '<p class="doc-verdict ' + (S.heard ? 'good' : 'bad') + '">' +
        (S.heard ? 'Bien — la synthèse vocale fonctionne.' : 'Aucun son : vérifie le volume, puis installe la voix ci-dessous.') + '</p>') +
      '</section>' +

      '<section class="doc-block">' +
      '<h4>Micro</h4>' +
      '<div class="row">' +
      '<button class="btn btn-blue" data-act="' + (S.rec === 'rec' ? 'recstop' : 'rec') + '">' +
      (S.rec === 'rec' ? t.recStop : t.docMicTest) + '</button>' +
      (NL.speech.hasRecording() ? '<button class="btn" data-act="playrec">' + t.recYours + '</button>' : '') +
      '</div>' +
      (S.micMsg ? '<p class="doc-verdict ' + (S.mic ? 'good' : 'bad') + '">' + esc(S.micMsg) + '</p>' : '') +
      '</section>' +

      (v.quality !== 'be'
        ? '<section class="doc-fix">' +
        '<h4>' + t.docFixTitle + '</h4>' +
        '<ol>' + t.docFixSteps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
        '<p class="muted small">' + t.docFixNote + '</p>' +
        '<button class="btn btn-primary wide" data-act="recheck">' + t.docRecheck + '</button>' +
        '</section>'
        : '<section class="doc-fix good"><h4>Voix flamande installée</h4>' +
        '<p class="muted small">Rien à faire : ' + esc(v.name || '') + ' est prête.</p></section>') +

      '</div></div></div>';
  }

  return {
    render,
    click(el, d) {
      if (d.act === 'back') { NL.ui.go('meer'); return; }
      if (d.act === 'play') { S.heard = null; NL.speech.say(TEST); NL.ui.render(); return; }
      if (d.act === 'heard-yes') { S.heard = true; NL.ui.render(); return; }
      if (d.act === 'heard-no') { S.heard = false; NL.ui.render(); return; }
      if (d.act === 'recheck') { NL.speech.rescanVoices(); S.heard = null; NL.ui.render(); NL.ui.toast('Revérifié.'); return; }
      if (d.act === 'playrec') { NL.speech.playRecording(); return; }
      if (d.act === 'recstop') { NL.speech.stopRecord(); return; }
      if (d.act === 'rec') {
        S.rec = 'rec'; S.micMsg = 'Parle maintenant…'; S.mic = null; NL.ui.render();
        NL.speech.record({
          onstart: () => { setTimeout(() => { if (S.rec === 'rec') NL.speech.stopRecord(); }, 3000); },
          onstop: url => {
            S.rec = 'idle';
            S.mic = !!url;
            S.micMsg = url ? 'Enregistrement réussi. Écoute-le pour vérifier le son.' : 'Rien n’a été capté.';
            NL.ui.render();
          },
          onerror: kind => {
            S.rec = 'idle'; S.mic = false;
            S.micMsg = kind === 'framed'
              ? 'Le micro est bloqué parce que la page est intégrée dans un cadre. Ouvre la version hébergée pour l’utiliser.'
              : kind === 'denied' ? 'Autorisation refusée. Clique sur l’icône de cadenas dans la barre d’adresse pour l’accorder.'
                : kind === 'nomic' ? 'Aucun micro détecté sur cette machine.'
                  : 'Le micro n’est pas disponible ici.';
            NL.ui.render();
          }
        });
      }
    },
    key(e) { if (e.key === 'Escape') NL.ui.go('meer'); }
  };
})();
