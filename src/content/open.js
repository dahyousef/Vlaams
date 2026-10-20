/* Réponses libres, attachées aux règles de grammaire.
   Une consigne dit ce que la réponse doit CONTENIR, jamais comment la formuler :
   il y a donc beaucoup de bonnes réponses. La correction est une liste de cases
   cochées, puis un exemple. Tout est hors ligne, sans IA. */
NL.content = NL.content || {};
NL.content.openTasks = {

  'g-v2': {
    ask: { fr: 'Commence ta phrase par « Morgen » ou « Vandaag », puis dis où tu vas.', en: 'Start your sentence with “Morgen” or “Vandaag”, then say where you are going.' },
    need: [
      { what: { fr: 'commence par un mot de temps', en: 'starts with a time word' }, rx: /^\s*(morgen|vandaag|straks|daarna|gisteren)\b/i },
      { what: { fr: 'un verbe en deuxième position', en: 'a verb in second position' }, rx: /^\s*\S+\s+(ga|gaan|werk|kom|vertrek|rijd|blijf|moet|wil)\w*\b/i },
      { what: { fr: 'au moins 5 mots', en: 'at least 5 words' }, min: 5 }
    ],
    model: 'Morgen ga ik met de trein naar Brussel.'
  },

  'g-present': {
    ask: { fr: 'Dis ce que tu fais dans la vie et où.', en: 'Say what you do for a living and where.' },
    need: [
      { what: { fr: 'ik + verbe', en: 'ik + verb' }, rx: /\bik\s+\w+/i },
      { what: { fr: 'un lieu ou un employeur', en: 'a place or an employer' }, any: ['bij', 'in', 'voor'] },
      { what: { fr: 'au moins 5 mots', en: 'at least 5 words' }, min: 5 }
    ],
    model: 'Ik werk als ontwikkelaar bij een IT-bedrijf.'
  },

  'g-gegij': {
    ask: { fr: 'Pose une question à un collègue. Utilise « ge » ou « je ».', en: 'Ask a colleague a question. Use “ge” or “je”.' },
    need: [
      { what: { fr: 'une forme de deuxième personne', en: 'a form of “you”' }, any: ['ge ', 'gij', 'je ', 'kunde', 'hebde', 'zijde'] },
      { what: { fr: 'une question', en: 'a question' }, rx: /\?\s*$/ },
      { what: { fr: 'au moins 4 mots', en: 'at least 4 words' }, min: 4 }
    ],
    model: 'Kunt ge mij daarmee even helpen?'
  },

  'g-getallen': {
    ask: { fr: 'Dis ton âge, puis le prix d’un café.', en: 'Say your age, then the price of a coffee.' },
    need: [
      { what: { fr: 'un nombre écrit en toutes lettres', en: 'a number written out in words' }, rx: /\b\w*(twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig|euro)\w*\b/i },
      { what: { fr: 'jaar ou euro', en: 'jaar or euro' }, any: ['jaar', 'euro'] },
      { what: { fr: 'au moins 5 mots', en: 'at least 5 words' }, min: 5 }
    ],
    model: 'Ik ben eenenveertig jaar en een koffie kost drie euro.'
  },

  'g-halfuur': {
    ask: { fr: 'Dis à quelle heure commence ta réunion et à quelle heure elle finit.', en: 'Say what time your meeting starts and what time it ends.' },
    need: [
      { what: { fr: 'une heure', en: 'a time' }, rx: /\b(half|kwart|uur)\b/i },
      { what: { fr: 'om …', en: 'om …' }, any: ['om '] },
      { what: { fr: 'au moins 6 mots', en: 'at least 6 words' }, min: 6 }
    ],
    model: 'De vergadering begint om half tien en stopt om elf uur.'
  },

  'g-dehet': {
    ask: { fr: 'Décris ta maison ou ton bureau avec deux adjectifs.', en: 'Describe your house or your office with two adjectives.' },
    need: [
      { what: { fr: 'un article', en: 'an article' }, rx: /\b(de|het|een)\b/i },
      { what: { fr: 'un adjectif', en: 'an adjective' }, any: ['groot', 'grote', 'klein', 'kleine', 'mooi', 'mooie', 'oud', 'oude', 'nieuw', 'nieuwe', 'rustig', 'rustige', 'druk', 'drukke'] },
      { what: { fr: 'au moins 6 mots', en: 'at least 6 words' }, min: 6 }
    ],
    model: 'Wij hebben een klein huis met een grote tuin.'
  },

  'g-bezit': {
    ask: { fr: 'Parle de deux personnes de ta famille avec « mijn », « ons » ou « onze ».', en: 'Talk about two people in your family using “mijn”, “ons” or “onze”.' },
    need: [
      { what: { fr: 'un possessif', en: 'a possessive' }, any: ['mijn', 'ons ', 'onze', 'zijn ', 'haar '] },
      { what: { fr: 'deux personnes', en: 'two people' }, rx: /\b(vrouw|man|zoon|dochter|kind|kinderen|broer|zus|ouders|mama|papa)\b[\s\S]*\b(vrouw|man|zoon|dochter|kind|kinderen|broer|zus|ouders|mama|papa)\b/i },
      { what: { fr: 'au moins 7 mots', en: 'at least 7 words' }, min: 7 }
    ],
    model: 'Mijn vrouw werkt in Brussel en onze dochter gaat hier naar school.'
  },

  'g-scheidbaar': {
    ask: { fr: 'Raconte ton matin : à quelle heure tu te lèves et ce que tu emportes.', en: 'Tell your morning: what time you get up and what you take with you.' },
    need: [
      { what: { fr: 'un verbe séparable', en: 'a separable verb' }, rx: /\b(sta|neem|kom|spreek|bel)\b[\s\S]*\b(op|mee|thuis|af)\b/i },
      { what: { fr: 'une heure', en: 'a time' }, rx: /\b(half|kwart|uur)\b/i },
      { what: { fr: 'au moins 8 mots', en: 'at least 8 words' }, min: 8 }
    ],
    model: 'Ik sta om zes uur op en ik neem mijn laptop mee.'
  },

  'g-perfect-intro': {
    ask: { fr: 'Raconte ce que tu as fait hier soir.', en: 'Tell what you did last night.' },
    need: [
      { what: { fr: 'un auxiliaire', en: 'an auxiliary' }, rx: /\b(heb|hebt|heeft|hebben|ben|is|zijn)\b/i },
      { what: { fr: 'un participe passé', en: 'a past participle' }, rx: /\bge\w{2,}\b|\b(gezien|gedaan|geweest|gehad|gegeten)\b/i },
      { what: { fr: 'un mot de temps', en: 'a time word' }, any: ['gisteren', 'gisteravond', 'daarna', 'eerst', 'vanmorgen'] },
      { what: { fr: 'au moins 8 mots', en: 'at least 8 words' }, min: 8 }
    ],
    model: 'Gisteravond heb ik met de kinderen gegeten en daarna tv gekeken.'
  }
};
