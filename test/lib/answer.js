/* Répondre à l'exercice en cours comme le ferait une personne : par les clics
   et la saisie que l'écran attend, jamais en appelant le planificateur dans son
   dos. Une suite qui note elle-même les réponses ne traverse pas la séance — et
   c'est dans la séance que vivent les reprises et le renforcement des rencontres.

     const answer = require('./lib/answer')(B);
     answer.right();   répond juste, puis laisse l'écran sur le verdict
     answer.wrong();   passe l'exercice : c'est la faute la plus simple à produire
     answer.next();    « Continuer »
     answer.cantSpeak();  « Je ne peux pas parler », sur un exercice à voix haute  */
module.exports = function (B) {
  const NL = B.NL, U = NL.util, S = NL.screens.sessie;
  const click = d => S.click({ dataset: d }, d);
  const type = value => S.input({ classList: { contains: n => n === 'textin' }, value });

  function right() {
    const c = S.peek();
    if (!c) return false;
    const task = c.task, ex = NL.ex.get(c.ex);
    if (c.ex === 'match') {
      /* La dernière paire fait avancer la séance d'elle-même. */
      for (let k = 0; k < task.pairs.length; k++) {
        click({ match: 'l' + k, k: String(k), side: 'l' });
        click({ match: 'r' + k, k: String(k), side: 'r' });
      }
      return true;
    }
    if (c.ex === 'corrige') click({ opt: String(task.faulty) });
    else if (task.opts) click({ opt: String(task.opts.findIndex(o => o.ok)) });
    if (task.bank) {
      const used = new Set();
      U.tiles(ex.answer(task)).forEach(w => {
        const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
        if (i >= 0) { used.add(i); click({ pick: String(i) }); }
      });
    }
    if (c.ex === 'open') type(task.task.model);
    if (c.ex === 'type' || (c.ex === 'dictation' && !task.bank)) type(ex.answer(task));
    if (c.ex === 'speak') {
      if (NL.speech.listenBlocked()) click({ self: '1' });
      else { B.ctx.__saidNext = ex.answer(task); click({ mic: 'start' }); }
    }
    click({ check: '1' });
    return true;
  }

  const wrong = () => { if (!S.peek()) return false; click({ skip: '1' }); return true; };
  /* Après les paires, la séance a déjà avancé : il n'y a pas de verdict à quitter. */
  const next = wasMatch => { if (!wasMatch) click({ next: '1' }); };
  /* Le bouton se touche à travers le shell, comme sur l'appareil : appelé dans le dos du shell,
     il marchait dans la suite et ne faisait rien sur l'iPhone. Vrai si l'exercice parlé est parti. */
  const cantSpeak = () => {
    const c = S.peek(); if (!c || c.ex !== 'speak') return false;
    if (NL.ui.route !== 'sessie') NL.ui.go('sessie');
    B.tap({ quiet: '1' });
    return S.peek() !== c;
  };

  return { right, wrong, next, cantSpeak, click, type };
};
