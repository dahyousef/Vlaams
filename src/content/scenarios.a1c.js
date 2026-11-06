/* Conversations de la phase 4b. Même forme que scenarios.js, dont les aides T, Y et C sont reprises.
   Écrit par la fusion du genre scenarios (tools/content/kinds/scenarios.js) depuis ses lignes prises :
   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Elles s’ajoutent à celles de
   scenarios.js ; le fichier se charge après lui et avant content/index.js. */
NL.content = NL.content || {};
NL.content.scenarios = NL.content.scenarios || [];
(function () {
  'use strict';
  const T = (nl, g, be) => ({ them: { nl, ...NL.gloss.pair(g), be } });
  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint } });
  const C = (nl, g, reply, note) => ({ nl, ...NL.gloss.pair(g), reply, note });
  const S = o => NL.content.scenarios.push(o);

  S({
    id: 's-cafe', track: 'leven', level: 'A1', icon: '\u{2615}',
    title: { fr: 'Boire un verre', en: 'Having a drink' }, place: { fr: '{stad}, la terrasse d’un café, samedi après-midi', en: '{stad}, a café terrace, Saturday afternoon' },
    blurb: { fr: 'Vous commandez à boire et à manger, puis vous demandez l’addition et vous payez.', en: 'You order something to drink and eat, then ask for the bill and pay.' },
    steps: [
      T('Dag! Wat mag het zijn?', { fr: 'Bonjour ! Qu’est-ce que ce sera ?', en: 'Hello! What can I get you?' }, 'Dag! Wat mag het zijn?'),
      Y({ fr: 'Commandez une boisson et posez une question sur le plat.', en: 'Order a drink and ask about the food.' }, [
        C('Een pintje, alstublieft. Wat raadt u aan?', { fr: 'Une pinte, s’il vous plaît. Que conseillez-vous ?', en: 'A pint, please. What do you recommend?' }, { nl: 'De kaaskroket is heel lekker.', fr: 'La croquette au fromage est très bonne.', en: 'The cheese croquette is very good.', be: 'De kaaskroket is heel lekker.' }, { fr: 'Le verbe conseiller (aanraden) se sépare : « raadt » en deuxième place, « aan » en fin de phrase.', en: 'The verb to recommend (aanraden) splits: “raadt” in second place, “aan” at the end.' }),
        C('Een koffie, alstublieft. Is de soep vegetarisch?', { fr: 'Un café, s’il vous plaît. La soupe est-elle végétarienne ?', en: 'A coffee, please. Is the soup vegetarian?' }, { nl: 'Ja, de soep is vegetarisch.', fr: 'Oui, la soupe est végétarienne.', en: 'Yes, the soup is vegetarian.', be: 'Ja, de soep is vegetarisch.' }, { fr: '« Vegetarisch » (végétarien) s’écrit presque comme en français, mais se termine autrement.', en: '“Vegetarisch” (vegetarian) is spelled almost as in English, but ends differently.' })
      ]),
      T('En om te eten?', { fr: 'Et à manger ?', en: 'And something to eat?' }, 'En om te eten?'),
      Y({ fr: 'Commandez à manger.', en: 'Order something to eat.' }, [
        C('Een kaaskroket, alstublieft.', { fr: 'Une croquette au fromage, s’il vous plaît.', en: 'A cheese croquette, please.' }, { nl: 'Komt eraan!', fr: 'Ça arrive !', en: 'Coming up!', be: 'Komt eraan!' }, { fr: '« Kaaskroket » s’écrit en un seul mot : « kaas » (fromage) et kroket (croquette).', en: '“Kaaskroket” is a single word: “kaas” (cheese) and kroket (croquette).' }),
        C('De soep, alstublieft.', { fr: 'La soupe, s’il vous plaît.', en: 'The soup, please.' }, { nl: 'Komt eraan!', fr: 'Ça arrive !', en: 'Coming up!', be: 'Komt eraan!' })
      ]),
      T('Was het lekker? Nog iets?', { fr: 'C’était bon ? Autre chose ?', en: 'Was it good? Anything else?' }, 'Was het lekker? Nog iets?'),
      Y({ fr: 'Dites que c’était bon et demandez à payer.', en: 'Say it was good and ask to pay.' }, [
        C('Ja, heel lekker. De rekening, alstublieft.', { fr: 'Oui, très bon. L’addition, s’il vous plaît.', en: 'Yes, very good. The bill, please.' }, { nl: 'Meteen.', fr: 'Tout de suite.', en: 'Right away.', be: 'Direct.' }),
        C('Ja, heel lekker. Mag ik betalen?', { fr: 'Oui, très bon. Je peux payer ?', en: 'Yes, very good. May I pay?' }, { nl: 'Natuurlijk.', fr: 'Bien sûr.', en: 'Of course.', be: 'Natuurlijk.' })
      ]),
      T('Dat is veertien euro. Cash of met de kaart?', { fr: 'Cela fait quatorze euros. En liquide ou par carte ?', en: 'That is fourteen euros. Cash or by card?' }, 'Da’s veertien euro. Cash of met de kaart?'),
      Y({ fr: 'Payez par carte ou en liquide, et laissez un pourboire si vous voulez.', en: 'Pay by card or in cash, and leave a tip if you like.' }, [
        C('Met de kaart, alstublieft.', { fr: 'Par carte, s’il vous plaît.', en: 'By card, please.' }, { nl: 'Dank u wel!', fr: 'Merci beaucoup !', en: 'Thank you very much!', be: 'Dank u wel!' }),
        C('Cash. Houd het maar.', { fr: 'En liquide. Gardez la monnaie.', en: 'Cash. Keep the change.' }, { nl: 'Dank u wel, hè!', fr: 'Merci beaucoup !', en: 'Thank you very much!', be: 'Dank u wel, hè!' }, { fr: 'Le reste est pour le serveur : c’est « de fooi » (le pourboire).', en: 'The rest is for the waiter: that is “de fooi” (the tip).' })
      ])
    ],
    outro: { fr: 'Vous avez commandé, demandé l’addition et payé sans un mot de français.', en: 'You ordered, asked for the bill and paid without a word of French.' }
  });

  S({
    id: 's-afspraak', track: 'leven', level: 'A1', icon: '\u{1F4DE}',
    title: { fr: 'Au téléphone', en: 'On the phone' }, place: { fr: 'Au téléphone avec le cabinet, un matin de semaine', en: 'On the phone with the doctor’s practice, a weekday morning' },
    blurb: { fr: 'Vous appelez pour déplacer un rendez-vous et vous en acceptez un nouveau.', en: 'You call to move an appointment and accept a new one.' },
    steps: [
      T('Goeiedag, bij dokter Peeters, met Sofie.', { fr: 'Bonjour, cabinet du docteur Peeters, Sofie à l’appareil.', en: 'Hello, Dr Peeters’ practice, Sofie speaking.' }, 'Goeiedag, bij dokter Peeters, met Sofie.'),
      Y({ fr: 'Dites bonjour et donnez votre nom.', en: 'Say hello and give your name.' }, [
        C('Dag, met {naam}.', { fr: 'Bonjour, {naam} à l’appareil.', en: 'Hello, this is {naam}.' }),
        C('Goeiedag, ik ben {naam}.', { fr: 'Bonjour, je suis {naam}.', en: 'Hello, I am {naam}.' })
      ]),
      T('Dag! Wat kan ik voor u doen?', { fr: 'Bonjour ! Que puis-je faire pour vous ?', en: 'Hello! What can I do for you?' }, 'Dag! Wat kan ik voor u doen?'),
      Y({ fr: 'Dites pourquoi vous appelez : votre rendez-vous.', en: 'Say why you are calling: your appointment.' }, [
        C('Ik had graag mijn afspraak verplaatst.', { fr: 'Je voudrais déplacer mon rendez-vous.', en: 'I would like to move my appointment.' }, { nl: 'Dat is goed.', fr: 'C’est d’accord.', en: 'That is fine.', be: 'Da’s goed.' }),
        C('Mijn afspraak van vandaag past niet.', { fr: 'Mon rendez-vous d’aujourd’hui ne convient pas.', en: 'Today’s appointment does not suit me.' }, { nl: 'Dat is niet erg.', fr: 'Ce n’est pas grave.', en: 'That is no problem.', be: 'Da’s niet erg.' })
      ]),
      T('Ik heb donderdag om tien uur. Past dat voor u?', { fr: 'J’ai jeudi à 10 heures. Est-ce que cela vous convient ?', en: 'I have Thursday at 10 o’clock. Does that suit you?' }, 'Ik heb donderdag om tien uur. Past dat voor u?'),
      Y({ fr: 'Acceptez ce moment ou demandez un autre jour.', en: 'Accept this time or ask for another day.' }, [
        C('Ja, dat is goed.', { fr: 'Oui, c’est bien.', en: 'Yes, that is fine.' }),
        C('Nee, dat past niet. Hebt u vrijdag?', { fr: 'Non, cela ne convient pas. Avez-vous vendredi ?', en: 'No, that does not suit me. Do you have Friday?' }, { nl: 'Vrijdag om negen uur is de dokter beschikbaar.', fr: 'Vendredi à 9 heures, le docteur est disponible.', en: 'On Friday at 9 o’clock the doctor is available.', be: 'Vrijdag om negen uur is de dokter beschikbaar.' })
      ]),
      T('Goed, ik zet het in de agenda.', { fr: 'Très bien, je le note dans l’agenda.', en: 'Good, I will put it in the diary.' }, 'Oké, ik zet het in de agenda.'),
      Y({ fr: 'Remerciez et dites au revoir.', en: 'Say thank you and goodbye.' }, [
        C('Dank u wel. Tot dan!', { fr: 'Merci beaucoup. À bientôt !', en: 'Thank you. See you then!' }, { nl: 'Tot dan!', fr: 'À bientôt !', en: 'See you then!', be: 'Allee, tot dan!' }),
        C('Bedankt, tot ziens!', { fr: 'Merci, au revoir !', en: 'Thanks, goodbye!' }, { nl: 'Tot ziens!', fr: 'Au revoir !', en: 'Goodbye!', be: 'Allee, tot ziens!' })
      ])
    ],
    outro: { fr: 'Vous avez déplacé votre rendez-vous par téléphone.', en: 'You moved your appointment over the phone.' }
  });

  S({
    id: 's-school', track: 'leven', level: 'A1', icon: '\u{1F392}',
    title: { fr: 'À la sortie de l’école', en: 'At the school gate' }, place: { fr: '{stad}, devant l’école, en fin de journée', en: '{stad}, outside the school, end of the day' },
    blurb: { fr: 'Vous saluez la maîtresse, vous demandez comment la journée s’est passée et vous la prévenez pour demain.', en: 'You greet the teacher, ask how the day went and let her know about tomorrow.' },
    steps: [
      T('Dag!', { fr: 'Bonjour !', en: 'Hello!' }, 'Dag!'),
      Y({ fr: 'Saluez la maîtresse.', en: 'Greet the teacher.' }, [
        C('Dag, juf!', { fr: 'Bonjour, madame !', en: 'Hello, teacher!' }),
        C('Goeiedag, juf!', { fr: 'Bonjour, madame !', en: 'Hello, teacher!' })
      ]),
      T('Daar komen de kinderen al.', { fr: 'Voilà les enfants qui arrivent.', en: 'Here come the children.' }, 'Daar komen de kinderen al.'),
      Y({ fr: 'Demandez comment la journée s’est passée.', en: 'Ask how the day went.' }, [
        C('Hoe was het vandaag?', { fr: 'Comment était la journée ?', en: 'How was today?' }),
        C('Is het goed gegaan?', { fr: 'Est-ce que ça s’est bien passé ?', en: 'Did it go well?' })
      ]),
      T('Het is goed gegaan! Ze heeft mooi getekend in de klas.', { fr: 'Ça s’est bien passé ! Elle a bien dessiné en classe.', en: 'It went well! She drew nicely in class.' }, '’t Is goed gegaan! Ze heeft mooi getekend in de klas.'),
      Y({ fr: 'Dites une chose pratique pour demain.', en: 'Say one practical thing about tomorrow.' }, [
        C('Morgen blijft ze thuis.', { fr: 'Demain, elle reste à la maison.', en: 'Tomorrow she is staying at home.' }),
        C('Morgen blijft ze in de opvang.', { fr: 'Demain, elle reste à la garderie.', en: 'Tomorrow she is staying at after-school care.' }),
        C('Morgen haalt haar opa haar af.', { fr: 'Demain, son grand-père viendra la chercher.', en: 'Tomorrow her grandfather will pick her up.' }, null, { fr: 'Le verbe se coupe : « haalt » en deuxième place, « af » à la fin.', en: 'The verb splits: “haalt” in second place, “af” at the end.' })
      ]),
      T('Dat is goed, bedankt!', { fr: 'C’est bon, merci !', en: 'That’s fine, thank you!' }, 'Da’s goed, bedankt!')
    ],
    outro: { fr: 'Vous avez salué la maîtresse, pris des nouvelles et prévenu pour demain.', en: 'You greeted the teacher, asked for news and let her know about tomorrow.' }
  });

  S({
    id: 's-gemeente', track: 'leven', level: 'A1', icon: '\u{1F3DB}',
    title: { fr: 'À la maison communale', en: 'At the town hall' }, place: { fr: '{stad}, la maison communale, un matin de semaine', en: '{stad}, the town hall, a weekday morning' },
    blurb: { fr: 'Vous demandez une attestation au guichet et vous voulez savoir quand elle sera prête.', en: 'You ask for a certificate at the counter and find out when it will be ready.' },
    steps: [
      T('Goeiedag! Wat kan ik voor u doen?', { fr: 'Bonjour ! Que puis-je faire pour vous ?', en: 'Hello! What can I do for you?' }, 'Goeiedag! Wat kan ik voor u doen?'),
      Y({ fr: 'Dites que vous avez besoin d’une attestation.', en: 'Say that you need a certificate.' }, [
        C('Ik heb een attest nodig.', { fr: 'J’ai besoin d’une attestation.', en: 'I need a certificate.' }, { nl: 'Dat kan.', fr: 'C’est possible.', en: 'That can be done.', be: 'Dat kan.' }),
        C('Ik wil graag een attest.', { fr: 'Je voudrais une attestation.', en: 'I would like a certificate.' })
      ], { fr: '« Een attest » (une attestation).', en: '“Een attest” (a certificate).' }),
      T('Hebt u uw identiteitskaart bij u?', { fr: 'Avez-vous votre carte d’identité sur vous ?', en: 'Do you have your ID card with you?' }, 'Hebt ge uw identiteitskaart bij?'),
      Y({ fr: 'Répondez que oui et donnez votre carte.', en: 'Answer yes and hand over your card.' }, [
        C('Ja, alstublieft.', { fr: 'Oui, voilà.', en: 'Yes, here you are.' }, { nl: 'Dank u wel.', fr: 'Merci beaucoup.', en: 'Thank you very much.', be: 'Dank u wel.' }),
        C('Ja, hier is mijn identiteitskaart.', { fr: 'Oui, voici ma carte d’identité.', en: 'Yes, here is my ID card.' }, { nl: 'Dank u wel.', fr: 'Merci beaucoup.', en: 'Thank you very much.', be: 'Dank u wel.' })
      ], { fr: '« Identiteitskaart » (la carte d’identité).', en: '“Identiteitskaart” (the ID card).' }),
      Y({ fr: 'Demandez quand l’attestation sera prête.', en: 'Ask when the certificate will be ready.' }, [
        C('Wanneer is het klaar?', { fr: 'Quand est-ce que ce sera prêt ?', en: 'When will it be ready?' }, { nl: 'Het is direct klaar. Wilt u even wachten?', fr: 'Ce sera prêt tout de suite. Voulez-vous patienter un peu ?', en: 'It will be ready right away. Would you wait a little?', be: 'Het is direct klaar. Wilt ge even wachten?' }),
        C('Is het vandaag klaar?', { fr: 'Est-ce que ce sera prêt aujourd’hui ?', en: 'Will it be ready today?' }, { nl: 'Ja, het is direct klaar.', fr: 'Oui, ce sera prêt tout de suite.', en: 'Yes, it will be ready right away.', be: 'Ja, het is direct klaar.' })
      ])
    ],
    outro: { fr: 'Vous avez demandé une attestation au guichet, et elle est prête tout de suite.', en: 'You asked for a certificate at the counter, and it is ready right away.' }
  });
})();
