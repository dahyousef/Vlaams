/* Règles de grammaire. Chaque règle est elle-même un item du planificateur,
   travaillée en remettant des phrases en ordre, en comblant des trous, en tapant
   puis en disant. Classées par ce que chacune débloque dans une conversation,
   pas par l'ordre d'un manuel. */
NL.content = NL.content || {};
NL.content.patterns = (function () {
  'use strict';
  const D = (nl, fr, gap) => ({ nl, fr, gap });

  return [
    {
      id: 'g-v2', unit: 'overleven', level: 'A1',
      title: 'Le verbe en deuxième position',
      rule: 'Peu importe ce qui vient en premier, le verbe est le deuxième élément.',
      nl: 'Morgen ga ik naar Brussel.', fr: 'Demain je vais à Bruxelles.',
      explain: 'C’est la colonne vertébrale de toute phrase néerlandaise. Le verbe conjugué occupe la <b>deuxième</b> position — pas le deuxième mot, le deuxième <i>élément</i>. Commence par un complément de temps et le sujet passe derrière le verbe : <span class="ex">Morgen <b>ga</b> ik naar Brussel</span>, jamais <i>Morgen ik ga</i>. Le français ne fait pas ça, donc l’erreur revient pendant des années. La corriger tôt change immédiatement ta façon de sonner.',
      drills: [
        D('Morgen ga ik naar Brussel.', 'Demain je vais à Bruxelles.', 'ga'),
        D('Vandaag werk ik van thuis.', 'Aujourd’hui je travaille de chez moi.', 'werk'),
        D('Om acht uur vertrekt de trein.', 'Le train part à huit heures.', 'vertrekt'),
        D('In {stad} wonen wij al vijf jaar.', 'Nous habitons à {stad} depuis cinq ans.', 'wonen'),
        D('Daarna ga ik naar de bakker.', 'Ensuite je vais chez le boulanger.', 'ga')
      ]
    },
    {
      id: 'g-present', unit: 'ikengij', level: 'A1',
      title: 'Le présent : radical, radical+t, radical+en',
      rule: 'ik werk / jij werkt / hij werkt / wij werken.',
      nl: 'Ik werk bij {bedrijf}.', fr: 'Je travaille chez {bedrijf}.',
      explain: 'Trois formes et tu as tout le présent : <span class="ex">ik werk</span>, <span class="ex">jij/hij werkt</span>, <span class="ex">wij/jullie/zij werken</span>. Bien plus simple que le français, qui en a cinq. Un seul piège : quand <b>jij</b> passe derrière le verbe — dans une question, ou après un complément de temps — le <span class="ex">-t</span> disparaît. <span class="ex">Werk jij morgen?</span>, pas <i>werkt jij</i>. Uniquement avec jij, jamais avec hij.',
      drills: [
        D('Ik werk bij {bedrijf}.', 'Je travaille chez {bedrijf}.', 'werk'),
        D('Hij woont in Aalst.', 'Il habite à Alost.', 'woont'),
        D('Wij wonen in {stad}.', 'Nous habitons à {stad}.', 'wonen'),
        D('Spreek jij Nederlands?', 'Tu parles néerlandais ?', 'Spreek'),
        D('Zij komt om zeven uur.', 'Elle vient à sept heures.', 'komt')
      ]
    },
    {
      id: 'g-gegij', unit: 'ikengij', level: 'A1',
      title: 'Ge et gij : ce que tu entends vraiment',
      rule: 'Dis « je ». Attends-toi à « ge ». C’est la même chose.',
      nl: 'Hebt ge dat verstaan?', fr: 'Tu as compris ?',
      explain: 'Les manuels enseignent <span class="ex">jij/je</span>. Le Brabant flamand dit <span class="ex">gij/ge</span> — à la boulangerie, au club de foot, et en face de toi au bureau. Ce n’est ni grossier ni purement dialectal : c’est simplement le sud. Les verbes suivent : <span class="ex">gij zijt</span> (jij bent), <span class="ex">gij hebt</span>, <span class="ex">gij kunt</span>, et les questions se contractent : <span class="ex">Kunde?</span> (kun je), <span class="ex">Hebde?</span> (heb je), <span class="ex">Zijde?</span> (ben je). <b>Produis « je » et tu es toujours correct. Reconnais « ge » ou tu perds la moitié de ce qu’on te dit.</b>',
      drills: [
        D('Hebt ge dat verstaan?', 'Tu as compris ?', 'ge'),
        D('Zijt ge klaar?', 'Tu es prêt ?', 'Zijt'),
        D('Kunt ge mij helpen?', 'Tu peux m’aider ?', 'ge'),
        D('Waar woont ge?', 'Tu habites où ?', 'ge')
      ]
    },
    {
      id: 'g-getallen', unit: 'tijd', level: 'A1',
      title: 'Les unités avant les dizaines',
      rule: '21 se dit een-en-twintig : le petit chiffre d’abord.',
      nl: 'Het kost eenentwintig euro.', fr: 'Ça coûte vingt-et-un euros.',
      explain: 'Le néerlandais dit les unités avant les dizaines : <span class="ex">eenentwintig</span> (21), <span class="ex">vierenzestig</span> (64), <span class="ex">negenennegentig</span> (99). En un seul mot, sans espace. C’est pour ça qu’un prix ou un numéro de téléphone semble mélangé : tu entends le deuxième chiffre avant le premier. Bonne nouvelle pour toi : <span class="ex">zeventig</span> = septante et <span class="ex">negentig</span> = nonante, exactement comme en Belgique. Le français de France, lui, t’aurait imposé un détour par soixante-dix.',
      drills: [
        D('Het kost eenentwintig euro.', 'Ça coûte vingt-et-un euros.', 'eenentwintig'),
        D('Ik ben tweeenveertig jaar.', 'J’ai quarante-deux ans.', 'tweeenveertig'),
        D('Dat is vijfenzestig euro.', 'Ça fait soixante-cinq euros.', 'vijfenzestig'),
        D('Zij is zeventig jaar.', 'Elle a septante ans.', 'zeventig')
      ]
    },
    {
      id: 'g-halfuur', unit: 'tijd', level: 'A1',
      title: 'Half drie, c’est 2h30',
      rule: 'half + heure = trente minutes AVANT cette heure.',
      nl: 'De vergadering begint om half drie.', fr: 'La réunion commence à deux heures et demie.',
      explain: 'Le néerlandais compte <b>vers</b> l’heure qui vient. <span class="ex">Half drie</span> = une demi-heure avant trois heures, donc 2h30 — et non 3h30. Le français fait l’inverse : « trois heures et demie » = 3h30. Même logique pour <span class="ex">kwart voor</span> (moins le quart) et <span class="ex">kwart na</span> (et quart). La Flandre dit aussi <span class="ex">tien voor half vier</span> pour 15h20, compté à rebours depuis la demie. Te tromper une fois te coûte une réunion.',
      drills: [
        D('De vergadering begint om half drie.', 'La réunion commence à 14h30.', 'half'),
        D('Het is kwart voor acht.', 'Il est huit heures moins le quart.', 'voor'),
        D('Ik vertrek om half negen.', 'Je pars à 8h30.', 'half')
      ]
    },
    {
      id: 'g-dehet', unit: 'bakker', level: 'A1',
      title: 'De ou het, et le -e en plus',
      rule: 'een groot huis, mais het grote huis.',
      nl: 'Het grote huis staat in de straat.', fr: 'La grande maison est dans la rue.',
      explain: 'Environ trois noms sur quatre prennent <span class="ex">de</span>, le reste prend <span class="ex">het</span>. <b>Ne traduis jamais depuis le français</b> : <span class="ex">het huis</span> est neutre alors que « la maison » est féminine, <span class="ex">de tafel</span> est un de-mot alors que « le bureau » est masculin. Les genres ne se correspondent pas du tout. Bonne nouvelle : ce n’est pas totalement arbitraire — voir la fiche <i>Les familles de het</i>. Le gain vient avec l’adjectif : il prend <span class="ex">-e</span> partout — <span class="ex">de grote fiets</span>, <span class="ex">het grote huis</span>, <span class="ex">een grote fiets</span> — sauf après <b>een</b> devant un mot <b>het</b> : <span class="ex">een groot huis</span>. Après le verbe, toujours nu : <span class="ex">het huis is groot</span>.',
      drills: [
        D('Het grote huis staat in de straat.', 'La grande maison est dans la rue.', 'grote'),
        D('Wij hebben een groot huis.', 'Nous avons une grande maison.', 'groot'),
        D('Dat is een lekkere koffie.', 'C’est un bon café.', 'lekkere'),
        D('De koffie is lekker.', 'Le café est bon.', 'lekker')
      ]
    },
    {
      id: 'g-bezit', unit: 'familie', level: 'A1',
      title: 'Mijn, uw, ons et onze',
      rule: 'ons devant un mot het, onze devant tout le reste.',
      nl: 'Ons huis staat naast onze tuin.', fr: 'Notre maison est à côté de notre jardin.',
      explain: 'Les possessifs ne changent jamais de forme, sauf un. <span class="ex">mijn</span>, <span class="ex">je/uw</span>, <span class="ex">zijn</span> (son à lui), <span class="ex">haar</span> (son à elle), <span class="ex">hun</span> (leur) restent identiques quel que soit le nom — contrairement au français, où « mon/ma/mes » s’accorde. Le seul qui bouge est <b>ons/onze</b> : <span class="ex">ons</span> devant un mot het (<span class="ex">ons huis</span>, <span class="ex">ons kind</span>), <span class="ex">onze</span> partout ailleurs (<span class="ex">onze tuin</span>, <span class="ex">onze kinderen</span>). En Flandre tu entendras aussi <span class="ex">uw</span> de façon familière, là où le nord impose <span class="ex">je</span>.',
      drills: [
        D('Ons huis staat naast onze tuin.', 'Notre maison est à côté de notre jardin.', 'Ons'),
        D('Onze dochter gaat naar school.', 'Notre fille va à l’école.', 'Onze'),
        D('Ons kind is zes jaar.', 'Notre enfant a six ans.', 'Ons')
      ]
    },
    {
      id: 'g-scheidbaar', unit: 'dedag', level: 'A1',
      title: 'Les verbes qui se cassent en deux',
      rule: 'Le préfixe s’envole à la fin de la phrase.',
      nl: 'Ik sta elke dag om zes uur op.', fr: 'Je me lève à six heures tous les jours.',
      explain: 'Beaucoup de verbes néerlandais sont un préfixe collé à un verbe, et dans une principale ils se séparent. <span class="ex">Opstaan</span> devient <span class="ex">ik sta ... <b>op</b></span>, le préfixe projeté tout à la fin — parfois six mots plus loin. <span class="ex">Ik sta elke dag om zes uur <b>op</b></span>. Surveille <span class="ex">meenemen</span>, <span class="ex">aankomen</span>, <span class="ex">afspreken</span>, <span class="ex">opbellen</span>, <span class="ex">uitleggen</span>. Écoute toujours la fin de la phrase : le dernier mot change souvent le sens du premier.',
      drills: [
        D('Ik sta elke dag om zes uur op.', 'Je me lève à six heures tous les jours.', 'op'),
        D('Ik neem mijn laptop mee.', 'J’emporte mon portable.', 'mee'),
        D('We spreken morgen af.', 'On se voit demain.', 'af'),
        D('Hij belt u straks op.', 'Il vous rappellera tout à l’heure.', 'op'),
        D('Kunt u dat even uitleggen?', 'Pouvez-vous expliquer ça rapidement ?', 'uitleggen')
      ]
    },
    {
      id: 'g-perfect-intro', unit: 'weekend', level: 'A1',
      title: 'Le passé composé avec hebben',
      rule: 'hebben + ge...t/d, participe à la fin.',
      nl: 'Ik heb dit weekend gewandeld.', fr: 'Je me suis promené ce week-end.',
      explain: 'Sans ça, impossible de répondre à <i>hoe was uw weekend?</i>. Le néerlandais raconte le passé avec <span class="ex">hebben</span> (ou <span class="ex">zijn</span>) plus un participe garé <b>tout à la fin</b> de la phrase — c’est la différence avec le français, où le participe suit immédiatement l’auxiliaire : <span class="ex">Ik <b>heb</b> dit weekend <b>gewandeld</b></span>. Construis le participe avec <b>ge-</b> + radical + <b>-t</b> ou <b>-d</b> : werken → gewerkt, wandelen → gewandeld. Les verbes de mouvement et de changement prennent <span class="ex">zijn</span>, exactement comme le français prend « être » : <span class="ex">ik <b>ben</b> naar Brussel <b>geweest</b></span>.',
      drills: [
        D('Ik heb dit weekend gewandeld.', 'Je me suis promené ce week-end.', 'gewandeld'),
        D('Ik heb de match gezien.', 'J’ai vu le match.', 'gezien'),
        D('We hebben niks speciaals gedaan.', 'On n’a rien fait de spécial.', 'gedaan'),
        D('Ik ben naar Brussel geweest.', 'Je suis allé à Bruxelles.', 'geweest')
      ]
    }
  ];
})();
