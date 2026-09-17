# Vlaams

Hébergé sur Vercel, progression enregistrée par compte (Supabase). À ouvrir dans
Edge pour la reconnaissance vocale, ou à installer sur le téléphone.

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

Passer d'une adresse à une autre, c'est changer d'origine : autre base locale,
vide. **Réglages → Exporter ma progression** avant de bouger, puis importe sur la
nouvelle adresse. Si tu es connecté, l'import part aussi dans ton compte.

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

## Le budget quotidien

Un plafond dur : **120 exercices par jour, environ 25 minutes** au rythme Normal.
Du nouveau n'est libéré que si la journée a de la place une fois les révisions
faites. Ce qui déborde attend, et ne s'affiche jamais comme un arriéré.

C'est le seul mécanisme qui empêche la dette de révisions : sans lui, une
simulation sur 400 jours passe à deux heures par jour au sixième mois.

| Rythme | Par jour | Plafond |
| --- | --- | --- |
| Tranquille | 15 min | 70 exercices |
| **Normal** | **25 min** | **120** |
| Intensif | 45 min | 200 |

Chaque élément porte aussi un **palier** : tout le vocabulaire ne monte pas
jusqu'à l'oral. On comprend 4 000 mots, on en produit 1 500.

## L'échelle de production

Le type d'exercice n'est pas tiré au hasard : il dépend de ce que tu sais déjà.

Chaque barreau propose un **ensemble** de types, jamais un seul, et un
gouverneur évite ce que l'élément a eu la dernière fois. Une passe d'étalement
réordonne ensuite la file pour qu'aucun type ne colle à lui-même.

| Barreau | Nom | Mot | Phrase |
| --- | --- | --- | --- |
| 0 | découverte | pick | pick |
| 1 | reconnaissance | article · l'intrus | assemblage · standaard/Vlaams |
| 2 | à l'oreille | dictée · écrire | trou · corrige l'erreur |
| 3 | à l'écrit | écrire · trou | dictée · corrige |
| 4 | à voix haute | écrire · dictée | écrire · trou |
| 5 | maîtrisé | **parler** | **parler** |
| 6 | ancré | alterné | alterné, dont réponse libre |

L'échelon 5 est **parler** et rien d'autre : c'est ce qui garantit que rien n'est
acquis sans être sorti de ta bouche.

Deux règles trouvées en simulation, et testées :

- une rechute redescend de **deux** barreaux et **rentre dans l'échelle** — elle
  ne repart pas de deux minutes pour remonter en multipliant, sinon l'élément
  oscille sous son plafond sans jamais en sortir ;
- elle ne redescend **jamais sous le barreau 1** : on ne te REPRÉSENTE pas un mot
  que tu connais depuis des mois ;
- au sommet de son palier, l'intervalle **continue de croître** puis l'élément
  sort du paquet quotidien. Figé, il reviendrait tous les jours à vie.

Les mots transparents — *de tram, de garage, direct* — démarrent au barreau 3 :
un francophone n'a pas besoin de douze passages pour les apprendre.

## Ce que le français t'apporte

Une part du flamand vient directement du français : `merci`, `allez`, `plezant`
(plaisant), `ambetant` (embêtant), `een tas koffie`, `de confituur`, `het
pistolet`. La fiche **Le français caché dans le flamand** les rassemble, avec les
faux amis en contrepoids. Trois voyelles néerlandaises — `eu`, `oe`, `u` —
existent déjà en français, ce qu'un anglophone n'a pas.

Et les nombres suivent : `zeventig` = **septante**, `negentig` = **nonante**.

## Compte et synchronisation

Connexion sans mot de passe : un lien par mail, ou le **code à six chiffres** du
même mail — indispensable quand le lien s'ouvre dans un autre navigateur que
celui où tu étudies.

L'appareil reste la source immédiate. Chaque réponse s'écrit d'abord en local
(IndexedDB), puis dans une boîte d'envoi qui part vers la base dès qu'il y a du
réseau. Hors ligne, rien ne change ; au retour, tout rattrape.

- **Conflits** : par fiche, la révision la plus récente gagne — côté serveur
  aussi, par un déclencheur qui ignore une écriture plus ancienne.
- **Réglages** : fusion champ par champ. L'XP se prend au maximum, la série suit
  le jour le plus récent, les listes s'unissent.
- **Première connexion** : la progression déjà présente sur l'appareil est
  adoptée par le compte.
- **Autre compte sur le même appareil** : l'appareil est effacé d'abord. La
  déconnexion envoie ce qui reste, puis efface.
- **Sans configuration** (pas de variables Supabase au build), la synchro est
  inerte : l'app fonctionne en local, comme l'artefact et les tests.

## Mettre en ligne — Supabase + Vercel

**1. Supabase** — crée un projet sur supabase.com, puis :

- **SQL Editor** : colle et exécute [supabase/schema.sql](supabase/schema.sql).
  Tables, RLS (chacun ne voit que ses lignes) et déclencheur « le plus récent
  gagne ». Le script peut être relancé sans danger.
- **Authentication → URL Configuration** : *Site URL* = l'adresse Vercel,
  et ajoute-la aussi dans *Redirect URLs*.
- **Authentication → Email Templates → Magic Link** : ajoute le code au mail,
  par exemple `<p>Ou tape ce code : <b>{{ .Token }}</b></p>`.
- **Project Settings → API** : copie *Project URL* et la clé *anon / publishable*.
  Cette clé est publique par conception ; c'est la RLS qui protège les données.

**2. Vercel** — *Add New → Project*, importe ce dépôt GitHub, puis dans
*Environment Variables* :

| Nom | Valeur |
| --- | --- |
| `SUPABASE_URL` | l'URL du projet |
| `SUPABASE_ANON_KEY` | la clé anon |

Rien d'autre à régler : [vercel.json](vercel.json) donne la commande de build
(`sh build.sh`) et le dossier publié (`dist/`). Chaque push sur `main`
redéploie. Après avoir changé une variable, relance un déploiement.

**3. Adresse finale** — reviens dans Supabase mettre l'adresse définitive dans
*Site URL* et *Redirect URLs* si elle a changé (domaine perso, par exemple).

Le workflow [.github/workflows/test.yml](.github/workflows/test.yml) teste chaque
push dans les quatre combinaisons voix/navigateur, plus un build avec la synchro
activée. Un run rouge veut dire : ne fais pas confiance à ce déploiement.

Build local avec la synchro :

```sh
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=... sh build.sh
```

## Fichiers

```
src/core/     util  fr (toute l'interface)  state (IndexedDB)  srs  speech  audio  sync (Supabase)
src/content/  lexicon.a1  lexicon.a1b  grammar  reference  scenarios  index
src/ex/       les types d'exercices, derrière une seule interface
src/ui/       shell  session  home  scenario  listen  library  placement  doctor  account
styles.css    le système de design
build.sh      concatène le tout en index.html + artifact.html, et prépare dist/
vendor/       supabase-js (UMD, version dans SUPABASE_VERSION), seulement dans index.html
supabase/     schéma de la base, RLS et déclencheurs
vercel.json   build et en-têtes pour Vercel
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
node test/sync.js     "$(pwd)"              # deux appareils, faux Supabase : adoption, conflits, panne, comptes
node test/journey.js  "$(pwd)" nl-BE OPR    # parcours complet d'un utilisateur
node test/pace.js     "$(pwd)" 400          # 400 jours : charge, variété, exigence
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

**Livré** : interface et contenu en français de Belgique (12 unités, 439
éléments, 6 scénarios, 8 antisèches, 9 règles) ; docteur audio et
enregistre-et-compare pour Opera ; sauvegarde export/import ; personnalisation
prénom/commune/employeur.

**Moteur, refait après simulation** : budget quotidien borné, paliers par
élément, les deux correctifs d'intervalle, gouverneur de variété et étalement,
déverrouillage par frontière contiguë, pourcentage de maîtrise seule, test de
placement en échelle (4 questions, 3 bonnes, arrêt à la première échouée),
quatre nouveaux types d'exercice — l'intrus, corrige l'erreur, standaard of
Vlaams, réponse libre notée sur rubrique.

**À venir** : le contenu est encore le plafond. 439 éléments s'épuisent vers le
jour 40. La suite, dans l'ordre : noyau de 1 200 mots par fréquence avec les
situations intégrées, 400 expressions figées, écrans *Lezen* et *Missions*,
textes gradués et écoute longue, puis A2 → B2.
