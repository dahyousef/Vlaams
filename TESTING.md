# Comment Vlaams est testé

## Lancer toute la suite

```sh
sh test/run-all.sh
```

Build, puis chaque test, dans l'ordre. C'est la même commande que la CI : il
n'y a qu'une seule liste. Il faut Node et un `sh` (sous Windows, celui de Git).

| Test | Ce qu'il vérifie |
| --- | --- |
| `smoke.js` | Le contenu, l'échelle, chaque type d'exercice, la notation, la qualité des leurres, l'orthographe, et qu'aucune chaîne anglaise ne survit dans le build |
| `sim.js` | Chaque écran, une séance, un scénario, une série d'écoute |
| `firstrun.js` | Une base vide : premier écran, première séance, le défi, la sauvegarde |
| `sync.js` | Deux appareils et un faux Supabase : adoption, conflits, panne, comptes |
| `journey.js` | Le parcours complet d'un utilisateur, pour une voix et un navigateur donnés |
| `pace.js` | 200 jours simulés : charge quotidienne, variété, exigence |

`journey.js` tourne huit fois : trois voix (flamande, néerlandaise du nord,
aucune) sous Opera et Edge, plus Chrome et Safari sur iPhone. Les tests sont
déterministes : la graine est fixe, `SEED=...` en rejoue une autre.

Chaque bug corrigé laisse un test qui échoue sur l'ancien code.

## Ce que les tests ne voient pas

Ils tournent sans navigateur. Trois choses ne se vérifient qu'en vrai :

- le **micro réel** et la reconnaissance vocale ;
- une **vraie voix** néerlandaise, et ce qu'elle donne à l'oreille ;
- la **série de jours**, sur plusieurs jours réels.

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
