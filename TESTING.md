# Comment Vlaams est testé

## Lancer toute la suite

```sh
sh test/run-all.sh
```

Build, puis chaque test, dans l'ordre. C'est la même commande que la CI : il
n'y a qu'une seule liste. Il faut Node et un `sh` (sous Windows, celui de Git).

| Test | Ce qu'il vérifie |
| --- | --- |
| `smoke.js` | Le contenu, l'échelle, chaque type d'exercice, la notation, la qualité des leurres (ceux que « Comment le dit-on ici ? » tire au hasard, chaque élément tiré sans ses leurres écrits : la forme que l'exercice propose pour un autre élément du même genre, jamais une réponse juste, et jamais une bonne option seule à porter un article, ou seule à n'en pas porter), l'orthographe ; que le build ne garde aucune des chaînes d'interface néerlandaises connues non traduites, qu'il déclare `<html lang="en-GB">` et porte la description anglaise (l'anglais est l'affichage par défaut ; `lang.js` contrôle les deux tables d'interface), et que `index.html` et `artifact.html` en sortent en LF, sans retour chariot ; et les gardes qui relisent les sources et les suites comme du texte, listées sous « Les gardes de `smoke.js` » |
| `helpers.js` | Les aides de `test/lib` dont chaque suite dépend sans les voir : les minuteurs `'held'` du faux navigateur suivent les règles d'un vrai tour (rien ne part avant `B.tick()`, puis tout part dans l'ordre de pose ; `clearTimeout` retire un minuteur avant le tour ou pendant ; un minuteur posé pendant le tour attend le suivant), `B.waiting()` compte ceux qui attendent, une erreur dans l'un d'eux sort de `B.tick()` une fois les autres partis, et un mode de minuteurs inconnu échoue en se nommant ; `onTimerError` ne sert qu'aux minuteurs `'sync'`, dont il reçoit l'erreur que, sans lui, ils ignorent, et échoue en se nommant à côté d'un autre mode ; `prepare` part juste avant `src/app.js`, les autres sources chargées, et échoue sur une page qui ne charge pas `src/app.js` ; `joined()` ôte chaque balise sans rien à sa place, là où `text()` met une espace (`test/lib/langs.js`) |
| `lang.js` | La langue d'affichage (contrôles 2 à 6) : le cours chargé tel quel puis « apparié » (un anglais factice par sens et par texte), aucune chaîne d'interface hors des deux tables, mêmes clés, même forme, mêmes chiffres et mêmes `{…}` dans `fr.js` et `en.js`, aucun écran qui mêle les langues, le réglage, le changement qui attend la fin de la séance et l'avis qui l'annonce (un écran ouvert dans le tour où l'avis s'est levé le montre encore, un écran d'un tour suivant ne le montre plus ; deux avis levés dans un même tour n'attendent qu'un minuteur, et chaque essai part d'un tour fini), ce que la restauration et la remise à zéro gardent, et le néerlandais du cours déclaré comme tel (`lang`), chaque balise prise dans la table de `gloss.js` (`fr`, `en-GB`, `nl-BE`), le sens montré dans l'autre langue marqué comme tel, à l'écran (jusqu'aux exemples d'une règle et aux lignes d'une fiche) et dans chaque exercice du registre, ce que le micro entend déclaré `nl-BE` (le texte provisoire, ce qu'il a entendu, les mots comparés : séance, nazeggen, conversation), la langue où chaque exercice pose et répond (`asks`, `answers` : sur chacun, et lus par le pied, qui en tire la langue de la réponse et la ligne du sens), et ce que chacun dit avoir reçu de la personne (`given`, sur chacun), l'avis sur doctor et compte, la recherche par l'un ou l'autre sens, et les guillemets (6d) : ce que la prose du cours et le piège d'un faux ami citent entre « » ou “ ” déclaré `nl-BE` sur chaque écran qui les montre, dans le pied d'une réponse fausse comme ailleurs, le néerlandais d'un titre (`title`, `h`), qui porte `class="nl"` sans guillemets, déclaré `nl-BE` sur chaque écran qui le montre, celui de la page de / het et de sa tuile, le texte de l'apprenant (`{naam}`, `{stad}`, `{bedrijf}`) échappé sur chaque écran qui le montre, et ce qui est cité, jusque dans les tables des sons et des faux amis, relu contre le néerlandais du cours, les exceptions de `QUOTE_OK` chacune avec sa raison, le reste sous `QUOTE_BUDGET`, et le néerlandais du cours qu'une prose laisse nu quand le français et l'anglais l'écrivent tous deux hors de `nl-BE`, les exceptions de `SHARED_OK` chacune avec sa raison ; elle ne voit pas le néerlandais nu qu'un seul côté écrit, ni celui d'une table écrite dans une seule langue (les sons, les faux amis), ni celui que le cours n'enseigne pas, ni celui des notes des mots et des phrases, ni un mot anglais cité qui s'écrit comme un mot du cours (« slim », « door ») |
| `dehet.js` | Chaque nom du cours confronté au Wiktionnaire : `de` ou `het`, sur la fiche **et** dans ses phrases d'exemple ; le cours chargé par `browser.open`, sans `src/app.js`, comme dans les autres suites |
| `content.js` | L'orthographe contre 410 000 formes néerlandaises, que chaque exercice promis se construise vraiment, que l'exemple de chaque réponse libre coche chacun de ses besoins et que chaque besoin ait sa réponse manquée (`miss`), qui le manque, lui seul, qu'une phrase d'exemple n'emprunte pas de vocabulaire à une unité ultérieure, et qu'un mot ou une phrase listé dans deux unités dise la même chose et ne soit qu'un élément, dont le second listage est un alias ; le contrôle 5 : chaque id garde son néerlandais, le 6 : l'anglais qui reste dû ; un « u » ou « uw » néerlandais glosé « you » porte « (informal, Flemish u) » quand le français tutoie, « (formal) » sinon ; un `<i>` d'une explication de grammaire qui se lit pareil en français et en anglais est du néerlandais, et porte `class="nl"`, que `NL.gloss.prose` déclare `nl-BE` |
| `engine.js` | Ce qu'une séance contient et quand un élément revient, horloge en marche : la panne d'octobre, deux jours de suite, ce qui revient le lendemain à la même heure, l'heure de la réponse à Bruxelles (minuit, 23 h 50, les deux nuits de changement d'heure), le renforcement dans la séance, la réserve de nouveautés, le seuil des unités, la première demande à voix haute et l'exercice écrit qui la suit, l'écrit de l'échelon 3 toujours tapé, « je ne peux pas parler », un mot listé dans deux unités servi une fois, et sa progression d'avant les alias repliée une fois ; « Comment le dit-on ici ? » à l'échelon 1 d'un mot qui a sa forme d'ici, jamais d'un mot dont la première forme flamande est son néerlandais (ja, de dokter) |
| `screens.js` | Chaque écran dans quatre états, relu comme du texte : ni pourcentage, ni maîtrise ; les comptes, le nom de l'unité, ce qui résiste, le bouton « je ne peux pas parler », le journal d'erreurs ; `NL.ui.ifText` et `NL.ui.ifProse`, sur une page à eux : rien sans texte, ni pour un sens qui vaut `null` dans la langue lue, même quand l'autre langue en a un, en anglais comme en français, et sinon le texte échappé dans sa balise, avec sa classe, et pour `ifText` la langue qu'on lui donne, et pour `ifProse` chaque passage cité déclaré `nl-BE` ; la copie de la sauvegarde et celle du journal d'erreurs, toutes deux par `NL.ui.copy`, sur une page aux minuteurs retenus : le champ sélectionné avant toute copie, ce que chacune copie, par le presse-papiers s'il existe, sinon par l'ancienne commande du navigateur, et le toast qui dit « Copié » si l'un d'eux a copié, « copie-le à la main » s'il a refusé ou s'il n'y a ni l'un ni l'autre ; un mot listé dans deux unités, compté une fois : les comptes, les totaux des unités, ce qui résiste, la bibliothèque |
| `typed.js` | Ce qu'une réponse tapée accepte, tapée à l'écran : la cible, la variante flamande, les autres façons de dire (`also`), et la réponse d'un élément au même sens ; la note qu'elle laisse, « Presque » mesuré contre chaque réponse acceptée, la dictée qui garde sa seule cible, les leurres qui ne sont jamais une réponse juste, et le panneau : une bonne réponse qu'il ne redit pas (ni la ligne en gras, ni « Ici on dit », ni la variante choisie dans « Comment le dit-on ici ? », dont les autres formes restent, même sans la ligne flamande dans les réglages), « Ici on dit » sans répétition, la variante flamande telle que le cours l'écrit, chaque forme dans son propre passage en `nl-BE`, sa ponctuation collée au mot qu'elle suit, les mots flamands en gras, « On dit aussi », le sens de l'élément quand l'exercice pose et répond en néerlandais (dans la langue d'affichage, juste ou faux, avant l'explication ; celui du mot de trop dans l'intrus, celui du mot et non de sa phrase dans le texte à trou) ; la règle d'un motif, qui est son explication, sous la réponse du texte à trou et d'« Écris-le », et pas redite après « Remets dans l'ordre », qui la montre au-dessus de ses tuiles ; la réponse libre, dont chaque besoin se lit en mots entiers (« in » n'est pas dans « kind », « om half » mot à mot) et sur les lettres au-delà de l'ASCII (« geïnstalleerd », « één »), pour `\b`, `\B`, `\w`, `\W` et `\w` entre crochets, et une phrase qui la reçoit de `src/content/open.phrases.js`, servie à son échelon 6 ; et tout le cours : pour chaque élément, sa cible puis chaque forme que le panneau présente comme juste (« Ici on dit », `also`), tapées à l'écran, justes et notées comme la cible |
| `sim.js` | Chaque écran, une séance, un scénario, une série d'écoute |
| `firstrun.js` | Une base vide : premier écran, première séance, le défi, la sauvegarde |
| `sync.js` | Deux appareils et le faux Supabase de `test/lib/supabase.js` : adoption, conflits, panne, comptes, la remise à zéro sur deux appareils (dont un hors ligne qui revient), la migration unique, un appareil resté sur l'ancienne version et un serveur qui garde la remise à zéro la plus récente, et une langue d'affichage changée sur un autre appareil, que l'avis nomme ; une connexion qui finit sur l'écran compte, par le code à six chiffres ou par un autre onglet, dont l'accueil dit d'où vient la langue ; et la progression d'un mot listé dans deux unités, apprise sous son second listage avant les alias : repliée sur un appareil neuf, un raté d'après qui tient, rien après une remise à zéro, une sauvegarde d'avant repliée quand on la rend, et des copies d'avant qui ne passent pas devant une progression plus récente faite sur un autre appareil ni ne cachent une fiche d'alias plus récente au serveur, sur un appareil connecté rouvert comme sur un appareil sans compte qui rejoint le compte (six pages chargent `app.js`, les seules de la suite : les deux connexions et les quatre appareils qui s'ouvrent sur leurs copies d'avant) |
| `hooks.js` | Le rappel de reprise : `.claude/settings.json` le branche sur SessionStart (`compact\|resume`), il imprime où une exécution de plan garde son état, même sans `CLAUDE_PROJECT_DIR`, le crochet de démarrage imprime le chemin du transcript que Claude Code lui donne, et `run-controller.md` le nomme, `verifier.md` remet les sorties du build avant de vérifier l'arbre, et le garde-fou git reste branché |
| `journey.js` | Le parcours complet d'un utilisateur, pour une voix et un navigateur donnés |
| `pace.js` | 200 jours simulés, pour quatre apprenants (budget épuisé chaque jour ; une seule séance par jour ; une seule séance, dont une sur cinq là où l’on ne peut pas parler ; une seule séance, commencée à 21 h puis vingt minutes plus tôt chaque jour jusqu’à 7 h, et qui remonte, à l’heure de Bruxelles) : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste, des éléments laissés à un jour qui reviennent le lendemain, y compris les jours où la séance commence plus tôt que la veille, un élément du premier jour demandé à voix haute en dix jours et jamais après trois semaines, l’échelon de l’écrit passé en écrivant, et « je ne peux pas parler » qui ne note rien, ne coûte rien et ne fait rien sauter. L’horloge avance pendant la journée. Sous trente jours, ce qui ne se juge que sur la durée (le lendemain, la première demande à voix haute, une séance sans parler qui croise un exercice à voix haute, la fréquence d’un élément, l’étalement) dit « non jugé » et n’est pas un problème : la suite lance aussi un seul jour, comme les tâches d’un plan |

`journey.js` tourne huit fois : trois voix (flamande, néerlandaise du nord,
aucune) sous Opera et Edge, plus Chrome et Safari sur iPhone. Les tests sont
déterministes : la graine est fixe, `SEED=...` en rejoue une autre.

`test/tools/check-files.js` est un outil, mais `run-all.sh` lance ses contrôles :
sans dossier, `node test/tools/check-files.js .` ne fait qu'eux et n'écrit rien.
`node test/tools/check-files.js . <dossier>` écrit les fichiers que lit une
séance de contrôle de l'anglais : `glosses.tsv` (chaque élément, son français et
son anglais), `blind.tsv` (les mêmes sans l'anglais), `sentences.tsv` (phrases
d'exemple et répliques de scénario), `prose.tsv` (toute autre paire de texte du
cours) et `interface.tsv` (chaque clé des deux tables). Il sort avec 1 si
`glosses.tsv` et `owed()` ne comptent pas les mêmes gloses (celle d'un mot listé
dans deux unités, au second listage, se compte à part : `test/content.js` vérifie
qu'elle dit ce que dit le premier), ou si une ligne a un côté vide que le contenu
n'explique pas (seule une note dont l'anglais est `null` exprès en laisse un), ou
lit « undefined ».

Le balayage de `typed.js` passe par l'écran, pas par le juge : mesuré le 18
octobre 2026, une réponse tapée coûte 11 ms, et les 439 cibles et 98 formes du
cours se tapent en quelques secondes, loin de la minute qu'il ne devait pas
dépasser. Par l'écran, il voit aussi ce que la séance fait de la réponse :
l'échelon, la rechute, le panneau. Il lit les formes dans le panneau lui-même
(`hereLine`) et non dans le contenu : ce qu'il vérifie est ce que la personne
voit présenté comme juste.

L'apprenant qui dérive tient à part le compte du lendemain pour les jours où sa
séance commence plus tôt que la veille. Sur la règle d'avant #28, qui faisait
revenir un élément vingt-quatre heures pile après la réponse, l'apprenant à
heure fixe ne revoyait aucun des 722 éléments laissés à un jour. Celui qui
dérive en revoyait encore 27 sur 772, tous venus des jours où il commençait
plus tard, et aucun des 521 des jours où il commençait plus tôt : son compte
global seul n'aurait rien vu. Ce qu'il garde, c'est un lendemain qui ne dépend
pas de l'heure à laquelle on commence.

Chaque bug corrigé laisse un test qui échoue sur l'ancien code ; une correction
faite à plusieurs endroits, un test qui échoue à chacun.

Ce que plusieurs suites font vit une fois dans `test/lib/`, et chaque fichier y
dit en tête ce qu'il offre : une suite le prend là au lieu de le refaire. Ses
dates partent de l'horloge de la suite (`T0`), chacune différente : deux
écritures dans la même milliseconde ne testent rien.

## Les gardes de `smoke.js`

`smoke.js` relit aussi les sources et les suites comme du texte, sans les lancer. Il
refuse :

- dans les sources listées par `build.sh`, `var` et le chaînage optionnel `?.` (les
  chaînes, les commentaires et les regex ne comptent pas) ;
- hors de `gloss.js`, un attribut `lang="…"` écrit dans le code (`NL.gloss.attr`,
  `NL.gloss.langAttr` ; le cours écrit `class="nl"`), ou `en-GB` écrit en toutes lettres ;
- dans une suite, ce que `test/lib` partage, refait à la main :
  - un clic construit à la main (`B.tap`) ;
  - un second faux Supabase (`test/lib/supabase.js`) ;
  - une échéance tirée d'une date écrite en dur (`test/lib/seed.js`) ;
  - un minuteur remplacé à la main (`timers: 'held'` et `B.tick()`,
    `test/lib/browser.js`) ;
  - un champ de page simulé à la main (`byId: 'stub'` et `B.fields`) ;
  - un HTML dépouillé de ses balises à la main (`text()`, ou `joined()` quand ce
    qu'une balise sépare se lit d'un tenant, `test/lib/langs.js`) ;
  - une source lancée à la main par le `vm` de node, dans le contexte d'une page ou
    dans un contexte à elle (`browser.open`, et `prepare` pour ce qui précède
    `src/app.js`, `test/lib/browser.js`) ;
  - une copie du cours tel qu'il est écrit (`raw()`, `test/lib/prose.js`) ;
  - un arbre parcouru à la main, par une fonction, une méthode d'objet ou un
    `x.y = function`, la tête d'un `if`, d'un `for`, d'un `while`, d'un `switch` ou
    d'un `catch` n'étant pas une méthode (`test/lib/tree.js`) ;
  - le cours parcouru collection par collection (`visitCourse()` et
    `rewriteCourse()`), une boucle écrite dans une chaîne ou un commentaire mise à
    part ; une suite où cette relecture perd le fil (une chaîne, une regex, un
    gabarit ou un commentaire qui ne se ferme pas) est nommée à sa ligne ;
- dans une source ou une suite, ce qui a déjà un nom, écrit de nouveau :
  - l'autre langue (`NL.gloss.other`) ;
  - un sens recopié langue par langue, `fr: x.fr, en: x.en` (`NL.gloss.meaning`) ;
  - « le texte, s'il y en a un » (`NL.ui.ifText`), qu'il soit un sens lu par
    `NL.gloss`, un message, un score ou ce que le micro a entendu, le test écrit
    dans un sens ou dans l'autre, la balise écrite en toutes lettres ou tenue dans
    une variable, `esc()` posé sur le texte ou sur une expression qui le lit, entre
    guillemets simples ou doubles, sur une ligne ou plusieurs ;
  - la comparaison des sens (lue dans `NL.gloss` seul) ;
  - la langue de l'appareil dans des réglages reconstruits (`withDeviceLang`) ;
  - la langue appliquée sans rien dire ou annoncée (`apply()`, `applyAndTell()`) ;
  - une copie par le presse-papiers ou par l'ancienne commande `execCommand` du
    navigateur (`NL.ui.copy`), hors de son bloc dans `shell.js` ;
- un ancien nom revenu : `wordsFr`, `wordsPhFr`, `add-en`, `en` dans `library.js`,
  `voiceInfo().note`, `notice` dans `lang.js`, les textes du journal d'erreurs
  ailleurs que dans sa propre copie (`errcopy`), chaque acte d'une condition lu,
  même sur plusieurs lignes ;
- dans `CAPABILITIES` (`doctor.js`), un `id` que rend `NL.speech.capability()` sans les deux
  textes de ce que l'appareil sait faire de la parole en deux clés de `NL.t`,
  `labelKey` et `noteKey`, lues au dessin, ou un accesseur à leur place ;
- ce que l'appareil sait faire de la parole appelé « tier » : le mot dans `speech.js` ou
  `doctor.js`, une clé de `fr.js` ou `en.js` qui commence par `tier` ou `docTier`, `doc-tier`
  dans `styles.css` (« tier » est le plafond d'un item, voir `GLOSSARY.md`) ;
- dans `smoke.js` même, un fichier du dépôt lu autrement que par son `read()`, ou
  une relecture éprouvée autrement que par son `selfTest()`.

## Ce que les tests ne voient pas

Ils tournent sans navigateur. Trois choses ne se vérifient qu'en vrai :

- le **micro réel** et la reconnaissance vocale ;
- une **vraie voix** néerlandaise, et ce qu'elle donne à l'oreille ;
- **deux séances, deux jours de suite**, sur un vrai appareil : la simulation
  avance son horloge, mais elle ne remplace pas ça.

La **branche IndexedDB**, celle que prend tout vrai navigateur, n'est atteinte
que par `test/sync.js`, à travers un faux IndexedDB minimal (`idb` dans
`test/lib/browser.js`) qui survit à un rechargement : la restauration d'une
sauvegarde, la migration et le rebasage d'une progression adoptée y sont relus
au chargement suivant. Les autres suites tournent sur le repli localStorage.
Trois choses restent hors d'atteinte : le **vrai IndexedDB** d'un navigateur
(transactions qui échouent, quota, onglets qui écrivent ensemble) ; les
**suppressions contre le vrai serveur** (seul le faux serveur de
`test/sync.js` les a exécutées) ; et un **vrai appareil qui tourne encore sur
la version précédente** quand la nouvelle est déployée — les suites en écrivent
l'état, elles ne font pas tourner l'ancienne version.

Les déclencheurs de `supabase/schema.sql` ne tournent que sur la vraie base :
`test/sync.js` les reflète en JavaScript, et le SQL de `keep_reset` a été
vérifié une fois contre un Postgres local (PGlite), hors de la suite.

Et une limite du test `de`/`het` : il vérifie l'article du mot drillé, pas tous
les articles d'une phrase. Un balayage large demanderait une analyse
grammaticale — « het » est aussi le pronom impersonnel (« is het druk »), et un
infinitif substantivé est neutre quand son pluriel prend « de » (« van het
werken »). Restent donc invérifiés : l'article devant un **autre** nom à
l'intérieur d'une phrase d'exemple, l'idiome, et le registre.

Quatre de ces contrôles portent un budget plutôt qu'une exigence de zéro, parce
que le contenu actuel enfreint déjà la règle : 62 phrases d'exemple empruntent du
vocabulaire à une unité ultérieure, 3 échelons n'ont aucun exercice possible, des
éléments de « Comment le dit-on ici ? » n'ont pas de leurres écrits
(`DECOY_BUDGET`) et des éléments n'ont pas d'explication dans les deux langues
(`EXPLAIN_BUDGET`, qui lit la note d'un mot ou d'une phrase et la règle d'un
motif).
`lang.js` en porte un cinquième, `QUOTE_BUDGET` : les passages que la prose du
cours met entre guillemets sans qu'ils soient du néerlandais (une traduction, qui
va entre parenthèses) ; il n'en reste que dans les notes des mots et des
phrases. Un budget ne peut que baisser, et chacun échoue aussi quand le compte
passe dessous, pour que le gain soit verrouillé.

Le balayage de `typed.js` ne tape que les formes que le contenu tient : une
façon juste de dire que ni `be` ni `also` ne connaît reste refusée, et aucun
test ne le saura. Il tape chaque forme exactement, sans faute de frappe, et ne
regarde ni la dictée ni les réponses parlées. L'apprenant qui dérive commence
une fois par jour, chaque jour, entre 7 h et 21 h, toujours à Bruxelles : il
ne voit ni une séance qui passe minuit, ni plusieurs séances à des heures qui
changent, ni des heures au hasard, ni un jour sauté. En deux cents jours, il ne
traverse que le passage à l'heure d'été du 29 mars ; celui d'octobre, c'est
`engine.js` qui le vérifie. Et comme tous les apprenants simulés, il n'oublie
rien : il répond juste 85 fois sur 100, quoi qu'il arrive.

Le barème de la réponse libre lit les lettres au-delà de l'ASCII par le regard
arrière des regex. Un navigateur qui ne le connaît pas (Safari avant 16.4) note
avec la regex telle qu'écrite, où « één » n'est pas un mot. Aucune suite ne le
voit : Node connaît le regard arrière.

`lang.js` ne voit pas si l'anglais est naturel : il compare des clés, des chiffres et des langues, pas le sens. C'est le travail de la séance de contrôle et du mainteneur.

Et ce qu'aucun d'eux ne voit : l'idiome, le registre, l'ordre des mots, si une
phrase vaut la peine d'être apprise. Les scénarios et les antisèches ne passent
pas par le contrôle d'orthographe.

## Le passage complet du 30 septembre 2026

Un passage à la main dans un vrai navigateur, sur un build local : test de
placement (48 questions, les 12 unités), environ 540 exercices couvrant les 12
unités et les 14 types, les 6 scénarios, les deux modes d'écoute, « Mes mots »,
les 8 antisèches, le docteur audio, tous les réglages, la sauvegarde, la remise
à zéro, le clavier, le thème sombre, et chaque écran à 375 px de large.

Il a trouvé quinze bugs, tous corrigés (`cef9723`, `05d3d57`) :

- **Le thème Sombre ou Clair bloquait chaque clic.** `<html data-theme>` était
  pris pour un bouton de thème. Seul « Système » fonctionnait.
- **« Passer » sur l'échauffement par paires** laissait sans bouton pour
  continuer, et recomptait cinq échecs à chaque nouvel appui.
- **Les unités se refermaient** après quelques rechutes dans l'unité 1.
- **Deux mots, une même traduction** : une seule des deux cartes identiques
  était acceptée.
- **Micro refusé dans un scénario** : l'auto-évaluation promise n'avait pas de
  boutons.
- **Le docteur audio** annonçait une voix du nord sans aucune voix installée.
- **Des textes tronqués** : 22 phrases sans leur premier mot, « leur » affiché
  « ur », « un » affiché vide.
- **Le test de placement** pouvait afficher deux fois la même option.
- Et sept défauts plus petits : messages, leurres trop faciles, reprises.

Le même jour (`bc69373`), les exercices sont devenus un cran plus exigeants :
quatre options, orthographe exacte sous six lettres, une question à taper au
test de placement, la dictée plus tôt, la série et le défi.

## Encore ouvert

- Le contenu reste le plafond : 430 éléments, tous de niveau A1.
- Un tiers du vocabulaire n'a pas encore de phrase d'exemple.
