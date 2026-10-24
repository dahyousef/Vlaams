/* Les leurres : les deux mauvaises réponses de « Comment le dit-on ici ? » pour un mot ou une
   phrase qui a sa forme flamande dans src/content/be.js. Une entrée par mot ou phrase, sous
   son néerlandais tel que le lexique l'écrit, jetons non remplis ; la valeur est une liste de
   deux formes. build() (src/content/index.js) la pose sur l'élément, au champ decoys. Merge
   des genres explanations-be et explanations récrit ce fichier, vide jusque-là. */
NL.content.byDutch = NL.content.byDutch || {};
NL.content.byDutch['decoys'] = {
};
