/* Lexique A1, unités 7 à 12. Même forme que lexicon.a1.js.
   L'unité 8 est écrite pour un développeur Java, pas pour un consultant générique. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const W = (nl, g, art, be, note) => ({ kind: 'word', nl, ...NL.gloss.pair(g), art, be, note });
  const P = (nl, g, be, note) => ({ kind: 'phrase', nl, ...NL.gloss.pair(g), be, note });
  const U = o => NL.content.units.push(o);

  U({
    id: 'onderweg', n: 7, name: { fr: 'En route', en: 'On the way' }, nlName: 'Onderweg', level: 'A1', track: 'beide', icon: '\u{1F686}',
    blurb: { fr: 'Le trajet : la SNCB, De Lijn, les files, et arriver en retard sans mal s’excuser.', en: 'The commute: the railway, De Lijn buses, traffic jams, and arriving late without apologising badly.' },
    grammar: ['g-v2'],
    words: [
      W('de fiets', { fr: 'le vélo', en: 'bicycle' }, 'de'),
      W('de auto', { fr: 'la voiture', en: 'car' }, 'de'),
      W('de trein', { fr: 'le train', en: 'train' }, 'de'),
      W('de bus', { fr: 'le bus', en: 'bus' }, 'de'),
      W('de tram', { fr: 'le tram', en: 'tram' }, 'de'),
      W('het station', { fr: 'la gare', en: 'station' }, 'het'),
      W('het perron', { fr: 'le quai', en: 'platform' }, 'het', 'perron, spoor', { fr: 'Emprunté au français, gardé tel quel.', en: 'Borrowed from French, kept as it is.' }),
      W('het spoor', { fr: 'la voie', en: 'track' }, 'het', null, { fr: 'Les annonces disent « spoor 4 ». C’est le chiffre qu’il faut attraper.', en: 'The announcements say “spoor 4”. The number is what you need to catch.' }),
      W('de halte', { fr: 'l’arrêt', en: 'stop' }, 'de'),
      W('de vertraging', { fr: 'le retard', en: 'delay' }, 'de', null, { fr: 'Tu l’entendras tous les jours : « tien minuten vertraging ».', en: 'You will hear it every day: “tien minuten vertraging”.' }),
      W('de file', { fr: 'l’embouteillage', en: 'traffic jam' }, 'de', null, { fr: 'Obsession nationale et sujet de conversation sans risque.', en: 'A national obsession and a safe topic of conversation.' }),
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
      P('De trein heeft tien minuten vertraging.', { fr: 'Le train a dix minutes de retard.', en: 'The train is ten minutes late.' }, null, { fr: 'Le néerlandais dit que le train « a » du retard.', en: 'Dutch says the train “has” ten minutes of delay.' }),
      P('Op welk spoor?', { fr: 'Sur quelle voie ?', en: 'Which track?' }, 'Op welk spoor?'),
      P('Ik moet overstappen in Dendermonde.', { fr: 'Je dois changer à Termonde.', en: 'I have to change at Dendermonde.' }),
      P('Hoe lang duurt het?', { fr: 'Ça prend combien de temps ?', en: 'How long does it take?' }),
      P('Ik sta in de file.', { fr: 'Je suis dans les files.', en: 'I am stuck in traffic.' }, null, { fr: 'Littéralement « je me tiens dans la file ». Excuse universellement acceptée.', en: 'Literally “I stand in the queue”. A universally accepted excuse.' }),
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
      W('de vergadering', { fr: 'la réunion', en: 'meeting' }, 'de', 'de meeting, de vergadering', { fr: 'Les bureaux flamands disent « meeting » aussi souvent que « vergadering ».', en: 'Flemish offices say “meeting” as often as “vergadering”.' }),
      W('het project', { fr: 'le projet', en: 'project' }, 'het'),
      W('de code', { fr: 'le code', en: 'code' }, 'de'),
      W('de test', { fr: 'le test', en: 'test' }, 'de'),
      W('de fout', { fr: 'l’erreur', en: 'error' }, 'de', 'de fout, de bug'),
      W('het probleem', { fr: 'le problème', en: 'problem' }, 'het'),
      W('de oplossing', { fr: 'la solution', en: 'solution' }, 'de'),
      W('het ticket', { fr: 'le ticket', en: 'ticket' }, 'het'),
      W('de deadline', { fr: 'la deadline', en: 'deadline' }, 'de'),
      W('de planning', { fr: 'le planning', en: 'schedule' }, 'de'),
      W('de omgeving', { fr: 'l’environnement', en: 'environment' }, 'de', null, { fr: 'test-, acceptatie-, productieomgeving. Mot de tous les jours chez un dev.', en: 'test-, acceptatie-, productieomgeving. An everyday word for a developer.' }),
      W('de databank', { fr: 'la base de données', en: 'database' }, 'de', 'databank, database', { fr: 'La Flandre dit volontiers « databank » là où le nord dit « database ».', en: 'Flanders is happy to say “databank” where the north says “database”.' }),
      W('de server', { fr: 'le serveur', en: 'server' }, 'de'),
      W('de mail', { fr: 'le mail', en: 'email' }, 'de', 'de mail, het mailtje'),
      W('het verslag', { fr: 'le compte rendu', en: 'report' }, 'het'),
      W('het thuiswerk', { fr: 'le télétravail', en: 'working from home' }, 'het', 'telewerk, thuiswerk'),
      W('het kantoor', { fr: 'le bureau', en: 'office' }, 'het'),
      W('de afspraak', { fr: 'le rendez-vous', en: 'appointment' }, 'de'),
      W('klaar', { fr: 'prêt / terminé', en: 'ready / finished' }),
      W('bezig', { fr: 'en cours', en: 'in progress' }, null, null, { fr: '« Ik ben ermee bezig » est LA réponse à « c’est fini ? »', en: '“Ik ben ermee bezig” is THE answer to “is it done?”' }),
      W('dringend', { fr: 'urgent', en: 'urgent' }),
      W('sturen', { fr: 'envoyer', en: 'to send' }),
      W('uitleggen', { fr: 'expliquer', en: 'to explain' }),
      W('oplossen', { fr: 'résoudre', en: 'to solve' }),
      W('draaien', { fr: 'tourner / s’exécuter', en: 'to turn / to run (of software)' }),
      W('afwerken', { fr: 'terminer', en: 'to finish off' })
    ],
    phrases: [
      P('Ik werk bij {bedrijf}.', { fr: 'Je travaille chez {bedrijf}.', en: 'I work at {bedrijf}.' }),
      P('Ik ben Java-ontwikkelaar.', { fr: 'Je suis développeur Java.', en: 'I am a Java developer.' }, null, { fr: '« ontwikkelaar » ou simplement « developer » : les deux passent.', en: '“ontwikkelaar” or simply “developer”: both are fine.' }),
      P('Ik werk aan een project voor een klant.', { fr: 'Je travaille sur un projet pour un client.', en: 'I am working on a project for a client.' }),
      P('Ik heb een vergadering om tien uur.', { fr: 'J’ai une réunion à dix heures.', en: 'I have a meeting at ten o’clock.' }),
      P('Ik werk vandaag van thuis.', { fr: 'Je travaille de chez moi aujourd’hui.', en: 'I am working from home today.' }),
      P('Ik stuur u een mail.', { fr: 'Je vous envoie un mail.', en: 'I will send you an email. (formal)' }, null, { fr: 'Le présent suffit pour un futur proche : pas besoin de « zal ».', en: 'The present tense is enough for the near future: no need for “zal”.' }),
      P('Ik ben er nog mee bezig.', { fr: 'J’y travaille encore.', en: 'I am still working on it.' }, null, { fr: 'La phrase de statut la plus utile de toute ta journée.', en: 'The most useful status sentence of your whole day.' }),
      P('Dat is klaar.', { fr: 'C’est terminé.', en: 'That is finished.' }),
      P('Kunt u dat even uitleggen?', { fr: 'Pouvez-vous expliquer ça rapidement ?', en: 'Could you quickly explain that? (formal)' }, 'Kunde da is uitleggen?', { fr: '« Even » adoucit toute demande. Sans lui, tu sonnes sec.', en: '“Even” softens any request. Without it, you sound curt.' }),
      P('De testen draaien nog.', { fr: 'Les tests tournent encore.', en: 'The tests are still running.' }),
      P('Sorry, mijn Nederlands is nog niet zo goed.', { fr: 'Désolé, mon néerlandais n’est pas encore très bon.', en: 'Sorry, my Dutch is not very good yet.' }, null, { fr: 'Dis-le en réunion : les collègues flamands aident au lieu de basculer.', en: 'Say it in a meeting: Flemish colleagues help instead of switching language.' })
    ]
  });

  U({
    id: 'dedag', n: 9, name: { fr: 'La journée', en: 'The day' }, nlName: 'De dag', level: 'A1', track: 'beide', icon: '\u{23F0}',
    blurb: { fr: 'Ta routine, et les verbes qui se cassent en deux quand tu les utilises.', en: 'Your routine, and the verbs that break in two when you use them.' },
    grammar: ['g-scheidbaar'],
    words: [
      W('opstaan', { fr: 'se lever', en: 'to get up' }, null, null, { fr: 'Se sépare : ik sta om zes uur op.', en: 'Separable: ik sta om zes uur op.' }),
      W('ontbijten', { fr: 'déjeuner (le matin)', en: 'to have breakfast' }, null, null, { fr: 'En Belgique on déjeune le matin, on dîne à midi, on soupe le soir.', en: null }),
      W('vertrekken', { fr: 'partir', en: 'to leave' }),
      W('thuiskomen', { fr: 'rentrer', en: 'to come home' }, null, null, { fr: 'Se sépare : ik kom om zes uur thuis.', en: 'Separable: ik kom om zes uur thuis.' }),
      W('meenemen', { fr: 'emporter', en: 'to take along' }, null, null, { fr: 'Se sépare : ik neem mijn laptop mee.', en: 'Separable: ik neem mijn laptop mee.' }),
      W('afspreken', { fr: 'convenir d’un rendez-vous', en: 'to arrange to meet' }, null, null, { fr: 'Se sépare : we spreken morgen af.', en: 'Separable: we spreken morgen af.' }),
      W('opbellen', { fr: 'téléphoner', en: 'to phone' }, null, 'bellen, opbellen'),
      W('uitleggen', { fr: 'expliquer', en: 'to explain' }),
      W('slapen', { fr: 'dormir', en: 'to sleep' }),
      W('eten', { fr: 'manger', en: 'to eat' }),
      W('drinken', { fr: 'boire', en: 'to drink' }),
      W('douchen', { fr: 'se doucher', en: 'to shower' }),
      W('koken', { fr: 'cuisiner', en: 'to cook' }),
      W('wandelen', { fr: 'se promener', en: 'to go for a walk' }),
      W('de voormiddag', { fr: 'la matinée', en: 'morning' }, 'de', null, { fr: 'La Flandre découpe la journée autrement : voormiddag, namiddag, avond.', en: 'Flanders divides the day differently: voormiddag, namiddag, avond.' }),
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
      P('Ik sta om zes uur op.', { fr: 'Je me lève à six heures.', en: 'I get up at six o’clock.' }, null, { fr: 'Le « op » part tout à la fin. C’est la forme même du néerlandais.', en: 'The “op” goes right to the end. That is the very shape of Dutch.' }),
      P('Ik vertrek om kwart voor acht.', { fr: 'Je pars à huit heures moins le quart.', en: 'I leave at a quarter to eight.' }),
      P('Ik neem mijn laptop mee.', { fr: 'J’emporte mon portable.', en: 'I am taking my laptop.' }),
      P('Ik kom om zes uur thuis.', { fr: 'Je rentre à six heures.', en: 'I come home at six o’clock.' }),
      P('We spreken morgen af.', { fr: 'On se donne rendez-vous demain.', en: 'We are meeting tomorrow.' }),
      P('Eerst werk ik, daarna kook ik.', { fr: 'D’abord je travaille, ensuite je cuisine.', en: 'First I work, then I cook.' }, null, { fr: 'Commence par autre chose que le sujet et le verbe reste quand même en deuxième position.', en: 'Start with something other than the subject and the verb still stays in second position.' }),
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
      W('de kaart', { fr: 'la carte', en: 'card' }, 'de', 'bancontact', { fr: 'En Belgique la carte de débit, c’est « Bancontact » — le mot écrit sur le terminal.', en: 'In Belgium the debit card is “Bancontact”: the word written on the terminal.' }),
      W('cash', { fr: 'en liquide', en: 'cash' }),
      W('de korting', { fr: 'la réduction', en: 'discount' }, 'de'),
      W('de bon', { fr: 'le ticket de caisse', en: 'receipt' }, 'de', 'het kasticket, de bon'),
      W('het zakje', { fr: 'le sachet', en: 'small bag' }, 'het', null, { fr: 'Diminutif en -je, donc het.', en: 'Diminutive in -je, so het.' }),
      W('de winkelkar', { fr: 'le caddie', en: 'shopping trolley' }, 'de', 'winkelkar, caddie'),
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
      W('gesloten', { fr: 'fermé', en: 'closed' }, null, 'toe, gesloten', { fr: 'Sur une porte, souvent juste « toe ».', en: 'On a door, often just “toe”.' }),
      W('genoeg', { fr: 'assez', en: 'enough' })
    ],
    phrases: [
      P('Hoeveel kost dat?', { fr: 'Ça coûte combien ?', en: 'How much does that cost?' }),
      P('Kan ik met de kaart betalen?', { fr: 'Je peux payer par carte ?', en: 'Can I pay by card?' }, 'Kan ik met bancontact betalen?'),
      P('Mag ik een zakje, alstublieft?', { fr: 'Puis-je avoir un sachet, s’il vous plaît ?', en: 'May I have a bag, please? (formal)' }),
      P('Heeft u dat in een andere maat?', { fr: 'Vous avez ça dans une autre taille ?', en: 'Do you have that in another size? (formal)' }),
      P('Dat is te duur voor mij.', { fr: 'C’est trop cher pour moi.', en: 'That is too expensive for me.' }),
      P('Ik ben op zoek naar brood.', { fr: 'Je cherche du pain.', en: 'I am looking for bread.' }),
      P('Waar is de kassa?', { fr: 'Où est la caisse ?', en: 'Where is the checkout?' }),
      P('Tot hoe laat zijn jullie open?', { fr: 'Vous êtes ouverts jusqu’à quelle heure ?', en: 'Until what time are you open? (informal)' }),
      P('Ik kijk alleen even, merci.', { fr: 'Je regarde juste, merci.', en: 'I am just looking, thanks.' }, null, { fr: 'La façon polie d’échapper à un vendeur serviable.', en: 'The polite way to escape a helpful shop assistant.' })
    ]
  });

  U({
    id: 'dokter', n: 11, name: { fr: 'Le corps et le médecin', en: 'The body and the doctor' }, nlName: 'Lichaam en dokter', level: 'A1', track: 'leven', icon: '\u{1FA7A}',
    blurb: { fr: 'Prendre rendez-vous chez le huisarts et dire ce qui fait mal, sans passer au français.', en: 'Making an appointment at the huisarts and saying what hurts, without switching to French.' },
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
      W('de dokter', { fr: 'le médecin', en: 'doctor' }, 'de', 'de dokter, de huisarts'),
      W('de apotheek', { fr: 'la pharmacie', en: 'pharmacy' }, 'de'),
      W('het medicijn', { fr: 'le médicament', en: 'medicine' }, 'het', 'medicijn, medicament'),
      W('het voorschrift', { fr: 'l’ordonnance', en: 'prescription' }, 'het', null, { fr: 'Mot flamand. Le nord dit « recept ».', en: 'A Flemish word. The north says “recept”.' }),
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
      P('Ik heb pijn aan mijn rug.', { fr: 'J’ai mal au dos.', en: 'My back hurts.' }, null, { fr: 'Le néerlandais dit « douleur à mon dos », comme le français.', en: null }),
      P('Ik heb koorts sinds gisteren.', { fr: 'J’ai de la fièvre depuis hier.', en: 'I have had a fever since yesterday.' }, null, { fr: 'Présent avec « sinds », comme en français.', en: 'Dutch uses the present tense with “sinds”: literally “I have fever since yesterday”.' }),
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
      W('het verlof', { fr: 'le congé', en: 'leave' }, 'het', 'verlof, vakantie', { fr: 'Au travail on prend « verlof » ; les enfants ont « vakantie ».', en: 'At work you take “verlof”; children have “vakantie”.' }),
      W('het voetbal', { fr: 'le football', en: 'football' }, 'het'),
      W('de match', { fr: 'le match', en: 'match' }, 'de', 'de match, de wedstrijd', { fr: 'La Flandre dit « match » ; le nord dit « wedstrijd ».', en: 'Flanders says “match”; the north says “wedstrijd”.' }),
      W('plezant', { fr: 'chouette', en: 'great / fun' }, null, 'plezant, tof', { fr: 'Vient du français « plaisant ». Le nord dit « leuk ». L’utiliser te fait sonner d’ici tout de suite.', en: 'Comes from French “plaisant”. The north says “leuk”. Using it makes you sound local straight away.' }),
      W('gezellig', { fr: 'convivial', en: 'cosy / convivial' }, null, null, { fr: 'Aucun équivalent exact. La chaleur d’être bien ensemble.', en: 'No exact equivalent. The warmth of being comfortable together.' }),
      W('ambetant', { fr: 'embêtant', en: 'annoying' }, null, null, { fr: 'Vient tout droit du français « embêtant ». Le nord dirait « vervelend ».', en: 'Comes straight from French “embêtant”. The north would say “vervelend”.' }),
      W('amai', { fr: 'oh là là', en: 'wow' }, null, null, { fr: 'Le mot le plus flamand qui soit. Surprise, compassion, admiration.', en: 'The most Flemish word there is. Surprise, sympathy, admiration.' }),
      W('goesting', { fr: 'l’envie', en: 'desire / urge' }, null, null, { fr: 'L’équivalent flamand de « zin ». « Ik heb er geen goesting in » = je n’ai pas envie.', en: 'The Flemish equivalent of “zin”. “Ik heb er geen goesting in” = I do not feel like it.' }),
      W('rustig', { fr: 'calme', en: 'calm' }),
      W('wandelen', { fr: 'se promener', en: 'to go for a walk' }),
      W('kijken', { fr: 'regarder', en: 'to watch / to look' }),
      W('gedaan', { fr: 'fini', en: 'over / done' }),
      W('niks', { fr: 'rien', en: 'nothing' }, null, 'niks, niets'),
      W('speciaal', { fr: 'spécial', en: 'special' }),
      W('lang', { fr: 'long', en: 'long' }),
      W('volgende', { fr: 'prochain', en: 'next' })
    ],
    phrases: [
      P('Wat een weer!', { fr: 'Quel temps !', en: 'What weather!' }, 'Amai, wat een weer!', { fr: 'Toujours disponible, jamais déplacé, ouvre n’importe quelle conversation.', en: 'Always available, never out of place, opens any conversation.' }),
      P('Het regent weer.', { fr: 'Il pleut encore.', en: 'It is raining again.' }),
      P('Hoe was uw weekend?', { fr: 'C’était comment, ton week-end ?', en: 'How was your weekend? (formal)' }, 'En, hoe was ’t weekend?', { fr: 'On te le demandera tous les lundis. Prépare une réponse.', en: 'You will be asked every Monday. Have an answer ready.' }),
      P('Niks speciaals, en bij u?', { fr: 'Rien de spécial, et toi ?', en: 'Nothing special, and you? (formal)' }, null, { fr: 'Réponse complète et naturelle. Renvoyer la question est attendu.', en: 'A complete, natural answer. Asking back is expected.' }),
      P('We hebben gewandeld.', { fr: 'On s’est promenés.', en: 'We went for a walk.' }, null, { fr: 'Ton premier passé composé : hebben plus le participe à la fin.', en: 'Your first perfect tense: hebben plus the participle at the end.' }),
      P('Ik heb de match gezien.', { fr: 'J’ai vu le match.', en: 'I saw the match.' }),
      P('Dat was plezant.', { fr: 'C’était chouette.', en: 'That was great.' }),
      P('Ik heb er geen goesting in.', { fr: 'Je n’ai pas envie.', en: 'I do not feel like it.' }, null, { fr: 'Typiquement flamand. Utilise-le et les gens sourient.', en: 'Typically Flemish. Use it and people smile.' }),
      P('Een goed weekend nog!', { fr: 'Bon week-end !', en: 'Have a good weekend!' }, null, { fr: 'Le vendredi après-midi. Le « nog » n’est pas optionnel.', en: 'Friday afternoon. The “nog” is not optional.' }),
      P('Tot maandag!', { fr: 'À lundi !', en: 'See you Monday!' })
    ]
  });
})();
