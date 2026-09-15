/* Speech in both directions, degrading honestly when the browser cannot help. */
NL.speech = (function () {
  'use strict';
  const { norm, words, diffWords, ratio } = NL.util;

  /* Words a recogniser may drop without changing what you said. Negation
     (niet, geen, nooit) and place words are deliberately absent — losing those
     inverts the sentence. */
  const FUNCTION_WORDS = new Set(['de', 'het', 'een', 'ik', 'je', 'jij', 'ge', 'gij', 'u',
    'hij', 'zij', 'ze', 'wij', 'we', 'er', 'en', 'in', 'op', 'aan', 'te', 'van', 'met',
    'voor', 'bij', 'naar', 'dat', 'dit', 'is', 'om', 'zo', 'ook', 'wel', 'eens', 'hè', 'al']);

  /* ---------------- out: text to speech ---------------- */
  let voices = [], chosen = null, quality = 'none';

  function scan() {
    if (!('speechSynthesis' in window)) return;
    voices = speechSynthesis.getVoices() || [];
    const be = voices.filter(v => /^nl[-_]BE/i.test(v.lang));
    const nl = voices.filter(v => /^nl/i.test(v.lang));
    if (be.length) { chosen = be[0]; quality = 'be'; }
    else if (nl.length) { chosen = nl[0]; quality = 'nl'; }
    else { chosen = null; quality = voices.length ? 'none' : 'unknown'; }
  }
  if ('speechSynthesis' in window) {
    scan();
    speechSynthesis.addEventListener('voiceschanged', scan);
  }

  const canSpeak = () => 'speechSynthesis' in window;
  const voiceInfo = () => ({
    quality,                                  // 'be' | 'nl' | 'none' | 'unknown'
    name: chosen ? chosen.name : null,
    lang: chosen ? chosen.lang : null,
    note: quality === 'be' ? 'Voix flamande trouvée.'
      : quality === 'nl' ? 'Seule une voix des Pays-Bas est installée : l’audio a donc l’accent du nord, avec un g raclé là où la Flandre utilise un g doux.'
        : 'Aucune voix néerlandaise trouvée. L’audio retombe sur la voix par défaut du navigateur et ne sonnera pas néerlandais.'
  });

  let lastSpoken = 0;
  function say(text, opts) {
    opts = opts || {};
    if (!canSpeak() || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = quality === 'be' ? 'nl-BE' : 'nl-NL';
      if (chosen) u.voice = chosen;
      u.rate = opts.rate || 1;
      u.pitch = 1;
      if (opts.onend) u.onend = opts.onend;
      lastSpoken = Date.now();
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const stop = () => { try { speechSynthesis.cancel(); } catch (e) {} };

  /* ---------------- in: speech recognition ---------------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const UA = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  /* Opera defines webkitSpeechRecognition but ships no service behind it: calls
     fail silently or report a network error, which would otherwise be reported to
     the user as "check your connection". Treat it as having none. */
  const OPERA = /OPR\/|Opera/i.test(UA);
  function browserName() {
    if (OPERA) return 'Opera';
    if (/Edg\//.test(UA)) return 'Edge';
    if (/Firefox\//.test(UA)) return 'Firefox';
    if (/Chrome\//.test(UA)) return 'Chrome';
    if (/Safari\//.test(UA)) return 'Safari';
    return 'ton navigateur';
  }

  const canListen = () => !!SR && !OPERA && navigator.onLine !== false;
  const listenBlocked = () => (!SR || OPERA) ? 'browser' : navigator.onLine === false ? 'offline' : null;

  let active = null;
  function listen(opts) {
    opts = opts || {};
    if (!SR) { opts.onerror && opts.onerror('browser'); return null; }
    abort();
    let r;
    try { r = new SR(); } catch (e) { opts.onerror && opts.onerror('browser'); return null; }
    r.lang = 'nl-BE';
    r.interimResults = true;
    r.maxAlternatives = 5;
    r.continuous = false;

    let finalText = '', alts = [];
    r.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript + ' ';
          for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
        } else {
          opts.onpartial && opts.onpartial(res[0].transcript);
        }
      }
    };
    r.onerror = e => {
      const kind = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied'
        : e.error === 'no-speech' ? 'silence'
          : e.error === 'network' ? 'network' : e.error || 'error';
      active = null;
      opts.onerror && opts.onerror(kind);
    };
    r.onend = () => { active = null; opts.onend && opts.onend(finalText.trim(), alts); };

    try { r.start(); active = r; } catch (e) { opts.onerror && opts.onerror('error'); return null; }
    return r;
  }
  function abort() { if (active) { try { active.abort(); } catch (e) {} active = null; } }

  /* ---------------- record and compare ----------------
     Opera has no recognition service, so scoring is impossible there. Recording
     yourself and playing it against the model needs no service at all, works
     offline, and is how language labs worked for fifty years. */
  let mediaRec = null, chunks = [], lastUrl = null;
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const hasRecording = () => !!lastUrl;

  function record(opts) {
    opts = opts || {};
    if (!canRecord()) { opts.onerror && opts.onerror('browser'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      chunks = [];
      let mr;
      try { mr = new MediaRecorder(stream); }
      catch (e) { try { mr = new MediaRecorder(stream, { mimeType: 'audio/webm' }); } catch (e2) { opts.onerror && opts.onerror('format'); return; } }
      mediaRec = mr;
      mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop());
        if (lastUrl) URL.revokeObjectURL(lastUrl);
        try {
          lastUrl = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
        } catch (e) { lastUrl = null; }
        mediaRec = null;
        opts.onstop && opts.onstop(lastUrl);
      };
      mr.start();
      opts.onstart && opts.onstart();
    }).catch(err => {
      /* In an embedded frame the permission may never even be offered. */
      const name = err && err.name;
      opts.onerror && opts.onerror(
        name === 'NotAllowedError' ? (window.self !== window.top ? 'framed' : 'denied')
          : name === 'NotFoundError' ? 'nomic' : 'blocked');
    });
  }
  function stopRecord() { try { if (mediaRec && mediaRec.state !== 'inactive') mediaRec.stop(); } catch (e) {} }
  function playRecording(onend) {
    if (!lastUrl) return null;
    const a = new Audio(lastUrl);
    if (onend) a.onended = onend;
    a.play().catch(() => {});
    return a;
  }
  /* Model first, then your own voice, with a beat between them. */
  function playBoth(text) {
    say(text, { onend: () => setTimeout(() => playRecording(), 350) });
  }
  function clearRecording() {
    if (lastUrl) { URL.revokeObjectURL(lastUrl); lastUrl = null; }
  }

  /* ---------------- scoring ---------------- */
  /* Scores the best of the alternatives the recogniser offered, so a single
     misheard word does not sink an otherwise correct sentence. */
  function score(heardList, target) {
    const cands = (Array.isArray(heardList) ? heardList : [heardList]).filter(Boolean);
    if (!cands.length) return { pct: 0, parts: diffWords('', target), heard: '', pass: false };
    let best = null;
    cands.forEach(h => {
      const parts = diffWords(h, target);
      const hit = parts.filter(p => p.ok).length;
      const extra = Math.max(0, words(h).length - words(target).length);
      const pct = Math.round(Math.max(0, hit / Math.max(1, parts.length) - extra * 0.06) * 100);
      if (!best || pct > best.pct) best = { pct, parts, heard: h };
    });
    /* Passing is not a percentage. Recognisers routinely swallow small
       grammatical words without it meaning you said the sentence wrong, so those
       are forgiven — but a missed content word changes what you said, and a
       percentage bar would happily let "ik ben Frans aan het leren" through. */
    const missed = best.parts.filter(p => !p.ok).map(p => norm(p.word));
    const slack = Math.max(1, Math.floor(words(target).length / 6));
    best.pass = norm(best.heard) === norm(target) || missed.length === 0 ||
      (missed.every(m => FUNCTION_WORDS.has(m)) && missed.length <= slack);
    best.missed = missed;
    return best;
  }

  /* Which tier this browser puts you in — the audio doctor reports this. */
  function tier() {
    const framed = window.self !== window.top;
    if (canListen() && quality === 'be') return { id: 'full', framed };
    if (canListen()) return { id: 'scored', framed };
    if (canRecord()) return { id: 'compare', framed };
    return { id: 'self', framed };
  }

  return {
    canSpeak, say, stop, voiceInfo, rescanVoices: scan, voices: () => voices,
    canListen, listenBlocked, listen, abort, score, ratio,
    canRecord, hasRecording, record, stopRecord, playRecording, playBoth, clearRecording, tier, browserName
  };
})();
