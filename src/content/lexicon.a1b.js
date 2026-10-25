/* Lexique A1, unités 7 à 12. Même forme que lexicon.a1.js.
   L'unité 8 est écrite pour un développeur Java, pas pour un consultant générique. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const W = (nl, g, art) => ({ kind: 'word', nl, ...NL.gloss.pair(g), art });
  const P = (nl, g) => ({ kind: 'phrase', nl, ...NL.gloss.pair(g) });
  const U = o => NL.content.units.push(o);

  U({
    id: 'onderweg', n: 7, name: { fr: 'En route', en: 'On the way' }, nlName: 'Onderweg', level: 'A1', track: 'beide', icon: '\u{1F686}',
    blurb: { fr: 'Le trajet : la SNCB, « De Lijn », les files, et arriver en retard sans mal s’excuser.', en: 'The commute: the railway, “De Lijn” buses, traffic jams, and arriving late without apologising badly.' },
    grammar: ['g-v2'],
    words: [
      W('de fiets', { fr: 'le vélo', en: 'bicycle' }, 'de'),
      W('de auto', { fr: 'la voiture', en: 'car' }, 'de'),
      W('de trein', { fr: 'le train', en: 'train' }, 'de'),
      W('de bus', { fr: 'le bus', en: 'bus' }, 'de'),
      W('de tram', { fr: 'le tram', en: 'tram' }, 'de'),
      W('het station', { fr: 'la gare', en: 'station' }, 'het'),
      W('het perron', { fr: 'le quai', en: 'platform' }, 'het'),
      W('het spoor', { fr: 'la voie', en: 'track' }, 'het'),
      W('de halte', { fr: 'l’arrêt', en: 'stop' }, 'de'),
      W('de vertraging', { fr: 'le retard', en: 'delay' }, 'de'),
      W('de file', { fr: 'l’embouteillage', en: 'traffic jam' }, 'de'),
      W('het kaartje', { fr: 'le ticket', en: 'ticket' }, 'het'),
      W('de rit', { fr: 'le trajet', en: 'journey' }, 'de'),
      W('vertrekken', { fr: 'partir', en: 'to leave' }),
      W('aankomen', { fr: 'arriver', en: 'to arrive' }),
      W('overstappen', { fr: 'changer de train', en: 'to change trains' }),
      W('rijden', { fr: 'rouler / circuler', en: 'to drive / to travel' }),
      W('links', { fr: 'à gauche', en: 'left' }),
      W('rechts', { fr: 'à droite', en: 'right' }),
      W('rechtdoor', { fr: 'tout droit', en: 'straight on' }),
      W('ver', { fr: 'loin', en: 'far' }),
      W('dichtbij', { fr: 'près', en: 'nearby' }),
      W('de richting', { fr: 'la direction', en: 'direction' }, 'de'),
      W('duren', { fr: 'durer', en: 'to last' })
    ],
    phrases: [
      P('Ik neem de trein naar Brussel.', { fr: 'Je prends le train pour Bruxelles.', en: 'I am taking the train to Brussels.' }),
      P('De trein heeft tien minuten vertraging.', { fr: 'Le train a dix minutes de retard.', en: 'The train is ten minutes late.' }),
      P('Op welk spoor?', { fr: 'Sur quelle voie ?', en: 'Which track?' }),
      P('Ik moet overstappen in Dendermonde.', { fr: 'Je dois changer à Termonde.', en: 'I have to change at Dendermonde.' }),
      P('Hoe lang duurt het?', { fr: 'Ça prend combien de temps ?', en: 'How long does it take?' }),
      P('Ik sta in de file.', { fr: 'Je suis dans les files.', en: 'I am stuck in traffic.' }),
      P('Ik kom een beetje later, sorry.', { fr: 'Je vais arriver un peu plus tard, désolé.', en: 'I will arrive a little later, sorry.' }),
      P('Rijdt deze bus naar Aalst?', { fr: 'Ce bus va à Alost ?', en: 'Does this bus go to Aalst?' }),
      P('Is het ver van hier?', { fr: 'C’est loin d’ici ?', en: 'Is it far from here?' }),
      P('Ga rechtdoor en dan links.', { fr: 'Va tout droit puis à gauche.', en: 'Go straight on and then left. (informal)' })
    ]
  });

  U({
    id: 'werkbasis', n: 8, name: { fr: 'Le travail : la base', en: 'Work: the basics' }, nlName: 'Werk: de basis', level: 'A1', track: 'werk', icon: '\u{1F4BB}',
    blurb: { fr: 'Le vocabulaire de ta journée chez {bedrijf} : le ticket, le build, le client, la réunion.', en: 'The vocabulary of your day at {bedrijf}: the ticket, the build, the client, the meeting.' },
    grammar: ['g-present'],
    words: [
      W('het werk', { fr: 'le travail', en: 'work' }, 'het'),
      W('de collega', { fr: 'le collègue', en: 'colleague' }, 'de'),
      W('de klant', { fr: 'le client', en: 'client' }, 'de'),
      W('de vergadering', { fr: 'la réunion', en: 'meeting' }, 'de'),
      W('het project', { fr: 'le projet', en: 'project' }, 'het'),
      W('de code', { fr: 'le code', en: 'code' }, 'de'),
      W('de test', { fr: 'le test', en: 'test' }, 'de'),
      W('de fout', { fr: 'l’erreur', en: 'error' }, 'de'),
      W('het probleem', { fr: 'le problème', en: 'problem' }, 'het'),
      W('de oplossing', { fr: 'la solution', en: 'solution' }, 'de'),
      W('het ticket', { fr: 'le ticket', en: 'ticket' }, 'het'),
      W('de deadline', { fr: 'la deadline', en: 'deadline' }, 'de'),
      W('de planning', { fr: 'le planning', en: 'schedule' }, 'de'),
      W('de omgeving', { fr: 'l’environnement', en: 'environment' }, 'de'),
      W('de databank', { fr: 'la base de données', en: 'database' }, 'de'),
      W('de server', { fr: 'le serveur', en: 'server' }, 'de'),
      W('de mail', { fr: 'le mail', en: 'email' }, 'de'),
      W('het verslag', { fr: 'le compte rendu', en: 'report' }, 'het'),
      W('het thuiswerk', { fr: 'le télétravail', en: 'working from home' }, 'het'),
      W('het kantoor', { fr: 'le bureau', en: 'office' }, 'het'),
      W('de afspraak', { fr: 'le rendez-vous', en: 'appointment' }, 'de'),
      W('klaar', { fr: 'prêt / terminé', en: 'ready / finished' }),
      W('bezig', { fr: 'en cours', en: 'in progress' }, null),
      W('dringend', { fr: 'urgent', en: 'urgent' }),
      W('sturen', { fr: 'envoyer', en: 'to send' }),
      W('uitleggen', { fr: 'expliquer', en: 'to explain' }),
      W('oplossen', { fr: 'résoudre', en: 'to solve' }),
      W('draaien', { fr: 'tourner / s’exécuter', en: 'to turn / to run (of software)' }),
      W('afwerken', { fr: 'terminer', en: 'to finish off' })
    ],
    phrases: [
      P('Ik werk bij {bedrijf}.', { fr: 'Je travaille chez {bedrijf}.', en: 'I work at {bedrijf}.' }),
      P('Ik ben Java-ontwikkelaar.', { fr: 'Je suis développeur Java.', en: 'I am a Java developer.' }),
      P('Ik werk aan een project voor een klant.', { fr: 'Je travaille sur un projet pour un client.', en: 'I am working on a project for a client.' }),
      P('Ik heb een vergadering om tien uur.', { fr: 'J’ai une réunion à dix heures.', en: 'I have a meeting at ten o’clock.' }),
      P('Ik werk vandaag van thuis.', { fr: 'Je travaille de chez moi aujourd’hui.', en: 'I am working from home today.' }),
      P('Ik stuur u een mail.', { fr: 'Je vous envoie un mail.', en: 'I will send you an email. (formal)' }),
      P('Ik ben er nog mee bezig.', { fr: 'J’y travaille encore.', en: 'I am still working on it.' }),
      P('Dat is klaar.', { fr: 'C’est terminé.', en: 'That is finished.' }),
      P('Kunt u dat even uitleggen?', { fr: 'Pouvez-vous expliquer ça rapidement ?', en: 'Could you quickly explain that? (formal)' }),
      P('De testen draaien nog.', { fr: 'Les tests tournent encore.', en: 'The tests are still running.' }),
      P('Sorry, mijn Nederlands is nog niet zo goed.', { fr: 'Désolé, mon néerlandais n’est pas encore très bon.', en: 'Sorry, my Dutch is not very good yet.' })
    ]
  });

  U({
    id: 'dedag', n: 9, name: { fr: 'La journée', en: 'The day' }, nlName: 'De dag', level: 'A1', track: 'beide', icon: '\u{23F0}',
    blurb: { fr: 'Ta routine, et les verbes qui se cassent en deux quand tu les utilises.', en: 'Your routine, and the verbs that break in two when you use them.' },
    grammar: ['g-scheidbaar'],
    words: [
      W('opstaan', { fr: 'se lever', en: 'to get up' }, null),
      W('ontbijten', { fr: 'déjeuner (le matin)', en: 'to have breakfast' }, null),
      W('vertrekken', { fr: 'partir', en: 'to leave' }),
      W('thuiskomen', { fr: 'rentrer', en: 'to come home' }, null),
      W('meenemen', { fr: 'emporter', en: 'to take away / to take along' }),
      W('afspreken', { fr: 'convenir d’un rendez-vous', en: 'to arrange to meet' }, null),
      W('opbellen', { fr: 'téléphoner', en: 'to phone' }, null),
      W('uitleggen', { fr: 'expliquer', en: 'to explain' }),
      W('slapen', { fr: 'dormir', en: 'to sleep' }),
      W('eten', { fr: 'manger', en: 'to eat' }),
      W('drinken', { fr: 'boire', en: 'to drink' }),
      W('douchen', { fr: 'se doucher', en: 'to shower' }),
      W('koken', { fr: 'cuisiner', en: 'to cook' }),
      W('wandelen', { fr: 'se promener', en: 'to go for a walk' }),
      W('de voormiddag', { fr: 'la matinée', en: 'morning' }, 'de'),
      W('de namiddag', { fr: 'l’après-midi', en: 'afternoon' }, 'de'),
      W('de avond', { fr: 'le soir', en: 'evening' }, 'de'),
      W('moe', { fr: 'fatigué', en: 'tired' }),
      W('druk', { fr: 'chargé / occupé', en: 'busy' }),
      W('altijd', { fr: 'toujours', en: 'always' }),
      W('soms', { fr: 'parfois', en: 'sometimes' }),
      W('nooit', { fr: 'jamais', en: 'never' }),
      W('meestal', { fr: 'la plupart du temps', en: 'usually / most of the time' }),
      W('eerst', { fr: 'd’abord', en: 'first' }),
      W('daarna', { fr: 'ensuite', en: 'afterwards' })
    ],
    phrases: [
      P('Ik sta om zes uur op.', { fr: 'Je me lève à six heures.', en: 'I get up at six o’clock.' }),
      P('Ik vertrek om kwart voor acht.', { fr: 'Je pars à huit heures moins le quart.', en: 'I leave at a quarter to eight.' }),
      P('Ik neem mijn laptop mee.', { fr: 'J’emporte mon portable.', en: 'I am taking my laptop.' }),
      P('Ik kom om zes uur thuis.', { fr: 'Je rentre à six heures.', en: 'I come home at six o’clock.' }),
      P('We spreken morgen af.', { fr: 'On se donne rendez-vous demain.', en: 'We are meeting tomorrow.' }),
      P('Eerst werk ik, daarna kook ik.', { fr: 'D’abord je travaille, ensuite je cuisine.', en: 'First I work, then I cook.' }),
      P('Het was een drukke dag.', { fr: 'C’était une journée chargée.', en: 'It was a busy day.' }),
      P('Ik ben moe.', { fr: 'Je suis fatigué.', en: 'I am tired.' }),
      P('Wat doe je meestal in het weekend?', { fr: 'Qu’est-ce que tu fais d’habitude le week-end ?', en: 'What do you usually do at the weekend? (informal)' })
    ]
  });

  U({
    id: 'winkel', n: 10, name: { fr: 'Courses et argent', en: 'Shopping and money' }, nlName: 'Winkelen en geld', level: 'A1', track: 'leven', icon: '\u{1F6D2}',
    blurb: { fr: 'Le Colruyt, la caisse, le terminal Bancontact, et demander une autre taille.', en: 'The supermarket, the checkout, the Bancontact terminal, and asking for another size.' },
    grammar: ['g-getallen'],
    words: [
      W('de winkel', { fr: 'le magasin', en: 'shop' }, 'de'),
      W('de kassa', { fr: 'la caisse', en: 'checkout' }, 'de'),
      W('het geld', { fr: 'l’argent', en: 'money' }, 'het'),
      W('de euro', { fr: 'l’euro', en: 'euro' }, 'de'),
      W('de kaart', { fr: 'la carte', en: 'card' }, 'de'),
      W('cash', { fr: 'en liquide', en: 'cash' }),
      W('de korting', { fr: 'la réduction', en: 'discount' }, 'de'),
      W('de bon', { fr: 'le ticket de caisse', en: 'receipt' }, 'de'),
      W('het zakje', { fr: 'le sachet', en: 'small bag' }, 'het'),
      W('de winkelkar', { fr: 'le caddie', en: 'shopping trolley' }, 'de'),
      W('de maat', { fr: 'la taille', en: 'size' }, 'de'),
      W('de kleur', { fr: 'la couleur', en: 'colour' }, 'de'),
      W('duur', { fr: 'cher', en: 'expensive' }),
      W('goedkoop', { fr: 'bon marché', en: 'cheap' }),
      W('gratis', { fr: 'gratuit', en: 'free' }),
      W('kopen', { fr: 'acheter', en: 'to buy' }),
      W('betalen', { fr: 'payer', en: 'to pay' }),
      W('ruilen', { fr: 'échanger', en: 'to exchange' }),
      W('passen', { fr: 'essayer / aller', en: 'to try on / to fit' }),
      W('zoeken', { fr: 'chercher', en: 'to look for' }),
      W('vinden', { fr: 'trouver', en: 'to find' }),
      W('open', { fr: 'ouvert', en: 'open' }),
      W('gesloten', { fr: 'fermé', en: 'closed' }, null),
      W('genoeg', { fr: 'assez', en: 'enough' })
    ],
    phrases: [
      P('Hoeveel kost dat?', { fr: 'Ça coûte combien ?', en: 'How much does that cost?' }),
      P('Kan ik met de kaart betalen?', { fr: 'Je peux payer par carte ?', en: 'Can I pay by card?' }),
      P('Mag ik een zakje, alstublieft?', { fr: 'Puis-je avoir un sachet, s’il vous plaît ?', en: 'May I have a bag, please? (formal)' }),
      P('Heeft u dat in een andere maat?', { fr: 'Vous avez ça dans une autre taille ?', en: 'Do you have that in another size? (formal)' }),
      P('Dat is te duur voor mij.', { fr: 'C’est trop cher pour moi.', en: 'That is too expensive for me.' }),
      P('Ik ben op zoek naar brood.', { fr: 'Je cherche du pain.', en: 'I am looking for bread.' }),
      P('Waar is de kassa?', { fr: 'Où est la caisse ?', en: 'Where is the checkout?' }),
      P('Tot hoe laat zijn jullie open?', { fr: 'Vous êtes ouverts jusqu’à quelle heure ?', en: 'Until what time are you open? (informal)' }),
      P('Ik kijk alleen even, merci.', { fr: 'Je regarde juste, merci.', en: 'I am just looking, thanks.' })
    ]
  });

  U({
    id: 'dokter', n: 11, name: { fr: 'Le corps et le médecin', en: 'The body and the doctor' }, nlName: 'Lichaam en dokter', level: 'A1', track: 'leven', icon: '\u{1FA7A}',
    blurb: { fr: 'Prendre rendez-vous chez le « huisarts » et dire ce qui fait mal, sans passer au français.', en: 'Making an appointment at the “huisarts” and saying what hurts, without switching to French.' },
    grammar: ['g-dehet'],
    words: [
      W('ziek', { fr: 'malade', en: 'ill' }),
      W('de pijn', { fr: 'la douleur', en: 'pain' }, 'de'),
      W('het hoofd', { fr: 'la tête', en: 'head' }, 'het'),
      W('de keel', { fr: 'la gorge', en: 'throat' }, 'de'),
      W('de buik', { fr: 'le ventre', en: 'belly / stomach' }, 'de'),
      W('de rug', { fr: 'le dos', en: 'back' }, 'de'),
      W('de hand', { fr: 'la main', en: 'hand' }, 'de'),
      W('de voet', { fr: 'le pied', en: 'foot' }, 'de'),
      W('de tand', { fr: 'la dent', en: 'tooth' }, 'de'),
      W('de koorts', { fr: 'la fièvre', en: 'fever' }, 'de'),
      W('de hoest', { fr: 'la toux', en: 'cough' }, 'de'),
      W('de dokter', { fr: 'le médecin', en: 'doctor' }, 'de'),
      W('de apotheek', { fr: 'la pharmacie', en: 'pharmacy' }, 'de'),
      W('het medicijn', { fr: 'le médicament', en: 'medicine' }, 'het'),
      W('het voorschrift', { fr: 'l’ordonnance', en: 'prescription' }, 'het'),
      W('de afspraak', { fr: 'le rendez-vous', en: 'appointment' }, 'de'),
      W('de wachtzaal', { fr: 'la salle d’attente', en: 'waiting room' }, 'de'),
      W('het ziekenhuis', { fr: 'l’hôpital', en: 'hospital' }, 'het'),
      W('beter', { fr: 'mieux', en: 'better' }),
      W('slecht', { fr: 'mauvais', en: 'bad' }),
      W('sinds', { fr: 'depuis', en: 'since' }),
      W('voelen', { fr: 'sentir', en: 'to feel' }),
      W('rusten', { fr: 'se reposer', en: 'to rest' }),
      W('langskomen', { fr: 'passer', en: 'to come by' })
    ],
    phrases: [
      P('Ik ben ziek.', { fr: 'Je suis malade.', en: 'I am ill.' }),
      P('Ik voel me niet goed.', { fr: 'Je ne me sens pas bien.', en: 'I do not feel well.' }),
      P('Ik heb pijn aan mijn rug.', { fr: 'J’ai mal au dos.', en: 'My back hurts.' }),
      P('Ik heb koorts sinds gisteren.', { fr: 'J’ai de la fièvre depuis hier.', en: 'I have had a fever since yesterday.' }),
      P('Ik wil graag een afspraak maken.', { fr: 'Je voudrais prendre rendez-vous.', en: 'I would like to make an appointment.' }),
      P('Kan ik vandaag nog langskomen?', { fr: 'Je peux encore passer aujourd’hui ?', en: 'Can I still come by today?' }),
      P('Heeft u een voorschrift nodig?', { fr: 'Vous avez besoin d’une ordonnance ?', en: 'Do you need a prescription? (formal)' }),
      P('Het gaat al wat beter.', { fr: 'Ça va déjà un peu mieux.', en: 'It is already a bit better.' }),
      P('Ik ben allergisch voor noten.', { fr: 'Je suis allergique aux noix.', en: 'I am allergic to nuts.' })
    ]
  });

  U({
    id: 'weekend', n: 12, name: { fr: 'Météo et week-end', en: 'Weather and weekend' }, nlName: 'Weer en weekend', level: 'A1', track: 'beide', icon: '\u{1F326}',
    blurb: { fr: 'La conversation de la machine à café : le temps, le week-end, le foot.', en: 'Coffee-machine conversation: the weather, the weekend, football.' },
    grammar: ['g-perfect-intro'],
    words: [
      W('het weer', { fr: 'le temps (météo)', en: 'weather' }, 'het'),
      W('de regen', { fr: 'la pluie', en: 'rain' }, 'de'),
      W('de zon', { fr: 'le soleil', en: 'sun' }, 'de'),
      W('de wind', { fr: 'le vent', en: 'wind' }, 'de'),
      W('koud', { fr: 'froid', en: 'cold' }),
      W('warm', { fr: 'chaud', en: 'warm / hot' }),
      W('nat', { fr: 'mouillé', en: 'wet' }),
      W('het weekend', { fr: 'le week-end', en: 'weekend' }, 'het'),
      W('het verlof', { fr: 'le congé', en: 'leave' }, 'het'),
      W('het voetbal', { fr: 'le football', en: 'football' }, 'het'),
      W('de match', { fr: 'le match', en: 'match' }, 'de'),
      W('plezant', { fr: 'chouette', en: 'great / fun' }, null),
      W('gezellig', { fr: 'convivial', en: 'cosy / convivial' }, null),
      W('ambetant', { fr: 'embêtant', en: 'annoying' }, null),
      W('amai', { fr: 'oh là là', en: 'wow' }, null),
      W('goesting', { fr: 'l’envie', en: 'desire / urge' }, null),
      W('rustig', { fr: 'calme', en: 'calm / quiet' }),
      W('wandelen', { fr: 'se promener', en: 'to go for a walk' }),
      W('kijken', { fr: 'regarder', en: 'to watch / to look' }),
      W('gedaan', { fr: 'fini', en: 'over / done' }),
      W('niks', { fr: 'rien', en: 'nothing' }, null),
      W('speciaal', { fr: 'spécial', en: 'special' }),
      W('lang', { fr: 'long', en: 'long' }),
      W('volgende', { fr: 'prochain', en: 'next' })
    ],
    phrases: [
      P('Wat een weer!', { fr: 'Quel temps !', en: 'What weather!' }),
      P('Het regent weer.', { fr: 'Il pleut encore.', en: 'It is raining again.' }),
      P('Hoe was uw weekend?', { fr: 'C’était comment, ton week-end ?', en: 'How was your weekend? (informal, Flemish u)' }),
      P('Niks speciaals, en bij u?', { fr: 'Rien de spécial, et toi ?', en: 'Nothing special, and you? (informal, Flemish u)' }),
      P('We hebben gewandeld.', { fr: 'On s’est promenés.', en: 'We went for a walk.' }),
      P('Ik heb de match gezien.', { fr: 'J’ai vu le match.', en: 'I saw the match.' }),
      P('Dat was plezant.', { fr: 'C’était chouette.', en: 'That was great.' }),
      P('Ik heb er geen goesting in.', { fr: 'Je n’ai pas envie.', en: 'I do not feel like it.' }),
      P('Een goed weekend nog!', { fr: 'Bon week-end !', en: 'Have a good weekend!' }),
      P('Tot maandag.', { fr: 'À lundi.', en: 'See you on Monday.' })
    ]
  });
})();
