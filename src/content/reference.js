/* Références : la prononciation, le tableau standard/flamand, le français caché
   dans le flamand, les familles de het, et les fiches qu'on ouvre dans le couloir
   trente secondes avant d'en avoir besoin. */
NL.content = NL.content || {};

/* Écrit pour un francophone, pas pour un anglophone : plusieurs voyelles
   néerlandaises existent déjà en français, ce qui est un avantage réel. */
NL.content.sounds = [
  { g: 'eu', ipa: '/ø/', good: true, say: 'Tu l’as déjà : c’est le <b>eu</b> de <i>peu</i>, identique. <span class="ex">deur</span>, <span class="ex">leuk</span>, <span class="ex">beenhouwer</span>. Un anglophone galère des mois là-dessus ; toi, non.' },
  { g: 'oe', ipa: '/u/', good: true, say: 'C’est le <b>ou</b> français, rien d’autre. <span class="ex">boek</span>, <span class="ex">goed</span>, <span class="ex">zoeken</span>. Ne le lis jamais comme un « oe » français.' },
  { g: 'u', ipa: '/y/', good: true, say: 'Le <b class="nl">u</b> de <i>tu</i>, exactement. <span class="ex">nu</span>, <span class="ex">minuut</span>, <span class="ex">uur</span>. Encore un cadeau du français.' },
  { g: 'g / ch', ipa: '/ɣ/ doux', say: 'En Flandre c’est le <b>g doux</b> : un souffle au milieu de la bouche, proche de la <i>jota</i> espagnole adoucie — et bien plus près de ton <b>r</b> français que du raclement d’Amsterdam. <span class="ex">goeiedag</span>, <span class="ex">gracht</span>. Si tu as copié des enregistrements du nord, c’est la première chose à désapprendre.' },
  { g: 'ui', ipa: '/œy/', say: 'Pars du <b>eu</b> de <i>peur</i>, lèvres arrondies, puis glisse vers « i ». <span class="ex">huis</span>, <span class="ex">buiten</span>, <span class="ex">uit</span>. Le français te donne le point de départ ; il ne reste que le glissement.' },
  { g: 'ij / ei', ipa: '/ɛi/', say: 'Même son, deux orthographes. Proche du <b>è</b> de <i>père</i> qui glisse vers « i ». En Flandre il est plus plat qu’au nord. <span class="ex">wij</span>, <span class="ex">klein</span>, <span class="ex">vrijdag</span>.' },
  { g: 'h', ipa: '/h/', warn: true, say: 'Le piège francophone numéro un : en néerlandais le <b>h</b> se prononce vraiment, avec un souffle. <span class="ex">huis</span>, <span class="ex">hebben</span>, <span class="ex">honger</span>. Le laisser tomber comme en français rend <i class="nl">hout</i> (bois) identique à <i class="nl">oud</i> (vieux).' },
  { g: 'sch', ipa: '/sx/', say: 's suivi du g doux. <span class="ex">school</span>, <span class="ex">schrijven</span>. À la <i>fin</i> d’un mot, c’est juste /s/ : <span class="ex">Belgisch</span>.' },
  { g: 'w', ipa: '/ʋ/', say: 'Entre le <b>v</b> et le <b>ou</b> français : les lèvres frôlent à peine les dents. <span class="ex">water</span>, <span class="ex">werk</span>. Jamais le « w » anglais.' },
  { g: 'accent tonique', ipa: '—', warn: true, say: 'Le français accentue la <b>dernière</b> syllabe ; le néerlandais accentue presque toujours la <b>première</b>. <span class="ex"><b>va</b>der</span>, <span class="ex"><b>wer</b>ken</span>, <span class="ex"><b>bak</b>ker</span>. Accentuer à la française est ce qui trahit le plus vite un francophone.' },
  { g: '-en final', ipa: '/ə/', say: 'Le <b>n</b> tombe presque toujours à l’oral : <span class="ex">werken</span> sonne « werke », <span class="ex">lopen</span> sonne « lope ». Écris le n, ne le dis pas.' },
  { g: 'suppression du t', ipa: '—', say: 'Le flamand rapide mange les t finaux : <span class="ex">niet</span> → « nie », <span class="ex">dat</span> → « da », <span class="ex">het</span> → « ’t ». C’est pour ça que ça semble plus rapide que ça ne l’est.' }
];

/* Produis la colonne de gauche. Comprends celle de droite. */
NL.content.register = [
  { std: 'jij / je bent', be: 'gij / ge zijt', note: { fr: 'Partout en informel, au bureau compris', en: 'Everywhere informal, the office included' } },
  { std: 'jij hebt', be: 'gij hebt, g’hebt' },
  { std: 'kun je?', be: 'kunde?', note: { fr: 'Question contractée', en: 'Contracted question' } },
  { std: 'heb je?', be: 'hebde?' },
  { std: 'ben je?', be: 'zijde?' },
  { std: 'leuk', be: 'plezant, tof' },
  { std: 'zin hebben in', be: 'goesting hebben in' },
  { std: 'vervelend', be: 'ambetant' },
  { std: 'hoi / doei', be: 'hey, salut, de groeten' },
  { std: 'dank je wel', be: 'merci', note: { fr: 'Ici ce n’est pas du français : c’est le mot flamand', en: 'It looks French, but here it is simply the Flemish word' } },
  { std: 'de slager', be: 'de beenhouwer' },
  { std: 'de ham', be: 'de hesp' },
  { std: 'het broodje', be: 'de pistolet' },
  { std: 'de woonkamer', be: 'de living' },
  { std: 'de milieustraat', be: 'het containerpark' },
  { std: 'de wedstrijd', be: 'de match' },
  { std: 'langzamer', be: 'trager' },
  { std: 'begrijpen', be: 'verstaan' },
  { std: 'het recept (arts)', be: 'het voorschrift' },
  { std: 'pinnen', be: 'betalen met bancontact' },
  { std: 'wat vervelend!', be: 'amai, dat is ambetant!' },
  { std: 'de database', be: 'de databank', note: { fr: 'Au bureau aussi, le sud garde sa forme', en: 'At the office too, the south keeps its own form' } }
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
  { nl: 'de pistolet', fr: 'pistolet', note: 'Le petit pain, gardé du français' },
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

/* Les faux amis d'un anglophone : un néerlandais qui ressemble à de l'anglais et n'en est pas.
   Entièrement en anglais, dans les deux affichages. */
NL.content.fauxEn = [
  { nl: 'eventueel', en: 'possibly / if need be', trap: 'looks like “eventually”, which is uiteindelijk' },
  { nl: 'actueel', en: 'current / topical', trap: 'looks like “actually”, which is eigenlijk' },
  { nl: 'slim', en: 'clever / smart', trap: 'looks like “slim” (thin), which is dun or slank' },
  { nl: 'raar', en: 'strange / odd', trap: 'looks like “rare” (uncommon), which is zeldzaam' },
  { nl: 'de brand', en: 'fire', trap: 'looks like “brand” (a make), which is het merk' },
  { nl: 'door', en: 'through / by', trap: 'looks like “door”, which is de deur' },
  { nl: 'bellen', en: 'to ring / to phone', trap: 'looks like “bells”, but it is a verb: to ring someone up' },
  { nl: 'de map', en: 'folder / file', trap: 'looks like “map”, which is de kaart or de plattegrond' }
];

/* Pour qui chaque page est écrite : 'fr' pour les francophones, 'en' pour les anglophones, 'all' pour tous. */
NL.content.anchors = { sounds: 'fr', loans: 'fr', faux: 'fr', fauxEn: 'en', register: 'all', hetRules: 'all', deRules: 'all', sheets: 'all' };

/* Environ 70% des mots het sont prévisibles. Voici les familles. */
NL.content.hetRules = [
  { rule: { fr: 'Tous les diminutifs en -je, -tje, -pje', en: 'All diminutives in -je, -tje, -pje' }, ex: 'het meisje, het broodje, het pakje, het zakje', sure: true },
  { rule: { fr: 'Toutes les langues', en: 'All languages' }, ex: 'het Nederlands, het Frans, het Engels', sure: true },
  { rule: { fr: 'Les noms en ge-, be-, ver-, ont- sans suffixe', en: 'Nouns in ge-, be-, ver-, ont- without a suffix' }, ex: 'het gebouw, het begin, het verhaal, het ontbijt' },
  { rule: { fr: 'Les verbes employés comme noms', en: 'Verbs used as nouns' }, ex: 'het eten, het werken, het wandelen', sure: true },
  { rule: { fr: 'Les métaux', en: 'Metals' }, ex: 'het goud, het zilver, het ijzer' },
  { rule: { fr: 'Les points cardinaux', en: 'Points of the compass' }, ex: 'het noorden, het zuiden, het westen', sure: true },
  { rule: { fr: 'Les sports et les jeux', en: 'Sports and games' }, ex: 'het voetbal, het schaken, het tennis' },
  { rule: { fr: 'Les couleurs', en: 'Colours' }, ex: 'het rood, het groen, het blauw', sure: true },
  { rule: { fr: 'Les noms en -um, -aat, -sel, -isme', en: 'Nouns in -um, -aat, -sel, -isme' }, ex: 'het museum, het resultaat, het deksel' },
  { rule: { fr: 'Les pays, villes et lettres', en: 'Countries, towns and letters' }, ex: 'het mooie {stad}, het grote Brussel' }
];
NL.content.deRules = [
  { rule: { fr: 'TOUS les pluriels, sans exception', en: 'ALL plurals, without exception' }, ex: 'de huizen, de kinderen, de boeken', sure: true },
  { rule: { fr: 'Les personnes et les métiers', en: 'People and professions' }, ex: 'de bakker, de collega, de dokter' },
  { rule: { fr: 'Les noms en -ing, -heid, -tie, -teit, -schap', en: 'Nouns in -ing, -heid, -tie, -teit, -schap' }, ex: 'de regering, de waarheid, de politie' },
  { rule: { fr: 'Les noms en -de, -te, -ij', en: 'Nouns in -de, -te, -ij' }, ex: 'de liefde, de hoogte, de bakkerij' },
  { rule: { fr: 'Fruits, arbres, fleurs, montagnes, rivières', en: 'Fruit, trees, flowers, mountains, rivers' }, ex: 'de appel, de eik, de roos' },
  { rule: { fr: 'Les chiffres et les lettres employés comme noms', en: 'Numbers and letters used as nouns' }, ex: 'de drie, de a' }
];

const S = (nl, g, note) => ({ nl, ...NL.gloss.pair(g), note });
NL.content.sheets = [
  {
    id: 'redden', title: { fr: 'Sauver la conversation', en: 'Saving the conversation' }, icon: '\u{1F9ED}',
    blurb: { fr: 'Les phrases qui empêchent un Flamand de basculer en français. À apprendre en premier.', en: 'The phrases that stop a Fleming from switching to French. Learn these first.' },
    groups: [
      {
        h: { fr: 'Rester en néerlandais', en: 'Staying in Dutch' }, rows: [
          S('Mag ik het in het Nederlands proberen?', { fr: 'Puis-je essayer en néerlandais ?', en: 'May I try in Dutch?' }, { fr: 'Marche presque à tous les coups', en: 'Works almost every time' }),
          S('Ik ben Nederlands aan het leren.', { fr: 'J’apprends le néerlandais.', en: 'I am learning Dutch.' }),
          S('Liever in het Nederlands, als het mag.', { fr: 'En néerlandais de préférence, si c’est possible.', en: 'In Dutch, if possible.' }),
          S('Ik oefen graag.', { fr: 'J’aime m’exercer.', en: 'I like to practise.' })
        ]
      },
      {
        h: { fr: 'Quand tu es perdu', en: 'When you are lost' }, rows: [
          S('Sorry, ik heb dat niet verstaan.', { fr: 'Pardon, je n’ai pas compris.', en: 'Sorry, I did not understand.' }),
          S('Kunt u wat trager spreken?', { fr: 'Pouvez-vous parler plus lentement ?', en: 'Could you speak a bit slower? (formal)' }),
          S('Kunt u dat herhalen?', { fr: 'Pouvez-vous répéter ?', en: 'Could you repeat that? (formal)' }),
          S('Wat betekent dat?', { fr: 'Qu’est-ce que ça veut dire ?', en: 'What does that mean?' }),
          S('Hoe zeg je dat in het Nederlands?', { fr: 'Comment dit-on ça en néerlandais ?', en: 'How do you say that in Dutch?' }),
          S('Kunt u het opschrijven?', { fr: 'Pouvez-vous l’écrire ?', en: 'Could you write it down? (formal)' }, { fr: 'Lire est plus facile qu’entendre', en: 'Reading is easier than listening' })
        ]
      },
      {
        h: { fr: 'Gagner du temps', en: 'Buying time' }, rows: [
          S('Een momentje.', { fr: 'Un instant.', en: 'Just a moment.' }),
          S('Hoe zeg ik dat ook alweer...', { fr: 'Comment on dit déjà...', en: 'How do I say that again...' }, { fr: 'Trois secondes gagnées et ça sonne natif', en: 'Three seconds gained, and it sounds native' }),
          S('Ik zoek even het woord.', { fr: 'Je cherche le mot.', en: 'I am looking for the word.' }),
          S('Awel...', { fr: 'Ben...', en: 'Well...' }, { fr: 'Hésitation typiquement flamande. Utilise-la', en: 'A typically Flemish hesitation. Use it' })
        ]
      }
    ]
  },
  {
    id: 'standup', title: { fr: 'Le stand-up', en: 'The stand-up' }, icon: '\u{1F4CB}',
    blurb: { fr: 'Quinze minutes, du néerlandais rapide, et quarante secondes pour toi. Écris ton texte une fois.', en: 'Fifteen minutes, fast Dutch, and forty seconds for you. Write your text once.' },
    groups: [
      {
        h: { fr: 'Hier', en: 'Yesterday' }, rows: [
          S('Gisteren heb ik aan het ticket gewerkt.', { fr: 'Hier j’ai travaillé sur le ticket.', en: 'Yesterday I worked on the ticket.' }),
          S('Ik heb de bug opgelost.', { fr: 'J’ai corrigé le bug.', en: 'I fixed the bug.' }),
          S('Ik heb de testen afgewerkt.', { fr: 'J’ai terminé les tests.', en: 'I finished the tests.' }),
          S('Ik heb de pull request gereviewd.', { fr: 'J’ai relu la pull request.', en: 'I reviewed the pull request.' })
        ]
      },
      {
        h: { fr: 'Aujourd’hui', en: 'Today' }, rows: [
          S('Vandaag ga ik verder met de tests.', { fr: 'Aujourd’hui je continue les tests.', en: 'Today I am carrying on with the tests.' }),
          S('Ik begin aan het nieuwe ticket.', { fr: 'Je commence le nouveau ticket.', en: 'I am starting the new ticket.' }),
          S('Ik ben er nog mee bezig.', { fr: 'J’y travaille encore.', en: 'I am still working on it.' }, { fr: 'La phrase de statut la plus utile qui soit', en: 'The most useful status phrase there is' }),
          S('Ik werk vandaag van thuis.', { fr: 'Je travaille de chez moi aujourd’hui.', en: 'I am working from home today.' })
        ]
      },
      {
        h: { fr: 'Blocages', en: 'Blockers' }, rows: [
          S('Ik zit vast op één ding.', { fr: 'Je bloque sur une chose.', en: 'I am stuck on one thing.' }),
          S('Ik wacht op de klant.', { fr: 'J’attends le client.', en: 'I am waiting for the client.' }),
          S('Ik heb hulp nodig van iemand.', { fr: 'J’ai besoin d’aide.', en: 'I need help from someone.' }),
          S('Geen blokkers.', { fr: 'Pas de blocages.', en: 'No blockers.' }),
          S('Kunnen we dat offline bespreken?', { fr: 'On peut en parler après ?', en: 'Can we discuss that offline?' }, { fr: 'Standard, et ça évite que le stand-up déborde', en: 'Standard, and it keeps the stand-up from running over' })
        ]
      }
    ]
  },
  {
    id: 'vergadering', title: { fr: 'En réunion', en: 'In a meeting' }, icon: '\u{1F5E3}',
    blurb: { fr: 'Interrompre, contredire et demander une répétition sans perdre la face.', en: 'Interrupting, disagreeing and asking for a repeat without losing face.' },
    groups: [
      {
        h: { fr: 'Prendre la parole', en: 'Taking the floor' }, rows: [
          S('Mag ik daar iets over zeggen?', { fr: 'Je peux dire un mot là-dessus ?', en: 'May I say something about that?' }),
          S('Ik wil daar even op inpikken.', { fr: 'Je voudrais rebondir là-dessus.', en: 'I would like to pick up on that.' }, { fr: 'Très flamand, très naturel', en: 'Very Flemish, very natural' }),
          S('Kort nog iets daarover.', { fr: 'Encore une chose là-dessus, brièvement.', en: 'One more brief thing about that.' }),
          S('Sorry dat ik onderbreek, maar...', { fr: 'Désolé de couper, mais...', en: 'Sorry to interrupt, but...' })
        ]
      },
      {
        h: { fr: 'Tu as perdu le fil', en: 'You have lost the thread' }, rows: [
          S('Sorry, ik volg even niet meer.', { fr: 'Désolé, j’ai perdu le fil.', en: 'Sorry, I have lost the thread.' }),
          S('Kunt u dat even samenvatten?', { fr: 'Pouvez-vous résumer ?', en: 'Could you summarise that? (formal)' }),
          S('Bedoelt u dat...?', { fr: 'Vous voulez dire que... ?', en: 'Do you mean that...? (formal)' }),
          S('Als ik het goed begrijp, ...', { fr: 'Si je comprends bien, ...', en: 'If I understand correctly, ...' }, { fr: 'Gagne du temps et vérifie en même temps', en: 'Buys you time and checks at the same time' })
        ]
      },
      {
        h: { fr: 'D’accord, ou pas', en: 'Agreeing, or not' }, rows: [
          S('Daar ben ik het mee eens.', { fr: 'Je suis d’accord.', en: 'I agree.' }),
          S('Ik denk er een beetje anders over.', { fr: 'Je le vois un peu autrement.', en: 'I see it a little differently.' }, { fr: 'La façon flamande de contredire : sous-entendre', en: 'The Flemish way to disagree: understate' }),
          S('Dat klopt, maar...', { fr: 'C’est exact, mais...', en: 'That is right, but...' }),
          S('Ik zou eerder zeggen dat...', { fr: 'Je dirais plutôt que...', en: 'I would rather say that...' }),
          S('Laten we dat nog eens bekijken.', { fr: 'On va revoir ça.', en: 'Let us look at that again.' }, { fr: 'Poli pour « pas maintenant »', en: 'Polite for “not now”' })
        ]
      },
      {
        h: { fr: 'Conclure', en: 'Wrapping up' }, rows: [
          S('Wie doet wat?', { fr: 'Qui fait quoi ?', en: 'Who does what?' }),
          S('Ik neem dat op mij.', { fr: 'Je prends ça en charge.', en: 'I will take that on.' }),
          S('Ik stuur een samenvatting.', { fr: 'J’envoie un résumé.', en: 'I will send a summary.' }),
          S('Tegen wanneer moet dat klaar zijn?', { fr: 'Pour quand ça doit être prêt ?', en: 'By when does that need to be ready?' })
        ]
      }
    ]
  },
  {
    id: 'dev', title: { fr: 'Entre développeurs', en: 'Between developers' }, icon: '\u{1F4BB}',
    blurb: { fr: 'Code review, build cassé, incident en production. Le registre compte autant que le vocabulaire.', en: 'Code review, broken build, production incident. Register matters as much as vocabulary.' },
    groups: [
      {
        h: { fr: 'Code review', en: 'Code review' }, rows: [
          S('Kleine opmerking, geen blocker.', { fr: 'Petite remarque, pas bloquant.', en: 'Small comment, not a blocker.' }, { fr: 'Ouvre presque toutes les reviews', en: 'Opens almost every review' }),
          S('Kunnen we dit niet beter apart zetten?', { fr: 'On ne devrait pas plutôt isoler ça ?', en: 'Shouldn’t we set this apart instead?' }, { fr: 'Une question, pas un ordre : c’est la clé', en: 'A question, not an order: that is the key' }),
          S('Waarom heb je hiervoor gekozen?', { fr: 'Pourquoi avoir choisi ça ?', en: 'Why did you choose this? (informal)' }),
          S('Ziet er goed uit voor mij.', { fr: 'Ça me semble bon.', en: 'Looks good to me.' }),
          S('Ik keur het goed, maar kijk nog even naar de testen.', { fr: 'J’approuve, mais regarde encore les tests.', en: 'I approve, but have another look at the tests. (informal)' })
        ]
      },
      {
        h: { fr: 'Quand ça casse', en: 'When it breaks' }, rows: [
          S('De build is gebroken.', { fr: 'Le build est cassé.', en: 'The build is broken.' }),
          S('Er is een probleem op productie.', { fr: 'Il y a un problème en production.', en: 'There is a problem in production.' }),
          S('Dat komt door mijn wijziging, sorry.', { fr: 'Ça vient de ma modification, désolé.', en: 'That comes from my change, sorry.' }, { fr: 'Le reconnaître vite vaut mieux que bien', en: 'Owning up quickly beats owning up well' }),
          S('We moeten terugrollen.', { fr: 'Il faut faire un rollback.', en: 'We have to roll back.' }),
          S('Ik kijk er direct naar.', { fr: 'Je regarde ça tout de suite.', en: 'I am looking at it right away.' })
        ]
      },
      {
        h: { fr: 'Expliquer la technique', en: 'Explaining the technical side' }, rows: [
          S('Ik leg het even simpel uit.', { fr: 'Je vais l’expliquer simplement.', en: 'I will explain it simply.' }),
          S('Technisch kan dat, maar het kost tijd.', { fr: 'Techniquement c’est possible, mais ça prend du temps.', en: 'Technically that is possible, but it takes time.' }),
          S('Dat is niet zo eenvoudig als het lijkt.', { fr: 'Ce n’est pas aussi simple que ça en a l’air.', en: 'It is not as simple as it looks.' }),
          S('Wat is precies de bedoeling?', { fr: 'Quel est exactement le but ?', en: 'What exactly is the aim?' }, { fr: 'La question qui sauve un sprint', en: 'The question that saves a sprint' })
        ]
      },
      {
        h: { fr: 'Estimations', en: 'Estimates' }, rows: [
          S('Dat wordt krap.', { fr: 'Ça va être juste.', en: 'That is going to be tight.' }, { fr: 'Litote flamande : dire moins pour dire beaucoup', en: 'Flemish understatement: say less to say a lot' }),
          S('Ik schat twee tot drie dagen.', { fr: 'J’estime deux à trois jours.', en: 'I estimate two to three days.' }),
          S('Die story is te groot.', { fr: 'Cette story est trop grosse.', en: 'That story is too big.' }),
          S('Kunnen we dat opsplitsen?', { fr: 'On peut découper ça ?', en: 'Can we split that up?' })
        ]
      }
    ]
  },
  {
    id: 'mail', title: { fr: 'Mail et Teams', en: 'Email and Teams' }, icon: '✉',
    blurb: { fr: 'À l’écrit, le registre est tout. Se tromper d’ouverture est l’erreur qui se voit.', en: 'In writing, register is everything. The wrong opening is the mistake that shows.' },
    groups: [
      {
        h: { fr: 'Ouvertures', en: 'Openings' }, rows: [
          S('Beste collega’s,', { fr: 'Chers collègues,', en: 'Dear colleagues,' }, { fr: 'Valeur sûre pour un groupe', en: 'A safe choice for a group' }),
          S('Beste meneer Janssens,', { fr: 'Monsieur Janssens,', en: 'Dear Mr Janssens,' }, { fr: 'Formel, externe, premier contact', en: 'Formal, external, first contact' }),
          S('Dag Kris,', { fr: 'Salut Kris,', en: 'Hi Kris,' }, { fr: 'Le registre interne normal', en: 'The normal internal register' }),
          S('Hallo allemaal,', { fr: 'Bonjour à tous,', en: 'Hello everyone,' }, { fr: 'Teams, informel', en: 'Teams, informal' })
        ]
      },
      {
        h: { fr: 'Le corps', en: 'The body' }, rows: [
          S('Ik kom even terug op uw mail van gisteren.', { fr: 'Je reviens sur votre mail d’hier.', en: 'I am following up on your email from yesterday. (formal)' }),
          S('In bijlage vindt u het verslag.', { fr: 'Vous trouverez le compte rendu en annexe.', en: 'You will find the report attached. (formal)' }, { fr: 'Tournure flamande ; le nord dit bijgevoegd', en: 'Flemish phrasing; the north says bijgevoegd' }),
          S('Kunt u mij laten weten of dat lukt?', { fr: 'Pouvez-vous me dire si ça marche ?', en: 'Could you let me know if that works? (formal)' }),
          S('Alvast bedankt.', { fr: 'Merci d’avance.', en: 'Thanks in advance.' }),
          S('Laat maar weten.', { fr: 'Tiens-moi au courant.', en: 'Let me know.' }, { fr: 'Informel, Teams', en: 'Informal, Teams' })
        ]
      },
      {
        h: { fr: 'Formules finales', en: 'Sign-offs' }, rows: [
          S('Met vriendelijke groeten,', { fr: 'Cordialement,', en: 'Kind regards,' }, { fr: 'Formel, externe', en: 'Formal, external' }),
          S('Vriendelijke groeten,', { fr: 'Bien à vous,', en: 'Best regards,' }, { fr: 'Interne normal', en: 'Normal internal' }),
          S('Groetjes,', { fr: 'Bises / À plus,', en: 'Cheers / See you,' }, { fr: 'Collègues que tu connais', en: 'Colleagues you know (informal)' }),
          S('Fijne dag nog!', { fr: 'Bonne journée !', en: 'Have a good day!' })
        ]
      },
      {
        h: { fr: 'u ou je ?', en: 'u or je?' }, rows: [
          S('u — klanten, onbekenden, eerste mail', { fr: 'clients, inconnus, premier mail', en: 'customers, strangers, first email' }),
          S('je — collega’s, na de eerste keer', { fr: 'collègues, après le premier échange', en: 'colleagues, after the first exchange' }),
          S('Zeg gerust je.', { fr: 'Tu peux me tutoyer.', en: 'Feel free to use “je” with me.' }, { fr: 'Quelqu’un te le proposera ; accepte', en: 'Someone will offer it; accept' })
        ]
      }
    ]
  },
  {
    id: 'koffie', title: { fr: 'À la machine à café', en: 'At the coffee machine' }, icon: '☕',
    blurb: { fr: 'Les deux minutes qui décident si les collègues t’intègrent. Météo, week-end, files.', en: 'The two minutes that decide whether colleagues take you in. Weather, weekend, traffic jams.' },
    groups: [
      {
        h: { fr: 'Ouvertures', en: 'Openings' }, rows: [
          S('Alles goed?', { fr: 'Ça va ?', en: 'How are you?' }, { fr: 'Le bonjour flamand standard. Réponse : « Ja, en bij u? »', en: 'The standard Flemish hello. Reply: “Ja, en bij u?”' }),
          S('En, hoe was het weekend?', { fr: 'Alors, c’était comment le week-end ?', en: 'So, how was the weekend?' }),
          S('Amai, wat een weer, hè.', { fr: 'Oh là là, quel temps.', en: 'Oh dear, what weather.' }),
          S('Druk vandaag?', { fr: 'Chargé aujourd’hui ?', en: 'Busy today?' }),
          S('Veel file gehad?', { fr: 'Beaucoup de files ?', en: 'Lots of traffic?' }, { fr: 'Ne rate jamais son coup en Belgique', en: 'Never fails in Belgium' })
        ]
      },
      {
        h: { fr: 'Réponses qui marchent', en: 'Answers that work' }, rows: [
          S('Niks speciaals, en bij u?', { fr: 'Rien de spécial, et toi ?', en: 'Nothing special, and you? (informal, Flemish u)' }, { fr: 'Complet et naturel. Renvoie la question', en: 'Complete and natural. Return the question' }),
          S('Rustig gebleven, gelukkig.', { fr: 'C’est resté calme, heureusement.', en: 'It stayed quiet, luckily.' }),
          S('We hebben gewandeld met de kinderen.', { fr: 'On s’est promenés avec les enfants.', en: 'We went for a walk with the children.' }),
          S('Het was plezant.', { fr: 'C’était chouette.', en: 'It was great.' }),
          S('’t Gaat wel, een beetje moe.', { fr: 'Ça va, un peu fatigué.', en: 'Fine, a bit tired.' })
        ]
      },
      {
        h: { fr: 'Sortir', en: 'Getting away' }, rows: [
          S('Allez, ik ga er weer in.', { fr: 'Allez, je m’y remets.', en: 'Right, back to it.' }, { fr: '« Allez » commence une phrase flamande sur deux', en: '“Allez” starts every other Flemish sentence' }),
          S('Tot straks!', { fr: 'À tout à l’heure !', en: 'See you later!' }),
          S('Een goed weekend nog!', { fr: 'Bon week-end !', en: 'Have a good weekend!' }, { fr: 'Vendredi seulement. Le « nog » n’est pas optionnel', en: 'Fridays only. The “nog” is not optional' })
        ]
      }
    ]
  },
  {
    id: 'winkel', title: { fr: 'Magasin et boulangerie', en: 'Shop and bakery' }, icon: '\u{1F950}',
    blurb: { fr: 'Mot pour mot, ce qu’il faut dire au comptoir à {stad}.', en: 'Word for word, what to say at the counter in {stad}.' },
    groups: [
      {
        h: { fr: 'Commander', en: 'Ordering' }, rows: [
          S('Een half wit, gesneden alstublieft.', { fr: 'Un demi pain blanc, tranché s’il vous plaît.', en: 'Half a white loaf, sliced please.' }),
          S('Mag ik twee pistolets?', { fr: 'Puis-je avoir deux pistolets ?', en: 'May I have two pistolets?' }),
          S('Ik zou graag ... hebben.', { fr: 'Je voudrais ...', en: 'I would like ...' }, { fr: 'La formule polie, remplis le trou', en: 'The polite formula, fill in the gap' }),
          S('Doe mij maar een koffiekoek.', { fr: 'Je vais prendre une couque.', en: 'I’ll have a pastry.' }, { fr: 'Détendu et très local', en: 'Relaxed and very local' })
        ]
      },
      {
        h: { fr: 'Ce qu’on te demande', en: 'What they ask you' }, rows: [
          S('Is dat alles?', { fr: 'Ce sera tout ?', en: 'Will that be all?' }, { fr: 'Réponse : Ja, dat is alles, merci', en: 'Reply: Ja, dat is alles, merci' }),
          S('Nog iets anders?', { fr: 'Autre chose ?', en: 'Anything else?' }),
          S('Voor hier of om mee te nemen?', { fr: 'Sur place ou à emporter ?', en: 'Eat in or take away?' }),
          S('Met de kaart of cash?', { fr: 'Carte ou liquide ?', en: 'Card or cash?' }),
          S('Hebt u een klantenkaart?', { fr: 'Vous avez une carte de fidélité ?', en: 'Do you have a loyalty card? (formal)' }, { fr: 'Colruyt et Delhaize demandent toujours', en: 'Colruyt and Delhaize always ask' })
        ]
      },
      {
        h: { fr: 'Payer', en: 'Paying' }, rows: [
          S('Hoeveel is het?', { fr: 'Ça fait combien ?', en: 'How much is it?' }),
          S('Kan ik met bancontact betalen?', { fr: 'Je peux payer par Bancontact ?', en: 'Can I pay by Bancontact?' }),
          S('Mag ik een zakje?', { fr: 'Puis-je avoir un sachet ?', en: 'May I have a bag?' }),
          S('Merci, tot ziens!', { fr: 'Merci, au revoir !', en: 'Thank you, goodbye!' })
        ]
      }
    ]
  },
  {
    id: 'grammatica', title: { fr: 'La grammaire d’un coup d’œil', en: 'Grammar at a glance' }, icon: '\u{1F4D0}',
    blurb: { fr: 'Les quatre tableaux qui valent la peine d’être dans ta poche.', en: 'The four tables worth keeping in your pocket.' },
    groups: [
      {
        h: { fr: 'zijn et hebben', en: 'zijn and hebben' }, rows: [
          S('ik ben / ik heb', { fr: 'je suis / j’ai', en: 'I am / I have' }),
          S('jij bent / jij hebt', { fr: 'tu es / tu as', en: 'you are / you have (informal)' }, { fr: 'En flamand : gij zijt / gij hebt', en: 'In Flemish: gij zijt / gij hebt' }),
          S('hij is / hij heeft', { fr: 'il est / il a', en: 'he is / he has' }),
          S('wij zijn / wij hebben', { fr: 'nous sommes / nous avons', en: 'we are / we have' })
        ]
      },
      {
        h: { fr: 'Le présent', en: 'The present tense' }, rows: [
          S('ik werk', { fr: 'radical', en: 'stem' }),
          S('jij werkt / hij werkt', { fr: 'radical + t', en: 'stem + t' }),
          S('werk jij?', { fr: 'pas de -t quand jij suit le verbe', en: 'no -t when jij follows the verb' }),
          S('wij / jullie / zij werken', { fr: 'radical + en', en: 'stem + en' })
        ]
      },
      {
        h: { fr: 'L’ordre des mots', en: 'Word order' }, rows: [
          S('Ik ga morgen naar Brussel.', { fr: 'sujet - verbe - temps - lieu', en: 'subject - verb - time - place' }),
          S('Morgen ga ik naar Brussel.', { fr: 'le verbe reste deuxième, le sujet passe derrière', en: 'the verb stays second, the subject moves behind it' }),
          S('..., omdat ik moe ben.', { fr: 'subordonnée : le verbe part tout à la fin', en: 'subordinate clause: the verb goes right to the end' }),
          S('Ik sta om zes uur op.', { fr: 'préfixe séparable tout à la fin', en: 'separable prefix goes right to the end' })
        ]
      },
      {
        h: { fr: 'Le passé, vite fait', en: 'The past tense, quickly' }, rows: [
          S('Ik heb gewerkt.', { fr: 'hebben + ge...t', en: 'hebben + ge...t' }),
          S('Ik ben geweest.', { fr: 'zijn pour le mouvement et le changement, comme « être »', en: 'zijn for movement and change of state' }),
          S('Ik heb gezien / gedaan / gehad.', { fr: 'irréguliers, à apprendre en bloc', en: 'irregular, learn them as a block' })
        ]
      }
    ]
  }
];
