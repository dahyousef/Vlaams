/* Réponses libres, attachées aux règles de grammaire.
   Une consigne dit ce que la réponse doit CONTENIR, jamais comment la formuler :
   il y a donc beaucoup de bonnes réponses. La correction est une liste de cases
   cochées, puis un exemple. Tout est hors ligne, sans IA. */
NL.content = NL.content || {};
NL.content.openTasks = {

  'g-v2': {
    ask: 'Commence ta phrase par « Morgen » ou « Vandaag », puis dis où tu vas.',
    need: [
      { what: 'commence par un mot de temps', rx: /^\s*(morgen|vandaag|straks|daarna|gisteren)\b/i },
      { what: 'un verbe en deuxième position', rx: /^\s*\S+\s+(ga|gaan|werk|kom|vertrek|rijd|blijf|moet|wil)\w*\b/i },
      { what: 'au moins 5 mots', min: 5 }
    ],
    model: 'Morgen ga ik met de trein naar Brussel.'
  },

  'g-present': {
    ask: 'Dis ce que tu fais dans la vie et où.',
    need: [
      { what: 'ik + verbe', rx: /\bik\s+\w+/i },
      { what: 'un lieu ou un employeur', any: ['bij', 'in', 'voor'] },
      { what: 'au moins 5 mots', min: 5 }
    ],
    model: 'Ik werk als ontwikkelaar bij een IT-bedrijf.'
  },

  'g-gegij': {
    ask: 'Pose une question à un collègue. Utilise « ge » ou « je ».',
    need: [
      { what: 'une forme de deuxième personne', any: ['ge ', 'gij', 'je ', 'kunde', 'hebde', 'zijde'] },
      { what: 'une question', rx: /\?\s*$/ },
      { what: 'au moins 4 mots', min: 4 }
    ],
    model: 'Kunt ge mij daarmee even helpen?'
  },

  'g-getallen': {
    ask: 'Dis ton âge, puis le prix d’un café.',
    need: [
      { what: 'un nombre écrit en toutes lettres', rx: /\b\w*(twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig|euro)\w*\b/i },
      { what: 'jaar ou euro', any: ['jaar', 'euro'] },
      { what: 'au moins 5 mots', min: 5 }
    ],
    model: 'Ik ben eenenveertig jaar en een koffie kost drie euro.'
  },

  'g-halfuur': {
    ask: 'Dis à quelle heure commence ta réunion et à quelle heure elle finit.',
    need: [
      { what: 'une heure', rx: /\b(half|kwart|uur)\b/i },
      { what: 'om …', any: ['om '] },
      { what: 'au moins 6 mots', min: 6 }
    ],
    model: 'De vergadering begint om half tien en stopt om elf uur.'
  },

  'g-dehet': {
    ask: 'Décris ta maison ou ton bureau avec deux adjectifs.',
    need: [
      { what: 'un article', rx: /\b(de|het|een)\b/i },
      { what: 'un adjectif', any: ['groot', 'grote', 'klein', 'kleine', 'mooi', 'mooie', 'oud', 'oude', 'nieuw', 'nieuwe', 'rustig', 'rustige', 'druk', 'drukke'] },
      { what: 'au moins 6 mots', min: 6 }
    ],
    model: 'Wij hebben een klein huis met een grote tuin.'
  },

  'g-bezit': {
    ask: 'Parle de deux personnes de ta famille avec « mijn », « ons » ou « onze ».',
    need: [
      { what: 'un possessif', any: ['mijn', 'ons ', 'onze', 'zijn ', 'haar '] },
      { what: 'deux personnes', rx: /\b(vrouw|man|zoon|dochter|kind|kinderen|broer|zus|ouders|mama|papa)\b[\s\S]*\b(vrouw|man|zoon|dochter|kind|kinderen|broer|zus|ouders|mama|papa)\b/i },
      { what: 'au moins 7 mots', min: 7 }
    ],
    model: 'Mijn vrouw werkt in Brussel en onze dochter gaat hier naar school.'
  },

  'g-scheidbaar': {
    ask: 'Raconte ton matin : à quelle heure tu te lèves et ce que tu emportes.',
    need: [
      { what: 'un verbe séparable', rx: /\b(sta|neem|kom|spreek|bel)\b[\s\S]*\b(op|mee|thuis|af)\b/i },
      { what: 'une heure', rx: /\b(half|kwart|uur)\b/i },
      { what: 'au moins 8 mots', min: 8 }
    ],
    model: 'Ik sta om zes uur op en ik neem mijn laptop mee.'
  },

  'g-perfect-intro': {
    ask: 'Raconte ce que tu as fait hier soir.',
    need: [
      { what: 'un auxiliaire', rx: /\b(heb|hebt|heeft|hebben|ben|is|zijn)\b/i },
      { what: 'un participe passé', rx: /\bge\w{2,}\b|\b(gezien|gedaan|geweest|gehad|gegeten)\b/i },
      { what: 'un mot de temps', any: ['gisteren', 'gisteravond', 'daarna', 'eerst', 'vanmorgen'] },
      { what: 'au moins 8 mots', min: 8 }
    ],
    model: 'Gisteravond heb ik met de kinderen gegeten en daarna tv gekeken.'
  }
};
