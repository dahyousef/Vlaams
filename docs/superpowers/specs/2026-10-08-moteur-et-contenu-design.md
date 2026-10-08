# Plan de reprise — un moteur minimal, des garde-fous, et du contenu jusqu'au B1

Spécification du 8 octobre 2026. Elle remplace l'intention du 30 septembre
(« geler, tester une semaine »). Les constats qui la motivent sont dans
`CONSTATS-2026-10-06.md` ; ce document dit quoi faire, dans quel ordre, et
comment on saura que c'est fait.

**Découpage.** Un seul plan d'implémentation couvre les sections 3 à 6 — le
moteur, les écrans, l'écran des erreurs, les garde-fous. C'est cohérent, c'est
fini en quelques jours, et ça débloque l'étude quotidienne. **Les phases de
contenu du §7 ne sont pas dans ce plan**, et **la fabrique du §8 non plus** :
chacune aura le sien, parce qu'elles se livrent une par une et que la phase 0
doit tourner avant qu'on dimensionne la suite. Vouloir tout planifier d'un coup
produirait un plan qu'on abandonne au tiers.

## 1. Le verdict de la semaine de test

Une phrase l'a réorientée : **« le but de l'application c'est juste d'apprendre
le néerlandais, la maîtrise je m'en fiche un peu »**. Trois conséquences :

- **La maîtrise n'est plus une mesure.** Le pourcentage de maîtrise et celui de
  l'unité quittent les écrans ; des comptes les remplacent. Les constats A2 et A3
  ne sont donc pas réparés, ils **disparaissent** : ils ne faisaient mal qu'en
  tant que chiffres.
- **Le moteur n'a jamais été le goulot. Le contenu l'est.** ~306 éléments
  distincts, tous A1, épuisés en 18 jours dès que le neuf circule. Le travail sur
  le moteur est donc délibérément petit.
- **La cible est le B1**, visant l'usage réel : il travaille dans un endroit où
  presque tout le monde parle néerlandais.

## 2. Ce qui n'est pas un objectif

Supprimé, et il faut le dire pour que personne ne le reconstruise :

- la refonte complète de l'échelle de progression ;
- le **test de placement** — il créait plus de confusion qu'il ne faisait gagner
  de temps ; on repart de zéro ;
- tout chiffre de « maîtrise » à l'écran ;
- un bouton « je connais déjà » ;
- **un serveur dans l'application** : la fabrique du §8 est un outil qu'on
  lance, pas un service déployé. L'application reste une page statique qui
  fonctionne hors ligne ;
- un dépôt de contenu privé : le dépôt reste **public**, donc aucune donnée
  personnelle dans les fichiers versionnés, et aucun contenu copié d'un cours
  commercial ;
- la machine à ingérer du texte réel : elle attend le niveau A2.

## 3. Le moteur — quatre changements, pas plus

### 3.1 Les reprises intra-séance cessent d'être des échéances

**La cause racine.** `r.interval = STEP[r.stage]` (`src/core/srs.js:137`) fait
dépendre *quand un élément revient* de *où il en est*. Les deux premiers barreaux
valent 2 et 12 minutes : une reprise à faire tout de suite devient une échéance
enregistrée, qui concourt ensuite pour une place du budget du jour, toute la
journée.

- `STEP` ne contient plus que des intervalles **≥ 1 jour** :
  `[1 j, 1 j, 3 j, 7 j, 21 j, 60 j]`. Les deux premières valeurs sont à 1 jour
  exprès : un mot neuf réussi revient **le lendemain**, ce qui est le bon premier
  intervalle, et un élément retombé au barreau 0 revient aussi le lendemain.
  Les valeurs exactes sont à valider par `pace.js`, pas à décréter.
- Le renforcement court reste, mais **dans la séance** : le lanceur de séance
  sait déjà remettre un élément en file (`src/ui/session.js:156`). Un mot neuf
  réussi est reproposé plus loin dans la même séance, sans jamais devenir une
  échéance.
- Conséquence : `dueItems()` ne rend plus que de vraies révisions du lendemain
  ou plus tard.

### 3.2 Une part de chaque séance est réservée au neuf

**Indispensable en plus de 3.1, et je m'étais trompé en disant que 3.1 suffisait.**
3.1 règle la panne d'aujourd'hui. Mais avec 400 éléments en rotation, les vraies
révisions rempliront à elles seules les 22 places, et le neuf s'arrêtera de
nouveau — même symptôme, autre cause.

- Tant qu'il reste des éléments jamais rencontrés, chaque séance réserve
  **au moins 30 % de ses places, et au minimum 4**, à du vocabulaire neuf.
- La réservation est prélevée **avant** que les révisions ne remplissent, dans
  `plan()` (`src/core/srs.js:224`) **et** dans `start()`
  (`src/ui/session.js:53-63`), qui calculent aujourd'hui la même chose deux fois.
  Les deux appellent désormais une seule fonction : un seul endroit décide de la
  composition d'une séance.
- Ce qui déborde attend. Le plafond quotidien (`pace().cap`) ne change pas.

### 3.3 Les paliers sont enfin renseignés

`TIER_MAX = { produce: 6, write: 4, recognise: 2 }` (`src/core/srs.js:18`) est du
code vivant sans aucun appelant : **aucun des 439 éléments ne déclare de
palier**, donc tous grimpent jusqu'au barreau 6. *zeventien* coûte autant que
*verstaan*.

- Les paliers sont posés **par règle**, pas à la main, pour que ce soit
  reproductible et relisible : les mots transparents détectés
  (`src/content/index.js:64`) et les nombres au-delà de vingt plafonnent à
  `write` ; une liste explicite et relue plafonne à `recognise`.
- Le script produit un **rapport** de ce qu'il a changé, à relire avant de
  committer.

### 3.4 Le seuil d'ouverture passe à 75 % de « rencontré »

`unitComplete` exige aujourd'hui 80 % des éléments au barreau 3
(`src/content/index.js:78-85`) : un seuil de maîtrise déguisé, et la cause du
« tu es à 3 % » après deux jours de travail parfait.

- Nouveau seuil : **75 % des éléments de l'unité rencontrés au moins une fois**.
- `frontier()`, `unitOpen()` et la contiguïté sont conservés tels quels : ils
  empêchent de déverser 439 éléments le premier jour, et c'est leur seul rôle.

## 4. Les écrans disent la vérité, en comptes

- Une carte d'unité affiche **deux comptes** — *mots rencontrés*, *mots que tu
  peux produire* — et **plus aucun pourcentage** (constats B3, B5).
- La ligne **« l'unité suivante s'ouvre dans N mots »** remplace le chiffre qui
  ne bougeait pas.
- Les **plaquettes d'échelon** sont supprimées (B2) : elles montraient le barreau
  d'un élément sous la barre de progression de la séance, donc elles se lisaient
  comme une barre cassée.
- La carte de séance **nomme son unité** — « Unité 5 », ou « Unités 4–5 »
  quand la frontière est à cheval (B1).
- Le texte d'explication qui n'existait qu'à la fin du test de placement est
  réemployé sur Aujourd'hui (B4). Le test disparaissant, ce texte est réécrit, pas
  déplacé.

## 5. L'écran des erreurs — ce que l'app sait déjà et ne dit pas

`logReview` (`src/core/state.js:129`) enregistre chaque réponse depuis septembre.
`state.logs` l'expose. **Aucun écran ne le lit** — vérifié sur tout `src/ui` et
`src/app.js`. Pendant ce temps le filtre « faible » de `src/ui/library.js:21`
définit la faiblesse par le barreau (`stageOf < 3`), pas par les erreurs.

- Un écran **« ce que tu rates »** : les éléments les plus souvent manqués,
  tirés du journal et de `r.lapses`, avec de quoi les travailler tout de suite.
- Le filtre « faible » de la bibliothèque passe du barreau aux **rechutes
  réelles**.
- Aucune collecte nouvelle : la donnée est là depuis le premier jour.

## 6. Les garde-fous — tout ce qui peut être vérifié par machine l'est

Le contenu va être multiplié par dix et il n'y a **pas de relecteur
néerlandophone**. Les garde-fous remplacent ce qu'on n'a pas.

| Garde-fou | Ce qu'il attrape | État |
| --- | --- | --- |
| `test/dehet.js` | `de`/`het` de chaque nom, contre le Wiktionnaire | **fait** (a trouvé `het pistolet`) |
| Dictionnaire | un mot qui n'existe pas en néerlandais | à écrire — 9 exceptions flamandes connues |
| Tous les exercices | un élément qu'aucun exercice ne peut construire — `src/ui/session.js:83` les saute en silence, et 20 des 37 `catch` du projet sont vides | à écrire — 0 échec sur 3 052 paires aujourd'hui |
| Emprunt en avant | une phrase d'exemple qui emploie du vocabulaire d'une unité **ultérieure**, ce que `examples.js` s'interdit déjà par écrit | à écrire — 62 phrases sur 414 aujourd'hui |
| Doublons | un mot enseigné dans deux unités : drillé deux fois, et compté deux fois pour le seuil de 75 % | à écrire — 8 aujourd'hui |

Deux corrections de la suite existante :

- **`test/pace.js` ne peut pas voir la panne qui a cassé la semaine.** La ligne 86
  fixe l'horloge une fois par jour simulé et la laisse figée pendant douze
  séances : une révision à 12 minutes n'échoit jamais dans la journée. L'horloge
  doit avancer **dans** la journée ; la simulation devient alors le test de
  non-régression de 3.1, et aurait trouvé le défaut en septembre.
- **Rien ne vérifie que `index.html` versionné correspond aux sources.** Vercel
  reconstruit, donc le site est juste ; mais le `index.html` du dépôt, que le
  README invite à ouvrir directement, peut dériver. Une ligne de CI.

## 7. Le contenu, par phases

Chaque phase est livrable et étudiable. Sources ouvertes seulement, avec
attribution (`ATTRIBUTION.md`) : Tatoeba (50 367 phrases néerlandaises traduites
en français, écrites par des natifs), le Wiktionnaire (genre, flexions),
FrequencyWords (fréquence de **l'oral**), Common Voice (voix humaines, CC0).

La **phase 0 se fait à la main**. À partir de la phase 1, c'est la fabrique du
§8 qui produit, et les garde-fous du §6 qui valident.

0. **Réparer avant d'ajouter.** Les 8 doublons. Les **107 mots sans phrase
   d'exemple**, en commençant par les unités 1 à 3 — qui sont les pires
   (*tijd* 29 sur 40, *ikengij* 17 sur 26, *overleven* 16 sur 26) et les
   premières rencontrées.
1. **Réveiller le flamand.** Seuls **60 éléments sur 430 (14 %)** portent une
   variante `be` réellement différente, donc l'exercice `vlaams` — le seul
   qu'aucun cours commercial n'a — tire **19 fois sur ~4 500**. C'est le contenu
   le plus rentable du projet.
2. **De vraies voix.** Associer les phrases à Common Voice quand elles y sont,
   la synthèse en repli. Puis l'écran d'écoute autour de ça : comprendre des
   collègues à vitesse normale est le vrai besoin.
3. **Finir le A1** (~800–1000 mots), ordre informé par la fréquence de l'oral.
4. **A2** (~1500–2000 mots), le niveau qui change la vie quotidienne.
5. **B1 + la machine à ingérer** du texte réel.

**La fréquence est un deuxième avis, pas une règle.** Les 26 mots « rares »
signalés par la sonde sont *choco, amai, plezant, living, frieten, pint, tram,
negentig, voorschrift* : rares dans des sous-titres, parfaitement courants dans
une boulangerie flamande. Cette liste **valide** le contenu au lieu de
l'accuser. L'ordre des unités, lui, mérite d'être rediscuté : *familie* (rang
médian 382) et *dokter* (873) sont derrière *bakker* (2377), *thuis* (1920) et
*onderweg* (1983).

## 8. La fabrique de contenu — Spring Boot + Spring AI

**Pourquoi elle existe, honnêtement : deux raisons qui pointent dans la même
direction.** Le contenu jusqu'au B1 (2 500–3 500 mots, chacun avec ses phrases)
ne s'écrit pas à la main — aucun manuel ne contient ça. Et Spring AI a une
valeur professionnelle réelle pour quelqu'un qui travaille dans une maison Java :
autant l'apprendre sur un problème qu'on a vraiment que sur un projet jouet.

**Où.** `tools/content-pipeline/`, avec son propre `pom.xml`, dans ce dépôt.
`build.sh` travaille sur une liste de sources explicite, donc il l'ignore déjà.
**L'outil qui fabrique le contenu est une application Spring Boot ; ce qui part
dans le navigateur garde zéro dépendance.** La distinction est volontaire, et
c'est elle qu'il faut savoir défendre.

**Ce qu'elle fait.**

1. **Ingérer** Tatoeba (50 367 phrases néerlandaises traduites en français,
   écrites par des natifs), FrequencyWords, le Wiktionnaire.
2. **Retrouver** les phrases candidates pour un mot — et c'est là qu'un magasin
   de vecteurs gagne sa place au lieu de décorer : la correspondance littérale
   trouve les phrases qui **contiennent** un mot, les plongements trouvent celles
   qui **parlent de la boulangerie**, ce qui est le vrai critère d'une phrase
   adaptée à une unité.
3. **Générer** seulement là où aucune phrase native ne convient, en **sortie
   structurée** — des enregistrements typés, pas de la prose à analyser.
4. **Vérifier** chaque candidate : dictionnaire, `de`/`het`, emprunt en avant,
   présence du mot à trouer, longueur ; plus des **évaluateurs** (« est-ce du
   flamand naturel ? », « le français correspond-il ? »), recoupés avec une
   deuxième source.
5. **Émettre** les fichiers de contenu statiques, et un **rapport des rejets avec
   leur raison**, pour ne relire que l'incertain.

**Quand : après la phase 0, pas avant.** La fabrique paie au volume, et 107
phrases vont plus vite à la main. Surtout, la phase 0 faite à la main devient
l'**étalon** contre lequel on mesure la sortie de la fabrique : sans échantillon
de référence, rien ne permet de dire si elle est assez bonne pour qu'on lui fasse
confiance. Le CV n'est pas pressé ; la qualité de la fabrique, elle, dépend de
cet étalon.

**Ce qu'elle n'est pas.** Un serveur. Rien n'est déployé, rien ne tourne en
production. Un tuteur IA *dans* l'application est une autre question, au §10.

## 9. Risques

- **La remise à zéro doit effacer le serveur, pas seulement le téléphone.** Le
  compte porte ~430 éléments au barreau 3 et il se synchronise. Si la remise à
  zéro ne vide que `localStorage`, la synchro réadopte l'ancienne progression au
  chargement suivant et resature le paquet — reproduisant A1 au jour 1 du
  nouveau plan. **À vérifier avant toute autre étape.**
- **Trois minuteries qui peuvent se combiner.** Supabase gratuit : aucune
  sauvegarde, mise en pause après 7 jours d'inactivité. L'action quotidienne le
  tient éveillé — mais GitHub désactive les workflows planifiés après ~60 jours
  d'inactivité du dépôt, et Safari iOS peut évincer le stockage d'un site non
  visité pendant ~une semaine. Chaque pièce va bien seule. À confirmer plutôt
  qu'à croire, et à couvrir par un export de progression conservé en fichier.
- **Pas de relecteur natif.** L'idiome, le registre et l'ordre des mots restent
  invérifiables par machine. Mitigation : préférer **une phrase écrite par un
  natif** (Tatoeba) à une phrase inventée, et traiter une réaction bizarre d'un
  collègue comme un rapport de bug.
- **Le contenu assisté par IA doit être recoupé**, jamais publié sur ma seule
  confiance : chaque phrase passe les garde-fous du §6, et vient d'une source
  native quand il en existe une.
- **Dette qui devient urgente à cause de ce plan** (D1, D2) : six copies
  divergentes du faux navigateur dans les tests, alors qu'on va en écrire
  plusieurs ; sept endroits décident de la phrase sur laquelle un élément est
  drillé, alors qu'on va ajouter 107 phrases. Peu cher maintenant, cher ensuite.

## 10. Décisions encore ouvertes

- **Un tuteur IA dans l'application** — corriger les réponses libres et
  converser. Le type d'exercice `open` existe et ne sert jamais. Contrairement à
  la fabrique du §8, ça demande un vrai serveur pour porter la clé d'API. Deux
  formes possibles : une **fonction Edge Supabase** (~30 lignes, gratuit, démarre
  en millisecondes) ou un **service Spring** déployé (plus lourd, démarrage à
  froid de plusieurs secondes pour une JVM, mais c'est du Spring déployé sur un
  CV). À décider après le A2, et à décider en sachant laquelle des deux raisons
  on sert.
- **L'ordre des unités** (§7) : rediscuter ou laisser.

## 11. Comment on saura que c'est fait

- `sh test/run-all.sh` vert, garde-fous du §6 inclus.
- **Chaque correction laisse un test qui échoue sur l'ancien code** — la règle du
  dépôt. Pour 3.1, c'est `pace.js` avec l'horloge qui avance.
- Et la seule mesure qui compte vraiment : **trois jours d'étude réelle où des
  mots neufs apparaissent chaque jour**, vérifiés sur l'appareil, pas en
  simulation.
