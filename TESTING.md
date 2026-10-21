# Comment Vlaams est testé

## Lancer toute la suite

```sh
sh test/run-all.sh
```

Build, puis chaque test, dans l'ordre. C'est la même commande que la CI : il
n'y a qu'une seule liste. Il faut Node et un `sh` (sous Windows, celui de Git).

| Test | Ce qu'il vérifie |
| --- | --- |
| `smoke.js` | Le contenu, l'échelle, chaque type d'exercice, la notation, la qualité des leurres, l'orthographe, que le build ne garde aucune des chaînes d'interface néerlandaises connues non traduites, qu'il déclare `<html lang="en-GB">` et porte la description anglaise (l'anglais est l'affichage par défaut ; `lang.js` contrôle les deux tables d'interface), et qu'aucune source listée dans `build.sh` n'emploie `var` ni le chaînage optionnel `?.` (les chaînes, les commentaires et les regex ne comptent pas), et que `index.html` et `artifact.html` sortent du build en LF, sans retour chariot ; qu'aucune source hors `gloss.js` ne construise un attribut `lang` à la main ni n'écrive `en-GB` ; et qu'aucune suite ne refasse ce que `test/lib` partage : un clic construit à la main (`B.tap`), un second faux Supabase (`test/lib/supabase.js`), une échéance tirée d'une date écrite en dur (`test/lib/seed.js`), un minuteur remplacé à la main (`timers: 'held'` et `B.tick()`, `test/lib/browser.js`), un champ de page simulé à la main (`byId: 'stub'` et `B.fields`), un HTML dépouillé de ses balises à la main (`text()`, ou `joined()` quand ce qu'une balise sépare se lit d'un tenant, `test/lib/langs.js`), une source lancée à la main dans le contexte d'une page, `B.ctx` (`prepare`, `test/lib/browser.js` ; `test/dehet.js`, qui lance `gloss.js` et les données du cours dans un contexte nu à lui, n'est pas une page), une copie du cours tel qu'il est écrit (`raw()`, `test/lib/prose.js`), un arbre parcouru à la main, par une fonction, une méthode d'objet ou un `x.y = function` (`test/lib/tree.js`), ou le cours collection par collection (`visitCourse()` et `rewriteCourse()`), une boucle écrite dans une chaîne ou un commentaire mise à part, et une suite où cette relecture perd le fil (une chaîne, une regex, un gabarit ou un commentaire qui ne se ferme pas) nommée à sa ligne ; et qu'aucune source ni aucune suite ne réécrive ce qui a déjà un nom — l'autre langue (`NL.gloss.other`), « le texte, s'il y en a un » (`NL.ui.ifText`, qu'il soit un sens lu par `NL.gloss`, un message, un score ou ce que le micro a entendu, le test écrit dans un sens ou dans l'autre, la balise écrite en toutes lettres ou tenue dans une variable, `esc()` posé sur le texte ou sur une expression qui le lit, entre guillemets simples ou doubles, sur une ligne ou plusieurs ; `ifText` ne rend rien sans texte, ni pour un sens qui vaut `null` dans la langue lue, même quand l'autre langue en a un, en anglais comme en français ; et le texte échappé dans sa balise, avec sa classe), la comparaison des sens (lue dans `NL.gloss` seul), la langue de l'appareil dans des réglages reconstruits (`withDeviceLang`), la langue appliquée sans rien dire ou annoncée (`apply()`, `applyAndTell()`) — ni ne revienne à un ancien nom : `wordsFr`, `wordsPhFr`, `add-en`, `en` dans `library.js`, `voiceInfo().note`, `notice` dans `lang.js`, les textes du journal d'erreurs ailleurs que dans sa propre copie (`errcopy`), chaque acte d'une condition lu, même sur plusieurs lignes ; que, dans `TIERS` (`doctor.js`), chaque `id` que rend `NL.speech.tier()` tienne les deux textes de ce que l'appareil sait faire de la parole en deux clés de `NL.t`, `labelKey` et `noteKey`, lues au dessin, sans accesseur ; que les minuteurs `'held'` du faux navigateur suivent les règles d'un vrai tour (rien ne part avant `B.tick()`, puis tout part dans l'ordre de pose ; `clearTimeout` retire un minuteur avant le tour ou pendant ; un minuteur posé pendant le tour attend le suivant), qu'un mode de minuteurs inconnu échoue en se nommant, que `B.waiting()` compte les minuteurs `'held'` qui attendent, et qu'une erreur dans l'un d'eux sorte de `B.tick()` une fois les autres partis, sauf si `onTimerError` la prend ; que `prepare` parte juste avant `src/app.js`, les autres sources chargées, et échoue sur une page qui ne charge pas `src/app.js` ; et que `smoke.js` lise les fichiers du dépôt par son seul `read()` et éprouve ses relectures par son seul `selfTest()` |
| `lang.js` | La langue d'affichage (contrôles 2 à 6) : le cours chargé tel quel puis « apparié » (un anglais factice par sens et par texte), aucune chaîne d'interface hors des deux tables, mêmes clés, même forme, mêmes chiffres et mêmes `{…}` dans `fr.js` et `en.js`, aucun écran qui mêle les langues, le réglage, le changement qui attend la fin de la séance et l'avis qui l'annonce (un écran ouvert dans le tour où l'avis s'est levé le montre encore, un écran d'un tour suivant ne le montre plus ; deux avis levés dans un même tour n'attendent qu'un minuteur, et chaque essai part d'un tour fini), ce que la restauration et la remise à zéro gardent, et le néerlandais du cours déclaré comme tel (`lang`), le sens montré dans l'autre langue marqué comme tel, à l'écran et dans chaque exercice du registre, l'avis sur doctor et compte, et la recherche par l'un ou l'autre sens ; elle ne voit pas le néerlandais cité dans la prose française ou anglaise (« … »), qui reste sans balise |
| `dehet.js` | Chaque nom du cours confronté au Wiktionnaire : `de` ou `het`, sur la fiche **et** dans ses phrases d'exemple |
| `content.js` | L'orthographe contre 410 000 formes néerlandaises, que chaque exercice promis se construise vraiment, qu'une phrase d'exemple n'emprunte pas de vocabulaire à une unité ultérieure, et les éléments enseignés deux fois ; le contrôle 5 : chaque id garde son néerlandais, le 6 : l'anglais qui reste dû ; un « u » ou « uw » néerlandais glosé « you » porte « (informal, Flemish u) » quand le français tutoie, « (formal) » sinon |
| `engine.js` | Ce qu'une séance contient et quand un élément revient, horloge en marche : la panne d'octobre, deux jours de suite, ce qui revient le lendemain à la même heure, l'heure de la réponse à Bruxelles (minuit, 23 h 50, les deux nuits de changement d'heure), le renforcement dans la séance, la réserve de nouveautés, le seuil des unités, la première demande à voix haute et l'exercice écrit qui la suit, l'écrit de l'échelon 3 toujours tapé, « je ne peux pas parler » |
| `screens.js` | Chaque écran dans quatre états, relu comme du texte : ni pourcentage, ni maîtrise ; les comptes, le nom de l'unité, ce qui résiste, le bouton « je ne peux pas parler », le journal d'erreurs |
| `typed.js` | Ce qu'une réponse tapée accepte, tapée à l'écran : la cible, la variante flamande, les autres façons de dire (`also`), et la réponse d'un élément au même sens ; la note qu'elle laisse, « Presque » mesuré contre chaque réponse acceptée, la dictée qui garde sa seule cible, les leurres qui ne sont jamais une réponse juste, et le panneau : « Ici on dit » sans répétition, les mots flamands en gras, « On dit aussi » ; et tout le cours : pour chaque élément, sa cible puis chaque forme que le panneau présente comme juste (« Ici on dit », `also`), tapées à l'écran, justes et notées comme la cible |
| `sim.js` | Chaque écran, une séance, un scénario, une série d'écoute |
| `firstrun.js` | Une base vide : premier écran, première séance, le défi, la sauvegarde |
| `sync.js` | Deux appareils et le faux Supabase de `test/lib/supabase.js` : adoption, conflits, panne, comptes, la remise à zéro sur deux appareils (dont un hors ligne qui revient), la migration unique, un appareil resté sur l'ancienne version et un serveur qui garde la remise à zéro la plus récente, et une langue d'affichage changée sur un autre appareil, que l'avis nomme ; et une connexion qui finit sur l'écran compte, par le code à six chiffres ou par un autre onglet, dont l'accueil dit d'où vient la langue (ces deux pages chargent `app.js`, les seules de la suite) |
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
`glosses.tsv` et `owed()` ne comptent pas les mêmes gloses, ou si une ligne a un
côté vide que le contenu n'explique pas (seule une note dont l'anglais est
`null` exprès en laisse un), ou lit « undefined ».

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

Trois de ces contrôles portent un budget plutôt qu'une exigence de zéro, parce
que le contenu actuel enfreint déjà la règle : 62 phrases d'exemple empruntent du
vocabulaire à une unité ultérieure, 9 éléments sont enseignés deux fois, 4
échelons n'ont aucun exercice possible. Un budget ne peut que baisser.

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

- Le contenu reste le plafond : 439 éléments, tous de niveau A1.
- Un tiers du vocabulaire n'a pas encore de phrase d'exemple.
- Neuf éléments figurent dans deux unités à la fois.
