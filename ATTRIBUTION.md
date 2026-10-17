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
