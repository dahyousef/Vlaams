/* Règles de grammaire des unités 13 à 34. Même forme que grammar.js.
   Écrit par la fusion du genre grammar (tools/content/kinds/grammar.js) depuis ses lignes prises :
   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de
   lexicon.a1c.js gardent grammar: [] dans leur fichier ; la boucle en bas range chaque règle dans la
   liste de son unité au chargement, et lève une erreur, avec l’id de la règle, quand l’unité manque. */
NL.content = NL.content || {};
NL.content.patterns = NL.content.patterns || [];
(function () {
  'use strict';
  const D = (nl, g, gap) => ({ nl, ...NL.gloss.pair(g), gap });
  const P = p => NL.content.patterns.push(p);

  P({
    id: 'g-niet-geen', unit: 'vragen', level: 'A1',
    title: { fr: '<span class="nl">niet</span> ou <span class="nl">geen</span>', en: '<span class="nl">niet</span> or <span class="nl">geen</span>' },
    rule: { fr: '« geen » remplace « een » + nom ; « niet » nie tout le reste.', en: '“geen” replaces “een” + noun; “niet” negates everything else.' },
    nl: 'Ik heb geen tijd.', fr: 'Je n’ai pas le temps.', en: 'I have no time.',
    explain: {
      fr: 'Le néerlandais a deux négations. <i class="nl">geen</i> remplace <i class="nl">een</i> + nom, ou se met devant un nom sans article : <span class="ex">Hij heeft een auto</span> devient <span class="ex">Hij heeft geen auto</span> (comme le français change un en de : il n’a pas de voiture). Tout le reste prend <i class="nl">niet</i> : un verbe, un adjectif, un lieu, un nom avec <i class="nl">de</i> ou <i class="nl">het</i>. Comme pas, <i class="nl">niet</i> se place devant un adjectif, un lieu ou un second verbe : <span class="ex">Het is niet groot</span>, <span class="ex">Ik kan niet komen</span>. Piège : après un objet avec <i class="nl">de</i> ou <i class="nl">het</i>, <i class="nl">niet</i> vient derrière l’objet, alors que pas reste collé au verbe : <span class="ex">Ik ken de man niet</span>, et non <span class="ex">Ik ken niet de man</span>.',
      en: 'Dutch has two negations. <i class="nl">geen</i> replaces <i class="nl">een</i> + noun, or stands before a noun with no article: <span class="ex">Hij heeft een auto</span> becomes <span class="ex">Hij heeft geen auto</span> (French does something similar with its indefinite article). Everything else takes <i class="nl">niet</i>: a verb, an adjective, a place, a noun with <i class="nl">de</i> or <i class="nl">het</i>. Like the French negation, <i class="nl">niet</i> stands before an adjective, a place or a second verb: <span class="ex">Het is niet groot</span>, <span class="ex">Ik kan niet komen</span>. Trap: after an object with <i class="nl">de</i> or <i class="nl">het</i>, <i class="nl">niet</i> comes behind the object, where French keeps its negation next to the verb: <span class="ex">Ik ken de man niet</span>, not <span class="ex">Ik ken niet de man</span>.'
    },
    drills: [
      D('Ik heb geen tijd.', { fr: 'Je n’ai pas le temps.', en: 'I have no time.' }, 'geen'),
      D('Hij heeft geen auto.', { fr: 'Il n’a pas de voiture.', en: 'He has no car.' }, 'geen'),
      D('Ik ken de man niet.', { fr: 'Je ne connais pas cet homme.', en: 'I don’t know the man.' }, 'niet'),
      D('Het is niet groot.', { fr: 'Ce n’est pas grand.', en: 'It is not big.' }, 'niet'),
      D('Ik kan niet komen.', { fr: 'Je ne peux pas venir.', en: 'I can’t come.' }, 'niet')
    ]
  });

  P({
    id: 'g-bijzin', unit: 'vragen', level: 'A1',
    title: { fr: 'Après <span class="nl">omdat</span>, <span class="nl">als</span>, <span class="nl">dat</span>', en: 'After <span class="nl">omdat</span>, <span class="nl">als</span>, <span class="nl">dat</span>' },
    rule: { fr: 'Après « omdat », « als », « dat » (que), le verbe va à la fin.', en: 'After “omdat”, “als”, “dat” (that), the verb goes to the end.' },
    nl: 'Ik kom niet omdat ik ziek ben.', fr: 'Je ne viens pas parce que je suis malade.', en: 'I’m not coming because I’m ill.',
    explain: {
      fr: 'Après les conjonctions <i class="nl">omdat</i> (parce que), <i class="nl">als</i> (si, quand) et <i class="nl">dat</i> (que), le verbe conjugué file tout au bout de sa proposition : <span class="ex">Ik kom niet omdat ik ziek ben</span>, <span class="ex">Ik zeg dat hij werkt</span>. Le français garde le verbe près du sujet ; le néerlandais le range en dernier. Attention : <i class="nl">dat</i> (ce, cela) n’est pas toujours une conjonction : <span class="ex">Dat is een lekkere koffie</span> garde le verbe en deuxième place. <i class="nl">want</i> et <i class="nl">maar</i> ne changent rien : <span class="ex">Ik kom niet want ik ben ziek</span>. Si la proposition avec <i class="nl">als</i> vient en premier, la principale démarre par son verbe : <span class="ex">Als het regent, blijf ik thuis</span>.',
      en: 'After the conjunctions <i class="nl">omdat</i> (because), <i class="nl">als</i> (if, when) and <i class="nl">dat</i> (that), the conjugated verb goes to the very end of its clause: <span class="ex">Ik kom niet omdat ik ziek ben</span>, <span class="ex">Ik zeg dat hij werkt</span>. French keeps the verb next to the subject; Dutch puts it last. Careful: <i class="nl">dat</i> (this, that) is not always a conjunction: <span class="ex">Dat is een lekkere koffie</span> keeps the verb second. <i class="nl">want</i> and <i class="nl">maar</i> change nothing: <span class="ex">Ik kom niet want ik ben ziek</span>. If the clause with <i class="nl">als</i> comes first, the main clause starts with its verb: <span class="ex">Als het regent, blijf ik thuis</span>.'
    },
    drills: [
      D('Ik kom niet omdat ik ziek ben.', { fr: 'Je ne viens pas parce que je suis malade.', en: 'I’m not coming because I’m ill.' }, 'ben'),
      D('Ik zeg dat hij werkt.', { fr: 'Je dis qu’il travaille.', en: 'I say that he is working.' }, 'werkt'),
      D('Als het regent, blijf ik thuis.', { fr: 'S’il pleut, je reste à la maison.', en: 'If it rains, I stay home.' }, 'blijf'),
      D('Ik kom omdat hij hier woont.', { fr: 'Je viens parce qu’il habite ici.', en: 'I’m coming because he lives here.' }, 'woont'),
      D('Ik ben moe want ik werk veel.', { fr: 'Je suis fatigué, car je travaille beaucoup.', en: 'I’m tired because I work a lot.' }, 'werk')
    ]
  });

  P({
    id: 'g-vraag', unit: 'vragen', level: 'A1',
    title: { fr: 'Poser une question', en: 'Asking a question' },
    rule: { fr: 'Le verbe vient en premier, ou juste après le mot interrogatif.', en: 'The verb comes first, or right after the question word.' },
    nl: 'Werk je hier?', fr: 'Tu travailles ici ?', en: 'Do you work here?',
    explain: {
      fr: 'Une question oui/non commence par le verbe : <span class="ex">Werk je hier?</span> Avec un mot interrogatif, le verbe suit tout de suite : <span class="ex">Waar woon je?</span> <span class="ex">Wanneer kom je?</span> C’est une inversion, comme travailles-tu, mais sans trait d’union ni est-ce que. Piège : après un mot interrogatif, le français parlé garde souvent le sujet devant (où tu habites ?) ; le néerlandais jamais : <span class="ex">Waar woon je?</span>, et non <span class="ex">Waar je woont?</span> Autre piège : quand <i class="nl">je</i> suit le verbe, le verbe perd son <i class="nl">-t</i> (<i class="nl">Werk je?</i>, pas <i class="nl">Werkt je?</i>). En flamand, <i class="nl">ge</i> garde le <i class="nl">-t</i> : <span class="ex">Waar werkt ge?</span>',
      en: 'A yes/no question starts with the verb: <span class="ex">Werk je hier?</span> With a question word, the verb follows right after it: <span class="ex">Waar woon je?</span> <span class="ex">Wanneer kom je?</span> This is an inversion, as in careful French, but with no hyphen and no extra question phrase. Trap: after a question word, spoken French often keeps the subject first; Dutch never does: <span class="ex">Waar woon je?</span>, not <span class="ex">Waar je woont?</span> Another trap: when <i class="nl">je</i> follows the verb, the verb loses its <i class="nl">-t</i> (<i class="nl">Werk je?</i>, not <i class="nl">Werkt je?</i>). In Flemish, <i class="nl">ge</i> keeps the <i class="nl">-t</i>: <span class="ex">Waar werkt ge?</span>'
    },
    drills: [
      D('Werk je hier?', { fr: 'Tu travailles ici ?', en: 'Do you work here?' }, 'Werk'),
      D('Waar woon je?', { fr: 'Où habites-tu ?', en: 'Where do you live?' }, 'woon'),
      D('Wanneer kom je?', { fr: 'Quand viens-tu ?', en: 'When are you coming?' }, 'kom'),
      D('Wat doe je nu?', { fr: 'Que fais-tu maintenant ?', en: 'What are you doing now?' }, 'doe'),
      D('Waar werkt ge?', { fr: 'Où travailles-tu ?', en: 'Where do you work?' }, 'werkt')
    ]
  });

  P({
    id: 'g-twee-werkwoorden', unit: 'kunnen', level: 'A1',
    title: { fr: 'Deux verbes : le second part à la fin', en: 'Two verbs: the second goes to the end' },
    rule: { fr: 'Le verbe conjugué reste deuxième, l’infinitif file à la fin.', en: 'The conjugated verb stays second, the infinitive goes last.' },
    nl: 'Ik kan morgen komen.', fr: 'Je peux venir demain.', en: 'I can come tomorrow.',
    explain: {
      fr: 'Avec <i class="nl">kunnen</i>, <i class="nl">moeten</i>, <i class="nl">willen</i>, <i class="nl">mogen</i> ou <i class="nl">zullen</i>, le verbe conjugué reste en <b>deuxième</b> position et l’autre verbe part à la <b>fin</b>, à l’infinitif : <span class="ex">Ik kan morgen komen</span>. Même chose avec <i class="nl">gaan</i> pour le futur proche : l’infinitif part aussi à la fin. Autre exemple : <span class="ex">Hij kan mij morgen helpen</span>. En français les deux verbes restent côte à côte (peux venir) ; en néerlandais, tout le reste de la phrase se glisse entre eux.',
      en: 'With <i class="nl">kunnen</i>, <i class="nl">moeten</i>, <i class="nl">willen</i>, <i class="nl">mogen</i> or <i class="nl">zullen</i>, the conjugated verb stays in <b>second</b> position and the other verb goes to the <b>end</b>, as an infinitive: <span class="ex">Ik kan morgen komen</span>. The same goes for <i class="nl">gaan</i> as a near future: the infinitive also goes last. Another example: <span class="ex">Hij kan mij morgen helpen</span>. French keeps the two verbs side by side; Dutch puts the rest of the sentence between them.'
    },
    drills: [
      D('Hij kan mij morgen helpen.', { fr: 'Il peut m’aider demain.', en: 'He can help me tomorrow.' }, 'helpen'),
      D('Ik moet dat onthouden.', { fr: 'Je dois retenir ça.', en: 'I have to remember that.' }, 'onthouden'),
      D('Wij gaan in {stad} wonen.', { fr: 'Nous allons habiter à {stad}.', en: 'We are going to live in {stad}.' }, 'wonen'),
      D('Je mag hier niet werken.', { fr: 'Tu n’as pas le droit de travailler ici.', en: 'You may not work here.' }, 'werken'),
      D('Ik wil dat niet vergeten.', { fr: 'Je ne veux pas oublier ça.', en: 'I don’t want to forget that.' }, 'vergeten')
    ]
  });

  P({
    id: 'g-perfect-zijn', unit: 'doen', level: 'A1',
    title: { fr: 'Le passé composé avec <span class="nl">zijn</span>', en: 'The perfect tense with <span class="nl">zijn</span>' },
    rule: { fr: 'Vers un lieu ou changement d’état : « zijn » + participe à la fin.', en: 'To a place, or a change of state: “zijn” + participle at the end.' },
    nl: 'Ik ben naar huis gegaan.', fr: 'Je suis rentré à la maison.', en: 'I went home.',
    explain: {
      fr: 'Un verbe qui va vers un lieu ou qui change d’état prend <i class="nl">zijn</i> au lieu de <i class="nl">hebben</i>, et le participe file à la <b>fin</b> : <span class="ex">Ik ben naar huis gegaan</span>, <span class="ex">Hij is gisteren gekomen</span>, <span class="ex">Wij zijn lang gebleven</span>. Une promenade sans but précis garde <i class="nl">hebben</i> : <span class="ex">Ik heb gewandeld</span> (le français dit se promener avec être). Et <i class="nl">zijn</i> lui-même se dit avec <i class="nl">zijn</i> : <span class="ex">Ik ben ziek geweest</span> (le français dit être malade avec avoir). La liste française est proche, mais pas identique : apprends le participe avec son auxiliaire.',
      en: 'A verb that goes toward a place or changes state takes <i class="nl">zijn</i> instead of <i class="nl">hebben</i>, and the participle goes to the <b>end</b>: <span class="ex">Ik ben naar huis gegaan</span>, <span class="ex">Hij is gisteren gekomen</span>, <span class="ex">Wij zijn lang gebleven</span>. A walk with no set destination keeps <i class="nl">hebben</i>: <span class="ex">Ik heb gewandeld</span> (French says to go for a walk with être). And <i class="nl">zijn</i> itself takes <i class="nl">zijn</i>: <span class="ex">Ik ben ziek geweest</span> (French says to have been ill with avoir). The French list is close but not identical: learn each participle with its auxiliary.'
    },
    drills: [
      D('Ik ben gisteren naar huis gegaan.', { fr: 'Je suis rentré hier à la maison.', en: 'I went home yesterday.' }, 'gegaan'),
      D('Hij is vandaag laat gekomen.', { fr: 'Il est arrivé tard aujourd’hui.', en: 'He came late today.' }, 'gekomen'),
      D('Wij zijn lang gebleven.', { fr: 'Nous sommes restés longtemps.', en: 'We stayed a long time.' }, 'gebleven'),
      D('Ik ben vandaag naar het werk gestapt.', { fr: 'Je suis allé au travail à pied aujourd’hui.', en: 'I walked to work today.' }, 'gestapt'),
      D('De vergadering is om negen uur begonnen.', { fr: 'La réunion a commencé à neuf heures.', en: 'The meeting began at nine o’clock.' }, 'begonnen')
    ]
  });

  P({
    id: 'g-was-had', unit: 'doen', level: 'A1',
    title: { fr: 'Le prétérit de cinq verbes courants', en: 'The simple past of five common verbs' },
    rule: { fr: '« was », « had », « kon », « moest », « wou » : un passé courant.', en: '“was”, “had”, “kon”, “moest”, “wou”: an everyday past.' },
    nl: 'Ik had geen tijd.', fr: 'Je n’avais pas le temps.', en: 'I had no time.',
    explain: {
      fr: 'Ces cinq verbes s’entendent sans cesse au prétérit, même à l’oral, à côté du parfait, qu’on dit aussi : <i class="nl">zijn</i> (<i class="nl">was</i>, <i class="nl">waren</i>), <i class="nl">hebben</i> (<i class="nl">had</i>, <i class="nl">hadden</i>), <i class="nl">kunnen</i> (<i class="nl">kon</i>), <i class="nl">moeten</i> (<i class="nl">moest</i>) et <i class="nl">willen</i> (<i class="nl">wou</i> en Flandre, <i class="nl">wilde</i> en néerlandais standard). Ils disent comment c’était, ou ce qu’on pouvait, devait ou voulait : <span class="ex">Hij kon niet komen</span>. Le français hésite entre l’imparfait et le passé composé (il ne pouvait pas, il n’a pas pu venir) ; ici <i class="nl">kon</i> couvre les deux. Quelques autres verbes s’entendent aussi au prétérit, mais pour les actions le parfait reste la règle.',
      en: 'These five verbs are heard in the simple past all the time, even in speech, beside the perfect, which is said too: <i class="nl">zijn</i> (<i class="nl">was</i>, <i class="nl">waren</i>), <i class="nl">hebben</i> (<i class="nl">had</i>, <i class="nl">hadden</i>), <i class="nl">kunnen</i> (<i class="nl">kon</i>), <i class="nl">moeten</i> (<i class="nl">moest</i>) and <i class="nl">willen</i> (<i class="nl">wou</i> in Flanders, <i class="nl">wilde</i> in standard Dutch). They say how things were, or what one could, had to or wanted: <span class="ex">Hij kon niet komen</span>. French splits this between the imperfect and the perfect; <i class="nl">kon</i> covers both. A few other verbs are also heard in the simple past, but for actions the perfect remains the rule.'
    },
    drills: [
      D('Ik was gisteren ziek.', { fr: 'J’étais malade hier.', en: 'I was ill yesterday.' }, 'was'),
      D('We hadden geen tijd.', { fr: 'Nous n’avions pas le temps.', en: 'We had no time.' }, 'hadden'),
      D('Hij kon niet komen.', { fr: 'Il n’a pas pu venir.', en: 'He could not come.' }, 'kon'),
      D('Ik moest vandaag werken.', { fr: 'J’ai dû travailler aujourd’hui.', en: 'I had to work today.' }, 'moest'),
      D('Hij wou niet thuis blijven.', { fr: 'Il ne voulait pas rester à la maison.', en: 'He did not want to stay at home.' }, 'wou')
    ]
  });

  P({
    id: 'g-deelwoord', unit: 'doen', level: 'A1',
    title: { fr: 'Les participes irréguliers', en: 'Irregular participles' },
    rule: { fr: 'Souvent « -en », la voyelle change ou non : « genomen », « gegeven ».', en: 'Often “-en”, with or without a new vowel: “genomen”, “gegeven”.' },
    nl: 'Ik heb de trein genomen.', fr: 'J’ai pris le train.', en: 'I took the train.',
    explain: {
      fr: 'À côté des participes réguliers (<i class="nl">gewerkt</i>, <i class="nl">gemaakt</i>), beaucoup de verbes courants finissent en <i class="nl">-en</i>, souvent avec une nouvelle voyelle : <i class="nl">nemen</i> <i class="nl">genomen</i>, <i class="nl">krijgen</i> <i class="nl">gekregen</i>, <i class="nl">schrijven</i> <i class="nl">geschreven</i>. <i class="nl">geven</i> <i class="nl">gegeven</i> ne change que sa terminaison. <i class="nl">brengen</i> change de voyelle mais finit en -t : <i class="nl">gebracht</i>. Le participe va à la <b>fin</b> : <span class="ex">Ik heb de trein genomen</span>. Le français aussi apprend pris, écrit, reçu verbe par verbe ; le néerlandais, lui, met <i class="nl">ge-</i> devant, sauf aux verbes en <i class="nl">be-</i>, <i class="nl">ver-</i> ou <i class="nl">ge-</i> : <i class="nl">begonnen</i>, <i class="nl">verloren</i>.',
      en: 'Beside the regular participles (<i class="nl">gewerkt</i>, <i class="nl">gemaakt</i>), many common verbs end in <i class="nl">-en</i>, often with a new vowel: <i class="nl">nemen</i> <i class="nl">genomen</i>, <i class="nl">krijgen</i> <i class="nl">gekregen</i>, <i class="nl">schrijven</i> <i class="nl">geschreven</i>. <i class="nl">geven</i> <i class="nl">gegeven</i> changes only its ending. <i class="nl">brengen</i> changes its vowel but ends in -t: <i class="nl">gebracht</i>. The participle goes to the <b>end</b>: <span class="ex">Ik heb de trein genomen</span>. French also learns its participles verb by verb; Dutch puts <i class="nl">ge-</i> in front, except on verbs that start with <i class="nl">be-</i>, <i class="nl">ver-</i> or <i class="nl">ge-</i>: <i class="nl">begonnen</i>, <i class="nl">verloren</i>.'
    },
    drills: [
      D('Ik heb vandaag de bus genomen.', { fr: 'J’ai pris le bus aujourd’hui.', en: 'I took the bus today.' }, 'genomen'),
      D('Zij heeft mij water gegeven.', { fr: 'Elle m’a donné de l’eau.', en: 'She gave me water.' }, 'gegeven'),
      D('Ik heb vandaag een mail gekregen.', { fr: 'J’ai reçu un mail aujourd’hui.', en: 'I got an email today.' }, 'gekregen'),
      D('Hij heeft een mail geschreven.', { fr: 'Il a écrit un mail.', en: 'He wrote an email.' }, 'geschreven'),
      D('Wij hebben de koffie gebracht.', { fr: 'Nous avons apporté le café.', en: 'We brought the coffee.' }, 'gebracht')
    ]
  });

  P({
    id: 'g-hem-haar', unit: 'mensen', level: 'A1',
    title: { fr: '<span class="nl">Hem</span>, <span class="nl">haar</span> et <span class="nl">zich</span>', en: '<span class="nl">Hem</span>, <span class="nl">haar</span> and <span class="nl">zich</span>' },
    rule: { fr: 'Après le verbe conjugué : « hem », « haar », « zich ».', en: 'After the conjugated verb: “hem” (him), “haar” (her), “zich” (self).' },
    nl: 'Ik ken hem.', fr: 'Je le connais.', en: 'I know him.',
    explain: {
      fr: 'Quand un homme ou une femme n’est pas le sujet, le néerlandais dit <i class="nl">hem</i> ou <i class="nl">haar</i>, et le place <b>après</b> le verbe conjugué ou après la préposition : <span class="ex">Ik help haar</span>, <span class="ex">Ik ga met hem naar de vergadering</span>. Le piège : le français met le, la, lui et se <b>avant</b> le verbe (je le connais), le néerlandais dit <span class="ex">Ik ken hem</span>. Quand <i class="nl">hij</i> ou <i class="nl">zij</i> (aussi au pluriel) est aussi la personne concernée, on dit <i class="nl">zich</i> : <span class="ex">Zij voelen zich niet goed</span>. Avec <i class="nl">ik</i> et <i class="nl">jij</i>, c’est <i class="nl">me</i> et <i class="nl">je</i>.',
      en: 'When a man or a woman is not the subject, Dutch says <i class="nl">hem</i> or <i class="nl">haar</i>, and puts it <b>after</b> the conjugated verb or after the preposition: <span class="ex">Ik help haar</span>, <span class="ex">Ik ga met hem naar de vergadering</span>. The trap: French puts the pronoun before the verb, Dutch puts it after: <span class="ex">Ik ken hem</span>. When <i class="nl">hij</i> or <i class="nl">zij</i> (also plural) is also the person affected, Dutch says <i class="nl">zich</i>: <span class="ex">Zij voelen zich niet goed</span>. With <i class="nl">ik</i> and <i class="nl">jij</i> it is <i class="nl">me</i> and <i class="nl">je</i>.'
    },
    drills: [
      D('Ik ken hem al lang.', { fr: 'Je le connais depuis longtemps.', en: 'I have known him for a long time.' }, 'hem'),
      D('Ik ken haar niet.', { fr: 'Je ne la connais pas.', en: 'I don’t know her.' }, 'haar'),
      D('Zij voelen zich niet goed.', { fr: 'Ils ne se sentent pas bien.', en: 'They don’t feel well.' }, 'zich'),
      D('Zij gaat met hem naar het kantoor.', { fr: 'Elle va au bureau avec lui.', en: 'She goes to the office with him.' }, 'hem'),
      D('Voelen zij zich hier thuis?', { fr: 'Se sentent-ils chez eux ici ?', en: 'Do they feel at home here?' }, 'zich')
    ]
  });

  P({
    id: 'g-er-is', unit: 'waar', level: 'A1',
    title: { fr: '<span class="nl">Er is</span> et <span class="nl">er zijn</span>', en: '<span class="nl">Er is</span> and <span class="nl">er zijn</span>' },
    rule: { fr: '« is » pour une chose, « zijn » pour plusieurs : le verbe s’accorde.', en: '“is” for one thing, “zijn” for several: the verb agrees.' },
    nl: 'Er is een tuin naast het huis.', fr: 'Il y a un jardin à côté de la maison.', en: 'There is a garden next to the house.',
    explain: {
      fr: 'Pour dire qu’une chose existe ou se trouve quelque part, le néerlandais utilise <i class="nl">er</i> avec le verbe <i class="nl">zijn</i>. Le verbe s’accorde avec la chose, pas avec <i class="nl">er</i> : <span class="ex">Er is een tuin naast het huis</span> pour une seule, <span class="ex">Er zijn drie kinderen op school</span> pour plusieurs. Dans une question, le verbe passe devant <i class="nl">er</i> : <span class="ex">Is er nog koffie?</span> ou <span class="ex">Hoeveel mensen zijn er?</span> Le français (il y a) ne change jamais, alors qu’ici il faut choisir <i class="nl">is</i> ou <i class="nl">zijn</i> selon ce qui suit. Regarde le nom avant de choisir le verbe.',
      en: 'To say that something exists or is somewhere, Dutch uses <i class="nl">er</i> with the verb <i class="nl">zijn</i>. The verb agrees with the thing, not with <i class="nl">er</i>: <span class="ex">Er is een tuin naast het huis</span> for one, <span class="ex">Er zijn drie kinderen op school</span> for several. In a question the verb comes before <i class="nl">er</i>: <span class="ex">Is er nog koffie?</span> or <span class="ex">Hoeveel mensen zijn er?</span> French (il y a) never changes, but here you must choose <i class="nl">is</i> or <i class="nl">zijn</i> according to what follows. Look at the noun before you choose the verb.'
    },
    drills: [
      D('Is er nog koffie?', { fr: 'Y a-t-il encore du café ?', en: 'Is there any coffee left?' }, 'Is'),
      D('Zijn er veel kinderen op school?', { fr: 'Y a-t-il beaucoup d’enfants à l’école ?', en: 'Are there many children at school?' }, 'Zijn'),
      D('Er zijn geen mensen meer op kantoor.', { fr: 'Il n’y a plus personne au bureau.', en: 'There’s nobody left at the office.' }, 'zijn'),
      D('Er is geen tijd.', { fr: 'Il n’y a pas le temps.', en: 'There is no time.' }, 'is'),
      D('Er zijn twee mensen in de tuin.', { fr: 'Il y a deux personnes dans le jardin.', en: 'There are two people in the garden.' }, 'zijn')
    ]
  });

  P({
    id: 'g-meervoud', unit: 'eten', level: 'A1',
    title: { fr: 'Le pluriel : <span class="nl">-s</span> ou <span class="nl">-en</span>', en: 'The plural: <span class="nl">-s</span> or <span class="nl">-en</span>' },
    rule: { fr: 'Surtout « -en » ; -s après « -el », « -er », « -en », « -je » atones.', en: 'Mostly “-en”; “-s” after unstressed “-el”, “-er”, “-en”, “-je”.' },
    nl: 'Ik wil twee komkommers.', fr: 'Je veux deux concombres.', en: 'I want two cucumbers.',
    explain: {
      fr: 'Un mot qui finit par un <i class="nl">-el</i>, <i class="nl">-er</i>, <i class="nl">-en</i> ou <i class="nl">-je</i> non accentué prend <i class="nl">-s</i> : <span class="ex">de komkommer, de komkommers</span>. Les autres prennent <i class="nl">-en</i>, avec une consonne doublée après une voyelle brève (<i class="nl">kip</i> devient <i class="nl">kippen</i>) et une voyelle en moins après une voyelle longue (<i class="nl">tomaat</i> devient <i class="nl">tomaten</i>). Un mot venu d’ailleurs prend <i class="nl">’s</i> après <i class="nl">a</i>, <i class="nl">i</i>, <i class="nl">o</i>, <i class="nl">u</i> ou <i class="nl">y</i> (<i class="nl">pizza’s</i>), et un simple <i class="nl">-s</i> après <i class="nl">-e</i> (<i class="nl">salades</i>). Le français ajoute presque toujours un -s muet ; ici la terminaison s’entend.',
      en: 'A word ending in an unstressed <i class="nl">-el</i>, <i class="nl">-er</i>, <i class="nl">-en</i> or <i class="nl">-je</i> takes <i class="nl">-s</i>: <span class="ex">de komkommer, de komkommers</span>. The others take <i class="nl">-en</i>, with a doubled consonant after a short vowel (<i class="nl">kip</i> becomes <i class="nl">kippen</i>) and one vowel less after a long one (<i class="nl">tomaat</i> becomes <i class="nl">tomaten</i>). A word from another language takes <i class="nl">’s</i> after <i class="nl">a</i>, <i class="nl">i</i>, <i class="nl">o</i>, <i class="nl">u</i> or <i class="nl">y</i> (<i class="nl">pizza’s</i>), and a plain <i class="nl">-s</i> after <i class="nl">-e</i> (<i class="nl">salades</i>). French mostly adds a silent -s; here the ending is pronounced.'
    },
    drills: [
      D('Ik wil twee komkommers.', { fr: 'Je veux deux concombres.', en: 'I want two cucumbers.' }, 'komkommers'),
      D('Ik neem twee pizza’s.', { fr: 'Je prends deux pizzas.', en: 'I’ll take two pizzas.' }, 'pizza’s'),
      D('De tomaten zijn lekker.', { fr: 'Les tomates sont bonnes.', en: 'The tomatoes are tasty.' }, 'tomaten'),
      D('Wij hebben vier kippen.', { fr: 'Nous avons quatre poules.', en: 'We have four chickens.' }, 'kippen'),
      D('Wij nemen twee salades.', { fr: 'Nous prenons deux salades.', en: 'We’ll take two salads.' }, 'salades')
    ]
  });

  P({
    id: 'g-gebiedend', unit: 'cafe', level: 'A1',
    title: { fr: 'L’impératif : le radical tout nu', en: 'The imperative: the bare stem' },
    rule: { fr: 'L’impératif avec « je » est le radical seul ; avec « u », radical + t.', en: 'The imperative with “je” is the bare stem; with “u”, stem + t.' },
    nl: 'Neem maar een glas.', fr: 'Prends un verre, vas-y.', en: 'Go ahead and take a glass.',
    explain: {
      fr: 'Pour donner un ordre ou une invitation à quelqu’un que tu tutoies, tu prends le <b>radical</b> du verbe, sans rien ajouter : <span class="ex">Kom binnen</span>, <span class="ex">Wacht even</span>. Pas de -ez ni -e à la française, et pas de pronom. Avec <i class="nl">u</i>, on ajoute <b>-t</b> et le pronom suit : <span class="ex">Neemt u plaats</span>. Pour que ça sonne poli en Flandre, on l’adoucit avec <i class="nl">maar</i>, <i class="nl">eens</i> ou <i class="nl">even</i> : <span class="ex">Zeg het maar</span> sonne comme une invitation, pas comme un ordre sec.',
      en: 'To give an order or an invitation to someone you call <i class="nl">je</i>, take the <b>stem</b> of the verb and add nothing: <span class="ex">Kom binnen</span>, <span class="ex">Wacht even</span>. There is no ending as in French (-ez, -e) and no pronoun. With <i class="nl">u</i>, add <b>-t</b> and the pronoun follows: <span class="ex">Neemt u plaats</span>. To sound polite in Flanders, soften it with <i class="nl">maar</i>, <i class="nl">eens</i> or <i class="nl">even</i>: <span class="ex">Zeg het maar</span> sounds like an invitation, not a curt order.'
    },
    drills: [
      D('Kom maar binnen.', { fr: 'Entre, je t’en prie.', en: 'Please, come in.' }, 'Kom'),
      D('Wacht even, ik kom zo.', { fr: 'Attends un instant, j’arrive.', en: 'Wait a moment, I’m coming.' }, 'Wacht'),
      D('Zeg het maar.', { fr: 'Dis-moi, je t’écoute.', en: 'Go on, tell me.' }, 'Zeg'),
      D('Komt u maar binnen.', { fr: 'Entrez, je vous en prie.', en: 'Please, come in.' }, 'Komt'),
      D('Bestel maar een glas wijn.', { fr: 'Vas-y, commande un verre de vin.', en: 'Go ahead and order a glass of wine.' }, 'Bestel')
    ]
  });

  P({
    id: 'g-verkleinwoord', unit: 'wonen', level: 'A1',
    title: { fr: 'Le diminutif : <span class="nl">het</span> au singulier', en: 'The diminutive: <span class="nl">het</span> in the singular' },
    rule: { fr: 'Un diminutif en « je » est « het » ; au pluriel, « de » et -s.', en: 'A diminutive in “je” is “het”; in the plural, “de” and -s.' },
    nl: 'Waar is het huisje?', fr: 'Où est la petite maison ?', en: 'Where is the little house?',
    explain: {
      fr: 'On ajoute <i class="nl">-je</i> au nom : <span class="ex">het huis, het huisje</span>. Après l, n ou r : -tje (<span class="ex">de stoel, het stoeltje</span> ; <span class="ex">de tafel, het tafeltje</span>). Après m : -pje (<span class="ex">het raam, het raampje</span>). Après une voyelle brève accentuée plus l, n, r ou m, on double la consonne : -etje (<span class="ex">de man, het mannetje</span>) ; ng ne se double pas (<span class="ex">de gang, het gangetje</span>). Tout diminutif est <i class="nl">het</i>, même si le nom est <i class="nl">de</i> ; au pluriel : <i class="nl">de</i> et <i class="nl">-s</i> (<span class="ex">de huisjes</span>). Piège pour un francophone : en français le diminutif ne change jamais le genre. En Flandre on en met partout, même pour <span class="ex">een biertje</span>.',
      en: 'Add <i class="nl">-je</i> to the noun: <span class="ex">het huis, het huisje</span>. After l, n or r: -tje (<span class="ex">de stoel, het stoeltje</span>; <span class="ex">de tafel, het tafeltje</span>). After m: -pje (<span class="ex">het raam, het raampje</span>). After a short stressed vowel plus l, n, r or m, double the consonant: -etje (<span class="ex">de man, het mannetje</span>); ng is not doubled (<span class="ex">de gang, het gangetje</span>). Every diminutive is <i class="nl">het</i>, even when the noun is <i class="nl">de</i>; in the plural: <i class="nl">de</i> and <i class="nl">-s</i> (<span class="ex">de huisjes</span>). The trap for a French speaker: in French a diminutive never changes the gender. Flanders uses it everywhere, even for <span class="ex">een biertje</span>.'
    },
    drills: [
      D('Waar is het huisje?', { fr: 'Où est la petite maison ?', en: 'Where is the little house?' }, 'huisje'),
      D('Heb je een lampje?', { fr: 'As-tu une petite lampe ?', en: 'Do you have a little lamp?' }, 'lampje'),
      D('Waar is het stoeltje?', { fr: 'Où est la petite chaise ?', en: 'Where is the little chair?' }, 'stoeltje'),
      D('Wij hebben twee kamertjes.', { fr: 'Nous avons deux petites chambres.', en: 'We have two small rooms.' }, 'kamertjes'),
      D('Het raampje is open.', { fr: 'La petite fenêtre est ouverte.', en: 'The little window is open.' }, 'raampje')
    ]
  });

  P({
    id: 'g-om-op-in', unit: 'kalender', level: 'A1',
    title: { fr: '<span class="nl">om</span>, <span class="nl">op</span>, <span class="nl">in</span> : dire quand', en: '<span class="nl">om</span>, <span class="nl">op</span>, <span class="nl">in</span>: saying when' },
    rule: { fr: '« om » pour l’heure, « op » pour le jour, « in » pour le mois.', en: '“om” for the hour, “op” for the day, “in” for the month.' },
    nl: 'Mijn verjaardag is op 5 mei.', fr: 'Mon anniversaire est le 5 mai.', en: 'My birthday is on 5 May.',
    explain: {
      fr: 'Pour situer un moment, le néerlandais choisit sa petite préposition selon la taille du moment. <i class="nl">om</i> pour l’heure : <span class="ex">Het feest is om negen uur</span>. <i class="nl">op</i> pour un jour ou une date : <i class="nl">op maandag</i> (le lundi), <span class="ex">Mijn verjaardag is op 5 mei</span>. <i class="nl">in</i> pour un mois, une saison ou une année : <span class="ex">Mijn verjaardag is in mei</span>. Le français dit à pour l’heure, rien devant le jour (le lundi) et une autre petite préposition devant le mois : le néerlandais a donc un mot de plus devant le jour. Dans une phrase simple, <i class="nl">op mei</i> ou <i class="nl">in maandag</i> sonnent faux.',
      en: 'To place a moment in time, Dutch picks its little preposition by the size of the moment. <i class="nl">om</i> for the hour: <span class="ex">Het feest is om negen uur</span>. <i class="nl">op</i> for a day or a date: <i class="nl">op maandag</i> (on Monday), <span class="ex">Mijn verjaardag is op 5 mei</span>. <i class="nl">in</i> for a month, a season or a year: <span class="ex">Mijn verjaardag is in mei</span>. French uses one little word for the hour, none before the day and another before the month: so Dutch has one word more before the day. In a simple sentence, <i class="nl">op mei</i> or <i class="nl">in maandag</i> sound wrong.'
    },
    drills: [
      D('Mijn verjaardag is in mei.', { fr: 'Mon anniversaire est en mai.', en: 'My birthday is in May.' }, 'in'),
      D('Het feest is om negen uur.', { fr: 'La fête est à neuf heures.', en: 'The party is at nine o’clock.' }, 'om'),
      D('Kerstmis is op 25 december.', { fr: 'Noël, c’est le 25 décembre.', en: 'Christmas is on 25 December.' }, 'op'),
      D('In december vieren wij Kerstmis.', { fr: 'En décembre, nous fêtons Noël.', en: 'In December we celebrate Christmas.' }, 'In'),
      D('Op maandag werk ik thuis.', { fr: 'Le lundi, je travaille à la maison.', en: 'On Mondays I work from home.' }, 'Op')
    ]
  });

  [['g-niet-geen', 'vragen'], ['g-bijzin', 'vragen'], ['g-vraag', 'vragen'], ['g-twee-werkwoorden', 'kunnen'], ['g-perfect-zijn', 'doen'], ['g-was-had', 'doen'], ['g-deelwoord', 'doen'], ['g-hem-haar', 'mensen'], ['g-er-is', 'waar'], ['g-meervoud', 'eten'], ['g-gebiedend', 'cafe'], ['g-verkleinwoord', 'wonen'], ['g-om-op-in', 'kalender']].forEach(r => {
    const u = NL.content.units.find(x => x.id === r[1]);
    if (!u) throw new Error('grammar.a1c.js : la règle ' + r[0] + ' veut l’unité « ' + r[1] + ' », que le cours n’a pas (lexicon.a1c.js se charge avant)');
    (u.grammar = u.grammar || []).push(r[0]);
  });
})();
