/* Réponses libres, attachées aux règles de grammaire.
   Une consigne dit ce que la réponse doit CONTENIR, jamais comment la formuler :
   il y a donc beaucoup de bonnes réponses. La correction est une liste de cases
   cochées, puis un exemple. Tout est hors ligne, sans IA.
   Chaque besoin porte sa réponse manquée (`miss`) : une réponse qui le manque,
   lui seul. test/content.js vérifie que l'exemple coche chaque besoin, et que
   chaque `miss` ne manque que le sien. */
NL.content = NL.content || {};
NL.content.openTasks = {

  'g-v2': {
    ask: { fr: 'Commence ta phrase par « Morgen » ou « Vandaag », puis dis où tu vas.', en: 'Start your sentence with “Morgen” or “Vandaag”, then say where you are going.' },
    need: [
      { what: { fr: 'commence par un mot de temps', en: 'starts with a time word' }, rx: /^\s*(morgen|vandaag|straks|daarna|gisteren)\b/i,
        miss: 'Ik ga morgen met de trein naar Brussel.' },
      { what: { fr: 'un verbe en deuxième position', en: 'a verb in second position' }, rx: /^\s*\S+\s+(ga|gaan|werk|kom|vertrek|rijd|blijf|moet|wil)\w*\b/i,
        miss: 'Morgen ik ga met de trein naar Brussel.' },
      { what: { fr: 'au moins 5 mots', en: 'at least 5 words' }, min: 5,
        miss: 'Morgen ga ik werken.' }
    ],
    model: 'Morgen ga ik met de trein naar Brussel.'
  },

  'g-present': {
    ask: { fr: 'Dis ce que tu fais dans la vie et où.', en: 'Say what you do for a living and where.' },
    need: [
      { what: { fr: '« ik » + verbe', en: '“ik” + verb' }, rx: /\bik\s+\w+/i,
        miss: 'Ontwikkelaar bij een IT-bedrijf in Brussel.' },
      { what: { fr: 'un lieu ou un employeur', en: 'a place or an employer' }, any: ['bij', 'in', 'voor'],
        miss: 'Ik werk als ontwikkelaar en dat doe ik graag.' },
      { what: { fr: 'au moins 5 mots', en: 'at least 5 words' }, min: 5,
        miss: 'Ik werk in Brussel.' }
    ],
    model: 'Ik werk als ontwikkelaar bij een IT-bedrijf.'
  },

  'g-gegij': {
    ask: { fr: 'Pose une question à un collègue. Utilise « ge » ou « je ».', en: 'Ask a colleague a question. Use “ge” or “je”.' },
    need: [
      { what: { fr: 'une forme de deuxième personne', en: 'a second-person form' }, any: ['ge ', 'gij', 'je ', 'kunde', 'hebde', 'zijde'],
        miss: 'Kunt u mij daarmee even helpen?' },
      { what: { fr: 'une question', en: 'a question' }, rx: /\?\s*$/,
        miss: 'Ge kunt mij daarmee even helpen.' },
      { what: { fr: 'au moins 4 mots', en: 'at least 4 words' }, min: 4,
        miss: 'Kunt ge helpen?' }
    ],
    model: 'Kunt ge mij daarmee even helpen?'
  },

  'g-getallen': {
    ask: { fr: 'Dis ton âge, puis le prix d’un café.', en: 'Say your age, then the price of a coffee.' },
    need: [
      { what: { fr: 'un nombre écrit en toutes lettres', en: 'a number written out in words' }, rx: /\b\w*(twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig|euro)\w*\b/i,
        miss: 'Ik ben 41 jaar oud.' },
      { what: { fr: '« jaar » ou « euro »', en: '“jaar” or “euro”' }, any: ['jaar', 'euro'],
        miss: 'Ik ben eenenveertig en mijn vrouw is negenendertig.' },
      { what: { fr: 'au moins 5 mots', en: 'at least 5 words' }, min: 5,
        miss: 'Ik ben eenenveertig jaar.' }
    ],
    model: 'Ik ben eenenveertig jaar en een koffie kost drie euro.'
  },

  'g-halfuur': {
    ask: { fr: 'Dis à quelle heure commence ta réunion et à quelle heure elle finit.', en: 'Say what time your meeting starts and what time it ends.' },
    need: [
      { what: { fr: 'une heure', en: 'a time' }, rx: /\b(half|kwart|uur)\b/i,
        miss: 'De vergadering begint om negen en stopt om elf.' },
      { what: { fr: '« om … »', en: '“om …”' }, any: ['om '],
        miss: 'De vergadering duurt van half tien tot elf uur.' },
      { what: { fr: 'au moins 6 mots', en: 'at least 6 words' }, min: 6,
        miss: 'Ze begint om half tien.' }
    ],
    model: 'De vergadering begint om half tien en stopt om elf uur.'
  },

  'g-dehet': {
    ask: { fr: 'Décris ta maison ou ton bureau avec deux adjectifs.', en: 'Describe your house or your office with two adjectives.' },
    need: [
      { what: { fr: 'un article', en: 'an article' }, rx: /\b(de|het|een)\b/i,
        miss: 'Wij wonen in Brussel, ons huis is klein.' },
      { what: { fr: 'un adjectif', en: 'an adjective' }, any: ['groot', 'grote', 'klein', 'kleine', 'mooi', 'mooie', 'oud', 'oude', 'nieuw', 'nieuwe', 'rustig', 'rustige', 'druk', 'drukke'],
        miss: 'Wij hebben een huis met een tuin.' },
      { what: { fr: 'au moins 6 mots', en: 'at least 6 words' }, min: 6,
        miss: 'Het huis is klein.' }
    ],
    model: 'Wij hebben een klein huis met een grote tuin.'
  },

  'g-bezit': {
    ask: { fr: 'Parle de deux personnes de ta famille avec « mijn », « ons » ou « onze ».', en: 'Talk about two people in your family using “mijn”, “ons” or “onze”.' },
    need: [
      { what: { fr: 'un possessif', en: 'a possessive' }, any: ['mijn', 'ons ', 'onze', 'zijn ', 'haar '],
        miss: 'Ik heb een vrouw en een dochter, ze wonen hier.' },
      { what: { fr: 'deux personnes', en: 'two people' }, rx: /\b(vrouw|man|zoon|dochter|kind|kinderen|broer|zus|ouders|mama|papa)\b[\s\S]*\b(vrouw|man|zoon|dochter|kind|kinderen|broer|zus|ouders|mama|papa)\b/i,
        miss: 'Mijn vrouw werkt in Brussel en ze gaat met de trein.' },
      { what: { fr: 'au moins 7 mots', en: 'at least 7 words' }, min: 7,
        miss: 'Mijn vrouw en onze dochter.' }
    ],
    model: 'Mijn vrouw werkt in Brussel en onze dochter gaat hier naar school.'
  },

  'g-scheidbaar': {
    ask: { fr: 'Raconte ton matin : à quelle heure tu te lèves et ce que tu emportes.', en: 'Describe your morning: what time you get up and what you take with you.' },
    need: [
      { what: { fr: 'un verbe séparable', en: 'a separable verb' }, rx: /\b(sta|neem|kom|spreek|bel)\b[\s\S]*\b(op|mee|thuis|af)\b/i,
        miss: 'Ik vertrek om zeven uur en ik neem de trein.' },
      { what: { fr: 'une heure', en: 'a time' }, rx: /\b(half|kwart|uur)\b/i,
        miss: 'Ik sta vroeg op en ik neem mijn laptop mee.' },
      { what: { fr: 'au moins 8 mots', en: 'at least 8 words' }, min: 8,
        miss: 'Ik sta om zes uur op.' }
    ],
    model: 'Ik sta om zes uur op en ik neem mijn laptop mee.'
  },

  'g-perfect-intro': {
    ask: { fr: 'Raconte ce que tu as fait hier soir.', en: 'Tell what you did last night.' },
    need: [
      { what: { fr: 'un auxiliaire', en: 'an auxiliary' }, rx: /\b(heb|hebt|heeft|hebben|ben|is|zijn)\b/i,
        miss: 'Gisteravond ik gegeten met de kinderen en tv gekeken.' },
      { what: { fr: 'un participe passé', en: 'a past participle' }, rx: /\bge\w{2,}\b|\b(gezien|gedaan|geweest|gehad|gegeten)\b/i,
        miss: 'Gisteravond heb ik met de kinderen eten en daarna tv kijken.' },
      { what: { fr: 'un mot de temps', en: 'a time word' }, any: ['gisteren', 'gisteravond', 'daarna', 'eerst', 'vanmorgen'],
        miss: 'Ik heb met de kinderen gegeten en tv gekeken.' },
      { what: { fr: 'au moins 8 mots', en: 'at least 8 words' }, min: 8,
        miss: 'Gisteravond heb ik tv gekeken.' }
    ],
    model: 'Gisteravond heb ik met de kinderen gegeten en daarna tv gekeken.'
  }
};
