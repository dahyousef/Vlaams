# Vlaams

**→ https://dahyousef.github.io/Vlaams/**

À ouvrir dans Edge pour la reconnaissance vocale, ou à installer sur le
téléphone depuis cette adresse.

Un cours de flamand pour quelqu'un qui vit en Flandre depuis des années, entend
du néerlandais tous les jours et n'arrive toujours pas à le parler.

Le cours prend **ton** prénom, **ta** commune et **ton** employeur et les glisse
dans les phrases : tu t'entraînes sur ce que tu diras vraiment. Voir
« Rends-le tien » plus bas.

Interface et traductions **en français**. Trois partis pris :

1. **Du flamand, pas du néerlandais des Pays-Bas.** Duolingo enseigne `jij`,
   `leuk`, `hoi` et un g raclé. Le Brabant flamand dit `ge`, `plezant`, `hey`,
   un g doux, commande des *pistolets* chez le *bakker* et de la *hesp* chez le
   *beenhouwer*. Tu apprends à **produire** le standard — ce que tu écris dans un
   mail au travail — et à **comprendre** la tussentaal de tes voisins. Les deux
   sont affichées côte à côte.
2. **Rien n'est acquis tant que tu ne l'as pas dit à voix haute.** Chaque élément
   monte une échelle de six barreaux et le dernier est oral.
3. **C'est le planificateur qui décide, pas un arbre de leçons.** La répétition
   espacée choisit quoi et quand. Les unités ne font que l'alimenter.

## Rends-le tien

**Réglages → Rends-le tien** : trois champs, ton prénom, ta commune, ton
employeur. Ils remplacent `{naam}`, `{stad}` et `{bedrijf}` partout — phrases,
scénarios, exercices de grammaire, jusqu'au sous-titre en haut de l'écran.

```
Ik woon in {stad}.        →  Ik woon in Aalst.
Ik werk bij {bedrijf}.    →  Ik werk bij Proximus.
Dag {naam}. Kunt ge ons een korte status geven?
```

Sans réglage, le cours reste neutre (Tom, Gent, Novatech). Tes valeurs ne
quittent jamais l'appareil : elles vivent dans le même stockage local que ta
progression, jamais dans le dépôt.

## Lancer

Ouvre `index.html`. Aucune dépendance, aucune étape de build, aucun serveur.

Pour le micro, il faut une vraie origine — `file://` ne l'accorde pas :

```sh
python -m http.server 8080      # puis http://localhost:8080
```

## Son et micro : lis ceci avant de râler

Tout dépend du navigateur, et l'app le mesure au lieu de le supposer :
**Plus → Son et micro** teste tes voix, joue une phrase, demande le micro et te
dit dans quel niveau tu es.

| Où | Audio | Oral |
| --- | --- | --- |
| Artefact claude.ai (Opera) | Voix système, une fois le flamand installé | Enregistre-et-compare, ou auto-évaluation si le cadre bloque le micro |
| Fichier hébergé ou servi | Idem | Enregistre-et-compare |
| Hébergé, sous Edge | Voix neuronales flamandes, sans installation | Notation automatique, mot par mot |

**Opera est le seul navigateur Chromium sans service de reconnaissance vocale.**
`webkitSpeechRecognition` y existe mais ne répond pas. Aucun code ne corrige ça,
donc l'app le détecte et bascule sur **enregistre-et-compare** : tu écoutes le
modèle, tu t'enregistres, tu joues les deux à la suite. C'est ainsi qu'on
travaillait en laboratoire de langues pendant cinquante ans.

La synthèse vocale, elle, se répare : **Paramètres → Heure et langue → Langue et
région → Ajouter une langue → Nederlands (België)**, en cochant *Voix*. Ça
installe une voix système que tous les navigateurs voient, Opera compris. Le
docteur audio a un bouton **Revérifier** — pas besoin de redémarrer.

## Sauvegarde — à faire avant de changer d'adresse

Passer du lien claude.ai à une URL à toi, c'est changer d'origine : autre base de
données, vide. **Réglages → Exporter ma progression** avant de bouger.

Trois routes, parce que la page tourne à trois endroits : la capacité de
téléchargement de l'hôte dans l'artefact, un téléchargement classique en local ou
hébergé, et **copier/coller** qui marche partout.

## Les écrans

| Écran | À quoi il sert |
| --- | --- |
| **Aujourd'hui** | L'écran par défaut, et le seul dont tu as besoin la plupart des jours. Une seule action, environ quinze minutes. |
| **Parcours** | Douze unités A1 avec les explications de grammaire. Alimente le planificateur. |
| **Parler** | Six jeux de rôle. Tu choisis ta réplique puis tu la dis. |
| **Écouter** | Du flamand à vitesse réelle sans texte, plus du shadowing. |
| **Plus** | Tes mots, les antisèches, standard/flamand, le français caché, les sons, les familles de de/het, le docteur audio, le test de niveau. |

## L'échelle de production

Le type d'exercice n'est pas tiré au hasard : il dépend de ce que tu sais déjà.

| Barreau | Mot | Phrase | Règle |
| --- | --- | --- | --- |
| 0 | pick | pick | order |
| 1 | article (de/het) | bank | order |
| 2 | dictée | cloze | cloze |
| 3 | écrire | dictée | écrire |
| 4 | **parler** | écrire | **parler** |
| 5 | **parler** | **parler** | **parler** |
| 6 | mature — alterne écrit et oral |

Une faute fait redescendre d'un barreau et l'élément revient dans la même séance.

## Ce que le français t'apporte

Une part du flamand vient directement du français : `merci`, `allez`, `plezant`
(plaisant), `ambetant` (embêtant), `een tas koffie`, `de confituur`, `het
pistolet`. La fiche **Le français caché dans le flamand** les rassemble, avec les
faux amis en contrepoids. Trois voyelles néerlandaises — `eu`, `oe`, `u` —
existent déjà en français, ce qu'un anglophone n'a pas.

Et les nombres suivent : `zeventig` = **septante**, `negentig` = **nonante**.

## Mettre en ligne

Le dépôt se publie tout seul sur GitHub Pages. Le workflow
`.github/workflows/pages.yml` reconstruit `index.html` depuis les sources et
**refuse de déployer si un test échoue**, dans les quatre combinaisons
voix/navigateur.

```sh
git remote add origin https://github.com/<toi>/Vlaams.git
git push -u origin main
```

Puis, une seule fois : **Settings → Pages → Source : GitHub Actions**.
L'adresse devient `https://dahyousef.github.io/Vlaams/`.

Pourquoi c'est utile : ouverte dans Edge, cette adresse donne la reconnaissance
vocale et les voix flamandes neuronales que l'artefact claude.ai dans Opera ne
peut pas fournir. Et elle s'installe sur le téléphone.

**Avant de changer d'adresse, exporte ta progression** : une autre origine, c'est
une autre base de données, vide.

## Fichiers

```
src/core/     util  fr (toute l'interface)  state (IndexedDB)  srs  speech  audio
src/content/  lexicon.a1  lexicon.a1b  grammar  reference  scenarios  index
src/ex/       les types d'exercices, derrière une seule interface
src/ui/       shell  session  home  scenario  listen  library  placement  doctor
styles.css    le système de design
build.sh      concatène le tout en index.html + artifact.html
test/         tests sans navigateur
```

Pas de bundler. Chaque fichier est un script qui accroche son objet à `NL.*`,
donc le build est une concaténation et seul l'ordre (dans `build.sh`) compte.
Après toute modification : `sh build.sh`.

## Ajouter du contenu

```js
W(nl, fr, art, be, note)   // W('de hesp', 'le jambon', 'de', null, 'Mot flamand ; le nord dit "ham".')
P(nl, fr, be, note)        // P('Hoeveel is het?', 'Ça fait combien ?', 'Hoeveel is ’t?')
```

`art` (`de`/`het`) doit correspondre à l'article dans `nl` — les tests le
vérifient. Les identifiants viennent de la position dans l'unité : **réordonner
un tableau renomme ses éléments et efface leur historique**. Ajoute à la fin.

## Tests

```sh
node test/smoke.js    "$(pwd)"              # contenu, échelle, exercices, notation, balayage français
node test/sim.js      "$(pwd)"              # chaque écran, une séance, un scénario, une série d'écoute
node test/firstrun.js "$(pwd)"              # base vide : premier écran, première séance, sauvegarde
node test/journey.js  "$(pwd)" nl-BE OPR    # parcours complet d'un utilisateur (~960 vérifications)
```

`journey.js` prend une voix (`nl-BE`, `nl-NL`, `none`) et un navigateur (`OPR`,
`EDG`), parce que c'est là que vivent les vrais problèmes. Lance les quatre :

```sh
for c in "nl-BE OPR" "nl-NL OPR" "none OPR" "nl-BE EDG"; do
  set -- $c; node test/journey.js "$(pwd)" "$1" "$2" | tail -1
done
```

`smoke.js` vérifie aussi qu'aucune chaîne d'interface anglaise ou néerlandaise ne
survit dans le build.

## État

**Livré** : interface et contenu entièrement en français de Belgique (12 unités,
439 éléments, 9 règles, 6 scénarios, 8 antisèches), unité de travail réécrite
pour un développeur Java, docteur audio, enregistre-et-compare, sauvegarde
export/import, libellés bilingues, écrans *français caché* / *faux amis* /
*familles de de/het*, mise en page plus calme.

**À venir**, dans l'ordre : moteur de rythme adaptatif, simulateur de
conversation à trous, onze nouveaux types d'exercices, entraîneur de
conjugaison, détection des points faibles, jalons concrets, puis les neuf unités
A2/B1 et le reste de la filière Java.
