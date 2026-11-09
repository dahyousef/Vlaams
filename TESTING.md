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
| `lang.js` | La langue d'affichage (contrôles 2 à 6) : le cours chargé tel quel puis « apparié » (un anglais factice par sens et par texte), aucune chaîne d'interface hors des deux tables, mêmes clés, même forme, mêmes chiffres et mêmes `{…}` dans `fr.js` et `en.js`, aucun écran qui mêle les langues (et là, les séances montrent tout le cours à chaque échelon, et le contrôle échoue si elles n'y arrivent plus), le réglage, le changement qui attend la fin de la séance et l'avis qui l'annonce (un écran ouvert dans le tour où l'avis s'est levé le montre encore, un écran d'un tour suivant ne le montre plus ; deux avis levés dans un même tour n'attendent qu'un minuteur, et chaque essai part d'un tour fini), ce que la restauration et la remise à zéro gardent, et le néerlandais du cours déclaré comme tel (`lang`), chaque balise prise dans la table de `gloss.js` (`fr`, `en-GB`, `nl-BE`), le sens montré dans l'autre langue marqué comme tel, à l'écran (jusqu'aux exemples d'une règle et aux lignes d'une fiche) et dans chaque exercice du registre, ce que le micro entend déclaré `nl-BE` (le texte provisoire, ce qu'il a entendu, les mots comparés : séance, nazeggen, conversation), la langue où chaque exercice pose et répond (`asks`, `answers` : sur chacun, et lus par le pied, qui en tire la langue de la réponse et la ligne du sens), et ce que chacun dit avoir reçu de la personne (`given`, sur chacun), l'avis sur doctor et compte, la recherche par l'un ou l'autre sens, les mots transparents (2b, 5e : qu'une précision française ne change rien, qu'une précision anglaise garde un faux ami), `wordClass` et `gloss.option` sur des sens à parenthèses, et les guillemets (6d) : ce que la prose du cours et le piège d'un faux ami citent entre « » ou “ ” déclaré `nl-BE` sur chaque écran qui les montre, dans le pied d'une réponse fausse comme ailleurs, le néerlandais d'un titre (`title`, `h`), qui porte `class="nl"` sans guillemets, déclaré `nl-BE` sur chaque écran qui le montre, celui de la page de / het et de sa tuile, le texte de l'apprenant (`{naam}`, `{stad}`, `{bedrijf}`) échappé sur chaque écran qui le montre, et ce qui est cité, jusque dans les tables des sons et des faux amis, relu contre le néerlandais du cours, les exceptions de `QUOTE_OK` chacune avec sa raison, une note de mot ou de phrase relue comme le kit la vérifie (une citation qu'elle fait dans ses deux langues et dont l'orthographe connaît chaque forme est du néerlandais, même hors du cours), et rien d'autre, et le néerlandais du cours qu'une prose laisse nu quand le français et l'anglais l'écrivent tous deux hors de `nl-BE`, les exceptions de `SHARED_OK` chacune avec sa raison, et le gras de la table des sons, lu sur son écran : le néerlandais (l'orthographe du son enseigné, la syllabe accentuée d'un exemple) déclaré `nl-BE`, la lettre ou le mot auquel on compare le son (français, une fois le w anglais) laissé nu et nommé dans `SOUND_OK` avec sa raison (« le u de tu » est le u français, que le contrôle 6 ne prend pas pour du néerlandais), et la tête de chaque ligne, le nom du son, dont seule l'orthographe néerlandaise, celle qu'un exemple de la ligne écrit, est déclarée `nl-BE` (« accent tonique » et le « final » de « -en final » sont du français) ; elle ne voit pas le néerlandais nu qu'un seul côté écrit, ni celui d'une table écrite dans une seule langue (le texte des sons hors de son gras, les faux amis), ni celui que le cours n'enseigne pas, ni un mot anglais cité qui s'écrit comme un mot du cours (« slim », « door »), ni un mot anglais ou français que l'orthographe connaît aussi et qu'une note cite dans ses deux langues (« on », « has ») |
| `dehet.js` | Chaque nom du cours confronté au Wiktionnaire : `de` ou `het`, sur la fiche **et** dans ses phrases d'exemple ; le cours chargé par `browser.open`, sans `src/app.js`, comme dans les autres suites |
| `content.js` | L'orthographe contre 410 000 formes néerlandaises, que chaque exercice promis se construise vraiment, que l'exemple de chaque réponse libre coche chacun de ses besoins et que chaque besoin ait sa réponse manquée (`miss`), qui le manque, lui seul, qu'une phrase d'exemple n'emprunte pas de vocabulaire à une unité ultérieure, que la durée s'écrive « hoelang » et jamais « hoe lang » (#128), et qu'un mot ou une phrase listé dans deux unités dise la même chose et ne soit qu'un élément, dont le second listage est un alias ; les tables indexées par le néerlandais (`TABLES`, `src/content/index.js`) : chacune chargée, chaque clé le néerlandais d'un mot ou d'une phrase du cours, et ce qu'une table pose (`be`, `note`, `also`), qu'aucun lexique n'écrit plus ; les phrases sourcées (`src/content/sourced.js`, chargé juste avant `examples.js`) : chaque clé un mot du cours qui n'a pas de phrase écrite à la main, une ou deux phrases à cinq champs (`nl`, `fr`, `en`, `gap`, `src`) d'une ligne chacun, sans blanc autour, `src` le numéro d'une phrase de Tatoeba ou `gen`, un trou que le texte à trous sait cacher, ni jeton ni nom par défaut, chaque phrase de Tatoeba créditée dans `docs/attribution/tatoeba.tsv`, qui ne crédite qu'elles (une traduction écrite pour le cours y vaut « - » dans ses deux colonnes et sa langue dans `adapted`, D17) ; les phrases prises dans Tatoeba pour les unités 13 à 34 (`src/content/phrases.a1c.js`, leur `src` un numéro) : chacune créditée une fois dans `docs/attribution/tatoeba-phrases.tsv`, sous son unité, qui ne crédite qu'elles, dans les mêmes huit colonnes (le contrôle est d'abord essayé sur des crédits plantés) ; aucune forme que le cours n'a pas encore enseignée à l'unité de leur mot, ce mot et sa lacune exceptés, pas même la forme fléchie d'un mot vu (#12, récit 39), et une table d'une seule phrase qui donne à son mot le texte à trous ; le contrôle 5 : chaque id garde son néerlandais, le 6 : l'anglais qui reste dû ; un « u » ou « uw » néerlandais glosé « you » porte « (informal, Flemish u) » quand le français tutoie, « (formal) » sinon ; le français qu'une conversation adresse à l'apprenant (`blurb`, `outro`, la consigne et l'indice d'un tour, la note d'un choix) le tutoie, comme les six premières, et seule la traduction d'un u néerlandais garde « vous » (#135) ; une note de mot ou de phrase qui cite « kunde » à côté d'un « u » cite aussi « kunt ge », dont il est la contraction ; un `<i>` d'une explication de grammaire qui se lit pareil en français et en anglais est du néerlandais, et porte `class="nl"`, que `NL.gloss.prose` déclare `nl-BE` |
| `engine.js` | Ce qu'une séance contient et quand un élément revient, horloge en marche : la panne d'octobre, deux jours de suite, ce qui revient le lendemain à la même heure, l'heure de la réponse à Bruxelles (minuit, 23 h 50, les deux nuits de changement d'heure), le renforcement dans la séance, la réserve de nouveautés, la séance qui suit l'arriéré (trente places de base, une de plus par quarante éléments dus, onze au plus, la réserve calculée sur les trente, lue sur une page à part), le seuil des unités, la première demande à voix haute et l'exercice écrit qui la suit, l'écrit de l'échelon 3 toujours tapé, « je ne peux pas parler », un mot listé dans deux unités servi une fois, et sa progression d'avant les alias repliée une fois ; « Comment le dit-on ici ? » à l'échelon 1 d'un mot qui a sa forme d'ici, jamais d'un mot dont la première forme flamande est son néerlandais (ja, de dokter) |
| `screens.js` | Chaque écran dans quatre états, relu comme du texte : ni pourcentage, ni maîtrise ; les comptes, le nom de l'unité, ce qui résiste, le bouton « je ne peux pas parler », un nom (aria-label) à tout bouton sans texte, le micro compris, fermé et ouvert, au tour de parole et au nazeggen, en anglais aussi ; le journal d'erreurs ; `NL.ui.ifText` et `NL.ui.ifProse`, sur une page à eux : rien sans texte, ni pour un sens qui vaut `null` dans la langue lue, même quand l'autre langue en a un, en anglais comme en français, et sinon le texte échappé dans sa balise, avec sa classe, et pour `ifText` la langue qu'on lui donne, et pour `ifProse` chaque passage cité déclaré `nl-BE` ; la copie de la sauvegarde et celle du journal d'erreurs, toutes deux par `NL.ui.copy`, sur une page aux minuteurs retenus : le champ sélectionné avant toute copie, ce que chacune copie, par le presse-papiers s'il existe, sinon par l'ancienne commande du navigateur, et le toast qui dit « Copié » si l'un d'eux a copié, « copie-le à la main » s'il a refusé ou s'il n'y a ni l'un ni l'autre ; un mot listé dans deux unités, compté une fois : les comptes, les totaux des unités, ce qui résiste, la bibliothèque ; la semaine de Plus, sept jours de suite sur le calendrier local, chacun sous le nom de son jour et comptant les révisions de sa date locale, celles de 00:30 comme celles de 23:30, à Bruxelles autour des deux changements d'heure et à Montréal, à l'ouest de UTC, et les jours en arrière que la série de `journey.js` (§12) compte à ces instants ; la feuille des réglages qu'on a fait défiler garde sa place : le toast s'y pose et s'en va sans la redessiner, un interrupteur, le thème, le rythme ou la langue la redessinent au même endroit, et une autre feuille, ou la même rouverte, part du haut |
| `typed.js` | Ce qu'une réponse tapée accepte, tapée à l'écran : la cible, la variante flamande, les autres façons de dire (`also`), et la réponse d'un élément au même sens, mais pas celle d'un mot qu'un même mot français traduit sans dire la même chose (« negen » pour « nieuw »), la consigne française disant lequel : seules les cinq paires de #129 sont couvertes ; les quatre options de « recall », dans les deux langues, pour un mot et pour une phrase : la parenthèse qui termine un seul sens tombe et le pied la montre, celle qui dit lequel de deux sens reste, comme celle du milieu d'une phrase et celle sans laquelle l'option se lirait comme son néerlandais (« half »), et deux options ne disent jamais la même chose, précisions tombées, sauf dans une unité qui n'a rien d'autre à offrir, où la carte garde ses quatre options ; la note qu'elle laisse, « Presque » mesuré contre chaque réponse acceptée, la dictée qui garde sa seule cible, les leurres qui ne sont jamais une réponse juste, et le panneau : une bonne réponse qu'il ne redit pas (ni la ligne en gras, ni « Ici on dit », ni la variante choisie dans « Comment le dit-on ici ? », dont les autres formes restent, même sans la ligne flamande dans les réglages), « Ici on dit » sans répétition, la variante flamande telle que le cours l'écrit, chaque forme dans son propre passage en `nl-BE`, sa ponctuation collée au mot qu'elle suit, les mots flamands en gras, « On dit aussi », le sens de l'élément quand l'exercice pose et répond en néerlandais (dans la langue d'affichage, juste ou faux, avant l'explication ; celui du mot de trop dans l'intrus, celui du mot et non de sa phrase dans le texte à trou) ; la règle d'un motif, qui est son explication, sous la réponse du texte à trou et d'« Écris-le », et pas redite après « Remets dans l'ordre », qui la montre au-dessus de ses tuiles ; la réponse libre, dont chaque besoin se lit en mots entiers (« in » n'est pas dans « kind », « om half » mot à mot) et sur les lettres au-delà de l'ASCII (« geïnstalleerd », « één »), pour `\b`, `\B`, `\w`, `\W` et `\w` entre crochets, et une phrase qui la reçoit de `src/content/open.phrases.js`, servie à son échelon 6 ; et tout le cours : pour chaque élément, sa cible puis chaque forme que le panneau présente comme juste (« Ici on dit », `also`), tapées à l'écran, justes et notées comme la cible |
| `sim.js` | Chaque écran, une séance, un scénario, une série d'écoute |
| `firstrun.js` | Une base vide : premier écran, première séance, le défi, la sauvegarde |
| `sync.js` | Deux appareils et le faux Supabase de `test/lib/supabase.js` : adoption, conflits, panne, comptes, la remise à zéro sur deux appareils (dont un hors ligne qui revient), la migration unique, un appareil resté sur l'ancienne version et un serveur qui garde la remise à zéro la plus récente, et une langue d'affichage changée sur un autre appareil, que l'avis nomme ; une connexion qui finit sur l'écran compte, par le code à six chiffres ou par un autre onglet, dont l'accueil dit d'où vient la langue ; et la progression d'un mot listé dans deux unités, apprise sous son second listage avant les alias : repliée sur un appareil neuf, un raté d'après qui tient, rien après une remise à zéro, une sauvegarde d'avant repliée quand on la rend, et des copies d'avant qui ne passent pas devant une progression plus récente faite sur un autre appareil ni ne cachent une fiche d'alias plus récente au serveur, sur un appareil connecté rouvert comme sur un appareil sans compte qui rejoint le compte (six pages chargent `app.js`, les seules de la suite : les deux connexions et les quatre appareils qui s'ouvrent sur leurs copies d'avant) |
| `hooks.js` | Le rappel de reprise : `.claude/settings.json` le branche sur SessionStart (`compact\|resume`), il imprime où une exécution de plan garde son état, même sans `CLAUDE_PROJECT_DIR`, le crochet de démarrage imprime le chemin du transcript que Claude Code lui donne, et `run-controller.md` le nomme, `verifier.md` remet les sorties du build avant de vérifier l'arbre et laisse son retour dans `tmp/verifier.txt` sous le commit vérifié, que `task-controller.md` lit quand le retour n'a pas sa ligne, le kit dit comment un agent en attend un autre et `wait-suite.sh` attend la fin de la suite et dit si une suite tourne encore, `verify.sh` y laisse le numéro de la suite même quand son shell est tué, `tools/fanout.js` coupe son passage à sa limite de temps, les scripts `.sh` restent en LF, et le garde-fou git reste branché |
| `tools/fanout.js` | Le kit de répartition (`tools/content/`), dans une copie du dépôt et sans réseau : le cours tel que les outils le lisent, l'empreinte d'une source, Split, Check et Merge sur un genre d'essai (refus, reprise, ligne écartée, relance refusée comme périmée, un Split d'ids nommés qui ne coupe que leurs lignes et refuse, sans rien écrire, un id que le genre ne coupe pas ou, sur un dossier déjà coupé, des ids autres que les lignes de ses lots, ou un lot dont l'entrée manque ou ne se lit pas), le rédacteur des tables (littéraux, tri, en-tête, fins de ligne, et chaque table du cours relue dans sa forme), le cache épinglé (un dossier, un serveur local), l'outil de lecture ; puis chaque vrai genre, sur le cours tel qu'il est : son découpage, chacune de ses règles sur une ligne juste et une ligne fausse (tout texte d'une ligne refusé avec un blanc devant ou derrière, ou un `\r`), et un Merge de bout en bout (`flemish`, dont le Split se tient aux 22 unités de `UNITS`, en lots d'unités entières de 80 lignes au plus, ne recoupe rien des unités 1 à 12 sans id nommé et recoupe une ligne nommée, `be` ou non, et dont Check refuse une forme qui est un leurre écrit d'un autre élément, l'apostrophe droite, la preuve `none` d'une forme qu'une règle donne et, pour un mot, le néerlandais à l'article près ; `examples` et `examples-gen`, `open`, les deux genres d'explications, et `words`, dont la source est une unité à venir : ses 22 unités et leurs places, ses règles, son Merge qui récrit `src/content/lexicon.a1c.js` et ajoute à `test/data/ids.tsv`, relancée à l'identique, et un second Split qui ne recoupe pas une unité fondue ; `grammar`, dont la source est une règle à venir : ses 13 règles et leurs 9 unités, chaque garde de Check (cinq exercices, un trou d'une seule tuile qui n'est pas écrit deux fois, de 3 à 8 tuiles par exercice, rien que l'unité de la règle n'ait enseigné, l'orthographe, le néerlandais de l'explication dans `<i class="nl">` ou `<span class="ex">`, les citations et le néerlandais nu que 6d de `lang.js` refuserait, et un `{jeton}` dans le titre ou l'explication, que la feuille montre en HTML et que 6d.7 refuserait), la boucle de `src/content/grammar.a1c.js` qui range chaque règle dans la liste de son unité au chargement et lève une erreur nommant la règle quand l'unité manque, et son Merge de bout en bout ; `scenarios`, dont la source est une conversation à venir : ses 4 conversations, la forme d'un scénario et les bornes des six du cours, une réplique de l'autre sans `be`, un sens manquant, un `{jeton}` hors `{naam}` `{stad}` `{bedrijf}`, un jeton dans le titre, que l'écran montre en HTML (6d.7), les mêmes citations et le même néerlandais nu, et son Merge qui récrit `src/content/scenarios.a1c.js` ; `phrases`, dont la source est une unité : ses 22 unités en 4 lots, les candidates d'une unité classées (les deux traductions d'abord, D17, puis ses mots), les règles d'une candidate (de 3 à 8 tuiles, rien que l'unité n'ait enseigné, l'unité qui l'enseigne nommée, l'orthographe, ni nom ni jeton, « hoelang », pas le néerlandais d'un élément ni d'une phrase d'exemple, pas une forme qu'une prose écrit nue dans les deux langues), chaque garde de Check (une candidate de la ligne, telle que Tatoeba l'écrit, ses traductions liées ou l'une écrite, l'apostrophe « ’ » d'un côté écrit, l'étiquette d'un u glosé you, les mêmes chiffres, un anglais qu'un élément ou une autre ligne du lot dit déjà sans sens français commun), le chargement de `src/content/phrases.a1c.js` qui lève une erreur nommant l'unité absente, et son Merge de bout en bout, qui refuse deux unités au même anglais sans sens français commun, récrit le fichier, ajoute à `test/data/ids.tsv` et récrit `docs/attribution/tatoeba-phrases.tsv` ; et, pour les quatre fichiers qu'un Merge écrit entiers (`lexicon.a1c.js`, `grammar.a1c.js`, `scenarios.a1c.js`, `phrases.a1c.js`), que son en-tête est celui que son genre écrit (`HEADER`), puisque Merge ne lit pas l'ancien) ; et le fichier se relance en enfant sous une limite de temps (300 s ; `FANOUT_LIMIT=<s>` la change), passée laquelle il imprime `DÉLAI DÉPASSÉ` et sort en 1 |
| `tools/learner-pass.js` | Les outils de la passe d'apprenant (`tools/learner-pass/`), sans navigateur : une séance qui ne finit pas est dite, une conversation est jouée une fois par position de choix et dite bloquée quand elle l'est, `sweep.js` ne s'arrête pas à un nombre fixe de touchers, et la feuille d'une règle est jugée (`judgeSheet` : titre, règle, explication, exemples, rien qui déborde de 390 px). |
| `tools/sources.js` | Les sources externes du kit, sur des fichiers que la suite écrit avec leur épingle : les deux extraits du Wiktionnaire (`tools/content/kaikki.js` : les sens belges, et chaque entrée avec sa nature, son genre et ses gloses) et le classement des phrases de Tatoeba (`tools/content/tatoeba.js`) : une traduction, anglaise ou française, suffit, et les phrases qui ont les deux passent devant, D17, avec l'ordre du cours qu'il lit (`sequence.firstUnits`) ; rien n'est téléchargé, et les vrais fichiers épinglés (ceux du 7 novembre 2026) ne sont pas lus |
| `journey.js` | Le parcours complet d'un utilisateur, pour une voix et un navigateur donnés |
| `pace.js` | 200 jours simulés, pour cinq apprenants (budget épuisé chaque jour ; une seule séance par jour ; une seule séance, dont une sur cinq là où l’on ne peut pas parler ; une seule séance, commencée à 21 h puis vingt minutes plus tôt chaque jour jusqu’à 7 h, et qui remonte, à l’heure de Bruxelles ; une seule séance, sur un cours grossi à au moins 1 160 éléments par `test/lib/grow.js`) ; chez ceux qui font une seule séance, l’arriéré reste sous les trois quarts du cours (la séance suit l’arriéré, ADR 0007) et tout est rencontré assez tôt pour que ce plafond juge quelque chose : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste, des éléments laissés à un jour qui reviennent le lendemain, y compris les jours où la séance commence plus tôt que la veille, un élément du premier jour demandé à voix haute en dix jours et jamais après trois semaines, l’échelon de l’écrit passé en écrivant, et « je ne peux pas parler » qui ne note rien, ne coûte rien et ne fait rien sauter. L’horloge avance pendant la journée. Sous trente jours, ce qui ne se juge que sur la durée (le lendemain, la première demande à voix haute, une séance sans parler qui croise un exercice à voix haute, la fréquence d’un élément, l’étalement) dit « non jugé » et n’est pas un problème : la suite lance aussi un seul jour, comme les tâches d’un plan |

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
octobre 2026, une réponse tapée coûte 11 ms, et les cibles et les formes du
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

L'arriéré d'un cours de phase 4 se voit désormais sur le vrai cours : sur ses 1 035
éléments et 200 jours, une séance de 22 places fixes le laissait monter à 857 ; la
séance qui suit l'arriéré (ADR 0007) le tient à 654 sur 1 048 éléments, sous les trois
quarts du cours (786) qu'exige chaque apprenant à une séance par jour. L'apprenant du
grand cours (`groot`) regarde un peu au-delà : 993 sur 1 192 éléments avec 22 places
fixes, 731 sur 1 172 (plafond 879) avec la séance qui suit l'arriéré. Ces pics
bougent de quelques dizaines dès que le contenu change : c'est le plafond qui est
exigé, pas le chiffre.

Ce plafond a une limite, et `pace.js` la dit : il ne juge qu'un cours rencontré à
temps. Sur 1 580 éléments, 200 jours ne suffisent plus : 22 places fixes restent à
1 160, sous les trois quarts. Si tout n'est plus rencontré au jour 155, la suite
échoue : c'est la simulation qu'il faut allonger.

Chaque bug corrigé laisse un test qui échoue sur l'ancien code ; une correction
faite à plusieurs endroits, un test qui échoue à chacun.

Ce que plusieurs suites font vit une fois dans `test/lib/`, et chaque fichier y
dit en tête ce qu'il offre : une suite le prend là au lieu de le refaire. Ses
dates partent de l'horloge de la suite (`T0`), chacune différente : deux
écritures dans la même milliseconde ne testent rien. Un jour se compte sur le
calendrier local, jamais en 24 heures : à Bruxelles, le dernier dimanche
d'octobre en dure 25 et celui de mars 23, et un jour compté en arrière par pas
de 24 heures tombe ces semaines-là sur la mauvaise date (#105).
`NL.util.daysBack(n)` le compte sur le calendrier. Une suite qui fixe le fuseau
pour un bloc le fait par `inZone()` de `test/lib/zone.js`, qui le remet ensuite.
`test/lib/quoted.js` dit ce qu'une prose du cours cite et ce qu'elle laisse nu : `test/lang.js`
(6d.3 et 6d.4) le lit sur tout le cours, le Check des genres `grammar` et `scenarios` sur une
ligne avant Merge. Ni l'un ni l'autre ne prend un nombre pour un mot du cours : `courseWords`,
de `test/lib/dutch.js`, l'ôte des mots qu'ajoutent `dutchWords` et les deux genres. Et
`htmlTokens` fait refuser à Check un `{jeton}` dans un champ que l'écran montre en HTML,
comme 6d.7 le refuse sur le cours.

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

Le faux micro de `test/lib/browser.js` imite ce que Safari sur iPhone a fait en
octobre 2026 : un résultat jamais marqué final, une écoute qui ne finit pas seule
(`journey.js`, section 16). Il imite ce qu'on a vu, pas Safari lui-même.

`B.tap` passe par les sélecteurs du shell, comme un vrai clic : un `data-*` que le
shell oublie n'y mène nulle part. `test/lib/answer.js` touche « Je ne peux pas
parler » de la même façon, mais répond aux exercices en appelant l'écran
directement : une option, une tuile ou le micro qu'un sélecteur oublierait ne se
voit qu'à un `B.tap`.

La **passe d'apprenant** (`tools/learner-pass/`, voir son README) joue la page
construite dans un vrai Chrome habillé en Safari sur iPhone, en touchant l'écran :
des jours d'étude jusqu'aux cartes parlées et chaque façon de s'en servir, l'écoute,
chaque conversation du cours (`corners.js` les prend dans `NL.content.scenarios`, une
ligne `CONVERSATION <id>` chacune, jouée une fois par position de choix : chaque choix
de chaque étape est touché), le défi, la feuille de chaque règle de grammaire
ouverte depuis sa pastille sur le parcours, à 390 px (`rules.js` : une règle listée sur
plusieurs unités a plusieurs pastilles et une seule feuille ; une fin
`EVERY RULE SHEET OPENS`), puis chaque bouton de seize écrans. Elle a besoin de
Chrome, ou d'Edge (`LEARNER_PASS_CHANNEL=msedge`), et d'un `npm install` : elle n'est ni dans `run-all.sh` ni dans la CI. On la
lance avant de demander au mainteneur de vérifier en apprenant. La phase 3 est
partie en production avec « Je ne peux pas parler » sans effet et le micro de Safari
qui ne notait rien, la suite au vert ; la passe trouve les deux sur ce code-là.
Son micro est faux lui aussi : la vraie voix et le vrai micro restent à essayer sur
un téléphone.

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

Certains de ces contrôles portent un budget plutôt qu'une exigence de zéro, parce
que le contenu actuel enfreint déjà la règle : 136 phrases d'exemple empruntent du
vocabulaire à une unité ultérieure, et 3 échelons n'ont aucun exercice possible.
Un budget ne peut que baisser, et chacun échoue aussi quand le compte passe
dessous, pour que le gain soit verrouillé. Le premier a fait deux exceptions : il est
monté de 61 à 129 avec les unités 13–34, puis de 129 à 136 avec les règles de
`grammar.a1c.js`, sans qu'aucune phrase change. Ces phrases employaient déjà des mots
que le cours n'enseignait nulle part, un emprunt que rien ne comptait ; les unités,
puis les règles, en les enseignant plus tard, l'ont révélé. Les leurres, les explications et les
guillemets n'en ont plus : `content.js` exige que chaque élément de « Comment le
dit-on ici ? » ait ses leurres et chaque élément son explication en français et
en anglais (la note d'un mot ou d'une phrase, la règle d'un motif), et
`lang.js` que la prose du cours ne mette entre guillemets que du néerlandais
(une traduction va entre parenthèses).

Les phrases sourcées (`src/content/sourced.js`) n'ont pas de budget : `content.js`
exige qu'aucune n'emploie une forme que le cours n'a pas encore enseignée à l'unité
de son mot, ce mot et sa lacune exceptés, pas même une forme fléchie d'un mot vu
(#12, récit 39). `test/lib/sequence.js` devine les formes d'un mot en lui ajoutant
les terminaisons de sa classe, sans lexique, et ne sait pas reconnaître une flexion :
il prendrait « Engelsen » pour le pluriel de « het Engels ». Le Check d'`examples` et
d'`examples-gen` refuse ces phrases avant le Merge, et `content.js` les tient
ensuite, quand le cours change autour d'elles. Ce n'est donc pas une exception à
« Un budget ne peut que baisser » : il n'y a rien à baisser.

Le balayage de `typed.js` ne tape que les formes que le contenu tient : une
façon juste de dire que ni `be` ni `also` ne connaît reste refusée, et aucun
test ne le saura. Il tape chaque forme exactement, sans faute de frappe, et ne
regarde ni la dictée ni les réponses parlées. L'apprenant qui dérive commence
une fois par jour, chaque jour, entre 7 h et 21 h, toujours à Bruxelles : il
ne voit ni une séance qui passe minuit, ni plusieurs séances à des heures qui
changent, ni des heures au hasard, ni un jour sauté. En deux cents jours, il ne
traverse que le passage à l'heure d'été du 29 mars ; celui d'octobre, c'est
`engine.js` qui le vérifie. Et comme tous les apprenants simulés, il n'oublie
rien : il répond juste 85 fois sur 100, quoi qu'il arrive. L'apprenant du grand
cours apprend en partie des copies : ses 1 172 éléments (comptés le 3 novembre 2026 par `node test/pace.js . 200 one groot`) sont
les 1 048 du cours, et 124 repris avec un suffixe (`test/lib/grow.js`), de même difficulté et des mêmes
types d'exercice.
Il voit l'arriéré que la séance doit suivre, pas ce que des mots nouveaux feraient
au mélange des types ni à la charge d'une journée.

Le barème de la réponse libre lit les lettres au-delà de l'ASCII par le regard
arrière des regex. Un navigateur qui ne le connaît pas (Safari avant 16.4) note
avec la regex telle qu'écrite, où « één » n'est pas un mot. Aucune suite ne le
voit : Node connaît le regard arrière.

`lang.js` ne voit pas si l'anglais est naturel : il compare des clés, des chiffres et des langues, pas le sens. C'est le travail de la séance de contrôle et du mainteneur.

Les contrôles du kit (`tools/content/`, un Check par genre) relisent chaque ligne
avant Merge, mais une ligne à la fois : un leurre qui est la réponse qu'une autre
ligne du même lot ajoute (un « on dit aussi ») ne se voit qu'après Merge, dans
`content.js`. Ils ne voient ni l'idiome, ni le registre, ni si un Flamand le dit
vraiment, ni si une note explique bien : c'est ce que lisent le relecteur de chaque
lot et le mainteneur, sur la liste de `tools/content/reading.js`.
Check de `grammar` et de `scenarios` relit la garde 6d de `test/lang.js` par
`test/lib/quoted.js` (des guillemets seulement autour du néerlandais du cours, aucun mot
du cours nu dans la prose) : il ne lit pas ce que 6d ne lit pas, soit, dans un scénario,
les répliques, les choix et leurs réponses.
`test/tools/fanout.js` essaie chaque règle sur des lignes écrites pour lui, pas sur
celles des lots, et `test/tools/sources.js` ne voit pas le vrai fichier épinglé,
qui vit dans `.cache/`, que la CI n'a pas.

Et ce qu'aucun d'eux ne voit : l'idiome, le registre, l'ordre des mots, si une
phrase vaut la peine d'être apprise. Les six scénarios écrits à la main et les
antisèches ne passent pas par le contrôle d'orthographe ; les quatre conversations du
genre `scenarios` y passent, par son Check. Et aucun contrôle ne dit si la règle
d'une fiche est vraie ni si une conversation sonne flamand : ce sont les 17 lignes
du genre `grammar` et du genre `scenarios` que le mainteneur lit entières.

## Le passage complet du 30 septembre 2026

Un passage à la main dans un vrai navigateur, sur un build local : test de
placement (48 questions, les 12 unités d'alors), environ 540 exercices couvrant les 12
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

- Le contenu reste le plafond : 1048 éléments, tous de niveau A1 ; les unités 13 à 34 ont leurs mots, treize règles de grammaire (neuf unités) et quatre conversations, et pas encore leurs phrases.
- 613 mots sur 912 n'ont pas encore de phrase d'exemple (comptés le 1er novembre 2026) : les 8 d'octobre, et les 605 mots des unités 13 à 34, dont les phrases viennent avec un plan suivant de la phase 4.
