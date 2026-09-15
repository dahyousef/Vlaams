/* Scénarios de conversation. Les étapes alternent : l'autre parle (audio), puis tu
   choisis ce que tu dis et tu le dis à voix haute. Un choix peut porter sa propre
   réponse, donc la conversation bifurque vraiment selon ce que tu décides. */
NL.content = NL.content || {};
NL.content.scenarios = (function () {
  'use strict';
  const T = (nl, fr, be) => ({ them: { nl, fr, be } });
  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint } });
  const C = (nl, fr, reply, note) => ({ nl, fr, reply, note });

  return [
    /* ---------------- vie quotidienne ---------------- */
    {
      id: 's-bakker', track: 'leven', level: 'A1', icon: '\u{1F950}',
      title: 'Chez le boulanger', place: '{stad}, samedi matin',
      blurb: 'La conversation au comptoir, du début à la fin. Six échanges et tu ressors avec ton pain.',
      steps: [
        T('Goeiedag! Zegt het maar.', 'Bonjour ! Je vous écoute.', 'Goeiedag! Zegt het maar.'),
        Y('Commande un demi pain blanc, tranché.', [
          C('Een half wit, gesneden alstublieft.', 'Un demi pain blanc, tranché s’il vous plaît.'),
          C('Mag ik twee pistolets?', 'Puis-je avoir deux pistolets ?', { nl: 'Twee pistolets, komt in orde.', fr: 'Deux pistolets, ça marche.', be: 'Twee pistolets, komt in orde.' })
        ], 'La commande standard. Dis-la exactement et personne ne bascule en français.'),
        T('Gesneden, ja. Nog iets anders?', 'Tranché, oui. Autre chose ?', 'Gesneden, ja. Nog iets anders?'),
        Y('Dis que c’est tout, et remercie.', [
          C('Nee, dat is alles, merci.', 'Non, c’est tout, merci.'),
          C('Ja, ook twee koffiekoeken alstublieft.', 'Oui, et deux couques aussi s’il vous plaît.', { nl: 'Twee koffiekoeken erbij. Anders nog iets?', fr: 'Deux couques en plus. Autre chose ?', be: 'Twee koffiekoeken erbij. Anders nog iets?' })
        ]),
        T('Dat is vier euro tachtig.', 'Ça fait quatre euros quatre-vingts.', 'Da’s vier euro tachtig.'),
        Y('Demande si tu peux payer par carte.', [
          C('Kan ik met bancontact betalen?', 'Je peux payer par Bancontact ?', null, 'En Belgique la carte c’est « bancontact ». Dire « pinnen » te fait passer pour hollandais.'),
          C('Ik betaal cash, alstublieft.', 'Je paie en liquide, s’il vous plaît.')
        ]),
        T('Natuurlijk. Alstublieft, en nog een goede dag!', 'Bien sûr. Voilà, et bonne journée !', 'Tuurlijk. Asteblieft, en nog een goeie dag!'),
        Y('Remercie et dis au revoir.', [
          C('Merci, tot ziens!', 'Merci, au revoir !'),
          C('Dank u wel, nog een fijne dag!', 'Merci beaucoup, bonne journée !')
        ])
      ],
      outro: 'Voilà toute la transaction. La seule phrase que tu dois vraiment produire est la première — tout le reste est une réaction.'
    },
    {
      id: 's-buur', track: 'leven', level: 'A1', icon: '\u{1F3E1}',
      title: 'Le voisin par-dessus la haie', place: 'Ta rue, jeudi soir',
      blurb: 'Imprévue, non préparée, et la raison pour laquelle beaucoup d’expatriés évitent le jardin. Deux minutes, répétées.',
      steps: [
        T('Hey! Alles goed?', 'Hey ! Ça va ?', 'Hey! Alles goed?'),
        Y('Dis que ça va et renvoie la question.', [
          C('Ja, alles goed. En bij u?', 'Oui, ça va. Et vous ?', null, 'Renvoyer la question est attendu, pas paresseux.'),
          C('’t Gaat wel, een beetje moe. En bij u?', 'Ça va, un peu fatigué. Et vous ?')
        ]),
        T('Ja ja, ’t gaat wel. Amai, wat een weer, hè.', 'Oui oui, ça va. Oh là là, quel temps.', 'Jaja, ’t gaat wel. Amai, wat een weer, hè.'),
        Y('Enchaîne sur la météo.', [
          C('Ja, het regent alweer.', 'Oui, il pleut encore.'),
          C('Ik hoop op beter weer dit weekend.', 'J’espère un meilleur temps ce week-end.')
        ], 'La météo n’est jamais du remplissage ici : c’est la poignée de main.'),
        T('Zeg, er ligt hier een pakje voor u. Dat is gisteren gekomen.', 'Dites, il y a un colis pour vous ici. Il est arrivé hier.', 'Zeg, der ligt hier een pakske veur u. Da’s gisteren gekomen.'),
        Y('Remercie chaleureusement.', [
          C('Amai, merci! Dat is vriendelijk.', 'Oh, merci ! C’est gentil.'),
          C('O, dank u wel! Ik kom het straks halen.', 'Oh, merci beaucoup ! Je viens le chercher tout à l’heure.')
        ]),
        T('Geen probleem, hè. Ik zet het wel aan de deur.', 'Pas de problème. Je le mets devant la porte.', 'Geen probleem, hè. ’k Zet het wel aan de deur.'),
        Y('Remercie et prends congé.', [
          C('Merci, tot later!', 'Merci, à plus tard !'),
          C('Dat is vriendelijk, nog een goede avond!', 'C’est gentil, bonne soirée !')
        ])
      ],
      outro: 'Regarde à quel point tout ça est une formule. « Alles goed ? » — « Ja, en bij u ? » — la météo. Trois coups et tu as tenu une conversation de voisinage.'
    },
    {
      id: 's-trein', track: 'leven', level: 'A1', icon: '\u{1F686}',
      title: 'Le train pour Bruxelles', place: 'Gare de {stad}, 8h05',
      blurb: 'Une annonce que tu attrapes à moitié, et un inconnu qui peut t’aider si tu demandes correctement.',
      steps: [
        T('De trein naar Brussel-Zuid van acht uur twaalf heeft tien minuten vertraging.', 'Le train de 8h12 vers Bruxelles-Midi a dix minutes de retard.', 'De trein naar Brussel-Zuid van acht uur twaalf heeft tien minuten vertraging.'),
        Y('Demande à un voyageur si ce train va à Bruxelles.', [
          C('Sorry, rijdt deze trein naar Brussel?', 'Pardon, ce train va à Bruxelles ?'),
          C('Excuseer, is dit de trein naar Brussel?', 'Excusez-moi, c’est le train pour Bruxelles ?', null, '« Excuseer » est la formule flamande ; le nord dit « pardon ».')
        ]),
        T('Ja, maar ge moet op spoor vier zijn, niet hier.', 'Oui, mais vous devez être voie quatre, pas ici.', 'Ja, maar ge moet op spoor vier zijn, nie hier.'),
        Y('Tu n’as pas tout saisi. Fais répéter et dis que tu apprends.', [
          C('Sorry, kunt u dat herhalen? Ik ben Nederlands aan het leren.', 'Pardon, pouvez-vous répéter ? J’apprends le néerlandais.', { nl: 'Natuurlijk. Spoor vier. Daar, de trap af en dan rechts.', fr: 'Bien sûr. Voie quatre. Là-bas, l’escalier puis à droite.', be: 'Tuurlijk. Spoor vier. Daar, de trap af en dan rechts.' }, 'Dire que tu apprends transforme un inconnu en allié.'),
          C('Sorry, op welk spoor?', 'Pardon, sur quelle voie ?', { nl: 'Spoor vier. De trap af en dan rechts.', fr: 'Voie quatre. L’escalier puis à droite.', be: 'Spoor vier. De trap af en dan rechts.' })
        ]),
        Y('Remercie.', [
          C('Merci, dat is vriendelijk!', 'Merci, c’est gentil !'),
          C('Ah, merci. Ik vind het wel.', 'Ah, merci. Je vais trouver.')
        ])
      ],
      outro: 'Le geste qui comptait : admettre que tu n’avais pas compris au lieu de hocher la tête. Hocher la tête, c’est comme ça que cinq ans passent sans rien apprendre.'
    },

    /* ---------------- le travail ---------------- */
    {
      id: 's-standup', track: 'werk', level: 'A1', icon: '\u{1F4CB}',
      title: 'Le stand-up quotidien', place: '{bedrijf}, 9h15',
      blurb: 'Tes quarante secondes. Trois phrases, toujours la même forme — donc écris-les une bonne fois.',
      steps: [
        T('Goeiemorgen allemaal. {naam}, wilt gij beginnen?', 'Bonjour à tous. {naam}, tu veux commencer ?', 'Goeiemorgen allemaal. {naam}, wilde gij beginnen?'),
        Y('Dis ce que tu as fait hier.', [
          C('Ja. Gisteren heb ik aan het ticket gewerkt.', 'Oui. Hier j’ai travaillé sur le ticket.', null, 'Passé composé, participe à la fin. Cette seule phrase couvre la plupart des jours.'),
          C('Ja. Gisteren heb ik de testen afgewerkt.', 'Oui. Hier j’ai terminé les tests.')
        ]),
        T('En vandaag?', 'Et aujourd’hui ?', 'En vandaag?'),
        Y('Dis ce que tu fais aujourd’hui.', [
          C('Vandaag ga ik verder met de tests.', 'Aujourd’hui je continue les tests.'),
          C('Vandaag begin ik aan het nieuwe ticket.', 'Aujourd’hui je commence le nouveau ticket.', null, 'Note l’inversion : « Vandaag begin ik », jamais « Vandaag ik begin ».')
        ]),
        T('Zijn er blokkers?', 'Il y a des blocages ?', 'Zijn der blokkers?'),
        Y('Signale un blocage, ou dis qu’il n’y en a pas.', [
          C('Ik wacht op de klant.', 'J’attends le client.', { nl: 'Oké, ik neem contact op. Merci.', fr: 'OK, je les contacte. Merci.', be: 'Oké, ik neem contact op. Merci.' }),
          C('Nee, geen blokkers.', 'Non, pas de blocages.', { nl: 'Perfect. Dan is het aan Sofie.', fr: 'Parfait. Alors c’est à Sofie.', be: 'Perfect. Dan is ’t aan Sofie.' }),
          C('Ik zit vast op één ding, kunnen we dat offline bespreken?', 'Je bloque sur une chose, on peut en parler après ?', { nl: 'Goed idee. We doen dat na de stand-up.', fr: 'Bonne idée. On fait ça après le stand-up.', be: 'Goe idee. We doen da na de stand-up.' }, 'La phrase qui garde un stand-up court et te fait passer pour expérimenté.')
        ])
      ],
      outro: 'Hier, aujourd’hui, blocages. La forme ne change jamais, donc chaque matin il n’y a qu’un seul mot nouveau à trouver.'
    },
    {
      id: 's-koffie', track: 'werk', level: 'A1', icon: '☕',
      title: 'À la machine à café', place: '{bedrijf}, lundi 10h',
      blurb: 'La conversation dont tu es exclu pour l’instant. Elle est bien plus formulaire qu’elle n’en a l’air.',
      steps: [
        T('Hey! Alles goed? Druk vandaag?', 'Hey ! Ça va ? Chargé aujourd’hui ?', 'Hey! Alles goed? Druk vandaag?'),
        Y('Réponds, et renvoie la question.', [
          C('’t Gaat wel, een beetje moe. En bij u?', 'Ça va, un peu fatigué. Et toi ?'),
          C('Ja, redelijk druk. En bij u?', 'Oui, assez chargé. Et toi ?')
        ]),
        T('En, hoe was het weekend?', 'Alors, c’était comment le week-end ?', 'En, hoe was ’t weekend?'),
        Y('Parle de ton week-end.', [
          C('Niks speciaals, en bij u?', 'Rien de spécial, et toi ?', null, 'Réponse complète. Tu ne dois d’histoire à personne.'),
          C('We hebben gewandeld met de kinderen.', 'On s’est promenés avec les enfants.'),
          C('Rustig gebleven, gelukkig.', 'C’est resté calme, heureusement.')
        ]),
        T('Amai, wij zijn naar de match geweest. Zot spannend was dat.', 'Oh là là, nous on est allés au match. C’était dingue.', 'Amai, wij zijn naar de match geweest. Zot spannend was da.'),
        Y('Réagis.', [
          C('Ah, ik heb de match ook gezien!', 'Ah, j’ai vu le match aussi !'),
          C('Ik volg het voetbal niet zo, eerlijk gezegd.', 'Je ne suis pas trop le foot, honnêtement.', null, 'Parfaitement acceptable. L’honnêteté fait continuer la conversation ; faire semblant, non.')
        ]),
        T('Allez, ik ga er weer in. Tot straks!', 'Allez, je m’y remets. À tout à l’heure !', 'Allez, ’k ga der weer in. Tot straks!'),
        Y('Conclus.', [
          C('Tot straks!', 'À tout à l’heure !'),
          C('Ja, tot later. Nog een goede dag!', 'Oui, à plus tard. Bonne journée !')
        ])
      ],
      outro: '« Alles goed ? » — réponse — renvoi — le week-end — réaction — « tot straks ». Six coups, et tu en faisais partie.'
    },
    {
      id: 's-status', track: 'werk', level: 'A1', icon: '\u{1F5E3}',
      title: 'Donner un statut au client', place: 'Appel Teams, mardi',
      blurb: 'Annoncer une mauvaise nouvelle en flamand : par litote, jamais frontalement, et toujours avec une suite.',
      steps: [
        T('Dag {naam}. Kunt ge ons een korte status geven?', 'Bonjour {naam}. Tu peux nous donner un statut rapide ?', 'Dag {naam}. Kunde ons een korte status geven?'),
        Y('Donne un statut court.', [
          C('Ja, natuurlijk. Het project loopt goed.', 'Oui, bien sûr. Le projet avance bien.'),
          C('Ja. We liggen ongeveer op schema.', 'Oui. On est à peu près dans les temps.')
        ]),
        T('En de deadline van volgende week?', 'Et la deadline de la semaine prochaine ?', 'En de deadline van volgende week?'),
        Y('Dis que ce sera juste.', [
          C('Dat wordt krap, denk ik.', 'Ça va être juste, je pense.', { nl: 'Krap? Hoezo?', fr: 'Juste ? C’est-à-dire ?', be: 'Krap? Hoezo?' }, 'La litote plus « denk ik » : c’est ainsi qu’un Flamand annonce une mauvaise nouvelle. Être direct sonne agressif.'),
          C('Dat gaat lukken.', 'Ça va passer.', { nl: 'Goed om te horen. Blijft ge het opvolgen?', fr: 'Bonne nouvelle. Tu continues à suivre ?', be: 'Goe om te horen. Blijfde ’t opvolgen?' })
        ]),
        Y('Explique la raison.', [
          C('Er was een probleem met de tests.', 'Il y a eu un problème avec les tests.'),
          C('We wachten nog op input van uw team.', 'On attend encore des éléments de votre équipe.', null, 'Désigner le client comme cause — adouci par « nog » et par la tournure impersonnelle.')
        ]),
        T('Oké. Kunnen we dat offline bespreken?', 'D’accord. On peut en parler après ?', 'Oké. Kunnen we da offline bespreken?'),
        Y('Accepte et propose une suite.', [
          C('Ja, ik stuur u een mail met de details.', 'Oui, je vous envoie un mail avec les détails.'),
          C('Zeker. Ik neem dat op mij.', 'Certainement. Je prends ça en charge.')
        ]),
        T('Perfect, merci. Tot volgende week.', 'Parfait, merci. À la semaine prochaine.', 'Perfect, merci. Tot volgende week.')
      ],
      outro: 'Le schéma pour une mauvaise nouvelle : sous-entendre, donner une raison, proposer la suite. Ne t’excuse jamais longuement — ça passe pour de l’incompétence, pas pour de la politesse.'
    }
  ];
})();
