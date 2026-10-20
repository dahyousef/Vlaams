/* Règles de grammaire. Chaque règle est elle-même un item du planificateur,
   travaillée en remettant des phrases en ordre, en comblant des trous, en tapant
   puis en disant. Classées par ce que chacune débloque dans une conversation,
   pas par l'ordre d'un manuel. */
NL.content = NL.content || {};
NL.content.patterns = (function () {
  'use strict';
  const D = (nl, g, gap) => ({ nl, ...NL.gloss.pair(g), gap });

  return [
    {
      id: 'g-v2', unit: 'overleven', level: 'A1',
      title: { fr: 'Le verbe en deuxième position', en: 'The verb in second position' },
      rule: { fr: 'Peu importe ce qui vient en premier, le verbe est le deuxième élément.', en: 'Whatever comes first, the verb is the second element.' },
      nl: 'Morgen ga ik naar Brussel.', fr: 'Demain je vais à Bruxelles.', en: 'Tomorrow I’m going to Brussels.',
      explain: {
        fr: 'C’est la colonne vertébrale de toute phrase néerlandaise. Le verbe conjugué occupe la <b>deuxième</b> position — pas le deuxième mot, le deuxième <i>élément</i>. Commence par un complément de temps et le sujet passe derrière le verbe : <span class="ex">Morgen <b>ga</b> ik naar Brussel</span>, jamais <i lang="nl-BE">Morgen ik ga</i>. Le français ne fait pas ça, donc l’erreur revient pendant des années. La corriger tôt change immédiatement ta façon de sonner.',
        en: 'This is the backbone of every Dutch sentence. The conjugated verb takes the <b>second</b> position — not the second word, the second <i>element</i>. Start with a time phrase and the subject drops behind the verb: <span class="ex">Morgen <b>ga</b> ik naar Brussel</span>, never <i lang="nl-BE">Morgen ik ga</i>. English does not do this, so the mistake keeps coming back for years. Fixing it early changes how you sound straight away.'
      },
      drills: [
        D('Morgen ga ik naar Brussel.', { fr: 'Demain je vais à Bruxelles.', en: 'Tomorrow I’m going to Brussels.' }, 'ga'),
        D('Vandaag werk ik van thuis.', { fr: 'Aujourd’hui je travaille de chez moi.', en: 'Today I’m working from home.' }, 'werk'),
        D('Om acht uur vertrekt de trein.', { fr: 'Le train part à huit heures.', en: 'The train leaves at eight o’clock.' }, 'vertrekt'),
        D('In {stad} wonen wij al vijf jaar.', { fr: 'Nous habitons à {stad} depuis cinq ans.', en: 'We have lived in {stad} for five years.' }, 'wonen'),
        D('Daarna ga ik naar de bakker.', { fr: 'Ensuite je vais chez le boulanger.', en: 'Then I’m going to the baker’s.' }, 'ga')
      ]
    },
    {
      id: 'g-present', unit: 'ikengij', level: 'A1',
      title: { fr: 'Le présent : radical, radical+t, radical+en', en: 'The present tense: stem, stem+t, stem+en' },
      rule: { fr: 'ik werk / jij werkt / hij werkt / wij werken.', en: 'ik werk / jij werkt / hij werkt / wij werken.' },
      nl: 'Ik werk bij {bedrijf}.', fr: 'Je travaille chez {bedrijf}.', en: 'I work at {bedrijf}.',
      explain: {
        fr: 'Trois formes et tu as tout le présent : <span class="ex">ik werk</span>, <span class="ex">jij/hij werkt</span>, <span class="ex">wij/jullie/zij werken</span>. Bien plus simple que le français, qui en a cinq. Un seul piège : quand <b lang="nl-BE">jij</b> passe derrière le verbe — dans une question, ou après un complément de temps — le <span class="ex">-t</span> disparaît. <span class="ex">Werk jij morgen?</span>, pas <i lang="nl-BE">werkt jij</i>. Uniquement avec jij, jamais avec hij.',
        en: 'Three forms and you have the whole present tense: <span class="ex">ik werk</span>, <span class="ex">jij/hij werkt</span>, <span class="ex">wij/jullie/zij werken</span>. One trap: when <b lang="nl-BE">jij</b> comes after the verb — in a question, or after a time phrase — the <span class="ex">-t</span> disappears. <span class="ex">Werk jij morgen?</span>, not <i lang="nl-BE">werkt jij</i>. Only with jij, never with hij.'
      },
      drills: [
        D('Ik werk bij {bedrijf}.', { fr: 'Je travaille chez {bedrijf}.', en: 'I work at {bedrijf}.' }, 'werk'),
        D('Hij woont in Aalst.', { fr: 'Il habite à Alost.', en: 'He lives in Aalst.' }, 'woont'),
        D('Wij wonen in {stad}.', { fr: 'Nous habitons à {stad}.', en: 'We live in {stad}.' }, 'wonen'),
        D('Spreek jij Nederlands?', { fr: 'Tu parles néerlandais ?', en: 'Do you speak Dutch?' }, 'Spreek'),
        D('Zij komt om zeven uur.', { fr: 'Elle vient à sept heures.', en: 'She is coming at seven o’clock.' }, 'komt')
      ]
    },
    {
      id: 'g-gegij', unit: 'ikengij', level: 'A1',
      title: { fr: 'Ge et gij : ce que tu entends vraiment', en: 'Ge and gij: what you really hear' },
      rule: { fr: 'Dis « je ». Attends-toi à « ge ». C’est la même chose.', en: 'Say “je”. Expect “ge”. It is the same thing.' },
      nl: 'Hebt ge dat verstaan?', fr: 'Tu as compris ?', en: 'Did you understand that? (informal)',
      explain: {
        fr: 'Les manuels enseignent <span class="ex">jij/je</span>. Le Brabant flamand dit <span class="ex">gij/ge</span> — à la boulangerie, au club de foot, et en face de toi au bureau. Ce n’est ni grossier ni purement dialectal : c’est simplement le sud. Les verbes suivent : <span class="ex">gij zijt</span> (jij bent), <span class="ex">gij hebt</span>, <span class="ex">gij kunt</span>, et les questions se contractent : <span class="ex">Kunde?</span> (kun je), <span class="ex">Hebde?</span> (heb je), <span class="ex">Zijde?</span> (ben je). <b>Produis « je » et tu es toujours correct. Reconnais « ge » ou tu perds la moitié de ce qu’on te dit.</b>',
        en: 'Textbooks teach <span class="ex">jij/je</span>. Flemish Brabant says <span class="ex">gij/ge</span> — at the bakery, at the football club, and across the desk from you at work. It is neither rude nor purely dialect: it is simply the south. The verbs follow: <span class="ex">gij zijt</span> (jij bent), <span class="ex">gij hebt</span>, <span class="ex">gij kunt</span>, and questions contract: <span class="ex">Kunde?</span> (kun je), <span class="ex">Hebde?</span> (heb je), <span class="ex">Zijde?</span> (ben je). <b>Produce “je” and you are always correct. Recognise “ge” or you lose half of what is said to you.</b>'
      },
      drills: [
        D('Hebt ge dat verstaan?', { fr: 'Tu as compris ?', en: 'Did you understand that?' }, 'ge'),
        D('Zijt ge klaar?', { fr: 'Tu es prêt ?', en: 'Are you ready?' }, 'Zijt'),
        D('Kunt ge mij helpen?', { fr: 'Tu peux m’aider ?', en: 'Can you help me?' }, 'ge'),
        D('Waar woont ge?', { fr: 'Tu habites où ?', en: 'Where do you live?' }, 'ge')
      ]
    },
    {
      id: 'g-getallen', unit: 'tijd', level: 'A1',
      title: { fr: 'Les unités avant les dizaines', en: 'Units before tens' },
      rule: { fr: '21 se dit een-en-twintig : le petit chiffre d’abord.', en: '21 is said een-en-twintig: the small digit first.' },
      nl: 'Het kost eenentwintig euro.', fr: 'Ça coûte vingt-et-un euros.', en: 'It costs twenty-one euros.',
      explain: {
        fr: 'Le néerlandais dit les unités avant les dizaines : <span class="ex">eenentwintig</span> (21), <span class="ex">vierenzestig</span> (64), <span class="ex">negenennegentig</span> (99). En un seul mot, sans espace. C’est pour ça qu’un prix ou un numéro de téléphone semble mélangé : tu entends le deuxième chiffre avant le premier. Bonne nouvelle pour toi : <span class="ex">zeventig</span> = septante et <span class="ex">negentig</span> = nonante, exactement comme en Belgique. Le français de France, lui, t’aurait imposé un détour par soixante-dix.',
        en: 'Dutch says the units before the tens: <span class="ex">eenentwintig</span> (21, literally “one-and-twenty”), <span class="ex">vierenzestig</span> (64), <span class="ex">negenennegentig</span> (99). As a single word, with no space. That is why a price or a phone number seems jumbled: you hear the second digit before the first. Good news: <span class="ex">zeventig</span> is simply seventy and <span class="ex">negentig</span> is simply ninety.'
      },
      drills: [
        D('Het kost eenentwintig euro.', { fr: 'Ça coûte vingt-et-un euros.', en: 'It costs twenty-one euros.' }, 'eenentwintig'),
        D('Ik ben tweeënveertig jaar.', { fr: 'J’ai quarante-deux ans.', en: 'I am forty-two years old.' }, 'tweeënveertig'),
        D('Dat is vijfenzestig euro.', { fr: 'Ça fait soixante-cinq euros.', en: 'That is sixty-five euros.' }, 'vijfenzestig'),
        D('Zij is zeventig jaar.', { fr: 'Elle a septante ans.', en: 'She is seventy years old.' }, 'zeventig')
      ]
    },
    {
      id: 'g-halfuur', unit: 'tijd', level: 'A1',
      title: { fr: 'Half drie, c’est 2h30', en: 'Half drie means 2:30' },
      rule: { fr: 'half + heure = trente minutes AVANT cette heure.', en: 'half + hour = thirty minutes BEFORE that hour.' },
      nl: 'De vergadering begint om half drie.', fr: 'La réunion commence à deux heures et demie.', en: 'The meeting starts at half past two.',
      explain: {
        fr: 'Le néerlandais compte <b>vers</b> l’heure qui vient. <span class="ex">Half drie</span> = une demi-heure avant trois heures, donc 2h30 — et non 3h30. Le français fait l’inverse : « trois heures et demie » = 3h30. Même logique pour <span class="ex">kwart voor</span> (moins le quart) et <span class="ex">kwart na</span> (et quart). La Flandre dit aussi <span class="ex">tien voor half vier</span> pour 15h20, compté à rebours depuis la demie. Te tromper une fois te coûte une réunion.',
        en: 'Dutch counts <b>towards</b> the coming hour. <span class="ex">Half drie</span> = half an hour before three o’clock, so 2:30 — not 3:30. English “half three” is 3:30, so the trap is real. Same logic for <span class="ex">kwart voor</span> (quarter to) and <span class="ex">kwart na</span> (quarter past). Flanders also says <span class="ex">tien voor half vier</span> for 15:20, counted back from the half hour. Get it wrong once and you miss a meeting.'
      },
      drills: [
        D('De vergadering begint om half drie.', { fr: 'La réunion commence à 14h30.', en: 'The meeting starts at 14:30.' }, 'half'),
        D('Het is kwart voor acht.', { fr: 'Il est huit heures moins le quart.', en: 'It is quarter to eight.' }, 'voor'),
        D('Ik vertrek om half negen.', { fr: 'Je pars à 8h30.', en: 'I leave at 8:30.' }, 'half')
      ]
    },
    {
      id: 'g-dehet', unit: 'bakker', level: 'A1',
      title: { fr: 'De ou het, et le -e en plus', en: 'De or het, and the extra -e' },
      rule: { fr: 'een groot huis, mais het grote huis.', en: 'een groot huis, but het grote huis.' },
      nl: 'Het grote huis staat in de straat.', fr: 'La grande maison est dans la rue.', en: 'The big house is in the street.',
      explain: {
        fr: 'Environ trois noms sur quatre prennent <span class="ex">de</span>, le reste prend <span class="ex">het</span>. <b>Ne traduis jamais depuis le français</b> : <span class="ex">het huis</span> est neutre alors que « la maison » est féminine, <span class="ex">het bureau</span> est neutre alors que « le bureau » est masculin. Les genres ne se correspondent pas du tout. Bonne nouvelle : ce n’est pas totalement arbitraire — voir la fiche <i>Les familles de het</i>. Le gain vient avec l’adjectif : il prend <span class="ex">-e</span> partout — <span class="ex">de grote fiets</span>, <span class="ex">het grote huis</span>, <span class="ex">een grote fiets</span> — sauf après <b lang="nl-BE">een</b> devant un mot <b>het</b> : <span class="ex">een groot huis</span>. Après le verbe, toujours nu : <span class="ex">het huis is groot</span>.',
        en: 'About three nouns in four take <span class="ex">de</span>, the rest take <span class="ex">het</span>. <b>Never guess from the meaning</b>: English has no grammatical gender to lean on, so learn the article together with the noun — <span class="ex">het huis</span>, <span class="ex">de tafel</span>. Good news: it is not entirely arbitrary — see the sheet <i>The het families</i>. The payoff comes with the adjective: it takes <span class="ex">-e</span> everywhere — <span class="ex">de grote fiets</span>, <span class="ex">het grote huis</span>, <span class="ex">een grote fiets</span> — except after <b lang="nl-BE">een</b> before a <b>het</b> word: <span class="ex">een groot huis</span>. After the verb, always bare: <span class="ex">het huis is groot</span>.'
      },
      drills: [
        D('Het grote huis staat in de straat.', { fr: 'La grande maison est dans la rue.', en: 'The big house is in the street.' }, 'grote'),
        D('Wij hebben een groot huis.', { fr: 'Nous avons une grande maison.', en: 'We have a big house.' }, 'groot'),
        D('Dat is een lekkere koffie.', { fr: 'C’est un bon café.', en: 'That is a tasty coffee.' }, 'lekkere'),
        D('De koffie is lekker.', { fr: 'Le café est bon.', en: 'The coffee is tasty.' }, 'lekker')
      ]
    },
    {
      id: 'g-bezit', unit: 'familie', level: 'A1',
      title: { fr: 'Mijn, uw, ons et onze', en: 'Mijn, uw, ons and onze' },
      rule: { fr: 'ons devant un mot het, onze devant tout le reste.', en: 'ons before a het word, onze before everything else.' },
      nl: 'Ons huis staat naast onze tuin.', fr: 'Notre maison est à côté de notre jardin.', en: 'Our house is next to our garden.',
      explain: {
        fr: 'Les possessifs ne changent jamais de forme, sauf un. <span class="ex">mijn</span>, <span class="ex">je/uw</span>, <span class="ex">zijn</span> (son à lui), <span class="ex">haar</span> (son à elle), <span class="ex">hun</span> (leur) restent identiques quel que soit le nom — contrairement au français, où « mon/ma/mes » s’accorde. Le seul qui bouge est <b>ons/onze</b> : <span class="ex">ons</span> devant un mot het (<span class="ex">ons huis</span>, <span class="ex">ons kind</span>), <span class="ex">onze</span> partout ailleurs (<span class="ex">onze tuin</span>, <span class="ex">onze kinderen</span>). En Flandre tu entendras aussi <span class="ex">uw</span> de façon familière, là où le nord impose <span class="ex">je</span>.',
        en: 'Possessives never change form, except one. <span class="ex">mijn</span> (my), <span class="ex">je</span> (your, informal) / <span class="ex">uw</span> (your, formal), <span class="ex">zijn</span> (his), <span class="ex">haar</span> (her), <span class="ex">hun</span> (their) stay the same whatever the noun. The only one that moves is <b>ons/onze</b> (our): <span class="ex">ons</span> before a het word (<span class="ex">ons huis</span>, <span class="ex">ons kind</span>), <span class="ex">onze</span> everywhere else (<span class="ex">onze tuin</span>, <span class="ex">onze kinderen</span>). In Flanders you will also hear <span class="ex">uw</span> used informally, where the north requires <span class="ex">je</span>.'
      },
      drills: [
        D('Ons huis staat naast onze tuin.', { fr: 'Notre maison est à côté de notre jardin.', en: 'Our house is next to our garden.' }, 'Ons'),
        D('Onze dochter gaat naar school.', { fr: 'Notre fille va à l’école.', en: 'Our daughter goes to school.' }, 'Onze'),
        D('Ons kind is zes jaar.', { fr: 'Notre enfant a six ans.', en: 'Our child is six years old.' }, 'Ons')
      ]
    },
    {
      id: 'g-scheidbaar', unit: 'dedag', level: 'A1',
      title: { fr: 'Les verbes qui se cassent en deux', en: 'Verbs that break in two' },
      rule: { fr: 'Le préfixe s’envole à la fin de la phrase.', en: 'The prefix flies off to the end of the sentence.' },
      nl: 'Ik sta elke dag om zes uur op.', fr: 'Je me lève à six heures tous les jours.', en: 'I get up at six o’clock every day.',
      explain: {
        fr: 'Beaucoup de verbes néerlandais sont un préfixe collé à un verbe, et dans une principale ils se séparent. <span class="ex">Opstaan</span> devient <span class="ex">ik sta ... <b>op</b></span>, le préfixe projeté tout à la fin — parfois six mots plus loin. <span class="ex">Ik sta elke dag om zes uur <b>op</b></span>. Surveille <span class="ex">meenemen</span>, <span class="ex">aankomen</span>, <span class="ex">afspreken</span>, <span class="ex">opbellen</span>, <span class="ex">uitleggen</span>. Écoute toujours la fin de la phrase : le dernier mot change souvent le sens du premier.',
        en: 'Many Dutch verbs are a prefix attached to a verb, and in a main clause they split. <span class="ex">Opstaan</span> becomes <span class="ex">ik sta ... <b>op</b></span>, with the prefix thrown to the very end — sometimes six words later. <span class="ex">Ik sta elke dag om zes uur <b>op</b></span>. Watch for <span class="ex">meenemen</span>, <span class="ex">aankomen</span>, <span class="ex">afspreken</span>, <span class="ex">opbellen</span>, <span class="ex">uitleggen</span>. Always listen to the end of the sentence: the last word often changes the meaning of the first.'
      },
      drills: [
        D('Ik sta elke dag om zes uur op.', { fr: 'Je me lève à six heures tous les jours.', en: 'I get up at six o’clock every day.' }, 'op'),
        D('Ik neem mijn laptop mee.', { fr: 'J’emporte mon portable.', en: 'I’m taking my laptop with me.' }, 'mee'),
        D('We spreken morgen af.', { fr: 'On se voit demain.', en: 'We’ll meet tomorrow.' }, 'af'),
        D('Hij belt u straks op.', { fr: 'Il vous appellera tout à l’heure.', en: 'He’ll call you later.' }, 'op'),
        D('Kunt u dat even uitleggen?', { fr: 'Pouvez-vous expliquer ça rapidement ?', en: 'Can you explain that quickly?' }, 'uitleggen')
      ]
    },
    {
      id: 'g-perfect-intro', unit: 'weekend', level: 'A1',
      title: { fr: 'Le passé composé avec hebben', en: 'The perfect tense with hebben' },
      rule: { fr: 'hebben + ge...t/d, participe à la fin.', en: 'hebben + ge...t/d, participle at the end.' },
      nl: 'Ik heb dit weekend gewandeld.', fr: 'Je me suis promené ce week-end.', en: 'I went for a walk this weekend.',
      explain: {
        fr: 'Sans ça, impossible de répondre à <i lang="nl-BE">hoe was uw weekend?</i>. Le néerlandais raconte le passé avec <span class="ex">hebben</span> (ou <span class="ex">zijn</span>) plus un participe garé <b>tout à la fin</b> de la phrase — c’est la différence avec le français, où le participe suit immédiatement l’auxiliaire : <span class="ex">Ik <b>heb</b> dit weekend <b>gewandeld</b></span>. Construis le participe avec <b>ge-</b> + radical + <b>-t</b> ou <b>-d</b> : werken → gewerkt, wandelen → gewandeld. Les verbes de mouvement et de changement prennent <span class="ex">zijn</span>, exactement comme le français prend « être » : <span class="ex">ik <b>ben</b> naar Brussel <b>geweest</b></span>.',
        en: 'Without this, you cannot answer <i lang="nl-BE">hoe was uw weekend?</i>. Dutch tells the past with <span class="ex">hebben</span> (or <span class="ex">zijn</span>) plus a participle parked <b>at the very end</b> of the sentence — that is the difference from English, where the participle follows the auxiliary immediately: <span class="ex">Ik <b>heb</b> dit weekend <b>gewandeld</b></span>. Build the participle with <b>ge-</b> + stem + <b>-t</b> or <b>-d</b>: werken → gewerkt, wandelen → gewandeld. Verbs of movement and change take <span class="ex">zijn</span>: <span class="ex">ik <b>ben</b> naar Brussel <b>geweest</b></span>.'
      },
      drills: [
        D('Ik heb dit weekend gewandeld.', { fr: 'Je me suis promené ce week-end.', en: 'I went for a walk this weekend.' }, 'gewandeld'),
        D('Ik heb de match gezien.', { fr: 'J’ai vu le match.', en: 'I saw the match.' }, 'gezien'),
        D('We hebben niks speciaals gedaan.', { fr: 'On n’a rien fait de spécial.', en: 'We didn’t do anything special.' }, 'gedaan'),
        D('Ik ben naar Brussel geweest.', { fr: 'Je suis allé à Bruxelles.', en: 'I have been to Brussels.' }, 'geweest')
      ]
    }
  ];
})();
