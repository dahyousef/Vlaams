/* Phrases d'exemple pour les mots isolés.

   Un mot seul ne se drille que d'une poignée de façons : reconnaître, traduire,
   taper, dire. Avec une phrase, il devient aussi un texte à trous, des tuiles à
   remettre en ordre, une dictée — et surtout il se rencontre là où on l'emploie,
   avec son article, sa place dans la phrase, ses voisins habituels.

   Deux phrases par mot, tirées au sort : le même mot ne revient donc pas dans la
   même phrase deux fois de suite.

   Règles d'écriture :
   - la phrase contient le mot, tel quel, sinon le texte à trous n'a rien à cacher ;
   - du flamand courant, pas du néerlandais de manuel : « ge » et « gij » à leur
     place, « hesp » plutôt que « ham », « pintje » plutôt que « bier » ;
   - court (quatre à huit mots), du vocabulaire déjà rencontré ;
   - {stad} et {bedrijf} sont remplacés par les réponses de la personne. */
(function () {
  'use strict';
  const S = (nl, fr, gap) => ({ nl, fr, gap });

  const EX = {
    /* ---- unité 1 : survivre ---- */
    'verstaan': [S('Sorry, ik kan u niet verstaan.', 'Pardon, je ne vous comprends pas.', 'verstaan'),
      S('Hebt ge dat verstaan?', 'Tu as compris ?', 'verstaan')],
    'herhalen': [S('Kunt ge dat nog eens herhalen?', 'Pouvez-vous répéter encore une fois ?', 'herhalen'),
      S('Ik ga het langzaam herhalen.', 'Je vais le répéter lentement.', 'herhalen')],
    'betekenen': [S('Wat betekent dat woord?', 'Que signifie ce mot ?', 'betekent'),
      S('Dat kan twee dingen betekenen.', 'Ça peut signifier deux choses.', 'betekenen')],
    'proberen': [S('Ik probeer het in het Nederlands.', 'J’essaie en néerlandais.', 'probeer'),
      S('Probeer het nog eens, trager.', 'Essaie encore une fois, plus lentement.', 'Probeer')],
    'spreken': [S('Spreekt ge een beetje Frans?', 'Vous parlez un peu français ?', 'Spreekt'),
      S('Ik spreek nog niet goed Nederlands.', 'Je ne parle pas encore bien néerlandais.', 'spreek')],
    'leren': [S('Ik leer Nederlands voor mijn werk.', 'J’apprends le néerlandais pour mon travail.', 'leer'),
      S('Mijn kinderen leren snel.', 'Mes enfants apprennent vite.', 'leren')],
    'zeggen': [S('Hoe zegt ge dat in het Nederlands?', 'Comment dit-on ça en néerlandais ?', 'zegt'),
      S('Zeg het maar in het Frans.', 'Dis-le donc en français.', 'Zeg')],
    'helpen': [S('Kan ik u helpen?', 'Puis-je vous aider ?', 'helpen'),
      S('Mijn collega helpt mij altijd.', 'Mon collègue m’aide toujours.', 'helpt')],
    'graag': [S('Ik werk graag met u samen.', 'J’aime bien travailler avec vous.', 'graag'),
      S('Een koffie, graag.', 'Un café, s’il vous plaît.', 'graag')],
    'trager': [S('Kunt ge wat trager spreken?', 'Pouvez-vous parler un peu plus lentement ?', 'trager'),
      S('Trager, alstublieft.', 'Plus lentement, s’il vous plaît.', 'Trager')],

    /* ---- unité 2 : moi et toi ---- */
    'heten': [S('Ik heet Tom en ik woon hier.', 'Je m’appelle Tom et j’habite ici.', 'heet'),
      S('Hoe heet uw collega?', 'Comment s’appelle votre collègue ?', 'heet')],
    'wonen': [S('Wij wonen al vijf jaar in {stad}.', 'Nous habitons à {stad} depuis cinq ans.', 'wonen'),
      S('Mijn zus woont in Gent.', 'Ma sœur habite à Gand.', 'woont')],
    'komen': [S('Ik kom uit Frankrijk.', 'Je viens de France.', 'kom'),
      S('Komt ge morgen naar kantoor?', 'Tu viens au bureau demain ?', 'Komt')],
    'werken': [S('Ik werk bij {bedrijf}.', 'Je travaille chez {bedrijf}.', 'werk'),
      S('Zij werkt van thuis uit.', 'Elle travaille de chez elle.', 'werkt')],
    'de naam': [S('Wat is uw naam, alstublieft?', 'Quel est votre nom, s’il vous plaît ?', 'naam'),
      S('Ik ben uw naam vergeten.', 'J’ai oublié votre nom.', 'naam')],
    'het jaar': [S('Ik woon hier al vijf jaar.', 'J’habite ici depuis cinq ans.', 'jaar'),
      S('Volgend jaar spreek ik beter Nederlands.', 'L’an prochain je parlerai mieux néerlandais.', 'jaar')],
    'getrouwd': [S('Ik ben getrouwd en heb twee kinderen.', 'Je suis marié et j’ai deux enfants.', 'getrouwd'),
      S('Zijn zus is niet getrouwd.', 'Sa sœur n’est pas mariée.', 'getrouwd')],
    'samen': [S('Wij doen dat samen.', 'On fait ça ensemble.', 'samen'),
      S('Samen met mijn collega.', 'Avec mon collègue.', 'Samen')],
    'het Nederlands': [S('Mijn Nederlands is nog niet goed.', 'Mon néerlandais n’est pas encore bon.', 'Nederlands'),
      S('Spreken wij Nederlands of Frans?', 'On parle néerlandais ou français ?', 'Nederlands')],

    /* ---- unité 3 : nombres et heure ---- */
    'het uur': [S('De vergadering duurt een uur.', 'La réunion dure une heure.', 'uur'),
      S('Om hoe laat, om acht uur?', 'À quelle heure, à huit heures ?', 'uur')],
    'de minuut': [S('Ik ben er over vijf minuten.', 'J’y suis dans cinq minutes.', 'minuten'),
      S('Nog één minuut, alstublieft.', 'Encore une minute, s’il vous plaît.', 'minuut')],
    'de dag': [S('Elke dag neem ik de trein.', 'Chaque jour je prends le train.', 'dag'),
      S('Het is een lange dag geweest.', 'Ça a été une longue journée.', 'dag')],
    'de week': [S('Volgende week ben ik thuis.', 'La semaine prochaine je suis à la maison.', 'week'),
      S('Ik werk vier dagen per week.', 'Je travaille quatre jours par semaine.', 'week')],
    'de maand': [S('Volgende maand ga ik op vakantie.', 'Le mois prochain je pars en vacances.', 'maand'),
      S('Elke maand betaal ik de huur.', 'Chaque mois je paie le loyer.', 'maand')],
    'vandaag': [S('Vandaag werk ik van thuis.', 'Aujourd’hui je travaille de chez moi.', 'Vandaag'),
      S('Is de bakker vandaag open?', 'Le boulanger est ouvert aujourd’hui ?', 'vandaag')],
    'morgen': [S('Morgen ga ik naar de dokter.', 'Demain je vais chez le médecin.', 'Morgen'),
      S('Tot morgen, collega!', 'À demain, collègue !', 'morgen')],
    'gisteren': [S('Gisteren heb ik mijn buurman gezien.', 'Hier j’ai vu mon voisin.', 'Gisteren'),
      S('Dat was gisteren al klaar.', 'C’était déjà prêt hier.', 'gisteren')],
    'vroeg': [S('Ik sta elke dag vroeg op.', 'Je me lève tôt tous les jours.', 'vroeg'),
      S('Het is nog te vroeg.', 'Il est encore trop tôt.', 'vroeg')],
    'laat': [S('Sorry, ik ben te laat.', 'Désolé, je suis en retard.', 'laat'),
      S('Het wordt laat vanavond.', 'Ça va finir tard ce soir.', 'laat')],
    'straks': [S('Ik bel u straks terug.', 'Je vous rappelle tout à l’heure.', 'straks'),
      S('Tot straks!', 'À tout à l’heure !', 'straks')],

    /* ---- unité 4 : chez le boulanger ---- */
    'het brood': [S('Een half wit brood, alstublieft.', 'Un demi pain blanc, s’il vous plaît.', 'brood'),
      S('Het brood is nog warm.', 'Le pain est encore chaud.', 'brood')],
    'het pistolet': [S('Vier pistolets, graag.', 'Quatre pistolets, s’il vous plaît.', 'pistolets'),
      S('Een pistolet met hesp.', 'Un pistolet au jambon.', 'pistolet')],
    'de koffiekoek': [S('Twee koffiekoeken voor de kinderen.', 'Deux couques pour les enfants.', 'koffiekoeken'),
      S('Op zondag eten wij een koffiekoek.', 'Le dimanche on mange une couque.', 'koffiekoek')],
    'de bakker': [S('Ik ga snel naar de bakker.', 'Je vais vite chez le boulanger.', 'bakker'),
      S('De bakker is op maandag gesloten.', 'Le boulanger est fermé le lundi.', 'bakker')],
    'de beenhouwer': [S('De beenhouwer in onze straat is goed.', 'Le boucher de notre rue est bon.', 'beenhouwer'),
      S('Ik koop mijn hesp bij de beenhouwer.', 'J’achète mon jambon chez le boucher.', 'beenhouwer')],
    'de hesp': [S('Een broodje met hesp en kaas.', 'Un sandwich jambon fromage.', 'hesp'),
      S('Is die hesp van vandaag?', 'Ce jambon est d’aujourd’hui ?', 'hesp')],
    'de kaas': [S('Voor mij een broodje kaas.', 'Pour moi un sandwich au fromage.', 'kaas'),
      S('De kaas is nogal duur.', 'Le fromage est assez cher.', 'kaas')],
    'de boter': [S('Een beetje boter op mijn brood.', 'Un peu de beurre sur mon pain.', 'boter'),
      S('De boter staat in de keuken.', 'Le beurre est dans la cuisine.', 'boter')],
    'het broodje': [S('Ik neem een broodje mee naar het werk.', 'J’emporte un sandwich au travail.', 'broodje'),
      S('Dat broodje was echt lekker.', 'Ce sandwich était vraiment bon.', 'broodje')],
    'de koffie': [S('Een koffie zonder suiker, graag.', 'Un café sans sucre, s’il vous plaît.', 'koffie'),
      S('Drinkt ge koffie of thee?', 'Tu bois du café ou du thé ?', 'koffie')],
    'het water': [S('Een glas water, alstublieft.', 'Un verre d’eau, s’il vous plaît.', 'water'),
      S('Ik drink veel water op het werk.', 'Je bois beaucoup d’eau au travail.', 'water')],
    'de pint': [S('Een pintje na het werk.', 'Une bière après le travail.', 'pintje'),
      S('Zij drinkt geen pint.', 'Elle ne boit pas de bière.', 'pint')],
    'de frieten': [S('Op vrijdag eten wij frieten.', 'Le vendredi on mange des frites.', 'frieten'),
      S('De frieten hier zijn de beste.', 'Les frites ici sont les meilleures.', 'frieten')],
    'lekker': [S('Dat was heel lekker, dank u.', 'C’était très bon, merci.', 'lekker'),
      S('De taart van de bakker is lekker.', 'La tarte du boulanger est bonne.', 'lekker')],
    'kosten': [S('Hoeveel kost dat?', 'Combien ça coûte ?', 'kost'),
      S('Die taart kost tien euro.', 'Cette tarte coûte dix euros.', 'kost')],
    'meenemen': [S('Is dat om mee te nemen?', 'C’est à emporter ?', 'nemen'),
      S('Ik neem twee broodjes mee.', 'J’emporte deux sandwichs.', 'neem')],

    /* ---- unité 5 : chez toi ---- */
    'het huis': [S('Ons huis staat in een rustige straat.', 'Notre maison est dans une rue calme.', 'huis'),
      S('Het huis van de buren is groot.', 'La maison des voisins est grande.', 'huis')],
    'de straat': [S('Wij wonen in dezelfde straat.', 'Nous habitons dans la même rue.', 'straat'),
      S('In onze straat is het rustig.', 'Dans notre rue c’est calme.', 'straat')],
    'de tuin': [S('De kinderen spelen in de tuin.', 'Les enfants jouent dans le jardin.', 'tuin'),
      S('Onze tuin is niet groot.', 'Notre jardin n’est pas grand.', 'tuin')],
    'de buurman': [S('Mijn buurman spreekt alleen Nederlands.', 'Mon voisin ne parle que néerlandais.', 'buurman'),
      S('De buurman helpt mij met de tuin.', 'Le voisin m’aide avec le jardin.', 'buurman')],
    'de buren': [S('De buren zijn heel vriendelijk.', 'Les voisins sont très gentils.', 'buren'),
      S('Ik ken de buren nog niet.', 'Je ne connais pas encore les voisins.', 'buren')],
    'de keuken': [S('De sleutel ligt in de keuken.', 'La clé est dans la cuisine.', 'keuken'),
      S('Wij eten in de keuken.', 'On mange dans la cuisine.', 'keuken')],
    'de living': [S('De living is klein maar rustig.', 'Le salon est petit mais calme.', 'living'),
      S('In de living staat de televisie.', 'La télévision est dans le salon.', 'living')],
    'het gemeentehuis': [S('Morgen moet ik naar het gemeentehuis.', 'Demain je dois aller à la maison communale.', 'gemeentehuis'),
      S('Het gemeentehuis is om vier uur gesloten.', 'La maison communale ferme à seize heures.', 'gemeentehuis')],
    'de gemeente': [S('De gemeente stuurt alles in het Nederlands.', 'La commune envoie tout en néerlandais.', 'gemeente'),
      S('Onze gemeente is niet groot.', 'Notre commune n’est pas grande.', 'gemeente')],
    'het containerpark': [S('Zaterdag ga ik naar het containerpark.', 'Samedi je vais au parc à conteneurs.', 'containerpark'),
      S('Het containerpark is zondag gesloten.', 'Le parc à conteneurs est fermé le dimanche.', 'containerpark')],
    'het pakje': [S('Er ligt een pakje bij de buren.', 'Il y a un colis chez les voisins.', 'pakje'),
      S('Mijn pakje komt vandaag.', 'Mon colis arrive aujourd’hui.', 'pakje')],
    'de sleutel': [S('Ik ben mijn sleutel vergeten.', 'J’ai oublié ma clé.', 'sleutel'),
      S('De sleutel van de garage hangt daar.', 'La clé du garage est accrochée là.', 'sleutel')],
    'de deur': [S('Doe de deur maar dicht.', 'Ferme la porte.', 'deur'),
      S('Er staat iemand aan de deur.', 'Il y a quelqu’un à la porte.', 'deur')],
    'de brievenbus': [S('Niets in de brievenbus vandaag.', 'Rien dans la boîte aux lettres aujourd’hui.', 'brievenbus'),
      S('De brievenbus staat naast de deur.', 'La boîte aux lettres est à côté de la porte.', 'brievenbus')],
    'vriendelijk': [S('De buurvrouw is altijd vriendelijk.', 'La voisine est toujours gentille.', 'vriendelijk'),
      S('Dat is vriendelijk van u.', 'C’est gentil de votre part.', 'vriendelijk')],
    'rustig': [S('Het is hier rustig ’s avonds.', 'C’est calme ici le soir.', 'rustig'),
      S('Een rustige straat, zonder veel auto’s.', 'Une rue calme, sans beaucoup de voitures.', 'rustige')],

    /* ---- unité 6 : famille et gens ---- */
    'de vrouw': [S('Mijn vrouw werkt in Brussel.', 'Ma femme travaille à Bruxelles.', 'vrouw'),
      S('Die vrouw woont naast ons.', 'Cette femme habite à côté de chez nous.', 'vrouw')],
    'de zoon': [S('Mijn zoon gaat naar school in {stad}.', 'Mon fils va à l’école à {stad}.', 'zoon'),
      S('Hun zoon is al twintig.', 'Leur fils a déjà vingt ans.', 'zoon')],
    'de dochter': [S('Onze dochter leert snel Nederlands.', 'Notre fille apprend vite le néerlandais.', 'dochter'),
      S('De dochter van de buren is jong.', 'La fille des voisins est jeune.', 'dochter')],
    'het kind': [S('Het kind speelt buiten.', 'L’enfant joue dehors.', 'kind'),
      S('Dat kind spreekt twee talen.', 'Cet enfant parle deux langues.', 'kind')],
    'de kinderen': [S('De kinderen eten om zes uur.', 'Les enfants mangent à dix-huit heures.', 'kinderen'),
      S('Wij hebben twee kinderen.', 'Nous avons deux enfants.', 'kinderen')],
    'de ouders': [S('Mijn ouders wonen niet in België.', 'Mes parents n’habitent pas en Belgique.', 'ouders'),
      S('De ouders wachten aan de school.', 'Les parents attendent devant l’école.', 'ouders')],
    'de zus': [S('Mijn zus komt dit weekend.', 'Ma sœur vient ce week-end.', 'zus'),
      S('Zijn zus werkt bij de gemeente.', 'Sa sœur travaille à la commune.', 'zus')],
    'de broer': [S('Mijn broer spreekt geen Nederlands.', 'Mon frère ne parle pas néerlandais.', 'broer'),
      S('Haar broer woont in Gent.', 'Son frère habite à Gand.', 'broer')],
    'de vriend': [S('Een vriend van mij werkt daar.', 'Un ami à moi travaille là.', 'vriend'),
      S('Mijn vriend helpt mij met Nederlands.', 'Mon ami m’aide avec le néerlandais.', 'vriend')],
    'de collega': [S('Mijn collega spreekt alleen Nederlands.', 'Mon collègue ne parle que néerlandais.', 'collega'),
      S('Een collega van {bedrijf} komt ook.', 'Un collègue de {bedrijf} vient aussi.', 'collega')],
    'de baas': [S('De baas is er vandaag niet.', 'Le patron n’est pas là aujourd’hui.', 'baas'),
      S('Onze baas spreekt ook Frans.', 'Notre patron parle aussi français.', 'baas')],
    'de mensen': [S('De mensen hier zijn vriendelijk.', 'Les gens ici sont gentils.', 'mensen'),
      S('Veel mensen spreken twee talen.', 'Beaucoup de gens parlent deux langues.', 'mensen')],
    'de school': [S('De school begint om half negen.', 'L’école commence à huit heures et demie.', 'school'),
      S('Onze kinderen gaan hier naar school.', 'Nos enfants vont à l’école ici.', 'school')],
    'iedereen': [S('Iedereen spreekt Nederlands op het werk.', 'Tout le monde parle néerlandais au travail.', 'Iedereen'),
      S('Dat weet iedereen hier.', 'Tout le monde ici sait ça.', 'iedereen')],
    'niemand': [S('Er is niemand thuis.', 'Il n’y a personne à la maison.', 'niemand'),
      S('Niemand heeft dat gezegd.', 'Personne n’a dit ça.', 'Niemand')],
    'streng': [S('De baas is streng maar eerlijk.', 'Le patron est sévère mais juste.', 'streng'),
      S('Die school is streng.', 'Cette école est sévère.', 'streng')]
  };

  /* Les phrases s'accrochent aux mots par leur forme exacte, article compris :
     si un mot est renommé dans le lexique, sa phrase ne suit pas en silence. */
  let missing = [];
  NL.content.units.forEach(u => (u.words || []).forEach(w => {
    if (EX[w.nl]) w.drills = EX[w.nl];
  }));
  Object.keys(EX).forEach(nl => {
    if (!NL.content.units.some(u => (u.words || []).some(w => w.nl === nl))) missing.push(nl);
  });
  NL.content.exampleReport = { attached: Object.keys(EX).length - missing.length, missing };
})();
