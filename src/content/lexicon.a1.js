/* Lexique A1, unités 1 à 6.
   nl = néerlandais standard, ce que tu écris dans un mail au travail.
   fr = français de Belgique (septante, nonante).
   be = ce qu'on dit vraiment en Brabant flamand. Produis le nl, comprends le be.
   note = ce qu'un manuel ne dit jamais. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const W = (nl, fr, art, be, note) => ({ kind: 'word', nl, fr, art, be, note });
  const P = (nl, fr, be, note) => ({ kind: 'phrase', nl, fr, be, note });
  const U = o => NL.content.units.push(o);

  U({
    id: 'overleven', n: 1, name: 'Survivre', nlName: 'Overleven', level: 'A1', track: 'leven', icon: '\u{1F9ED}',
    blurb: 'Les phrases qui gardent la conversation en néerlandais au lieu de la laisser basculer en français.',
    grammar: ['g-v2'],
    words: [
      W('hallo', 'bonjour', null, 'hey, salut', 'En Flandre, « hey » et « salut » servent pour dire bonjour ET au revoir.'),
      W('goeiedag', 'bonjour', null, 'goeiendag', 'Le bonjour passe-partout dans un magasin. Le nord dit « goedendag ».'),
      W('dag', 'salut', null, null, 'À l’entrée comme à la sortie. À ne pas confondre avec « de dag », le jour.'),
      W('tot ziens', 'au revoir', null, 'salut, de groeten'),
      W('alstublieft', 's’il vous plaît / voilà', null, 'asteblieft, alsjeblieft', 'Se dit aussi en tendant quelque chose, comme « voilà ».'),
      W('dank u wel', 'merci', null, 'merci', 'En Flandre, « merci » est du néerlandais normal, pas du français. Utilise-le sans hésiter.'),
      W('sorry', 'pardon'),
      W('ja', 'oui', null, 'ja, jaja', '« Jaja » veut souvent dire « oui oui, je sais » et peut sonner impatient.'),
      W('nee', 'non', null, 'nee, neenee'),
      W('misschien', 'peut-être'),
      W('graag', 'volontiers', null, null, 'Le néerlandais n’a pas de verbe « aimer faire » : on ajoute graag au verbe.'),
      W('goed', 'bien'),
      W('niet', 'ne... pas'),
      W('een beetje', 'un peu', null, 'een beetje, een klein beetje'),
      W('nog eens', 'encore une fois', null, 'nog is'),
      W('trager', 'plus lentement', null, null, 'La Flandre dit « trager » ; le nord dit « langzamer ».'),
      W('verstaan', 'comprendre', null, null, 'En Flandre, « verstaan » couvre à la fois entendre et comprendre.'),
      W('herhalen', 'répéter'),
      W('betekenen', 'signifier'),
      W('proberen', 'essayer'),
      W('spreken', 'parler'),
      W('leren', 'apprendre'),
      W('zeggen', 'dire'),
      W('helpen', 'aider'),
      W('natuurlijk', 'bien sûr', null, 'tuurlijk'),
      W('geen probleem', 'pas de problème', null, 'geen probleem, ’t is niks')
    ],
    phrases: [
      P('Ik ben Nederlands aan het leren.', 'J’apprends le néerlandais.', 'Ik ben Nederlands aan het leren, hè.', 'Dis-le tôt : les gens ralentissent au lieu de passer au français.'),
      P('Mag ik het in het Nederlands proberen?', 'Puis-je essayer en néerlandais ?', 'Mag ik het is in het Nederlands proberen?', 'La phrase la plus utile que tu possèdes. Elle empêche le passage au français.'),
      P('Kunt u wat trager spreken, alstublieft?', 'Pouvez-vous parler un peu plus lentement, s’il vous plaît ?', 'Kunde wat trager spreken?'),
      P('Sorry, ik heb dat niet verstaan.', 'Pardon, je n’ai pas compris.', 'Sorry, ik heb da nie verstaan.'),
      P('Kunt u dat herhalen?', 'Pouvez-vous répéter ?', 'Kunde da nog is zeggen?'),
      P('Hoe zeg je dat in het Nederlands?', 'Comment dit-on ça en néerlandais ?', 'Hoe zegde da in ’t Nederlands?'),
      P('Wat betekent dat?', 'Qu’est-ce que ça veut dire ?', 'Wa betekent da?'),
      P('Ik spreek nog niet goed Nederlands.', 'Je ne parle pas encore bien néerlandais.', null, 'Le mot « nog » compte : il promet que tu y travailles.'),
      P('Ik versta een beetje Nederlands.', 'Je comprends un peu le néerlandais.'),
      P('Kunt u mij helpen?', 'Pouvez-vous m’aider ?', 'Kunde mij helpen?'),
      P('Nog eens, alstublieft.', 'Encore une fois, s’il vous plaît.', 'Nog is, asteblieft.'),
      P('Dat is goed, merci.', 'C’est bon, merci.', null, 'Une phrase flamande parfaitement naturelle, avec un mot français dedans.')
    ]
  });

  U({
    id: 'ikengij', n: 2, name: 'Moi et toi', nlName: 'Ik en gij', level: 'A1', track: 'leven', icon: '\u{1F9D1}',
    blurb: 'Les pronoms, zijn et hebben, et se présenter sans se figer.',
    grammar: ['g-present', 'g-gegij'],
    words: [
      W('ik', 'je'),
      W('jij', 'tu', null, 'gij, ge', 'ge/gij est la forme flamande courante. Dis « je » toi-même ; attends-toi à « ge » en retour.'),
      W('u', 'vous (poli)', null, null, 'La Flandre emploie « u » bien plus que le nord, y compris chez le commerçant.'),
      W('hij', 'il'),
      W('zij', 'elle / ils', null, 'zij, ze'),
      W('wij', 'nous', null, 'wij, we'),
      W('zijn', 'être', null, null, 'ik ben, jij bent, hij is, wij zijn. En flamand : gij zijt.'),
      W('hebben', 'avoir', null, null, 'ik heb, jij hebt, hij heeft, wij hebben. En flamand : gij hebt.'),
      W('heten', 's’appeler'),
      W('wonen', 'habiter'),
      W('komen', 'venir'),
      W('werken', 'travailler'),
      W('de naam', 'le nom', 'de'),
      W('het jaar', 'l’an', 'het'),
      W('oud', 'vieux'),
      W('getrouwd', 'marié'),
      W('samen', 'ensemble'),
      W('hier', 'ici'),
      W('daar', 'là'),
      W('al', 'déjà'),
      W('ook', 'aussi'),
      W('mijn', 'mon'),
      W('uw', 'votre', null, 'uw, jouw', 'En Flandre, « uw » s’emploie aussi familièrement, là où le nord dirait « je ».'),
      W('het Nederlands', 'le néerlandais', 'het'),
      W('het Engels', 'l’anglais', 'het'),
      W('het Frans', 'le français', 'het')
    ],
    phrases: [
      P('Ik heet {naam}.', 'Je m’appelle {naam}.'),
      P('Hoe heet je?', 'Comment tu t’appelles ?', 'Hoe heette gij?'),
      P('Ik woon in {stad}.', 'J’habite à {stad}.'),
      P('Wij wonen hier al vijf jaar.', 'Nous habitons ici depuis cinq ans.', null, 'Le néerlandais met le présent ici, pas le passé composé.'),
      P('Ik werk bij {bedrijf}.', 'Je travaille chez {bedrijf}.', null, 'Les entreprises prennent « bij », jamais « in ».'),
      P('Hoe oud ben je?', 'Quel âge as-tu ?', 'Hoe oud zijde gij?'),
      P('Ik ben veertig jaar.', 'J’ai quarante ans.', null, 'Pas besoin d’ajouter « oud » à la fin.'),
      P('Ik ben getrouwd en ik heb twee kinderen.', 'Je suis marié et j’ai deux enfants.'),
      P('Spreekt u Frans?', 'Parlez-vous français ?', 'Spreekte gij Frans?', 'Une porte de secours, mais essaie le néerlandais d’abord.'),
      P('Aangenaam.', 'Enchanté.', null, 'Se dit une fois, en serrant la main. Court, c’est correct.')
    ]
  });

  U({
    id: 'tijd', n: 3, name: 'Nombres et heure', nlName: 'Getallen en tijd', level: 'A1', track: 'beide', icon: '\u{1F552}',
    blurb: 'Compter, lire l’heure, et le piège de « half drie » qui attrape tout le monde.',
    grammar: ['g-getallen', 'g-halfuur'],
    words: [
      W('nul', 'zéro'), W('een', 'un'), W('twee', 'deux'), W('drie', 'trois'),
      W('vier', 'quatre'), W('vijf', 'cinq'), W('zes', 'six'), W('zeven', 'sept'),
      W('acht', 'huit'), W('negen', 'neuf'), W('tien', 'dix'), W('elf', 'onze'),
      W('twaalf', 'douze'), W('twintig', 'vingt'), W('dertig', 'trente'),
      W('veertig', 'quarante'), W('vijftig', 'cinquante'),
      W('zeventig', 'septante', null, null, 'zeventig = septante, pas « soixante-dix ». Le belge et le néerlandais se suivent mot pour mot.'),
      W('negentig', 'nonante', null, null, 'negentig = nonante. Un mot pour un mot.'),
      W('honderd', 'cent'),
      W('het uur', 'l’heure', 'het'),
      W('half', 'et demie', null, null, '« half drie » = 2h30, pas 3h30. C’est une demi-heure AVANT trois heures.'),
      W('het kwart', 'le quart', 'het'),
      W('de minuut', 'la minute', 'de'),
      W('de dag', 'le jour', 'de'),
      W('de week', 'la semaine', 'de'),
      W('de maand', 'le mois', 'de'),
      W('vandaag', 'aujourd’hui'), W('morgen', 'demain'), W('gisteren', 'hier'),
      W('maandag', 'lundi'), W('dinsdag', 'mardi'), W('woensdag', 'mercredi'),
      W('donderdag', 'jeudi'), W('vrijdag', 'vendredi'),
      W('zaterdag', 'samedi'), W('zondag', 'dimanche'),
      W('vroeg', 'tôt'), W('laat', 'tard'), W('straks', 'tout à l’heure')
    ],
    phrases: [
      P('Hoe laat is het?', 'Quelle heure est-il ?', 'Hoe laat is ’t?'),
      P('Het is half drie.', 'Il est deux heures et demie.', null, '« Half drie » = 2h30. Trompe-toi une fois et tu rates une réunion.'),
      P('Het is kwart voor acht.', 'Il est huit heures moins le quart.'),
      P('Om negen uur.', 'À neuf heures.'),
      P('Ik kom om tien uur.', 'Je viens à dix heures.'),
      P('Tot straks!', 'À tout à l’heure !'),
      P('Tot maandag.', 'À lundi.'),
      P('Ik heb tijd op dinsdag.', 'J’ai le temps mardi.'),
      P('Dat duurt een half uur.', 'Ça prend une demi-heure.'),
      P('Ik ben te laat.', 'Je suis en retard.', 'Ik zen te laat.')
    ]
  });

  U({
    id: 'bakker', n: 4, name: 'Chez le boulanger', nlName: 'Bij de bakker', level: 'A1', track: 'leven', icon: '\u{1F950}',
    blurb: 'Commander à {stad}, avec les mots flamands qu’aucun cours du nord n’enseigne.',
    grammar: ['g-dehet'],
    words: [
      W('het brood', 'le pain', 'het'),
      W('het pistolet', 'le pistolet', 'het', null, 'Emprunté au français, gardé en Flandre. Le nord dirait « broodje ».'),
      W('de koffiekoek', 'la couque', 'de', null, 'La viennoiserie du matin. Le nord dit « zoet broodje ».'),
      W('een half wit', 'un demi pain blanc', null, null, 'Exactement ce qu’on dit au comptoir. Ajoute « gesneden » pour le faire trancher.'),
      W('gesneden', 'tranché'),
      W('de bakker', 'le boulanger', 'de'),
      W('de beenhouwer', 'le boucher', 'de', null, 'Mot flamand. Le nord dit « slager », qu’on n’emploie parfois même pas ici.'),
      W('de hesp', 'le jambon', 'de', null, 'Mot flamand. Le nord dit « ham ».'),
      W('de kaas', 'le fromage', 'de'),
      W('de choco', 'la pâte à tartiner', 'de'),
      W('de boter', 'le beurre', 'de'),
      W('het broodje', 'le sandwich', 'het'),
      W('de taart', 'la tarte', 'de'),
      W('de koffie', 'le café', 'de'),
      W('het water', 'l’eau', 'het'),
      W('de pint', 'la bière', 'de', 'een pintje', 'Un « pintje » est la bière standard. Commander « een bier » te marque comme étranger.'),
      W('de frieten', 'les frites', 'de', null, 'Toujours au pluriel en Flandre, et jamais « patat ».'),
      W('lekker', 'bon (au goût)'),
      W('de honger', 'la faim', 'de'),
      W('de dorst', 'la soif', 'de'),
      W('kosten', 'coûter'),
      W('alles', 'tout'),
      W('meenemen', 'emporter')
    ],
    phrases: [
      P('Een half wit, gesneden alstublieft.', 'Un demi pain blanc, tranché s’il vous plaît.', null, 'Apprends-la mot pour mot et la boulangerie cesse d’être effrayante.'),
      P('Mag ik twee pistolets?', 'Puis-je avoir deux pistolets ?', 'Mag ik twee pistolets hebben?'),
      P('Is dat alles?', 'Ce sera tout ?', 'Is da alles?', 'C’est eux qui te le demandent. Réponse : « Ja, dat is alles ».'),
      P('Ja, dat is alles, merci.', 'Oui, c’est tout, merci.'),
      P('Hoeveel is het?', 'Ça fait combien ?', 'Hoeveel is ’t?'),
      P('Ik zou graag een koffiekoek hebben.', 'Je voudrais une couque.', null, 'La formule polie pour commander : ik zou graag ... hebben.'),
      P('Een pintje, alstublieft.', 'Une bière, s’il vous plaît.'),
      P('Voor hier of om mee te nemen?', 'Sur place ou à emporter ?', null, 'Encore une question qu’on te pose, pas l’inverse.'),
      P('Ik heb honger.', 'J’ai faim.'),
      P('Dat is lekker.', 'C’est bon.', 'Da’s lekker.')
    ]
  });

  U({
    id: 'thuis', n: 5, name: 'Chez toi à {stad}', nlName: 'Thuis in {stad}', level: 'A1', track: 'leven', icon: '\u{1F3E1}',
    blurb: 'Ta maison, ta rue, tes voisins, et les papiers de la commune.',
    grammar: ['g-dehet'],
    words: [
      W('het huis', 'la maison', 'het', null, '« het huis » est neutre alors que « la maison » est féminine. Les genres ne se correspondent pas : apprends l’article néerlandais à part.'),
      W('de straat', 'la rue', 'de'),
      W('de tuin', 'le jardin', 'de'),
      W('de buurman', 'le voisin', 'de'),
      W('de buurvrouw', 'la voisine', 'de'),
      W('de buren', 'les voisins', 'de'),
      W('de keuken', 'la cuisine', 'de'),
      W('de living', 'le salon', 'de', null, 'Mot flamand emprunté à l’anglais. Le nord dit « woonkamer ».'),
      W('de badkamer', 'la salle de bain', 'de'),
      W('de slaapkamer', 'la chambre', 'de'),
      W('de garage', 'le garage', 'de'),
      W('de brievenbus', 'la boîte aux lettres', 'de'),
      W('het gemeentehuis', 'la maison communale', 'het', null, 'Où tu vas pour tout ce qui est administratif à {stad}.'),
      W('de gemeente', 'la commune', 'de'),
      W('het dorp', 'le village', 'het'),
      W('de kerk', 'l’église', 'de'),
      W('het containerpark', 'le parc à conteneurs', 'het', 'containerpark, recyclagepark', 'Mot flamand. Le nord dit « milieustraat ».'),
      W('het vuil', 'les déchets', 'het', 'het vuil, de vuilniszak'),
      W('het pakje', 'le colis', 'het', null, 'Diminutif en -je, donc het. Toujours.'),
      W('de sleutel', 'la clé', 'de'),
      W('de deur', 'la porte', 'de'),
      W('binnen', 'à l’intérieur'),
      W('buiten', 'dehors'),
      W('vriendelijk', 'gentil'),
      W('rustig', 'calme')
    ],
    phrases: [
      P('Ik woon in de Kloosterstraat.', 'J’habite dans la Kloosterstraat.', null, 'Les rues prennent « in », jamais « op ».'),
      P('De buren zijn heel vriendelijk.', 'Les voisins sont très gentils.'),
      P('Waar is het gemeentehuis?', 'Où est la maison communale ?'),
      P('Ik moet naar het containerpark.', 'Je dois aller au parc à conteneurs.'),
      P('Er ligt een pakje bij de buren.', 'Il y a un colis chez les voisins.'),
      P('Mag ik uw pakje aannemen?', 'Puis-je réceptionner votre colis ?', null, 'Ce qu’un voisin te demande. Réponse : « Ja, graag, merci ! »'),
      P('Het is hier heel rustig.', 'C’est très calme ici.'),
      P('Ik ben nieuw in de straat.', 'Je suis nouveau dans la rue.')
    ]
  });

  U({
    id: 'familie', n: 6, name: 'Famille et gens', nlName: 'Familie en mensen', level: 'A1', track: 'leven', icon: '\u{1F46A}',
    blurb: 'Les gens autour de toi, et comment demander des nouvelles des leurs.',
    grammar: ['g-bezit'],
    words: [
      W('de vrouw', 'la femme', 'de'),
      W('de man', 'l’homme', 'de'),
      W('de zoon', 'le fils', 'de'),
      W('de dochter', 'la fille', 'de'),
      W('het kind', 'l’enfant', 'het'),
      W('de kinderen', 'les enfants', 'de'),
      W('de ouders', 'les parents', 'de'),
      W('de mama', 'la maman', 'de', 'mama, moeke'),
      W('de papa', 'le papa', 'de', 'papa, vake'),
      W('de zus', 'la sœur', 'de'),
      W('de broer', 'le frère', 'de'),
      W('de vriend', 'l’ami', 'de', null, 'Veut aussi dire « petit ami ». « Een vriend van mij » reste neutre.'),
      W('de vriendin', 'l’amie', 'de'),
      W('de collega', 'le collègue', 'de'),
      W('de baas', 'le patron', 'de'),
      W('de mensen', 'les gens', 'de'),
      W('iedereen', 'tout le monde'),
      W('niemand', 'personne'),
      W('de school', 'l’école', 'de'),
      W('jong', 'jeune'),
      W('lief', 'gentil'),
      W('streng', 'sévère'),
      W('onze', 'notre', null, null, 'ons devant un mot het, onze devant le reste : ons huis, onze tuin.'),
      W('hun', 'leur')
    ],
    phrases: [
      P('Dit is mijn vrouw.', 'Voici ma femme.'),
      P('Wij hebben twee kinderen.', 'Nous avons deux enfants.'),
      P('Mijn dochter gaat naar school in {stad}.', 'Ma fille va à l’école à {stad}.'),
      P('Hoe gaat het met de familie?', 'Comment va la famille ?', 'En hoe is ’t thuis?', 'Petite conversation standard. Attends-toi à la question et prépare une réponse.'),
      P('Mijn collega’s spreken allemaal Nederlands.', 'Mes collègues parlent tous néerlandais.'),
      P('Hij is een collega van mij.', 'C’est un collègue à moi.'),
      P('Onze zoon is zes jaar.', 'Notre fils a six ans.'),
      P('Ik ken hier nog niet veel mensen.', 'Je ne connais pas encore beaucoup de monde ici.')
    ]
  });
})();
