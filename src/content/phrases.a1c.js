/* Phrases des unités 13 à 34, prises dans Tatoeba (docs/attribution/tatoeba-phrases.tsv les crédite).
   Même forme que les phrases de lexicon.a1.js, plus src, le numéro de la phrase de Tatoeba.
   Écrit par la fusion du genre phrases (tools/content/kinds/phrases.js) depuis ses lignes prises :
   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de
   lexicon.a1c.js gardent phrases: [] dans leur fichier ; U range les phrases de chaque unité dans sa
   liste au chargement, et lève une erreur, avec l’id de l’unité, quand l’unité manque. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const P = (nl, g, src) => ({ kind: 'phrase', nl, ...NL.gloss.pair(g), src });
  const U = (id, phrases) => {
    const u = NL.content.units.find(x => x.id === id);
    if (!u) throw new Error('phrases.a1c.js : les phrases de l’unité « ' + id + ' » n’ont pas leur unité dans le cours (lexicon.a1c.js se charge avant)');
    (u.phrases = u.phrases || []).push(...phrases);
  };

  U('vragen', [
    P('Wie doet dat?', { fr: 'Qui fait ça ?', en: 'Who does that?' }, 7142062),
    P('Wanneer was dat?', { fr: 'C\'était quand ?', en: 'When was that?' }, 7814614),
    P('Hoe werkt dat?', { fr: 'Comment ça fonctionne ?', en: 'How does that work?' }, 8466740),
    P('Ik heb nu geen tijd.', { fr: 'Je n\'ai pas le temps maintenant.', en: 'I don\'t have time right now.' }, 881221),
    P('Waarom doet hij dat?', { fr: 'Pourquoi fait-il cela ?', en: 'Why is he doing that?' }, 3572086)
  ]);

  U('kunnen', [
    P('Hoe laat kun je komen?', { fr: 'À quelle heure peux-tu venir ?', en: 'What time can you come?' }, 7814649),
    P('Ik wil het niet vergeten.', { fr: 'Je ne veux pas oublier.', en: 'I don\'t want to forget.' }, 8551094),
    P('Hoe moet ik dat weten?', { fr: 'Comment le saurais-je ?', en: 'How should I know?' }, 406429),
    P('We kunnen alleen maar hopen.', { fr: 'Tout ce que nous pouvons faire, c\'est espérer.', en: 'We can only hope.' }, 9061437),
    P('Jullie kunnen me geloven.', { fr: 'Vous pouvez me croire.', en: 'You can believe me.' }, 8579612)
  ]);

  U('doen', [
    P('Ik neem het.', { fr: 'Je le prends.', en: 'I\'ll take it.' }, 7207012),
    P('Ga even zitten.', { fr: 'Assieds-toi.', en: 'Take a seat.' }, 5314135),
    P('Dat kan wachten.', { fr: 'Ça peut attendre.', en: 'That can wait.' }, 7842204),
    P('Kan ik beginnen?', { fr: 'Puis-je commencer ?', en: 'Can I start?' }, 7327779),
    P('Zijn er vragen?', { fr: 'Des questions ?', en: 'Are there any questions?' }, 7530250)
  ]);

  U('mensen', [
    P('Kan iemand helpen?', { fr: 'Quelqu\'un peut-il aider ?', en: 'Can anyone help?' }, 6074983),
    P('Mag ik hem iets vragen?', { fr: 'Puis-je lui demander quelque chose ?', en: 'Can I ask him something?' }, 5808202),
    P('Kennen we elkaar?', { fr: 'Est-ce qu\'on se connaît ?', en: 'Do we know each other?' }, 8640618),
    P('Doe het zelf!', { fr: 'Fais-le toi-même !', en: 'Do it yourself!' }, 7268168),
    P('Ik wil niets.', { fr: 'Je ne veux rien.', en: 'I don\'t want anything.' }, 8810723)
  ]);

  U('hoeveel', [
    P('Dat is te veel.', { fr: 'Ça c\'est trop.', en: 'That\'s too much.' }, 7906672),
    P('Is hij nog steeds hier?', { fr: 'Est-il encore ici ?', en: 'Is he still here?' }, 1621694),
    P('Nog een keer?', { fr: 'Encore une fois ?', en: 'One more time?' }, 7550269),
    P('Hoeveel van jullie drinken elke dag koffie?', { fr: 'Combien d\'entre vous boivent du café tous les jours ?', en: 'How many of you drink coffee every day?' }, 10640922),
    P('Wie gaat er nog meer met ons mee?', { fr: 'Qui d\'autre vient avec nous ?', en: 'Who else is going with us?' }, 4451435)
  ]);

  U('waar', [
    P('Ik ga met de fiets naar het werk.', { fr: 'Je me rends au travail en vélo.', en: 'I bike to work.' }, 377969),
    P('Onder welke naam?', { fr: 'Sous quel nom ?', en: 'Under what name?' }, 727933),
    P('Kijk eens rond.', { fr: 'Jette un coup d\'œil aux alentours.', en: 'Take a look around.' }, 6218474),
    P('Over een uur kom ik bij je.', { fr: 'Je viendrai chez toi dans une heure.', en: 'I will come to you in an hour.' }, 377305),
    P('Ga door met werken!', { fr: 'Continue à travailler !', en: 'Continue working.' }, 1620584)
  ]);

  U('landen', [
    P('Spreekt u Duits?', { fr: 'Parlez-vous allemand ?', en: 'Do you speak German? (formal)' }, 560810),
    P('Ik kan deze zin niet vertalen.', { fr: 'Je ne sais pas traduire cette phrase.', en: 'I can\'t translate this sentence.' }, 1520075),
    P('Zoek dat woord op in het woordenboek.', { fr: 'Cherchez ce mot dans le dictionnaire.', en: 'Look that word up in the dictionary.' }, 3209755),
    P('Er is geen antwoord op je vraag.', { fr: 'Il n\'y a pas de réponse à ta question.', en: 'There is not an answer to your question.' }, 8317073),
    P('Hij was in Frankrijk.', { fr: 'Il était en France.', en: 'He was in France.' }, 379299)
  ]);

  U('eten', [
    P('Wilt u suiker of melk?', { fr: 'Désirez-vous du sucre ou du lait ?', en: 'Do you want sugar or milk? (formal)' }, 3839944),
    P('De soep is te zout.', { fr: 'La soupe est trop salée.', en: 'The soup is too salty.' }, 1076121),
    P('Ik wil pizza.', { fr: 'Je veux de la pizza.', en: 'I want pizza.' }, 7550408),
    P('Vlees is duur.', { fr: 'La viande est chère.', en: 'Meat is expensive.' }, 3959234),
    P('Hebben jullie rijst?', { fr: 'Avez-vous du riz ?', en: 'Do you have rice?' }, 1442641)
  ]);

  U('cafe', [
    P('De rekening, alstublieft.', { fr: 'L\'addition s\'il vous plaît.', en: 'The bill, please.' }, 377812),
    P('We willen graag nog een fles wijn.', { fr: 'Nous voudrions une autre bouteille de vin.', en: 'We\'d like another bottle of wine.' }, 7802308),
    P('We bestellen iets.', { fr: 'Nous commandons quelque chose.', en: 'We\'re ordering something.' }, 7953407),
    P('Er is geen lepel.', { fr: 'Il n\'y a pas de cuillère.', en: 'There is no spoon.' }, 11878067),
    P('Hebben jullie een mes?', { fr: 'Avez-vous un couteau ?', en: 'Do you have a knife?' }, 9072128)
  ]);

  U('kleren', [
    P('Doe uw schoenen uit, alstublieft.', { fr: 'Veuillez retirer vos chaussures.', en: 'Please take off your shoes. (formal)' }, 1054368),
    P('Ik wil deze rok kopen.', { fr: 'Je veux acheter cette jupe.', en: 'I want to buy this skirt.' }, 13204296),
    P('Mijn fiets is rood.', { fr: 'Mon vélo est rouge.', en: 'My bike is red.' }, 8317455),
    P('Is deze appel geel?', { fr: 'Cette pomme est-elle jaune ?', en: 'Is this apple yellow?' }, 7770056),
    P('Dit is een blauw huis.', { fr: 'C\'est une maison bleue.', en: 'This is a blue house.' }, 10746261)
  ]);

  U('wonen', [
    P('Open het raam!', { fr: 'Ouvre la fenêtre !', en: 'Open the window!' }, 5462439),
    P('We verhuizen volgende maand.', { fr: 'Nous déménageons le mois prochain.', en: 'We\'re moving house next month.' }, 1054585),
    P('Een tafel voor twee, alstublieft.', { fr: 'Une table pour deux, s\'il vous plaît.', en: 'A table for two, please.' }, 13360565),
    P('Ik moet naar bed.', { fr: 'Je dois aller au lit.', en: 'I have to go to bed.' }, 380124),
    P('Ik wil een douche nemen.', { fr: 'Je veux prendre une douche.', en: 'I want to take a shower.' }, 11214731)
  ]);

  U('kalender', [
    P('Ik ben jarig!', { fr: 'C\'est mon anniversaire !', en: 'It\'s my birthday!' }, 9031603),
    P('Zijn jullie klaar voor Kerstmis?', { fr: 'Êtes-vous prêts pour Noël ?', en: 'Are you ready for Christmas?' }, 9499846),
    P('Ik ben met vakantie.', { fr: 'Je suis en vacances.', en: 'I\'m on holiday.' }, 13899669),
    P('De winter komt.', { fr: 'L\'hiver approche.', en: 'Winter is coming.' }, 7833048),
    P('Vandaag is het twee januari.', { fr: 'Aujourd\'hui, c\'est le deux janvier.', en: 'Today is the second of January.' }, 693231)
  ]);

  U('stad', [
    P('Ik ga naar het park.', { fr: 'Je vais au parc.', en: 'I go to the park.' }, 450250),
    P('Ze zijn in de bibliotheek.', { fr: 'Ils sont à la bibliothèque.', en: 'They\'re in the library.' }, 4460704),
    P('Is het museum vandaag open?', { fr: 'Le musée est-il ouvert aujourd\'hui ?', en: 'Is the museum open today?' }, 7532996),
    P('Woon je hier in de buurt?', { fr: 'Vis-tu dans le coin ?', en: 'Do you live near here?' }, 6101686),
    P('Ze is kapper.', { fr: 'Elle est coiffeuse.', en: 'She is a hairdresser.' }, 8671820)
  ]);

  U('vrijetijd', [
    P('Wil je spelen?', { fr: 'Tu veux jouer ?', en: 'Do you want to play?' }, 7548830),
    P('Ik kan zwemmen.', { fr: 'Je sais nager.', en: 'I can swim.' }, 778223),
    P('Kan zij fietsen?', { fr: 'Sait-elle faire du vélo ?', en: 'Can she ride a bicycle?' }, 734553),
    P('Ik wil dansen.', { fr: 'Je veux danser.', en: 'I want to dance.' }, 1348672),
    P('Ik kan zingen.', { fr: 'Je sais chanter.', en: 'I can sing.' }, 7833071)
  ]);

  U('gevoel', [
    P('Ik ben bang.', { fr: 'J\'ai peur.', en: 'I\'m afraid.' }, 3507223),
    P('Was het interessant?', { fr: 'Était-ce intéressant ?', en: 'Was it interesting?' }, 7814593),
    P('Dat is jammer.', { fr: 'Quel dommage !', en: 'That\'s too bad.' }, 7109248),
    P('Frans is moeilijk.', { fr: 'Le français est difficile.', en: 'French is difficult.' }, 4782231),
    P('Ik ben zenuwachtig.', { fr: 'Je suis nerveux.', en: 'I\'m nervous.' }, 6483058)
  ]);

  U('beschrijven', [
    P('Is het kapot?', { fr: 'Est-il cassé ?', en: 'Is it broken?' }, 8698039),
    P('Het is donker.', { fr: 'C\'est sombre.', en: 'It\'s dark.' }, 7122087),
    P('Ze zijn snel.', { fr: 'Ils sont rapides.', en: 'They\'re fast.' }, 8661544),
    P('Ze is sterk.', { fr: 'Elle est forte.', en: 'She\'s strong.' }, 1117470),
    P('Ze werkt hard.', { fr: 'Elle travaille dur.', en: 'She works hard.' }, 9378988)
  ]);

  U('school', [
    P('Heb je huiswerk?', { fr: 'As-tu des devoirs ?', en: 'Do you have homework?' }, 7694726),
    P('Ik moet studeren.', { fr: 'Je dois étudier.', en: 'I have to study.' }, 2801180),
    P('Je bent leerkracht.', { fr: 'Tu es enseignant.', en: 'You\'re a teacher.' }, 7207284),
    P('Waar is mijn potlood?', { fr: 'Où est mon crayon ?', en: 'Where is my pencil?' }, 7455585),
    P('Wij geven les.', { fr: 'Nous enseignons.', en: 'We teach.' }, 7575264)
  ]);

  U('afspraak', [
    P('Waar is de gsm?', { fr: 'Où est le GSM ?', en: 'Where\'s the cellphone?' }, 7248985),
    P('Wanneer kan ik je bellen?', { fr: 'Quand puis-je t\'appeler ?', en: 'When can I call you?' }, 9979376),
    P('We zijn beschikbaar.', { fr: 'Nous sommes disponibles.', en: 'We\'re available.' }, 10043987),
    P('Ik moet opnemen.', { fr: 'Je dois prendre cet appel.', en: 'I have to take this call.' }, 11537905),
    P('Stuur me een bericht.', { fr: 'Envoie-moi un message.', en: 'Send me a message.' }, 11491778)
  ]);

  U('team', [
    P('Laten we samenwerken.', { fr: 'Travaillons ensemble.', en: 'Let\'s work together.' }, 8663271),
    P('Wat een team!', { fr: 'Quelle équipe !', en: 'What a team!' }, 8771988),
    P('Van wie is deze computer?', { fr: 'À qui est cet ordinateur ?', en: 'Whose computer is this?' }, 8544194),
    P('Het ligt op mijn bureau.', { fr: 'C\'est sur mon bureau.', en: 'It\'s on my desk.' }, 12339565),
    P('De printer werkt niet.', { fr: 'L’imprimante ne fonctionne pas.', en: 'The printer doesn\'t work.' }, 12901416)
  ]);

  U('reis', [
    P('Ik ben toerist.', { fr: 'Je suis touriste.', en: 'I\'m a tourist.' }, 514770),
    P('Neem een taxi naar het hotel.', { fr: 'Prenez un taxi jusqu\'à l\'hôtel.', en: 'Take a taxi to the hotel.' }, 377869),
    P('Dit is mijn kamer.', { fr: 'Voici ma chambre.', en: 'This is my room.' }, 7904231),
    P('Reis je alleen?', { fr: 'Voyages-tu seul ?', en: 'Are you traveling alone?' }, 11872634),
    P('Mag ik uw paspoort, alstublieft?', { fr: 'Puis-je voir votre passeport s\'il vous plaît ?', en: 'May I see your passport, please? (formal)' }, 638476)
  ]);

  U('natuur', [
    P('Ik heb een kat.', { fr: 'J\'ai un chat.', en: 'I have a cat.' }, 3396767),
    P('Waar is mijn hond?', { fr: 'Où est mon chien ?', en: 'Where is my dog?' }, 1480455),
    P('Is het een koe?', { fr: 'Est-ce une vache ?', en: 'Is it a cow?' }, 7487949),
    P('Deze bloem is mooi.', { fr: 'Cette fleur est belle.', en: 'This flower is beautiful.' }, 7432047),
    P('Mijn paard is wit.', { fr: 'Mon cheval est blanc.', en: 'My horse is white.' }, 3644421)
  ]);

  U('spoed', [
    P('Ik ben allergisch voor melk.', { fr: 'Je suis allergique au lait.', en: 'I\'m allergic to milk.' }, 9623765),
    P('Wie heeft dit gebroken?', { fr: 'Qui a cassé ceci ?', en: 'Who broke this?' }, 738006),
    P('Het is gevaarlijk.', { fr: 'C\'est dangereux.', en: 'It\'s dangerous.' }, 7699017),
    P('Ze heeft hulp nodig.', { fr: 'Elle a besoin d\'aide.', en: 'She needs help.' }, 451272),
    P('Ik was bij de tandarts.', { fr: 'J\'étais chez le dentiste.', en: 'I was at the dentist.' }, 701058)
  ]);
})();
