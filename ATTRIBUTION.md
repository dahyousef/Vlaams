# Sources

## Wiktionnaire néerlandais — genre des noms

`test/data/dehet.tsv` est une table dérivée du Wiktionnaire néerlandais, via
l'extraction lisible par machine de [kaikki.org](https://kaikki.org/dictionary/Dutch/).

Elle ne contient que des **faits** : un nom, et son genre grammatical (`de`,
`het`, ou les deux quand les deux sont attestés). Aucune définition, aucun
exemple, aucune phrase n'en est tirée — rien de ce qui relève de la rédaction.
Le fichier source de 256 Mo n'est pas versionné ; seule la table dérivée l'est.

Régénérer :

```sh
curl -o nl.jsonl https://kaikki.org/dictionary/Dutch/kaikki.org-dictionary-Dutch.jsonl
node test/tools/build-dehet.js nl.jsonl
```

Le Wiktionnaire est publié sous CC BY-SA 3.0. Le crédit est donné ici par
correction, et parce qu'un fichier de données doit toujours dire d'où il vient.

## Wiktionnaire — sens marqués belges, et les entrées avec leur genre

`tools/content/kaikki.js` tire du même fichier de kaikki.org, épinglé dans
`tools/content/lib/cache.js` (adresse, date, taille, sha256), deux extraits :
les sens que le Wiktionnaire marque belges ou flamands (`belgian.tsv`), et
chaque entrée avec sa nature, son genre et la première glose de chacun de ses
sens (`senses.tsv`). Les deux restent dans `.cache/`, ignoré par git. Le premier
ne sert qu'à vérifier la preuve `wiktionary:<lemme>` d'une forme flamande
proposée pour `src/content/be.js` ; le second, la preuve `wiktionary:<lemme>`
d'un mot nouveau proposé pour un lexique, dont la nature (`pos`) s'accorde.
Rien n'en entre dans un fichier versionné, sauf le lemme qu'une preuve cite :
un **fait**, ce mot existe, ou est marqué belge. Aucune glose, aucun exemple : le
sens d'un mot du cours est écrit pour le cours, le lemme cité dit seulement d'où
il vient.

Régénérer :

```sh
node tools/content/fetch.js . kaikki/nl.jsonl
node tools/content/kaikki.js .
```

## Tatoeba — phrases d'exemple

Les phrases de `src/content/sourced.js` dont le `src` est un numéro viennent de
[Tatoeba](https://tatoeba.org), avec leur traduction anglaise et française, ou l'une
des deux : l'autre est alors écrite pour le cours (D17).
Ce sont des textes, pas des faits : Tatoeba les publie sous
[CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/), et le crédit
est ici une condition de la licence. `docs/attribution/tatoeba.tsv` le donne
phrase par phrase : le numéro et l'auteur de la phrase néerlandaise, de sa
traduction anglaise et de sa traduction française, et la mention d'une
traduction adaptée : `adapted` nomme sa langue (`en`, `fr` ou `en fr`), et une
traduction écrite pour le cours, que Tatoeba n'a pas, s'y lit `-` dans ses deux colonnes. La fusion du genre `examples` (`tools/content/merge.js`)
le réécrit en entier. Une phrase dont le `src` vaut `gen` est écrite pour le
cours, et n'y figure pas.

Les fichiers de Tatoeba, ceux du 7 novembre 2026, sont épinglés dans `tools/content/lib/cache.js` et
restent dans `.cache/`, ignoré par git ; `tools/content/tatoeba.js` en tire les
phrases traduites dans l'une des deux langues au moins, que les outils de contenu classent, celles traduites dans les deux d'abord.

Régénérer :

```sh
node tools/content/fetch.js . tatoeba
node tools/content/tatoeba.js .
```

## OpenTaal — formes de mots

`test/data/nl-words.txt.gz` est la liste de mots d'[OpenTaal](https://github.com/OpenTaal/opentaal-wordlist),
mise en minuscules, triée et compressée : environ 410 000 formes, flexions
comprises. Elle ne contient que des **faits** — une forme existe, ou non — et
sert au contrôle d'orthographe de `test/content.js`. Aucune définition n'en est
tirée.

Régénérer :

```sh
node test/tools/build-wordlist.js
```

La liste est publiée sous licence [BSD révisée](https://opensource.org/license/bsd-3-clause) et [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), au choix ; le fichier de licence d’OpenTaal est [`LICENSE.txt`](https://github.com/OpenTaal/opentaal-wordlist/blob/master/LICENSE.txt). Le crédit
est donné ici pour la même raison que ci-dessus.
