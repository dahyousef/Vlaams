# Comment Vlaams est testé

## Lancer toute la suite

```sh
sh test/run-all.sh
```

Build, puis chaque test, dans l'ordre. C'est la même commande que la CI : il
n'y a qu'une seule liste. Il faut Node et un `sh` (sous Windows, celui de Git).

| Test | Ce qu'il vérifie |
| --- | --- |
| `smoke.js` | Le contenu, l'échelle, chaque type d'exercice, la notation, la qualité des leurres, l'orthographe, qu'aucune chaîne anglaise ne survit dans le build, et qu'aucune source listée dans `build.sh` n'emploie `var` ni le chaînage optionnel `?.` (les chaînes, les commentaires et les regex ne comptent pas) |
| `dehet.js` | Chaque nom du cours confronté au Wiktionnaire : `de` ou `het`, sur la fiche **et** dans ses phrases d'exemple |
| `content.js` | L'orthographe contre 410 000 formes néerlandaises, que chaque exercice promis se construise vraiment, qu'une phrase d'exemple n'emprunte pas de vocabulaire à une unité ultérieure, et les éléments enseignés deux fois |
| `engine.js` | Ce qu'une séance contient et quand un élément revient, horloge en marche : la panne d'octobre, deux jours de suite, ce qui revient le lendemain à la même heure, l'heure de la réponse à Bruxelles (minuit, 23 h 50, les deux nuits de changement d'heure), le renforcement dans la séance, la réserve de nouveautés, le seuil des unités, la première demande à voix haute et l'exercice écrit qui la suit, l'écrit de l'échelon 3 toujours tapé, « je ne peux pas parler » |
| `screens.js` | Chaque écran dans quatre états, relu comme du texte : ni pourcentage, ni maîtrise ; les comptes, le nom de l'unité, ce qui résiste, le bouton « je ne peux pas parler », le journal d'erreurs |
| `typed.js` | Ce qu'une réponse tapée accepte, tapée à l'écran : la cible, la variante flamande, les autres façons de dire (`also`), et la réponse d'un élément au même sens ; la note qu'elle laisse, « Presque » mesuré contre chaque réponse acceptée, la dictée qui garde sa seule cible, les leurres qui ne sont jamais une réponse juste, et le panneau : « Ici on dit » sans répétition, les mots flamands en gras, « On dit aussi » |
| `sim.js` | Chaque écran, une séance, un scénario, une série d'écoute |
| `firstrun.js` | Une base vide : premier écran, première séance, le défi, la sauvegarde |
| `sync.js` | Deux appareils et un faux Supabase : adoption, conflits, panne, comptes, la remise à zéro sur deux appareils (dont un hors ligne qui revient), la migration unique, un appareil resté sur l'ancienne version et un serveur qui garde la remise à zéro la plus récente |
| `journey.js` | Le parcours complet d'un utilisateur, pour une voix et un navigateur donnés |
| `pace.js` | 200 jours simulés, pour trois apprenants (budget épuisé chaque jour ; une seule séance par jour ; une seule séance, dont une sur cinq là où l’on ne peut pas parler) : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste, des éléments laissés à un jour qui reviennent le lendemain, un élément du premier jour demandé à voix haute en dix jours et jamais après trois semaines, l’échelon de l’écrit passé en écrivant, et « je ne peux pas parler » qui ne note rien, ne coûte rien et ne fait rien sauter. L’horloge avance pendant la journée |

`journey.js` tourne huit fois : trois voix (flamande, néerlandaise du nord,
aucune) sous Opera et Edge, plus Chrome et Safari sur iPhone. Les tests sont
déterministes : la graine est fixe, `SEED=...` en rejoue une autre.

Chaque bug corrigé laisse un test qui échoue sur l'ancien code.

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
