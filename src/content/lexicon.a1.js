/* Lexique A1, unités 1 à 6.
   nl = néerlandais standard, ce que tu écris dans un mail au travail.
   fr = français de Belgique (septante, nonante).
   be = ce qu'on dit vraiment en Brabant flamand. Produis le nl, comprends le be. Il s'écrit
        dans src/content/be.js, sous le nl.
   note = ce qu'un manuel ne dit jamais. Elle s'écrit dans src/content/notes.js, sous le nl. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const W = (nl, g, art) => ({ kind: 'word', nl, ...NL.gloss.pair(g), art });
  const P = (nl, g) => ({ kind: 'phrase', nl, ...NL.gloss.pair(g) });
  const U = o => NL.content.units.push(o);

  U({
    id: 'overleven', n: 1, name: { fr: 'Survivre', en: 'Survival' }, nlName: 'Overleven', level: 'A1', track: 'leven', icon: '\u{1F9ED}',
    blurb: { fr: 'Les phrases qui gardent la conversation en néerlandais au lieu de la laisser basculer en français.', en: 'The phrases that keep the conversation in Dutch instead of letting it switch to French or English.' },
    grammar: ['g-v2'],
    words: [
      W('hallo', { fr: 'bonjour', en: 'hello' }, null),
      W('goeiedag', { fr: 'bonjour', en: 'good day' }, null),
      W('dag', { fr: 'salut', en: 'hi / bye' }, null),
      W('tot ziens', { fr: 'au revoir', en: 'goodbye' }, null),
      W('alstublieft', { fr: 's’il vous plaît / voilà', en: 'please / here you are' }, null),
      W('dank u wel', { fr: 'merci', en: 'thank you (formal)' }, null),
      W('sorry', { fr: 'pardon', en: 'sorry' }),
      W('ja', { fr: 'oui', en: 'yes' }, null),
      W('nee', { fr: 'non', en: 'no' }, null),
      W('misschien', { fr: 'peut-être', en: 'perhaps' }),
      W('graag', { fr: 'volontiers', en: 'gladly' }, null),
      W('goed', { fr: 'bien', en: 'good / well' }),
      W('niet', { fr: 'ne... pas', en: 'not' }),
      W('een beetje', { fr: 'un peu', en: 'a little' }, null),
      W('nog eens', { fr: 'encore une fois', en: 'once more / again' }, null),
      W('trager', { fr: 'plus lentement', en: 'more slowly' }, null),
      W('verstaan', { fr: 'comprendre', en: 'to understand' }, null),
      W('herhalen', { fr: 'répéter', en: 'to repeat' }),
      W('betekenen', { fr: 'signifier', en: 'to mean' }),
      W('proberen', { fr: 'essayer', en: 'to try' }),
      W('spreken', { fr: 'parler', en: 'to speak' }),
      W('leren', { fr: 'apprendre', en: 'to learn' }),
      W('zeggen', { fr: 'dire', en: 'to say' }),
      W('helpen', { fr: 'aider', en: 'to help' }),
      W('natuurlijk', { fr: 'bien sûr', en: 'of course' }, null),
      W('geen probleem', { fr: 'pas de problème', en: 'no problem' }, null)
    ],
    phrases: [
      P('Ik ben Nederlands aan het leren.', { fr: 'J’apprends le néerlandais.', en: 'I am learning Dutch.' }),
      P('Mag ik het in het Nederlands proberen?', { fr: 'Puis-je essayer en néerlandais ?', en: 'May I try in Dutch?' }),
      P('Kunt u wat trager spreken, alstublieft?', { fr: 'Pouvez-vous parler un peu plus lentement, s’il vous plaît ?', en: 'Could you speak a little more slowly, please? (formal)' }),
      P('Sorry, ik heb dat niet verstaan.', { fr: 'Pardon, je n’ai pas compris.', en: 'Sorry, I did not understand that.' }),
      P('Kunt u dat herhalen?', { fr: 'Pouvez-vous répéter ?', en: 'Could you repeat that? (formal)' }),
      P('Hoe zeg je dat in het Nederlands?', { fr: 'Comment dit-on ça en néerlandais ?', en: 'How do you say that in Dutch?' }),
      P('Wat betekent dat?', { fr: 'Qu’est-ce que ça veut dire ?', en: 'What does that mean?' }),
      P('Ik spreek nog niet goed Nederlands.', { fr: 'Je ne parle pas encore bien néerlandais.', en: 'I do not speak Dutch well yet.' }),
      P('Ik versta een beetje Nederlands.', { fr: 'Je comprends un peu le néerlandais.', en: 'I understand a little Dutch.' }),
      P('Kunt u mij helpen?', { fr: 'Pouvez-vous m’aider ?', en: 'Could you help me? (formal)' }),
      P('Nog eens, alstublieft.', { fr: 'Encore une fois, s’il vous plaît.', en: 'Once more, please.' }),
      P('Dat is goed, merci.', { fr: 'C’est bon, merci.', en: 'That is fine, thanks.' })
    ]
  });

  U({
    id: 'ikengij', n: 2, name: { fr: 'Moi et toi', en: 'Me and you' }, nlName: 'Ik en gij', level: 'A1', track: 'leven', icon: '\u{1F9D1}',
    blurb: { fr: 'Les pronoms, « zijn » et « hebben », et se présenter sans se figer.', en: 'The pronouns, “zijn” and “hebben”, and introducing yourself without freezing.' },
    grammar: ['g-present', 'g-gegij'],
    words: [
      W('ik', { fr: 'je', en: 'I' }),
      W('jij', { fr: 'tu', en: 'you (informal)' }, null),
      W('u', { fr: 'vous (poli)', en: 'you (formal)' }, null),
      W('hij', { fr: 'il', en: 'he' }),
      W('zij', { fr: 'elle / ils', en: 'she / they' }, null),
      W('wij', { fr: 'nous', en: 'we' }, null),
      W('zijn', { fr: 'être', en: 'to be' }, null),
      W('hebben', { fr: 'avoir', en: 'to have' }, null),
      W('heten', { fr: 's’appeler', en: 'to be called' }),
      W('wonen', { fr: 'habiter', en: 'to live (in a place)' }),
      W('komen', { fr: 'venir', en: 'to come' }),
      W('werken', { fr: 'travailler', en: 'to work' }),
      W('de naam', { fr: 'le nom', en: 'name' }, 'de'),
      W('het jaar', { fr: 'l’an', en: 'year' }, 'het'),
      W('oud', { fr: 'vieux', en: 'old' }),
      W('getrouwd', { fr: 'marié', en: 'married' }),
      W('samen', { fr: 'ensemble', en: 'together' }),
      W('hier', { fr: 'ici', en: 'here' }),
      W('daar', { fr: 'là', en: 'there' }),
      W('al', { fr: 'déjà', en: 'already' }),
      W('ook', { fr: 'aussi', en: 'also / too' }),
      W('mijn', { fr: 'mon', en: 'my' }),
      W('uw', { fr: 'votre', en: 'your (formal)' }, null),
      W('het Nederlands', { fr: 'le néerlandais', en: 'Dutch' }, 'het'),
      W('het Engels', { fr: 'l’anglais', en: 'English' }, 'het'),
      W('het Frans', { fr: 'le français', en: 'French' }, 'het')
    ],
    phrases: [
      P('Ik heet {naam}.', { fr: 'Je m’appelle {naam}.', en: 'My name is {naam}.' }),
      P('Hoe heet je?', { fr: 'Comment tu t’appelles ?', en: 'What is your name? (informal)' }),
      P('Ik woon in {stad}.', { fr: 'J’habite à {stad}.', en: 'I live in {stad}.' }),
      P('Wij wonen hier al vijf jaar.', { fr: 'Nous habitons ici depuis cinq ans.', en: 'We have lived here for five years.' }),
      P('Ik werk bij {bedrijf}.', { fr: 'Je travaille chez {bedrijf}.', en: 'I work at {bedrijf}.' }),
      P('Hoe oud ben je?', { fr: 'Quel âge as-tu ?', en: 'How old are you? (informal)' }),
      P('Ik ben veertig jaar.', { fr: 'J’ai quarante ans.', en: 'I am forty (years old).' }),
      P('Ik ben getrouwd en ik heb twee kinderen.', { fr: 'Je suis marié et j’ai deux enfants.', en: 'I am married and I have two children.' }),
      P('Spreekt u Frans?', { fr: 'Parlez-vous français ?', en: 'Do you speak French? (formal)' }),
      P('Aangenaam.', { fr: 'Enchanté.', en: 'Pleased to meet you.' })
    ]
  });

  U({
    id: 'tijd', n: 3, name: { fr: 'Nombres et heure', en: 'Numbers and time' }, nlName: 'Getallen en tijd', level: 'A1', track: 'beide', icon: '\u{1F552}',
    blurb: { fr: 'Compter, lire l’heure, et le piège de « half drie » qui attrape tout le monde.', en: 'Counting, telling the time, and the “half drie” trap that catches everyone.' },
    grammar: ['g-getallen', 'g-halfuur'],
    words: [
      W('nul', { fr: 'zéro', en: 'zero' }), W('een', { fr: 'un', en: 'one' }), W('twee', { fr: 'deux', en: 'two' }), W('drie', { fr: 'trois', en: 'three' }),
      W('vier', { fr: 'quatre', en: 'four' }), W('vijf', { fr: 'cinq', en: 'five' }), W('zes', { fr: 'six', en: 'six' }), W('zeven', { fr: 'sept', en: 'seven' }),
      W('acht', { fr: 'huit', en: 'eight' }), W('negen', { fr: 'neuf', en: 'nine' }), W('tien', { fr: 'dix', en: 'ten' }), W('elf', { fr: 'onze', en: 'eleven' }),
      W('twaalf', { fr: 'douze', en: 'twelve' }), W('twintig', { fr: 'vingt', en: 'twenty' }), W('dertig', { fr: 'trente', en: 'thirty' }),
      W('veertig', { fr: 'quarante', en: 'forty' }), W('vijftig', { fr: 'cinquante', en: 'fifty' }),
      W('zeventig', { fr: 'septante', en: 'seventy' }, null),
      W('negentig', { fr: 'nonante', en: 'ninety' }, null),
      W('honderd', { fr: 'cent', en: 'one hundred' }),
      W('het uur', { fr: 'l’heure', en: 'hour' }, 'het'),
      W('half', { fr: 'et demie', en: 'half (before the hour)' }, null),
      W('het kwart', { fr: 'le quart', en: 'quarter' }, 'het'),
      W('de minuut', { fr: 'la minute', en: 'minute' }, 'de'),
      W('de dag', { fr: 'le jour', en: 'day' }, 'de'),
      W('de week', { fr: 'la semaine', en: 'week' }, 'de'),
      W('de maand', { fr: 'le mois', en: 'month' }, 'de'),
      W('vandaag', { fr: 'aujourd’hui', en: 'today' }), W('morgen', { fr: 'demain', en: 'tomorrow' }), W('gisteren', { fr: 'hier', en: 'yesterday' }),
      W('maandag', { fr: 'lundi', en: 'Monday' }), W('dinsdag', { fr: 'mardi', en: 'Tuesday' }), W('woensdag', { fr: 'mercredi', en: 'Wednesday' }),
      W('donderdag', { fr: 'jeudi', en: 'Thursday' }), W('vrijdag', { fr: 'vendredi', en: 'Friday' }),
      W('zaterdag', { fr: 'samedi', en: 'Saturday' }), W('zondag', { fr: 'dimanche', en: 'Sunday' }),
      W('vroeg', { fr: 'tôt', en: 'early' }), W('laat', { fr: 'tard', en: 'late' }), W('straks', { fr: 'tout à l’heure', en: 'in a little while' })
    ],
    phrases: [
      P('Hoe laat is het?', { fr: 'Quelle heure est-il ?', en: 'What time is it?' }),
      P('Het is half drie.', { fr: 'Il est deux heures et demie.', en: 'It is half past two.' }),
      P('Het is kwart voor acht.', { fr: 'Il est huit heures moins le quart.', en: 'It is a quarter to eight.' }),
      P('Om negen uur.', { fr: 'À neuf heures.', en: 'At nine o’clock.' }),
      P('Ik kom om tien uur.', { fr: 'Je viens à dix heures.', en: 'I am coming at ten o’clock.' }),
      P('Tot straks!', { fr: 'À tout à l’heure !', en: 'See you later!' }),
      P('Tot maandag.', { fr: 'À lundi.', en: 'See you on Monday.' }),
      P('Ik heb tijd op dinsdag.', { fr: 'J’ai le temps mardi.', en: 'I have time on Tuesday.' }),
      P('Dat duurt een half uur.', { fr: 'Ça prend une demi-heure.', en: 'That takes half an hour.' }),
      P('Ik ben te laat.', { fr: 'Je suis en retard.', en: 'I am late.' })
    ]
  });

  U({
    id: 'bakker', n: 4, name: { fr: 'Chez le boulanger', en: 'At the baker’s' }, nlName: 'Bij de bakker', level: 'A1', track: 'leven', icon: '\u{1F950}',
    blurb: { fr: 'Commander à {stad}, avec les mots flamands qu’aucun cours du nord n’enseigne.', en: 'Ordering in {stad}, with the Flemish words no course from the north teaches.' },
    grammar: ['g-dehet'],
    words: [
      W('het brood', { fr: 'le pain', en: 'bread' }, 'het'),
      W('de pistolet', { fr: 'le pistolet', en: 'crusty bread roll' }, 'de'),
      W('de koffiekoek', { fr: 'la couque', en: 'breakfast pastry' }, 'de'),
      W('een half wit', { fr: 'un demi pain blanc', en: 'half a white loaf' }, null),
      W('gesneden', { fr: 'tranché', en: 'sliced' }),
      W('de bakker', { fr: 'le boulanger', en: 'baker' }, 'de'),
      W('de beenhouwer', { fr: 'le boucher', en: 'butcher' }, 'de'),
      W('de hesp', { fr: 'le jambon', en: 'ham' }, 'de'),
      W('de kaas', { fr: 'le fromage', en: 'cheese' }, 'de'),
      W('de choco', { fr: 'la pâte à tartiner', en: 'chocolate spread' }, 'de'),
      W('de boter', { fr: 'le beurre', en: 'butter' }, 'de'),
      W('het broodje', { fr: 'le sandwich', en: 'sandwich / small bread roll' }, 'het'),
      W('de taart', { fr: 'la tarte', en: 'tart / cake' }, 'de'),
      W('de koffie', { fr: 'le café', en: 'coffee' }, 'de'),
      W('het water', { fr: 'l’eau', en: 'water' }, 'het'),
      W('de pint', { fr: 'la bière', en: 'beer (a glass of lager)' }, 'de'),
      W('de frieten', { fr: 'les frites', en: 'chips / fries' }, 'de'),
      W('lekker', { fr: 'bon (au goût)', en: 'tasty' }),
      W('de honger', { fr: 'la faim', en: 'hunger' }, 'de'),
      W('de dorst', { fr: 'la soif', en: 'thirst' }, 'de'),
      W('kosten', { fr: 'coûter', en: 'to cost' }),
      W('alles', { fr: 'tout', en: 'everything' }),
      W('meenemen', { fr: 'emporter', en: 'to take away / to take along' }, null)
    ],
    phrases: [
      P('Een half wit, gesneden alstublieft.', { fr: 'Un demi pain blanc, tranché s’il vous plaît.', en: 'Half a white loaf, sliced, please.' }),
      P('Mag ik twee pistolets?', { fr: 'Puis-je avoir deux pistolets ?', en: 'May I have two crusty rolls?' }),
      P('Is dat alles?', { fr: 'Ce sera tout ?', en: 'Will that be all?' }),
      P('Ja, dat is alles, merci.', { fr: 'Oui, c’est tout, merci.', en: 'Yes, that is all, thanks.' }),
      P('Hoeveel is het?', { fr: 'Ça fait combien ?', en: 'How much is it?' }),
      P('Ik zou graag een koffiekoek hebben.', { fr: 'Je voudrais une couque.', en: 'I would like a pastry.' }),
      P('Een pintje, alstublieft.', { fr: 'Une bière, s’il vous plaît.', en: 'A beer, please.' }),
      P('Voor hier of om mee te nemen?', { fr: 'Sur place ou à emporter ?', en: 'Eat in or take away?' }),
      P('Ik heb honger.', { fr: 'J’ai faim.', en: 'I am hungry.' }),
      P('Dat is lekker.', { fr: 'C’est bon.', en: 'That is tasty.' })
    ]
  });

  U({
    id: 'thuis', n: 5, name: { fr: 'Chez toi à {stad}', en: 'At home in {stad}' }, nlName: 'Thuis in {stad}', level: 'A1', track: 'leven', icon: '\u{1F3E1}',
    blurb: { fr: 'Ta maison, ta rue, tes voisins, et les papiers de la commune.', en: 'Your house, your street, your neighbours, and the paperwork from the council.' },
    grammar: ['g-dehet'],
    words: [
      W('het huis', { fr: 'la maison', en: 'house' }, 'het'),
      W('de straat', { fr: 'la rue', en: 'street' }, 'de'),
      W('de tuin', { fr: 'le jardin', en: 'garden' }, 'de'),
      W('de buurman', { fr: 'le voisin', en: 'male neighbour' }, 'de'),
      W('de buurvrouw', { fr: 'la voisine', en: 'female neighbour' }, 'de'),
      W('de buren', { fr: 'les voisins', en: 'neighbours' }, 'de'),
      W('de keuken', { fr: 'la cuisine', en: 'kitchen' }, 'de'),
      W('de living', { fr: 'le salon', en: 'living room' }, 'de'),
      W('de badkamer', { fr: 'la salle de bain', en: 'bathroom' }, 'de'),
      W('de slaapkamer', { fr: 'la chambre', en: 'bedroom' }, 'de'),
      W('de garage', { fr: 'le garage', en: 'garage' }, 'de'),
      W('de brievenbus', { fr: 'la boîte aux lettres', en: 'letterbox' }, 'de'),
      W('het gemeentehuis', { fr: 'la maison communale', en: 'town hall' }, 'het'),
      W('de gemeente', { fr: 'la commune', en: 'municipality' }, 'de'),
      W('het dorp', { fr: 'le village', en: 'village' }, 'het'),
      W('de kerk', { fr: 'l’église', en: 'church' }, 'de'),
      W('het containerpark', { fr: 'le parc à conteneurs', en: 'recycling centre' }, 'het'),
      W('het vuil', { fr: 'les déchets', en: 'rubbish' }, 'het'),
      W('het pakje', { fr: 'le colis', en: 'parcel' }, 'het'),
      W('de sleutel', { fr: 'la clé', en: 'key' }, 'de'),
      W('de deur', { fr: 'la porte', en: 'door' }, 'de'),
      W('binnen', { fr: 'à l’intérieur', en: 'inside' }),
      W('buiten', { fr: 'dehors', en: 'outside' }),
      W('vriendelijk', { fr: 'gentil', en: 'friendly' }),
      W('rustig', { fr: 'calme', en: 'calm / quiet' })
    ],
    phrases: [
      P('Ik woon in de Kloosterstraat.', { fr: 'J’habite dans la Kloosterstraat.', en: 'I live on Kloosterstraat.' }),
      P('De buren zijn heel vriendelijk.', { fr: 'Les voisins sont très gentils.', en: 'The neighbours are very friendly.' }),
      P('Waar is het gemeentehuis?', { fr: 'Où est la maison communale ?', en: 'Where is the town hall?' }),
      P('Ik moet naar het containerpark.', { fr: 'Je dois aller au parc à conteneurs.', en: 'I have to go to the recycling centre.' }),
      P('Er ligt een pakje bij de buren.', { fr: 'Il y a un colis chez les voisins.', en: 'There is a parcel at the neighbours’.' }),
      P('Mag ik uw pakje aannemen?', { fr: 'Puis-je réceptionner votre colis ?', en: 'May I take in your parcel? (formal)' }),
      P('Het is hier heel rustig.', { fr: 'C’est très calme ici.', en: 'It is very quiet here.' }),
      P('Ik ben nieuw in de straat.', { fr: 'Je suis nouveau dans la rue.', en: 'I am new in the street.' })
    ]
  });

  U({
    id: 'familie', n: 6, name: { fr: 'Famille et gens', en: 'Family and people' }, nlName: 'Familie en mensen', level: 'A1', track: 'leven', icon: '\u{1F46A}',
    blurb: { fr: 'Les gens autour de toi, et comment demander des nouvelles des leurs.', en: 'The people around you, and how to ask how theirs are doing.' },
    grammar: ['g-bezit'],
    words: [
      W('de vrouw', { fr: 'la femme', en: 'woman / wife' }, 'de'),
      W('de man', { fr: 'l’homme', en: 'man / husband' }, 'de'),
      W('de zoon', { fr: 'le fils', en: 'son' }, 'de'),
      W('de dochter', { fr: 'la fille', en: 'daughter' }, 'de'),
      W('het kind', { fr: 'l’enfant', en: 'child' }, 'het'),
      W('de kinderen', { fr: 'les enfants', en: 'children' }, 'de'),
      W('de ouders', { fr: 'les parents', en: 'parents' }, 'de'),
      W('de mama', { fr: 'la maman', en: 'mum' }, 'de'),
      W('de papa', { fr: 'le papa', en: 'dad' }, 'de'),
      W('de zus', { fr: 'la sœur', en: 'sister' }, 'de'),
      W('de broer', { fr: 'le frère', en: 'brother' }, 'de'),
      W('de vriend', { fr: 'l’ami', en: 'friend / boyfriend' }, 'de'),
      W('de vriendin', { fr: 'l’amie', en: 'female friend / girlfriend' }, 'de'),
      W('de collega', { fr: 'le collègue', en: 'colleague' }, 'de'),
      W('de baas', { fr: 'le patron', en: 'boss' }, 'de'),
      W('de mensen', { fr: 'les gens', en: 'people' }, 'de'),
      W('iedereen', { fr: 'tout le monde', en: 'everyone' }),
      W('niemand', { fr: 'personne', en: 'nobody' }),
      W('de school', { fr: 'l’école', en: 'school' }, 'de'),
      W('jong', { fr: 'jeune', en: 'young' }),
      W('lief', { fr: 'gentil', en: 'sweet / kind' }),
      W('streng', { fr: 'sévère', en: 'strict' }),
      W('onze', { fr: 'notre', en: 'our' }, null),
      W('hun', { fr: 'leur', en: 'their' })
    ],
    phrases: [
      P('Dit is mijn vrouw.', { fr: 'Voici ma femme.', en: 'This is my wife.' }),
      P('Wij hebben twee kinderen.', { fr: 'Nous avons deux enfants.', en: 'We have two children.' }),
      P('Mijn dochter gaat naar school in {stad}.', { fr: 'Ma fille va à l’école à {stad}.', en: 'My daughter goes to school in {stad}.' }),
      P('Hoe gaat het met de familie?', { fr: 'Comment va la famille ?', en: 'How is the family?' }),
      P('Mijn collega’s spreken allemaal Nederlands.', { fr: 'Mes collègues parlent tous néerlandais.', en: 'My colleagues all speak Dutch.' }),
      P('Hij is een collega van mij.', { fr: 'C’est un collègue à moi.', en: 'He is a colleague of mine.' }),
      P('Onze zoon is zes jaar.', { fr: 'Notre fils a six ans.', en: 'Our son is six years old.' }),
      P('Ik ken hier nog niet veel mensen.', { fr: 'Je ne connais pas encore beaucoup de monde ici.', en: 'I do not know many people here yet.' })
    ]
  });
})();
