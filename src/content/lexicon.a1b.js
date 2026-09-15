/* Lexique A1, unités 7 à 12. Même forme que lexicon.a1.js.
   L'unité 8 est écrite pour un développeur Java, pas pour un consultant générique. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const W = (nl, fr, art, be, note) => ({ kind: 'word', nl, fr, art, be, note });
  const P = (nl, fr, be, note) => ({ kind: 'phrase', nl, fr, be, note });
  const U = o => NL.content.units.push(o);

  U({
    id: 'onderweg', n: 7, name: 'En route', nlName: 'Onderweg', level: 'A1', track: 'beide', icon: '\u{1F686}',
    blurb: 'Le trajet : la SNCB, De Lijn, les files, et arriver en retard sans mal s’excuser.',
    grammar: ['g-v2'],
    words: [
      W('de fiets', 'le vélo', 'de'),
      W('de auto', 'la voiture', 'de'),
      W('de trein', 'le train', 'de'),
      W('de bus', 'le bus', 'de'),
      W('de tram', 'le tram', 'de'),
      W('het station', 'la gare', 'het'),
      W('het perron', 'le quai', 'het', 'perron, spoor', 'Emprunté au français, gardé tel quel.'),
      W('het spoor', 'la voie', 'het', null, 'Les annonces disent « spoor 4 ». C’est le chiffre qu’il faut attraper.'),
      W('de halte', 'l’arrêt', 'de'),
      W('de vertraging', 'le retard', 'de', null, 'Tu l’entendras tous les jours : « tien minuten vertraging ».'),
      W('de file', 'l’embouteillage', 'de', null, 'Obsession nationale et sujet de conversation sans risque.'),
      W('het kaartje', 'le ticket', 'het'),
      W('de rit', 'le trajet', 'de'),
      W('vertrekken', 'partir'),
      W('aankomen', 'arriver'),
      W('overstappen', 'changer de train'),
      W('rijden', 'rouler / circuler'),
      W('links', 'à gauche'),
      W('rechts', 'à droite'),
      W('rechtdoor', 'tout droit'),
      W('ver', 'loin'),
      W('dichtbij', 'près'),
      W('de richting', 'la direction', 'de'),
      W('duren', 'durer')
    ],
    phrases: [
      P('Ik neem de trein naar Brussel.', 'Je prends le train pour Bruxelles.'),
      P('De trein heeft tien minuten vertraging.', 'Le train a dix minutes de retard.', null, 'Le néerlandais dit que le train « a » du retard.'),
      P('Op welk spoor?', 'Sur quelle voie ?', 'Op welk spoor?'),
      P('Ik moet overstappen in Dendermonde.', 'Je dois changer à Termonde.'),
      P('Hoe lang duurt het?', 'Ça prend combien de temps ?'),
      P('Ik sta in de file.', 'Je suis dans les files.', null, 'Littéralement « je me tiens dans la file ». Excuse universellement acceptée.'),
      P('Ik kom een beetje later, sorry.', 'Je vais arriver un peu plus tard, désolé.'),
      P('Rijdt deze bus naar Aalst?', 'Ce bus va à Alost ?'),
      P('Is het ver van hier?', 'C’est loin d’ici ?'),
      P('Ga rechtdoor en dan links.', 'Va tout droit puis à gauche.')
    ]
  });

  U({
    id: 'werkbasis', n: 8, name: 'Le travail : la base', nlName: 'Werk: de basis', level: 'A1', track: 'werk', icon: '\u{1F4BB}',
    blurb: 'Le vocabulaire de ta journée chez {bedrijf} : le ticket, le build, le client, la réunion.',
    grammar: ['g-present'],
    words: [
      W('het werk', 'le travail', 'het'),
      W('de collega', 'le collègue', 'de'),
      W('de klant', 'le client', 'de'),
      W('de vergadering', 'la réunion', 'de', 'de meeting, de vergadering', 'Les bureaux flamands disent « meeting » aussi souvent que « vergadering ».'),
      W('het project', 'le projet', 'het'),
      W('de code', 'le code', 'de'),
      W('de test', 'le test', 'de'),
      W('de fout', 'l’erreur', 'de', 'de fout, de bug'),
      W('het probleem', 'le problème', 'het'),
      W('de oplossing', 'la solution', 'de'),
      W('het ticket', 'le ticket', 'het'),
      W('de deadline', 'la deadline', 'de'),
      W('de planning', 'le planning', 'de'),
      W('de omgeving', 'l’environnement', 'de', null, 'test-, acceptatie-, productieomgeving. Mot de tous les jours chez un dev.'),
      W('de databank', 'la base de données', 'de', 'databank, database', 'La Flandre dit volontiers « databank » là où le nord dit « database ».'),
      W('de server', 'le serveur', 'de'),
      W('de mail', 'le mail', 'de', 'de mail, het mailtje'),
      W('het verslag', 'le compte rendu', 'het'),
      W('het thuiswerk', 'le télétravail', 'het', 'telewerk, thuiswerk'),
      W('het kantoor', 'le bureau', 'het'),
      W('de afspraak', 'le rendez-vous', 'de'),
      W('klaar', 'prêt / terminé'),
      W('bezig', 'en cours', null, null, '« Ik ben ermee bezig » est LA réponse à « c’est fini ? »'),
      W('dringend', 'urgent'),
      W('sturen', 'envoyer'),
      W('uitleggen', 'expliquer'),
      W('oplossen', 'résoudre'),
      W('draaien', 'tourner / s’exécuter'),
      W('afwerken', 'terminer')
    ],
    phrases: [
      P('Ik werk bij {bedrijf}.', 'Je travaille chez {bedrijf}.'),
      P('Ik ben Java-ontwikkelaar.', 'Je suis développeur Java.', null, '« ontwikkelaar » ou simplement « developer » : les deux passent.'),
      P('Ik werk aan een project voor een klant.', 'Je travaille sur un projet pour un client.'),
      P('Ik heb een vergadering om tien uur.', 'J’ai une réunion à dix heures.'),
      P('Ik werk vandaag van thuis.', 'Je travaille de chez moi aujourd’hui.'),
      P('Ik stuur u een mail.', 'Je vous envoie un mail.', null, 'Le présent suffit pour un futur proche : pas besoin de « zal ».'),
      P('Ik ben er nog mee bezig.', 'J’y travaille encore.', null, 'La phrase de statut la plus utile de toute ta journée.'),
      P('Dat is klaar.', 'C’est terminé.'),
      P('Kunt u dat even uitleggen?', 'Pouvez-vous expliquer ça rapidement ?', 'Kunde da is uitleggen?', '« Even » adoucit toute demande. Sans lui, tu sonnes sec.'),
      P('De testen draaien nog.', 'Les tests tournent encore.'),
      P('Sorry, mijn Nederlands is nog niet zo goed.', 'Désolé, mon néerlandais n’est pas encore très bon.', null, 'Dis-le en réunion : les collègues flamands aident au lieu de basculer.')
    ]
  });

  U({
    id: 'dedag', n: 9, name: 'La journée', nlName: 'De dag', level: 'A1', track: 'beide', icon: '\u{23F0}',
    blurb: 'Ta routine, et les verbes qui se cassent en deux quand tu les utilises.',
    grammar: ['g-scheidbaar'],
    words: [
      W('opstaan', 'se lever', null, null, 'Se sépare : ik sta om zes uur op.'),
      W('ontbijten', 'déjeuner (le matin)', null, null, 'En Belgique on déjeune le matin, on dîne à midi, on soupe le soir.'),
      W('vertrekken', 'partir'),
      W('thuiskomen', 'rentrer', null, null, 'Se sépare : ik kom om zes uur thuis.'),
      W('meenemen', 'emporter', null, null, 'Se sépare : ik neem mijn laptop mee.'),
      W('afspreken', 'convenir d’un rendez-vous', null, null, 'Se sépare : we spreken morgen af.'),
      W('opbellen', 'téléphoner', null, 'bellen, opbellen'),
      W('uitleggen', 'expliquer'),
      W('slapen', 'dormir'),
      W('eten', 'manger'),
      W('drinken', 'boire'),
      W('douchen', 'se doucher'),
      W('koken', 'cuisiner'),
      W('wandelen', 'se promener'),
      W('de voormiddag', 'la matinée', 'de', null, 'La Flandre découpe la journée autrement : voormiddag, namiddag, avond.'),
      W('de namiddag', 'l’après-midi', 'de'),
      W('de avond', 'le soir', 'de'),
      W('moe', 'fatigué'),
      W('druk', 'chargé / occupé'),
      W('altijd', 'toujours'),
      W('soms', 'parfois'),
      W('nooit', 'jamais'),
      W('meestal', 'la plupart du temps'),
      W('eerst', 'd’abord'),
      W('daarna', 'ensuite')
    ],
    phrases: [
      P('Ik sta om zes uur op.', 'Je me lève à six heures.', null, 'Le « op » part tout à la fin. C’est la forme même du néerlandais.'),
      P('Ik vertrek om kwart voor acht.', 'Je pars à huit heures moins le quart.'),
      P('Ik neem mijn laptop mee.', 'J’emporte mon portable.'),
      P('Ik kom om zes uur thuis.', 'Je rentre à six heures.'),
      P('We spreken morgen af.', 'On se donne rendez-vous demain.'),
      P('Eerst werk ik, daarna kook ik.', 'D’abord je travaille, ensuite je cuisine.', null, 'Commence par autre chose que le sujet et le verbe reste quand même en deuxième position.'),
      P('Het was een drukke dag.', 'C’était une journée chargée.'),
      P('Ik ben moe.', 'Je suis fatigué.'),
      P('Wat doe je meestal in het weekend?', 'Qu’est-ce que tu fais d’habitude le week-end ?')
    ]
  });

  U({
    id: 'winkel', n: 10, name: 'Courses et argent', nlName: 'Winkelen en geld', level: 'A1', track: 'leven', icon: '\u{1F6D2}',
    blurb: 'Le Colruyt, la caisse, le terminal Bancontact, et demander une autre taille.',
    grammar: ['g-getallen'],
    words: [
      W('de winkel', 'le magasin', 'de'),
      W('de kassa', 'la caisse', 'de'),
      W('het geld', 'l’argent', 'het'),
      W('de euro', 'l’euro', 'de'),
      W('de kaart', 'la carte', 'de', 'bancontact', 'En Belgique la carte de débit, c’est « Bancontact » — le mot écrit sur le terminal.'),
      W('cash', 'en liquide'),
      W('de korting', 'la réduction', 'de'),
      W('de bon', 'le ticket de caisse', 'de', 'het kasticket, de bon'),
      W('het zakje', 'le sachet', 'het', null, 'Diminutif en -je, donc het.'),
      W('de winkelkar', 'le caddie', 'de', 'winkelkar, caddie'),
      W('de maat', 'la taille', 'de'),
      W('de kleur', 'la couleur', 'de'),
      W('duur', 'cher'),
      W('goedkoop', 'bon marché'),
      W('gratis', 'gratuit'),
      W('kopen', 'acheter'),
      W('betalen', 'payer'),
      W('ruilen', 'échanger'),
      W('passen', 'essayer / aller'),
      W('zoeken', 'chercher'),
      W('vinden', 'trouver'),
      W('open', 'ouvert'),
      W('gesloten', 'fermé', null, 'toe, gesloten', 'Sur une porte, souvent juste « toe ».'),
      W('genoeg', 'assez')
    ],
    phrases: [
      P('Hoeveel kost dat?', 'Ça coûte combien ?'),
      P('Kan ik met de kaart betalen?', 'Je peux payer par carte ?', 'Kan ik met bancontact betalen?'),
      P('Mag ik een zakje, alstublieft?', 'Puis-je avoir un sachet, s’il vous plaît ?'),
      P('Heeft u dat in een andere maat?', 'Vous avez ça dans une autre taille ?'),
      P('Dat is te duur voor mij.', 'C’est trop cher pour moi.'),
      P('Ik ben op zoek naar brood.', 'Je cherche du pain.'),
      P('Waar is de kassa?', 'Où est la caisse ?'),
      P('Tot hoe laat zijn jullie open?', 'Vous êtes ouverts jusqu’à quelle heure ?'),
      P('Ik kijk alleen even, merci.', 'Je regarde juste, merci.', null, 'La façon polie d’échapper à un vendeur serviable.')
    ]
  });

  U({
    id: 'dokter', n: 11, name: 'Le corps et le médecin', nlName: 'Lichaam en dokter', level: 'A1', track: 'leven', icon: '\u{1FA7A}',
    blurb: 'Prendre rendez-vous chez le huisarts et dire ce qui fait mal, sans passer au français.',
    grammar: ['g-dehet'],
    words: [
      W('ziek', 'malade'),
      W('de pijn', 'la douleur', 'de'),
      W('het hoofd', 'la tête', 'het'),
      W('de keel', 'la gorge', 'de'),
      W('de buik', 'le ventre', 'de'),
      W('de rug', 'le dos', 'de'),
      W('de hand', 'la main', 'de'),
      W('de voet', 'le pied', 'de'),
      W('de tand', 'la dent', 'de'),
      W('de koorts', 'la fièvre', 'de'),
      W('de hoest', 'la toux', 'de'),
      W('de dokter', 'le médecin', 'de', 'de dokter, de huisarts'),
      W('de apotheek', 'la pharmacie', 'de'),
      W('het medicijn', 'le médicament', 'het', 'medicijn, medicament'),
      W('het voorschrift', 'l’ordonnance', 'het', null, 'Mot flamand. Le nord dit « recept ».'),
      W('de afspraak', 'le rendez-vous', 'de'),
      W('de wachtzaal', 'la salle d’attente', 'de'),
      W('het ziekenhuis', 'l’hôpital', 'het'),
      W('beter', 'mieux'),
      W('slecht', 'mauvais'),
      W('sinds', 'depuis'),
      W('voelen', 'sentir'),
      W('rusten', 'se reposer'),
      W('langskomen', 'passer')
    ],
    phrases: [
      P('Ik ben ziek.', 'Je suis malade.'),
      P('Ik voel me niet goed.', 'Je ne me sens pas bien.'),
      P('Ik heb pijn aan mijn rug.', 'J’ai mal au dos.', null, 'Le néerlandais dit « douleur à mon dos », comme le français.'),
      P('Ik heb koorts sinds gisteren.', 'J’ai de la fièvre depuis hier.', null, 'Présent avec « sinds », comme en français.'),
      P('Ik wil graag een afspraak maken.', 'Je voudrais prendre rendez-vous.'),
      P('Kan ik vandaag nog langskomen?', 'Je peux encore passer aujourd’hui ?'),
      P('Heeft u een voorschrift nodig?', 'Vous avez besoin d’une ordonnance ?'),
      P('Het gaat al wat beter.', 'Ça va déjà un peu mieux.'),
      P('Ik ben allergisch voor noten.', 'Je suis allergique aux noix.')
    ]
  });

  U({
    id: 'weekend', n: 12, name: 'Météo et week-end', nlName: 'Weer en weekend', level: 'A1', track: 'beide', icon: '\u{1F326}',
    blurb: 'La conversation de la machine à café : le temps, le week-end, le foot.',
    grammar: ['g-perfect-intro'],
    words: [
      W('het weer', 'le temps (météo)', 'het'),
      W('de regen', 'la pluie', 'de'),
      W('de zon', 'le soleil', 'de'),
      W('de wind', 'le vent', 'de'),
      W('koud', 'froid'),
      W('warm', 'chaud'),
      W('nat', 'mouillé'),
      W('het weekend', 'le week-end', 'het'),
      W('het verlof', 'le congé', 'het', 'verlof, vakantie', 'Au travail on prend « verlof » ; les enfants ont « vakantie ».'),
      W('het voetbal', 'le football', 'het'),
      W('de match', 'le match', 'de', 'de match, de wedstrijd', 'La Flandre dit « match » ; le nord dit « wedstrijd ».'),
      W('plezant', 'chouette', null, 'plezant, tof', 'Vient du français « plaisant ». Le nord dit « leuk ». L’utiliser te fait sonner d’ici tout de suite.'),
      W('gezellig', 'convivial', null, null, 'Aucun équivalent exact. La chaleur d’être bien ensemble.'),
      W('ambetant', 'embêtant', null, null, 'Vient tout droit du français « embêtant ». Le nord dirait « vervelend ».'),
      W('amai', 'oh là là', null, null, 'Le mot le plus flamand qui soit. Surprise, compassion, admiration.'),
      W('goesting', 'l’envie', null, null, 'L’équivalent flamand de « zin ». « Ik heb er geen goesting in » = je n’ai pas envie.'),
      W('rustig', 'calme'),
      W('wandelen', 'se promener'),
      W('kijken', 'regarder'),
      W('gedaan', 'fini'),
      W('niks', 'rien', null, 'niks, niets'),
      W('speciaal', 'spécial'),
      W('lang', 'long'),
      W('volgende', 'prochain')
    ],
    phrases: [
      P('Wat een weer!', 'Quel temps !', 'Amai, wat een weer!', 'Toujours disponible, jamais déplacé, ouvre n’importe quelle conversation.'),
      P('Het regent weer.', 'Il pleut encore.'),
      P('Hoe was uw weekend?', 'C’était comment, ton week-end ?', 'En, hoe was ’t weekend?', 'On te le demandera tous les lundis. Prépare une réponse.'),
      P('Niks speciaals, en bij u?', 'Rien de spécial, et toi ?', null, 'Réponse complète et naturelle. Renvoyer la question est attendu.'),
      P('We hebben gewandeld.', 'On s’est promenés.', null, 'Ton premier passé composé : hebben plus le participe à la fin.'),
      P('Ik heb de match gezien.', 'J’ai vu le match.'),
      P('Dat was plezant.', 'C’était chouette.'),
      P('Ik heb er geen goesting in.', 'Je n’ai pas envie.', null, 'Typiquement flamand. Utilise-le et les gens sourient.'),
      P('Een goed weekend nog!', 'Bon week-end !', null, 'Le vendredi après-midi. Le « nog » n’est pas optionnel.'),
      P('Tot maandag!', 'À lundi !')
    ]
  });
})();
