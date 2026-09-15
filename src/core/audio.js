/* Interface sounds. Synthesised, so nothing to download and nothing to cache. */
NL.audio = (function () {
  'use strict';
  let ctx = null;
  const on = () => NL.state.meta().sfx !== false;

  function tone(seq, type) {
    if (!on()) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      seq.forEach(([f, t, v]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(f, ctx.currentTime + t);
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(v || 0.12, ctx.currentTime + t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.24);
      });
    } catch (e) {}
  }

  return {
    ok:   () => tone([[620, 0], [880, 0.08]]),
    no:   () => tone([[190, 0], [140, 0.09]], 'sawtooth'),
    win:  () => tone([[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24]]),
    tick: () => tone([[440, 0, 0.05]]),
    mic:  () => tone([[880, 0, 0.07], [1175, 0.06, 0.07]])
  };
})();
