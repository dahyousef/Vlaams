/* Références : la prononciation, le tableau standard/flamand, le français caché
   dans le flamand, les familles de het, et les fiches qu'on ouvre dans le couloir
   trente secondes avant d'en avoir besoin. */
NL.content = NL.content || {};

/* Écrit pour un francophone, pas pour un anglophone : plusieurs voyelles
   néerlandaises existent déjà en français, ce qui est un avantage réel. */
NL.content.sounds = [
  { g: 'eu', ipa: '/ø/', good: true, say: 'Tu l’as déjà : c’est le <b>eu</b> de <i>peu</i>, identique. <span class="ex">deur</span>, <span class="ex">leuk</span>, <span class="ex">beenhouwer</span>. Un anglophone galère des mois là-dessus ; toi, non.' },
  { g: 'oe', ipa: '/u/', good: true, say: 'C’est le <b>ou</b> français, rien d’autre. <span class="ex">boek</span>, <span class="ex">goed</span>, <span class="ex">zoeken</span>. Ne le lis jamais comme un « oe » français.' },
  { g: 'u', ipa: '/y/', good: true, say: 'Le <b>u</b> de <i>tu</i>, exactement. <span class="ex">nu</span>, <span class="ex">minuut</span>, <span class="ex">uur</span>. Encore un cadeau du français.' },
  { g: 'g / ch', ipa: '/ɣ/ doux', say: 'En Flandre c’est le <b>g doux</b> : un souffle au milieu de la bouche, proche de la <i>jota</i> espagnole adoucie — et bien plus près de ton <b>r</b> français que du raclement d’Amsterdam. <span class="ex">goeiedag</span>, <span class="ex">gracht</span>. Si tu as copié des enregistrements du nord, c’est la première chose à désapprendre.' },
  { g: 'ui', ipa: '/œy/', say: 'Pars du <b>eu</b> de <i>peur</i>, lèvres arrondies, puis glisse vers « i ». <span class="ex">huis</span>, <span class="ex">buiten</span>, <span class="ex">uit</span>. Le français te donne le point de départ ; il ne reste que le glissement.' },
  { g: 'ij / ei', ipa: '/ɛi/', say: 'Même son, deux orthographes. Proche du <b>è</b> de <i>père</i> qui glisse vers « i ». En Flandre il est plus plat qu’au nord. <span class="ex">wij</span>, <span class="ex">klein</span>, <span class="ex">vrijdag</span>.' },
  { g: 'h', ipa: '/h/', warn: true, say: 'Le piège francophone numéro un : en néerlandais le <b>h</b> se prononce vraiment, avec un souffle. <span class="ex">huis</span>, <span class="ex">hebben</span>, <span class="ex">honger</span>. Le laisser tomber comme en français rend <i>hout</i> (bois) identique à <i>oud</i> (vieux).' },
  { g: 'sch', ipa: '/sx/', say: 's suivi du g doux. <span class="ex">school</span>, <span class="ex">schrijven</span>. À la <i>fin</i> d’un mot, c’est juste /s/ : <span class="ex">Belgisch</span>.' },
  { g: 'w', ipa: '/ʋ/', say: 'Entre le <b>v</b> et le <b>ou</b> français : les lèvres frôlent à peine les dents. <span class="ex">water</span>, <span class="ex">werk</span>. Jamais le « w » anglais.' },
  { g: 'accent tonique', ipa: '—', warn: true, say: 'Le français accentue la <b>dernière</b> syllabe ; le néerlandais accentue presque toujours la <b>première</b>. <span class="ex"><b>va</b>der</span>, <span class="ex"><b>wer</b>ken</span>, <span class="ex"><b>bak</b>ker</span>. Accentuer à la française est ce qui trahit le plus vite un francophone.' },
  { g: '-en final', ipa: '/ə/', say: 'Le <b>n</b> tombe presque toujours à l’oral : <span class="ex">werken</span> sonne « werke », <span class="ex">lopen</span> sonne « lope ». Écris le n, ne le dis pas.' },
  { g: 'suppression du t', ipa: '—', say: 'Le flamand rapide mange les t finaux : <span class="ex">niet</span> → « nie », <span class="ex">dat</span> → « da », <span class="ex">het</span> → « ’t ». C’est pour ça que ça semble plus rapide que ça ne l’est.' }
];

/* Produis la colonne de gauche. Comprends celle de droite. */
NL.content.register = [
  { std: 'jij / je bent', be: 'gij / ge zijt', note: 'Partout en informel, au bureau compris' },
  { std: 'jij hebt', be: 'gij hebt, g’hebt' },
  { std: 'kun je?', be: 'kunde?', note: 'Question contractée' },
  { std: 'heb je?', be: 'hebde?' },
  { std: 'ben je?', be: 'zijde?' },
  { std: 'leuk', be: 'plezant, tof' },
  { std: 'zin hebben in', be: 'goesting hebben in' },
  { std: 'vervelend', be: 'ambetant' },
  { std: 'hoi / doei', be: 'hey, salut, de groeten' },
  { std: 'dank je wel', be: 'merci', note: 'Ici ce n’est pas du français : c’est le mot flamand' },
  { std: 'de slager', be: 'de beenhouwer' },
  { std: 'de ham', be: 'de hesp' },
  { std: 'het broodje', be: 'het pistolet' },
  { std: 'de woonkamer', be: 'de living' },
  { std: 'de milieustraat', be: 'het containerpark' },
  { std: 'de wedstrijd', be: 'de match' },
  { std: 'langzamer', be: 'trager' },
  { std: 'begrijpen', be: 'verstaan' },
  { std: 'het recept (arts)', be: 'het voorschrift' },
  { std: 'pinnen', be: 'betalen met bancontact' },
  { std: 'wat vervelend!', be: 'amai, dat is ambetant!' },
  { std: 'de database', be: 'de databank', note: 'Au bureau aussi, le sud garde sa forme' }
];

/* L'avantage qu'un anglophone n'a pas. */
NL.content.loans = [
  { nl: 'merci', fr: 'merci', note: 'Le mot normal pour dire merci en Flandre' },
  { nl: 'allez', fr: 'allez', note: 'Ouvre ou ferme une phrase sur deux à l’oral' },
  { nl: 'plezant', fr: 'plaisant', note: 'Là où le nord dit leuk' },
  { nl: 'ambetant', fr: 'embêtant' },
  { nl: 'sjiek', fr: 'chic' },
  { nl: 'sjans', fr: 'chance' },
  { nl: 'een tas koffie', fr: 'une tasse' },
  { nl: 'de confituur', fr: 'confiture', note: 'Le nord dit jam' },
  { nl: 'het trottoir', fr: 'trottoir' },
  { nl: 'de paraplu', fr: 'parapluie' },
  { nl: 'de portefeuille', fr: 'portefeuille' },
  { nl: 'het pistolet', fr: 'pistolet', note: 'Le petit pain, gardé du français' },
  { nl: 'de camion', fr: 'camion', note: 'Flamand parlé ; l’écrit dit vrachtwagen' },
  { nl: 'het perron', fr: 'perron' },
  { nl: 'de fourchet', fr: 'fourchette', note: 'Dialecte ; le standard dit vork' },
  { nl: 'direct', fr: 'direct', note: 'Se dit pour « tout de suite »' }
];

/* Les faux amis, qui coûtent plus cher que les emprunts ne rapportent. */
NL.content.faux = [
  { nl: 'de bril', fr: 'les lunettes', trap: 'pas « brillant »' },
  { nl: 'het kot', fr: 'la piaule / le studio', trap: 'en Belgique, un logement d’étudiant' },
  { nl: 'de tas', fr: 'la tasse OU le sac', trap: 'selon le contexte' },
  { nl: 'blaffen', fr: 'aboyer', trap: 'rien à voir avec « bluffer »' },
  { nl: 'de wagen', fr: 'la voiture', trap: 'pas un wagon' },
  { nl: 'lopen', fr: 'courir (en Flandre)', trap: 'au nord, ça veut dire marcher' },
  { nl: 'het bureau', fr: 'le bureau (le meuble)', trap: 'la pièce, c’est het kantoor' },
  { nl: 'de fabriek', fr: 'l’usine', trap: 'pas « fabrique » au sens large' }
];

/* Environ 70% des mots het sont prévisibles. Voici les familles. */
NL.content.hetRules = [
  { rule: 'Tous les diminutifs en -je, -tje, -pje', ex: 'het meisje, het broodje, het pakje, het zakje', sure: true },
  { rule: 'Toutes les langues', ex: 'het Nederlands, het Frans, het Engels', sure: true },
  { rule: 'Les noms en ge-, be-, ver-, ont- sans suffixe', ex: 'het gebouw, het begin, het verhaal, het ontbijt' },
  { rule: 'Les verbes employés comme noms', ex: 'het eten, het werken, het wandelen', sure: true },
  { rule: 'Les métaux', ex: 'het goud, het zilver, het ijzer' },
  { rule: 'Les points cardinaux', ex: 'het noorden, het zuiden, het westen', sure: true },
  { rule: 'Les sports et les jeux', ex: 'het voetbal, het schaken, het tennis' },
  { rule: 'Les couleurs', ex: 'het rood, het groen, het blauw', sure: true },
  { rule: 'Les noms en -um, -aat, -sel, -isme', ex: 'het museum, het resultaat, het deksel' },
  { rule: 'Les pays, villes et lettres', ex: 'het mooie {stad}, het grote Brussel' }
];
NL.content.deRules = [
  { rule: 'TOUS les pluriels, sans exception', ex: 'de huizen, de kinderen, de boeken', sure: true },
  { rule: 'Les personnes et les métiers', ex: 'de bakker, de collega, de dokter' },
  { rule: 'Les noms en -ing, -heid, -tie, -teit, -schap', ex: 'de regering, de waarheid, de politie' },
  { rule: 'Les noms en -de, -te, -ij', ex: 'de liefde, de hoogte, de bakkerij' },
  { rule: 'Fruits, arbres, fleurs, montagnes, rivières', ex: 'de appel, de eik, de roos' },
  { rule: 'Les chiffres et les lettres employés comme noms', ex: 'de drie, de a' }
];

const S = (nl, fr, note) => ({ nl, fr, note });
NL.content.sheets = [
  {
    id: 'redden', title: 'Sauver la conversation', icon: '\u{1F9ED}',
    blurb: 'Les phrases qui empêchent un Flamand de basculer en français. À apprendre en premier.',
    groups: [
      {
        h: 'Rester en néerlandais', rows: [
          S('Mag ik het in het Nederlands proberen?', 'Puis-je essayer en néerlandais ?', 'Marche presque à tous les coups'),
          S('Ik ben Nederlands aan het leren.', 'J’apprends le néerlandais.'),
          S('Liever in het Nederlands, als het mag.', 'En néerlandais de préférence, si c’est possible.'),
          S('Ik oefen graag.', 'J’aime m’exercer.')
        ]
      },
      {
        h: 'Quand tu es perdu', rows: [
          S('Sorry, ik heb dat niet verstaan.', 'Pardon, je n’ai pas compris.'),
          S('Kunt u wat trager spreken?', 'Pouvez-vous parler plus lentement ?'),
          S('Kunt u dat herhalen?', 'Pouvez-vous répéter ?'),
          S('Wat betekent dat?', 'Qu’est-ce que ça veut dire ?'),
          S('Hoe zeg je dat in het Nederlands?', 'Comment dit-on ça en néerlandais ?'),
          S('Kunt u het opschrijven?', 'Pouvez-vous l’écrire ?', 'Lire est plus facile qu’entendre')
        ]
      },
      {
        h: 'Gagner du temps', rows: [
          S('Een momentje.', 'Un instant.'),
          S('Hoe zeg ik dat ook alweer...', 'Comment on dit déjà...', 'Trois secondes gagnées et ça sonne natif'),
          S('Ik zoek even het woord.', 'Je cherche le mot.'),
          S('Awel...', 'Ben...', 'Hésitation typiquement flamande. Utilise-la')
        ]
      }
    ]
  },
  {
    id: 'standup', title: 'Le stand-up', icon: '\u{1F4CB}',
    blurb: 'Quinze minutes, du néerlandais rapide, et quarante secondes pour toi. Écris ton texte une fois.',
    groups: [
      {
        h: 'Hier', rows: [
          S('Gisteren heb ik aan het ticket gewerkt.', 'Hier j’ai travaillé sur le ticket.'),
          S('Ik heb de bug opgelost.', 'J’ai corrigé le bug.'),
          S('Ik heb de testen afgewerkt.', 'J’ai terminé les tests.'),
          S('Ik heb de pull request gereviewd.', 'J’ai relu la pull request.')
        ]
      },
      {
        h: 'Aujourd’hui', rows: [
          S('Vandaag ga ik verder met de tests.', 'Aujourd’hui je continue les tests.'),
          S('Ik begin aan het nieuwe ticket.', 'Je commence le nouveau ticket.'),
          S('Ik ben er nog mee bezig.', 'J’y travaille encore.', 'La phrase de statut la plus utile qui soit'),
          S('Ik werk vandaag van thuis.', 'Je travaille de chez moi aujourd’hui.')
        ]
      },
      {
        h: 'Blocages', rows: [
          S('Ik zit vast op één ding.', 'Je bloque sur une chose.'),
          S('Ik wacht op de klant.', 'J’attends le client.'),
          S('Ik heb hulp nodig van iemand.', 'J’ai besoin d’aide.'),
          S('Geen blokkers.', 'Pas de blocages.'),
          S('Kunnen we dat offline bespreken?', 'On peut en parler après ?', 'Standard, et ça évite que le stand-up déborde')
        ]
      }
    ]
  },
  {
    id: 'vergadering', title: 'En réunion', icon: '\u{1F5E3}',
    blurb: 'Interrompre, contredire et demander une répétition sans perdre la face.',
    groups: [
      {
        h: 'Prendre la parole', rows: [
          S('Mag ik daar iets over zeggen?', 'Je peux dire un mot là-dessus ?'),
          S('Ik wil daar even op inpikken.', 'Je voudrais rebondir là-dessus.', 'Très flamand, très naturel'),
          S('Kort nog iets daarover.', 'Encore une chose là-dessus, brièvement.'),
          S('Sorry dat ik onderbreek, maar...', 'Désolé de couper, mais...')
        ]
      },
      {
        h: 'Tu as perdu le fil', rows: [
          S('Sorry, ik volg even niet meer.', 'Désolé, j’ai perdu le fil.'),
          S('Kunt u dat even samenvatten?', 'Pouvez-vous résumer ?'),
          S('Bedoelt u dat...?', 'Vous voulez dire que... ?'),
          S('Als ik het goed begrijp, ...', 'Si je comprends bien, ...', 'Gagne du temps et vérifie en même temps')
        ]
      },
      {
        h: 'D’accord, ou pas', rows: [
          S('Daar ben ik het mee eens.', 'Je suis d’accord.'),
          S('Ik denk er een beetje anders over.', 'Je le vois un peu autrement.', 'La façon flamande de contredire : sous-entendre'),
          S('Dat klopt, maar...', 'C’est exact, mais...'),
          S('Ik zou eerder zeggen dat...', 'Je dirais plutôt que...'),
          S('Laten we dat nog eens bekijken.', 'On va revoir ça.', 'Poli pour « pas maintenant »')
        ]
      },
      {
        h: 'Conclure', rows: [
          S('Wie doet wat?', 'Qui fait quoi ?'),
          S('Ik neem dat op mij.', 'Je prends ça en charge.'),
          S('Ik stuur een samenvatting.', 'J’envoie un résumé.'),
          S('Tegen wanneer moet dat klaar zijn?', 'Pour quand ça doit être prêt ?')
        ]
      }
    ]
  },
  {
    id: 'dev', title: 'Entre développeurs', icon: '\u{1F4BB}',
    blurb: 'Code review, build cassé, incident en production. Le registre compte autant que le vocabulaire.',
    groups: [
      {
        h: 'Code review', rows: [
          S('Kleine opmerking, geen blocker.', 'Petite remarque, pas bloquant.', 'Ouvre presque toutes les reviews'),
          S('Kunnen we dit niet beter apart zetten?', 'On ne devrait pas plutôt isoler ça ?', 'Une question, pas un ordre : c’est la clé'),
          S('Waarom heb je hiervoor gekozen?', 'Pourquoi avoir choisi ça ?'),
          S('Ziet er goed uit voor mij.', 'Ça me semble bon.'),
          S('Ik keur het goed, maar kijk nog even naar de testen.', 'J’approuve, mais regarde encore les tests.')
        ]
      },
      {
        h: 'Quand ça casse', rows: [
          S('De build is gebroken.', 'Le build est cassé.'),
          S('Er is een probleem op productie.', 'Il y a un problème en production.'),
          S('Dat komt door mijn wijziging, sorry.', 'Ça vient de ma modification, désolé.', 'Le reconnaître vite vaut mieux que bien'),
          S('We moeten terugrollen.', 'Il faut faire un rollback.'),
          S('Ik kijk er direct naar.', 'Je regarde ça tout de suite.')
        ]
      },
      {
        h: 'Expliquer la technique', rows: [
          S('Ik leg het even simpel uit.', 'Je vais l’expliquer simplement.'),
          S('Technisch kan dat, maar het kost tijd.', 'Techniquement c’est possible, mais ça prend du temps.'),
          S('Dat is niet zo eenvoudig als het lijkt.', 'Ce n’est pas aussi simple que ça en a l’air.'),
          S('Wat is precies de bedoeling?', 'Quel est exactement le but ?', 'La question qui sauve un sprint')
        ]
      },
      {
        h: 'Estimations', rows: [
          S('Dat wordt krap.', 'Ça va être juste.', 'Litote flamande : dire moins pour dire beaucoup'),
          S('Ik schat twee tot drie dagen.', 'J’estime deux à trois jours.'),
          S('Die story is te groot.', 'Cette story est trop grosse.'),
          S('Kunnen we dat opsplitsen?', 'On peut découper ça ?')
        ]
      }
    ]
  },
  {
    id: 'mail', title: 'Mail et Teams', icon: '✉',
    blurb: 'À l’écrit, le registre est tout. Se tromper d’ouverture est l’erreur qui se voit.',
    groups: [
      {
        h: 'Ouvertures', rows: [
          S('Beste collega’s,', 'Chers collègues,', 'Valeur sûre pour un groupe'),
          S('Beste meneer Janssens,', 'Monsieur Janssens,', 'Formel, externe, premier contact'),
          S('Dag Kris,', 'Salut Kris,', 'Le registre interne normal'),
          S('Hallo allemaal,', 'Bonjour à tous,', 'Teams, informel')
        ]
      },
      {
        h: 'Le corps', rows: [
          S('Ik kom even terug op uw mail van gisteren.', 'Je reviens sur votre mail d’hier.'),
          S('In bijlage vindt u het verslag.', 'Vous trouverez le compte rendu en annexe.', 'Tournure flamande ; le nord dit bijgevoegd'),
          S('Kunt u mij laten weten of dat lukt?', 'Pouvez-vous me dire si ça marche ?'),
          S('Alvast bedankt.', 'Merci d’avance.'),
          S('Laat maar weten.', 'Tiens-moi au courant.', 'Informel, Teams')
        ]
      },
      {
        h: 'Formules finales', rows: [
          S('Met vriendelijke groeten,', 'Cordialement,', 'Formel, externe'),
          S('Vriendelijke groeten,', 'Bien à vous,', 'Interne normal'),
          S('Groetjes,', 'Bises / À plus,', 'Collègues que tu connais'),
          S('Fijne dag nog!', 'Bonne journée !')
        ]
      },
      {
        h: 'u ou je ?', rows: [
          S('u — klanten, onbekenden, eerste mail', 'clients, inconnus, premier mail'),
          S('je — collega’s, na de eerste keer', 'collègues, après le premier échange'),
          S('Zeg gerust je.', 'Tu peux me tutoyer.', 'Quelqu’un te le proposera ; accepte')
        ]
      }
    ]
  },
  {
    id: 'koffie', title: 'À la machine à café', icon: '☕',
    blurb: 'Les deux minutes qui décident si les collègues t’intègrent. Météo, week-end, files.',
    groups: [
      {
        h: 'Ouvertures', rows: [
          S('Alles goed?', 'Ça va ?', 'Le bonjour flamand standard. Réponse : « Ja, en bij u? »'),
          S('En, hoe was het weekend?', 'Alors, c’était comment le week-end ?'),
          S('Amai, wat een weer, hè.', 'Oh là là, quel temps.'),
          S('Druk vandaag?', 'Chargé aujourd’hui ?'),
          S('Veel file gehad?', 'Beaucoup de files ?', 'Ne rate jamais son coup en Belgique')
        ]
      },
      {
        h: 'Réponses qui marchent', rows: [
          S('Niks speciaals, en bij u?', 'Rien de spécial, et toi ?', 'Complet et naturel. Renvoie la question'),
          S('Rustig gebleven, gelukkig.', 'C’est resté calme, heureusement.'),
          S('We hebben gewandeld met de kinderen.', 'On s’est promenés avec les enfants.'),
          S('Het was plezant.', 'C’était chouette.'),
          S('’t Gaat wel, een beetje moe.', 'Ça va, un peu fatigué.')
        ]
      },
      {
        h: 'Sortir', rows: [
          S('Allez, ik ga er weer in.', 'Allez, je m’y remets.', '« Allez » commence une phrase flamande sur deux'),
          S('Tot straks!', 'À tout à l’heure !'),
          S('Een goed weekend nog!', 'Bon week-end !', 'Vendredi seulement. Le « nog » n’est pas optionnel')
        ]
      }
    ]
  },
  {
    id: 'winkel', title: 'Magasin et boulangerie', icon: '\u{1F950}',
    blurb: 'Mot pour mot, ce qu’il faut dire au comptoir à {stad}.',
    groups: [
      {
        h: 'Commander', rows: [
          S('Een half wit, gesneden alstublieft.', 'Un demi pain blanc, tranché s’il vous plaît.'),
          S('Mag ik twee pistolets?', 'Puis-je avoir deux pistolets ?'),
          S('Ik zou graag ... hebben.', 'Je voudrais ...', 'La formule polie, remplis le trou'),
          S('Doe mij maar een koffiekoek.', 'Je vais prendre une couque.', 'Détendu et très local')
        ]
      },
      {
        h: 'Ce qu’on te demande', rows: [
          S('Is dat alles?', 'Ce sera tout ?', 'Réponse : Ja, dat is alles, merci'),
          S('Nog iets anders?', 'Autre chose ?'),
          S('Voor hier of om mee te nemen?', 'Sur place ou à emporter ?'),
          S('Met de kaart of cash?', 'Carte ou liquide ?'),
          S('Hebt u een klantenkaart?', 'Vous avez une carte de fidélité ?', 'Colruyt et Delhaize demandent toujours')
        ]
      },
      {
        h: 'Payer', rows: [
          S('Hoeveel is het?', 'Ça fait combien ?'),
          S('Kan ik met bancontact betalen?', 'Je peux payer par Bancontact ?'),
          S('Mag ik een zakje?', 'Puis-je avoir un sachet ?'),
          S('Merci, tot ziens!', 'Merci, au revoir !')
        ]
      }
    ]
  },
  {
    id: 'grammatica', title: 'La grammaire d’un coup d’œil', icon: '\u{1F4D0}',
    blurb: 'Les quatre tableaux qui valent la peine d’être dans ta poche.',
    groups: [
      {
        h: 'zijn et hebben', rows: [
          S('ik ben / ik heb', 'je suis / j’ai'),
          S('jij bent / jij hebt', 'tu es / tu as', 'En flamand : gij zijt / gij hebt'),
          S('hij is / hij heeft', 'il est / il a'),
          S('wij zijn / wij hebben', 'nous sommes / nous avons')
        ]
      },
      {
        h: 'Le présent', rows: [
          S('ik werk', 'radical'),
          S('jij werkt / hij werkt', 'radical + t'),
          S('werk jij?', 'pas de -t quand jij suit le verbe'),
          S('wij / jullie / zij werken', 'radical + en')
        ]
      },
      {
        h: 'L’ordre des mots', rows: [
          S('Ik ga morgen naar Brussel.', 'sujet - verbe - temps - lieu'),
          S('Morgen ga ik naar Brussel.', 'le verbe reste deuxième, le sujet passe derrière'),
          S('..., omdat ik moe ben.', 'subordonnée : le verbe part tout à la fin'),
          S('Ik sta om zes uur op.', 'préfixe séparable tout à la fin')
        ]
      },
      {
        h: 'Le passé, vite fait', rows: [
          S('Ik heb gewerkt.', 'hebben + ge...t'),
          S('Ik ben geweest.', 'zijn pour le mouvement et le changement, comme « être »'),
          S('Ik heb gezien / gedaan / gehad.', 'irréguliers, à apprendre en bloc')
        ]
      }
    ]
  }
];
