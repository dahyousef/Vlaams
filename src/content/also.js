/* Les « on dit aussi » : d'autres façons de dire la même chose. Une entrée par mot ou phrase,
   sous son néerlandais tel que le lexique l'écrit, jetons non remplis ; la valeur est une liste
   de formes néerlandaises. La réponse tapée les accepte en plus de la cible et de sa forme
   flamande (NL.ex.accepted), et le panneau les liste après coup (« On dit aussi : … »). Du
   néerlandais seulement, jamais stocké : l'élément du contenu les porte, pas l'enregistrement
   de la personne. build() (src/content/index.js) pose la liste sur l'élément, au champ also.
   « bonjour » et « salut », c'est le même salut : hallo, goeiedag et dag s'acceptent l'un
   l'autre (hallo et goeiedag par leur sens commun). Merge des genres explanations-be et
   explanations récrit ce fichier. */
NL.content.byDutch = NL.content.byDutch || {};
NL.content.byDutch['also'] = {
  'Aangenaam.': ['Aangenaam kennis te maken.'],
  'De testen draaien nog.': ['De tests draaien nog.'],
  'Hij is een collega van mij.': ['Dat is een collega van mij.', 'Het is een collega van mij.'],
  'Ik heb koorts sinds gisteren.': ['Ik heb sinds gisteren koorts.'],
  'Ik heb pijn aan mijn rug.': ['Mijn rug doet pijn.', 'Ik heb pijn in mijn rug.'],
  'Ik heet {naam}.': ['Mijn naam is {naam}.'],
  'Ik werk vandaag van thuis.': ['Ik werk vandaag thuis.'],
  'Onze zoon is zes jaar.': ['Onze zoon is zes jaar oud.'],
  'Wij hebben twee kinderen.': ['We hebben twee kinderen.'],
  'dag': ['hallo', 'goeiedag'],
  'dank u wel': ['dank u', 'bedankt'],
  'de dokter': ['de huisdokter'],
  'de living': ['de woonkamer'],
  'de wachtzaal': ['de wachtkamer'],
  'de zus': ['de zuster'],
  'een': ['één'],
  'goeiedag': ['dag'],
  'hallo': ['dag'],
  'het pakje': ['het pakket'],
  'nog eens': ['nog een keer'],
  'trager': ['langzamer'],
};
