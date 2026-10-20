/* Scénarios de conversation. Les étapes alternent : l'autre parle (audio), puis tu
   choisis ce que tu dis et tu le dis à voix haute. Un choix peut porter sa propre
   réponse, donc la conversation bifurque vraiment selon ce que tu décides. */
NL.content = NL.content || {};
NL.content.scenarios = (function () {
  'use strict';
  const T = (nl, g, be) => ({ them: { nl, ...NL.gloss.pair(g), be } });
  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint } });
  const C = (nl, g, reply, note) => ({ nl, ...NL.gloss.pair(g), reply, note });

  return [
    /* ---------------- vie quotidienne ---------------- */
    {
      id: 's-bakker', track: 'leven', level: 'A1', icon: '\u{1F950}',
      title: { fr: 'Chez le boulanger', en: 'At the baker’s' }, place: { fr: '{stad}, samedi matin', en: '{stad}, Saturday morning' },
      blurb: { fr: 'La conversation au comptoir, du début à la fin. Six échanges et tu ressors avec ton pain.', en: 'The conversation at the counter, start to finish. Six exchanges and you walk out with your bread.' },
      steps: [
        T('Goeiedag! Zegt het maar.', { fr: 'Bonjour ! Je vous écoute.', en: 'Hello! What can I get you?' }, 'Goeiedag! Zegt het maar.'),
        Y({ fr: 'Commande un demi pain blanc, tranché.', en: 'Order half a white loaf, sliced.' }, [
          C('Een half wit, gesneden alstublieft.', { fr: 'Un demi pain blanc, tranché s’il vous plaît.', en: 'Half a white loaf, sliced, please.' }),
          C('Mag ik twee pistolets?', { fr: 'Puis-je avoir deux pistolets ?', en: 'Could I have two pistolets (bread rolls)?' }, { nl: 'Twee pistolets, komt in orde.', fr: 'Deux pistolets, ça marche.', en: 'Two pistolets, coming up.', be: 'Twee pistolets, komt in orde.' })
        ], { fr: 'La commande standard. Dis-la exactement et personne ne bascule en français.', en: 'The standard order. Say it exactly and nobody switches to English.' }),
        T('Gesneden, ja. Nog iets anders?', { fr: 'Tranché, oui. Autre chose ?', en: 'Sliced, yes. Anything else?' }, 'Gesneden, ja. Nog iets anders?'),
        Y({ fr: 'Dis que c’est tout, et remercie.', en: 'Say that is all, and say thank you.' }, [
          C('Nee, dat is alles, merci.', { fr: 'Non, c’est tout, merci.', en: 'No, that is all, thanks.' }),
          C('Ja, ook twee koffiekoeken alstublieft.', { fr: 'Oui, et deux couques aussi s’il vous plaît.', en: 'Yes, and two pastries as well, please.' }, { nl: 'Twee koffiekoeken erbij. Anders nog iets?', fr: 'Deux couques en plus. Autre chose ?', en: 'Two pastries as well. Anything else?', be: 'Twee koffiekoeken erbij. Anders nog iets?' })
        ]),
        T('Dat is vier euro tachtig.', { fr: 'Ça fait quatre euros quatre-vingts.', en: 'That comes to four euros eighty.' }, 'Da’s vier euro tachtig.'),
        Y({ fr: 'Demande si tu peux payer par carte.', en: 'Ask whether you can pay by card.' }, [
          C('Kan ik met bancontact betalen?', { fr: 'Je peux payer par Bancontact ?', en: 'Can I pay by Bancontact?' }, null, { fr: 'En Belgique la carte c’est « bancontact ». Dire « pinnen » te fait passer pour hollandais.', en: 'In Belgium paying by card is “bancontact”. Saying “pinnen” makes you sound as if you are from the Netherlands.' }),
          C('Ik betaal cash, alstublieft.', { fr: 'Je paie en liquide, s’il vous plaît.', en: 'I’ll pay cash, please.' })
        ]),
        T('Natuurlijk. Alstublieft, en nog een goede dag!', { fr: 'Bien sûr. Voilà, et bonne journée !', en: 'Of course. Here you are, and have a good day!' }, 'Tuurlijk. Asteblieft, en nog een goeie dag!'),
        Y({ fr: 'Remercie et dis au revoir.', en: 'Say thank you and goodbye.' }, [
          C('Merci, tot ziens!', { fr: 'Merci, au revoir !', en: 'Thank you, goodbye!' }),
          C('Dank u wel, nog een fijne dag!', { fr: 'Merci beaucoup, bonne journée !', en: 'Thank you very much, have a nice day!' })
        ])
      ],
      outro: { fr: 'Voilà toute la transaction. La seule phrase que tu dois vraiment produire est la première — tout le reste est une réaction.', en: 'That is the whole transaction. The only sentence you really have to produce is the first one — everything else is a reaction.' }
    },
    {
      id: 's-buur', track: 'leven', level: 'A1', icon: '\u{1F3E1}',
      title: { fr: 'Le voisin par-dessus la haie', en: 'The neighbour over the hedge' }, place: { fr: 'Ta rue, jeudi soir', en: 'Your street, Thursday evening' },
      blurb: { fr: 'Imprévue, non préparée, et la raison pour laquelle beaucoup d’expatriés évitent le jardin. Deux minutes, répétées.', en: 'Unplanned, unrehearsed, and the reason many expats avoid the garden. Two minutes, repeated.' },
      steps: [
        T('Hey! Alles goed?', { fr: 'Hey ! Ça va ?', en: 'Hey! How are you?' }, 'Hey! Alles goed?'),
        Y({ fr: 'Dis que ça va et renvoie la question.', en: 'Say you are fine and ask back.' }, [
          C('Ja, alles goed. En bij u?', { fr: 'Oui, ça va. Et vous ?', en: 'Yes, fine. And you? (formal)' }, null, { fr: 'Renvoyer la question est attendu, pas paresseux.', en: 'Asking back is expected, not lazy.' }),
          C('’t Gaat wel, een beetje moe. En bij u?', { fr: 'Ça va, un peu fatigué. Et vous ?', en: 'Not bad, a bit tired. And you? (formal)' })
        ]),
        T('Ja ja, ’t gaat wel. Amai, wat een weer, hè.', { fr: 'Oui oui, ça va. Oh là là, quel temps.', en: 'Yes, yes, fine. Goodness, what weather.' }, 'Jaja, ’t gaat wel. Amai, wat een weer, hè.'),
        Y({ fr: 'Enchaîne sur la météo.', en: 'Pick up on the weather.' }, [
          C('Ja, het regent alweer.', { fr: 'Oui, il pleut encore.', en: 'Yes, it’s raining again.' }),
          C('Ik hoop op beter weer dit weekend.', { fr: 'J’espère un meilleur temps ce week-end.', en: 'I’m hoping for better weather this weekend.' })
        ], { fr: 'La météo n’est jamais du remplissage ici : c’est la poignée de main.', en: 'The weather is never filler here: it is the handshake.' }),
        T('Zeg, er ligt hier een pakje voor u. Dat is gisteren gekomen.', { fr: 'Dites, il y a un colis pour vous ici. Il est arrivé hier.', en: 'Listen, there’s a parcel here for you (formal). It arrived yesterday.' }, 'Zeg, der ligt hier een pakske veur u. Da’s gisteren gekomen.'),
        Y({ fr: 'Remercie chaleureusement.', en: 'Thank them warmly.' }, [
          C('Amai, merci! Dat is vriendelijk.', { fr: 'Oh, merci ! C’est gentil.', en: 'Oh, thanks! That’s kind of you.' }),
          C('O, dank u wel! Ik kom het straks halen.', { fr: 'Oh, merci beaucoup ! Je viens le chercher tout à l’heure.', en: 'Oh, thank you very much! I’ll come and get it later.' })
        ]),
        T('Geen probleem, hè. Ik zet het wel aan de deur.', { fr: 'Pas de problème. Je le mets devant la porte.', en: 'No problem. I’ll put it by the door.' }, 'Geen probleem, hè. ’k Zet het wel aan de deur.'),
        Y({ fr: 'Remercie et prends congé.', en: 'Say thank you and take your leave.' }, [
          C('Merci, tot later!', { fr: 'Merci, à plus tard !', en: 'Thanks, see you later!' }),
          C('Dat is vriendelijk, nog een goede avond!', { fr: 'C’est gentil, bonne soirée !', en: 'That’s kind, have a good evening!' })
        ])
      ],
      outro: { fr: 'Regarde à quel point tout ça est une formule. « Alles goed ? » — « Ja, en bij u ? » — la météo. Trois coups et tu as tenu une conversation de voisinage.', en: 'See how formulaic all of this is. “Alles goed?” — “Ja, en bij u?” — the weather. Three beats and you have held a neighbourly conversation.' }
    },
    {
      id: 's-trein', track: 'leven', level: 'A1', icon: '\u{1F686}',
      title: { fr: 'Le train pour Bruxelles', en: 'The train to Brussels' }, place: { fr: 'Gare de {stad}, 8h05', en: '{stad} station, 8.05' },
      blurb: { fr: 'Une annonce que tu attrapes à moitié, et un inconnu qui peut t’aider si tu demandes correctement.', en: 'An announcement you only half catch, and a stranger who can help if you ask properly.' },
      steps: [
        T('De trein naar Brussel-Zuid van acht uur twaalf heeft tien minuten vertraging.', { fr: 'Le train de 8h12 vers Bruxelles-Midi a dix minutes de retard.', en: 'The 8.12 train to Brussels-South is ten minutes late.' }, 'De trein naar Brussel-Zuid van acht uur twaalf heeft tien minuten vertraging.'),
        Y({ fr: 'Demande à un voyageur si ce train va à Bruxelles.', en: 'Ask a passenger whether this train goes to Brussels.' }, [
          C('Sorry, rijdt deze trein naar Brussel?', { fr: 'Pardon, ce train va à Bruxelles ?', en: 'Sorry, does this train go to Brussels?' }),
          C('Excuseer, is dit de trein naar Brussel?', { fr: 'Excusez-moi, c’est le train pour Bruxelles ?', en: 'Excuse me, is this the train to Brussels?' }, null, { fr: '« Excuseer » est la formule flamande ; le nord dit « pardon ».', en: '“Excuseer” is the Flemish form; the north says “pardon”.' })
        ]),
        T('Ja, maar ge moet op spoor vier zijn, niet hier.', { fr: 'Oui, mais vous devez être voie quatre, pas ici.', en: 'Yes, but you need to be on platform four (informal), not here.' }, 'Ja, maar ge moet op spoor vier zijn, nie hier.'),
        Y({ fr: 'Tu n’as pas tout saisi. Fais répéter et dis que tu apprends.', en: 'You did not catch it all. Ask for it again and say you are learning.' }, [
          C('Sorry, kunt u dat herhalen? Ik ben Nederlands aan het leren.', { fr: 'Pardon, pouvez-vous répéter ? J’apprends le néerlandais.', en: 'Sorry, could you repeat that? I’m learning Dutch. (formal)' }, { nl: 'Natuurlijk. Spoor vier. Daar, de trap af en dan rechts.', fr: 'Bien sûr. Voie quatre. Là-bas, l’escalier puis à droite.', en: 'Of course. Platform four. Over there, down the stairs and then right.', be: 'Tuurlijk. Spoor vier. Daar, de trap af en dan rechts.' }, { fr: 'Dire que tu apprends transforme un inconnu en allié.', en: 'Saying you are learning turns a stranger into an ally.' }),
          C('Sorry, op welk spoor?', { fr: 'Pardon, sur quelle voie ?', en: 'Sorry, which platform?' }, { nl: 'Spoor vier. De trap af en dan rechts.', fr: 'Voie quatre. L’escalier puis à droite.', en: 'Platform four. Down the stairs and then right.', be: 'Spoor vier. De trap af en dan rechts.' })
        ]),
        Y({ fr: 'Remercie.', en: 'Say thank you.' }, [
          C('Merci, dat is vriendelijk!', { fr: 'Merci, c’est gentil !', en: 'Thanks, that’s kind of you!' }),
          C('Ah, merci. Ik vind het wel.', { fr: 'Ah, merci. Je vais trouver.', en: 'Ah, thanks. I’ll find it.' })
        ])
      ],
      outro: { fr: 'Le geste qui comptait : admettre que tu n’avais pas compris au lieu de hocher la tête. Hocher la tête, c’est comme ça que cinq ans passent sans rien apprendre.', en: 'The move that mattered: admitting you had not understood instead of nodding. Nodding is how five years go by without learning anything.' }
    },

    /* ---------------- le travail ---------------- */
    {
      id: 's-standup', track: 'werk', level: 'A1', icon: '\u{1F4CB}',
      title: { fr: 'Le stand-up quotidien', en: 'The daily stand-up' }, place: { fr: '{bedrijf}, 9h15', en: '{bedrijf}, 9.15' },
      blurb: { fr: 'Tes quarante secondes. Trois phrases, toujours la même forme — donc écris-les une bonne fois.', en: 'Your forty seconds. Three sentences, always the same shape — so write them out once and for all.' },
      steps: [
        T('Goeiemorgen allemaal. {naam}, wilt gij beginnen?', { fr: 'Bonjour à tous. {naam}, tu veux commencer ?', en: 'Good morning, everyone. {naam}, would you (informal) like to start?' }, 'Goeiemorgen allemaal. {naam}, wilde gij beginnen?'),
        Y({ fr: 'Dis ce que tu as fait hier.', en: 'Say what you did yesterday.' }, [
          C('Ja. Gisteren heb ik aan het ticket gewerkt.', { fr: 'Oui. Hier j’ai travaillé sur le ticket.', en: 'Yes. Yesterday I worked on the ticket.' }, null, { fr: 'Passé composé, participe à la fin. Cette seule phrase couvre la plupart des jours.', en: 'Perfect tense, participle at the end. This one sentence covers most days.' }),
          C('Ja. Gisteren heb ik de testen afgewerkt.', { fr: 'Oui. Hier j’ai terminé les tests.', en: 'Yes. Yesterday I finished the tests.' })
        ]),
        T('En vandaag?', { fr: 'Et aujourd’hui ?', en: 'And today?' }, 'En vandaag?'),
        Y({ fr: 'Dis ce que tu fais aujourd’hui.', en: 'Say what you are doing today.' }, [
          C('Vandaag ga ik verder met de tests.', { fr: 'Aujourd’hui je continue les tests.', en: 'Today I’m carrying on with the tests.' }),
          C('Vandaag begin ik aan het nieuwe ticket.', { fr: 'Aujourd’hui je commence le nouveau ticket.', en: 'Today I’m starting the new ticket.' }, null, { fr: 'Note l’inversion : « Vandaag begin ik », jamais « Vandaag ik begin ».', en: 'Note the inversion: “Vandaag begin ik”, never “Vandaag ik begin”.' })
        ]),
        T('Zijn er blokkers?', { fr: 'Il y a des blocages ?', en: 'Are there any blockers?' }, 'Zijn der blokkers?'),
        Y({ fr: 'Signale un blocage, ou dis qu’il n’y en a pas.', en: 'Report a blocker, or say there are none.' }, [
          C('Ik wacht op de klant.', { fr: 'J’attends le client.', en: 'I’m waiting for the client.' }, { nl: 'Oké, ik neem contact op. Merci.', fr: 'OK, je les contacte. Merci.', en: 'OK, I’ll get in touch with them. Thanks.', be: 'Oké, ik neem contact op. Merci.' }),
          C('Nee, geen blokkers.', { fr: 'Non, pas de blocages.', en: 'No, no blockers.' }, { nl: 'Perfect. Dan is het aan Sofie.', fr: 'Parfait. Alors c’est à Sofie.', en: 'Perfect. Then it’s Sofie’s turn.', be: 'Perfect. Dan is ’t aan Sofie.' }),
          C('Ik zit vast op één ding, kunnen we dat offline bespreken?', { fr: 'Je bloque sur une chose, on peut en parler après ?', en: 'I’m stuck on one thing, can we discuss it offline?' }, { nl: 'Goed idee. We doen dat na de stand-up.', fr: 'Bonne idée. On fait ça après le stand-up.', en: 'Good idea. We’ll do that after the stand-up.', be: 'Goe idee. We doen da na de stand-up.' }, { fr: 'La phrase qui garde un stand-up court et te fait passer pour expérimenté.', en: 'The sentence that keeps a stand-up short and makes you sound experienced.' })
        ])
      ],
      outro: { fr: 'Hier, aujourd’hui, blocages. La forme ne change jamais, donc chaque matin il n’y a qu’un seul mot nouveau à trouver.', en: 'Yesterday, today, blockers. The shape never changes, so each morning there is only one new word to find.' }
    },
    {
      id: 's-koffie', track: 'werk', level: 'A1', icon: '☕',
      title: { fr: 'À la machine à café', en: 'At the coffee machine' }, place: { fr: '{bedrijf}, lundi 10h', en: '{bedrijf}, Monday 10am' },
      blurb: { fr: 'La conversation dont tu es exclu pour l’instant. Elle est bien plus formulaire qu’elle n’en a l’air.', en: 'The conversation you are left out of for now. It is far more formulaic than it looks.' },
      steps: [
        T('Hey! Alles goed? Druk vandaag?', { fr: 'Hey ! Ça va ? Chargé aujourd’hui ?', en: 'Hey! How are you? Busy today?' }, 'Hey! Alles goed? Druk vandaag?'),
        Y({ fr: 'Réponds, et renvoie la question.', en: 'Answer, and ask back.' }, [
          C('’t Gaat wel, een beetje moe. En bij u?', { fr: 'Ça va, un peu fatigué. Et toi ?', en: 'Not bad, a bit tired. And you? (informal, Flemish u)' }),
          C('Ja, redelijk druk. En bij u?', { fr: 'Oui, assez chargé. Et toi ?', en: 'Yes, fairly busy. And you? (informal, Flemish u)' })
        ]),
        T('En, hoe was het weekend?', { fr: 'Alors, c’était comment le week-end ?', en: 'So, how was the weekend?' }, 'En, hoe was ’t weekend?'),
        Y({ fr: 'Parle de ton week-end.', en: 'Talk about your weekend.' }, [
          C('Niks speciaals, en bij u?', { fr: 'Rien de spécial, et toi ?', en: 'Nothing special, and you? (informal, Flemish u)' }, null, { fr: 'Réponse complète. Tu ne dois d’histoire à personne.', en: 'A complete answer. You owe nobody a story.' }),
          C('We hebben gewandeld met de kinderen.', { fr: 'On s’est promenés avec les enfants.', en: 'We went for a walk with the children.' }),
          C('Rustig gebleven, gelukkig.', { fr: 'C’est resté calme, heureusement.', en: 'It stayed quiet, thankfully.' })
        ]),
        T('Amai, wij zijn naar de match geweest. Zot spannend was dat.', { fr: 'Oh là là, nous on est allés au match. C’était dingue.', en: 'Wow, we went to the match. It was crazy exciting.' }, 'Amai, wij zijn naar de match geweest. Zot spannend was da.'),
        Y({ fr: 'Réagis.', en: 'React.' }, [
          C('Ah, ik heb de match ook gezien!', { fr: 'Ah, j’ai vu le match aussi !', en: 'Ah, I saw the match too!' }),
          C('Ik volg het voetbal niet zo, eerlijk gezegd.', { fr: 'Je ne suis pas trop le foot, honnêtement.', en: 'I don’t really follow football, to be honest.' }, null, { fr: 'Parfaitement acceptable. L’honnêteté fait continuer la conversation ; faire semblant, non.', en: 'Perfectly acceptable. Honesty keeps a conversation going; pretending does not.' })
        ]),
        T('Allez, ik ga er weer in. Tot straks!', { fr: 'Allez, je m’y remets. À tout à l’heure !', en: 'Right, back to it. See you later!' }, 'Allez, ’k ga der weer in. Tot straks!'),
        Y({ fr: 'Conclus.', en: 'Wrap up.' }, [
          C('Tot straks!', { fr: 'À tout à l’heure !', en: 'See you later!' }),
          C('Ja, tot later. Nog een goede dag!', { fr: 'Oui, à plus tard. Bonne journée !', en: 'Yes, see you later. Have a good day!' })
        ])
      ],
      outro: { fr: '« Alles goed ? » — réponse — renvoi — le week-end — réaction — « tot straks ». Six coups, et tu en faisais partie.', en: '“Alles goed?” — an answer — asking back — the weekend — a reaction — “tot straks”. Six beats, and you were part of it.' }
    },
    {
      id: 's-status', track: 'werk', level: 'A1', icon: '\u{1F5E3}',
      title: { fr: 'Donner un statut au client', en: 'Giving the client a status' }, place: { fr: 'Appel Teams, mardi', en: 'Teams call, Tuesday' },
      blurb: { fr: 'Annoncer une mauvaise nouvelle en flamand : par litote, jamais frontalement, et toujours avec une suite.', en: 'Breaking bad news in Flemish: by understatement, never head-on, and always with a next step.' },
      steps: [
        T('Dag {naam}. Kunt ge ons een korte status geven?', { fr: 'Bonjour {naam}. Tu peux nous donner un statut rapide ?', en: 'Hello {naam}. Can you (informal) give us a quick status?' }, 'Dag {naam}. Kunde ons een korte status geven?'),
        Y({ fr: 'Donne un statut court.', en: 'Give a short status.' }, [
          C('Ja, natuurlijk. Het project loopt goed.', { fr: 'Oui, bien sûr. Le projet avance bien.', en: 'Yes, of course. The project is going well.' }),
          C('Ja. We liggen ongeveer op schema.', { fr: 'Oui. On est à peu près dans les temps.', en: 'Yes. We’re roughly on schedule.' })
        ]),
        T('En de deadline van volgende week?', { fr: 'Et la deadline de la semaine prochaine ?', en: 'And the deadline next week?' }, 'En de deadline van volgende week?'),
        Y({ fr: 'Dis que ce sera juste.', en: 'Say it will be tight.' }, [
          C('Dat wordt krap, denk ik.', { fr: 'Ça va être juste, je pense.', en: 'It’s going to be tight, I think.' }, { nl: 'Krap? Hoezo?', fr: 'Juste ? C’est-à-dire ?', en: 'Tight? How so?', be: 'Krap? Hoezo?' }, { fr: 'La litote plus « denk ik » : c’est ainsi qu’un Flamand annonce une mauvaise nouvelle. Être direct sonne agressif.', en: 'Understatement plus “denk ik”: that is how a Fleming delivers bad news. Being direct sounds aggressive.' }),
          C('Dat gaat lukken.', { fr: 'Ça va passer.', en: 'It’ll work out.' }, { nl: 'Goed om te horen. Blijft ge het opvolgen?', fr: 'Bonne nouvelle. Tu continues à suivre ?', en: 'Good news. Will you (informal) keep following it?', be: 'Goe om te horen. Blijfde ’t opvolgen?' })
        ]),
        Y({ fr: 'Explique la raison.', en: 'Explain the reason.' }, [
          C('Er was een probleem met de tests.', { fr: 'Il y a eu un problème avec les tests.', en: 'There was a problem with the tests.' }),
          C('We wachten nog op input van uw team.', { fr: 'On attend encore des éléments de votre équipe.', en: 'We’re still waiting for input from your (formal) team.' }, null, { fr: 'Désigner le client comme cause — adouci par « nog » et par la tournure impersonnelle.', en: 'Naming the client as the cause — softened by “nog” and by the impersonal phrasing.' })
        ]),
        T('Oké. Kunnen we dat offline bespreken?', { fr: 'D’accord. On peut en parler après ?', en: 'OK. Can we discuss that offline?' }, 'Oké. Kunnen we da offline bespreken?'),
        Y({ fr: 'Accepte et propose une suite.', en: 'Agree and propose a next step.' }, [
          C('Ja, ik stuur u een mail met de details.', { fr: 'Oui, je vous envoie un mail avec les détails.', en: 'Yes, I’ll send you (formal) an email with the details.' }),
          C('Zeker. Ik neem dat op mij.', { fr: 'Certainement. Je prends ça en charge.', en: 'Certainly. I’ll take that on.' })
        ]),
        T('Perfect, merci. Tot volgende week.', { fr: 'Parfait, merci. À la semaine prochaine.', en: 'Perfect, thanks. See you next week.' }, 'Perfect, merci. Tot volgende week.')
      ],
      outro: { fr: 'Le schéma pour une mauvaise nouvelle : sous-entendre, donner une raison, proposer la suite. Ne t’excuse jamais longuement — ça passe pour de l’incompétence, pas pour de la politesse.', en: 'The pattern for bad news: hint, give a reason, propose the next step. Never apologise at length — it comes across as incompetence, not politeness.' }
    }
  ];
})();
