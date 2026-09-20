# Script de soutenance — SecurePress

## Mode d’emploi

Ce document est un support de répétition pour la présentation finale SecurePress. Il reprend les 17 slides du deck amélioré et propose, pour chacune :

- l’objectif de la slide ;
- l’explication à donner au jury ;
- un script oral naturel ;
- une transition vers la slide suivante.

Le fil conducteur à conserver pendant toute la soutenance est le suivant : les résultats sont fondés sur une copie locale documentée ; les observations, les risques potentiels et les contrôles à réaliser sur la cible sont séparés explicitement.

La durée de chaque passage peut être adaptée au temps imposé. Il est préférable de garder une explication courte sur les slides de structure et de réserver davantage de temps aux slides 8 à 15, qui portent la valeur technique du projet.

## Fil directeur à mémoriser

SecurePress ne cherche pas à produire un score artificiel. La démarche consiste à :

1. recueillir des éléments observables ;
2. les qualifier selon la preuve, la sévérité, l’exposition et la confiance ;
3. prioriser les corrections ;
4. préparer des contrôles reproductibles ;
5. distinguer ce qui est développé, préparé, simulé et réellement vérifié sur la cible.

---

## Slide 1 — SecurePress — Soutenance PFE

### Objectif

Présenter le sujet, le cadre de la soutenance et la prudence méthodologique qui encadre les résultats.

### Explication

Le projet porte sur la sécurisation et le durcissement d’une plateforme WordPress. La démonstration s’appuie sur une copie locale et hors ligne ; elle ne doit donc pas être présentée comme un scan ou un déploiement réalisé sur la production.

### Script oral

« Bonjour à toutes et à tous. Je vais vous présenter mon projet de fin d’études, SecurePress, consacré à l’analyse, à la configuration et à la sécurisation d’une plateforme WordPress.
L’objectif n’était pas seulement d’identifier des points faibles, mais de construire une démarche traçable : partir de preuves documentées, qualifier les risques, préparer les corrections et définir comment les valider.
Je précise dès le départ que la démonstration repose sur une copie locale préparée et hors ligne. Les éléments qui concernent directement la cible de production doivent donc être confirmés dans un environnement autorisé. »

### Transition

« Pour montrer comment cette démarche est organisée, je commence par le plan de la présentation. »

---

## Slide 2 — Plan — 5 parties

### Objectif

Donner au jury une carte de lecture simple de la soutenance.

### Explication

Les cinq parties suivent le chemin logique du projet : contexte, diagnostic, priorisation, durcissement/validation, puis bilan.

### Script oral

« La présentation est organisée en cinq parties.
Je commencerai par le contexte du stage, la mission et le périmètre. Je présenterai ensuite le diagnostic factuel de l’environnement WordPress, puis la méthode SecurePress et la priorisation des risques.
La quatrième partie portera sur le durcissement, la validation et la restitution. Enfin, je terminerai par le bilan, les limites du travail et les perspectives d’évolution. »

### Transition

« Je vais donc commencer par expliquer le besoin auquel le projet devait répondre. »

---

## Slide 3 — 01 — Contexte, stage et mission

### Objectif

Relier le projet à une problématique professionnelle et montrer que la mission ne se limitait pas à une simple installation de plugins.

### Explication

Le projet a été réalisé dans le cadre du PFE, avec une orientation cybersécurité applicative WordPress. La valeur ajoutée se situe dans la structuration de l’analyse et dans la traçabilité des conclusions.

### Script oral

« Dans le cadre de mon projet de fin d’études, réalisé autour d’une problématique de cybersécurité applicative chez LNET Communication, la mission consistait à structurer une démarche d’analyse et de durcissement d’un site WordPress.
Le besoin principal était d’obtenir des constats compréhensibles et vérifiables, plutôt qu’une liste de recommandations générales.
J’ai donc cherché à relier chaque observation à une preuve, chaque risque à un niveau de priorité et chaque correction à un contrôle de validation. »

### Transition

« Pour comprendre pourquoi cette démarche est nécessaire, il faut d’abord regarder la surface d’attaque propre à WordPress. »

---

## Slide 4 — 01 — Surface d’attaque WordPress

### Objectif

Expliquer que la sécurité concerne un écosystème complet, et pas seulement le noyau WordPress.

### Explication

La surface d’attaque comprend le cœur, les thèmes, les extensions, la configuration serveur, les interfaces d’administration, les dépendances et les éléments exposés publiquement.

### Script oral

« Un site WordPress ne se limite pas à son cœur logiciel. Sa surface d’attaque comprend également les thèmes, les extensions, la configuration du serveur, les interfaces d’administration et les dépendances tierces.
Chaque composant peut introduire une configuration particulière, une dette de maintenance ou une exposition supplémentaire.
C’est pour cette raison que l’inventaire et la qualification du contexte sont indispensables avant de conclure qu’un élément constitue effectivement une vulnérabilité exploitable. »

### Transition

« Cette nécessité conduit à une distinction fondamentale dans le projet : séparer ce qui est prouvé de ce qui reste une hypothèse. »

---

## Slide 5 — 01 — Problème : preuves vs inférences

### Objectif

Faire comprendre au jury la règle de prudence qui gouverne toute la soutenance.

### Explication

La présence d’un fichier ou d’une version ne suffit pas à prouver l’activation, l’exposition, l’exploitabilité ou une compromission.

### Script oral

« Le problème central est la différence entre une preuve et une inférence.
La présence d’un plugin dans une archive ne prouve pas nécessairement qu’il est activé. Une version connue pour être ancienne ne prouve pas, à elle seule, qu’une exploitation est possible dans le contexte observé. De la même manière, l’absence d’un indicateur dans une copie ne prouve pas l’absence totale de compromission dans l’historique réel.
J’ai donc documenté séparément le fait observé, le risque potentiel, le niveau de confiance et le contrôle qui doit encore être réalisé. »

### Transition

« À partir de cette règle, j’ai construit la méthode SecurePress. »

---

## Slide 6 — 02 — Méthode SecurePress

### Objectif

Présenter la chaîne de travail complète, de la collecte à la restitution.

### Explication

La méthode organise la collecte, la qualification, la priorisation, la préparation de correction et la restitution.

### Script oral

« SecurePress transforme l’analyse en une chaîne de travail structurée.
La première étape consiste à collecter les éléments disponibles. Ils sont ensuite qualifiés selon la preuve, la sévérité potentielle, l’exposition et la confiance. Les risques sont priorisés en fonction de la réduction de risque attendue, puis des corrections et des contrôles sont préparés.
Enfin, la restitution doit permettre à une autre personne de comprendre ce qui a été observé, ce qui est recommandé et ce qui reste à vérifier. »

### Transition

« Avant de présenter les résultats, je dois préciser exactement quel environnement a été analysé. »

---

## Slide 7 — 02 — Périmètre et architecture

### Objectif

Fixer les limites d’interprétation des résultats.

### Explication

La slide signale explicitement une démonstration basée sur un snapshot local hors ligne. Aucun accès de production ni scan en direct ne doit être revendiqué.

### Script oral

« Le périmètre présenté ici est une copie locale préparée pour la démonstration. Elle permet d’étudier les fichiers disponibles, la configuration fournie et la structure de la plateforme, mais elle ne permet pas de confirmer tout l’état runtime de la production.
Il n’y a pas eu de scan en direct de la cible, de modification de la production ou de déduction automatique de l’état réel des utilisateurs, des rôles, des headers HTTP ou du TLS.
L’architecture représentée sert donc à comprendre les zones de contrôle et à préparer la validation ultérieure. »

### Transition

« Dans ce périmètre, le premier résultat concret est l’inventaire factuel des composants. »

---

## Slide 8 — 02 — Inventaire factuel

### Objectif

Montrer que le diagnostic commence par une base technique vérifiable.

### Explication

La copie examinée contient WordPress 6.4.3, Astra 4.6.3, WooCommerce 8.4.0, 17 plugins et 4 thèmes ; l’activation réelle n’est pas déduite de la seule présence des répertoires.

### Script oral

« L’inventaire fournit la base factuelle du diagnostic. Dans la copie étudiée, j’ai identifié WordPress 6.4.3, le thème Astra 4.6.3, WooCommerce 8.4.0, ainsi que 17 répertoires de plugins et 4 thèmes.
Un composant personnalisé, Info Cards 1.0.2, est également présent dans l’environnement fourni.
Je parle volontairement de composants présents ou documentés. Sans preuve directe dans la base de données ou dans l’exécution de la cible, je ne conclus pas automatiquement qu’un plugin est actif, utilisé ou exposé. »

### Transition

« Une fois l’inventaire établi, chaque élément passe dans un pipeline d’évaluation. »

---

## Slide 9 — 03 — Pipeline d’évaluation

### Objectif

Expliquer les critères utilisés pour passer d’un élément technique à une décision de sécurité.

### Explication

Le pipeline sépare la preuve observable, la sévérité, l’exposition, la confiance et l’état de suivi.

### Script oral

« Le pipeline d’évaluation comporte cinq niveaux.
D’abord, je cherche une preuve observable ou documentée. Ensuite, j’estime la sévérité potentielle, puis le contexte d’exposition : accès public, administration, configuration locale ou dépendance serveur.
J’ajoute le niveau de confiance, car toutes les informations n’ont pas la même solidité. Enfin, je donne un état de suivi : constat, action préparée, contrôle local ou validation cible à planifier.
Cette séparation évite de transformer directement un indice technique en conclusion définitive. »

### Transition

« Ces critères permettent ensuite de construire une matrice de risques lisible et priorisée. »

---

## Slide 10 — 03 — Matrice des risques prioritaires

### Objectif

Montrer comment les risques sont hiérarchisés sans exagérer leur niveau de certitude.

### Explication

La matrice met en relation l’impact potentiel, l’exposition et la confiance ; elle distingue les actions urgentes des dettes de durcissement et des contrôles à confirmer.

### Script oral

« La matrice ne classe pas uniquement les éléments selon leur version. Elle croise l’impact potentiel, l’exposition connue ou supposée et le niveau de confiance dans la preuve.
Par exemple, la présence d’un compte de base de données configuré avec l’utilisateur root et un mot de passe vide dans la copie examinée constitue un constat sérieux sur cette copie. La présence de clés ou de sels d’exemple et l’absence de certains paramètres de durcissement sont également des éléments documentés.
À l’inverse, XML-RPC, la protection des sauvegardes, les permissions de fichiers et la modération des commentaires nécessitent une confirmation côté cible avant de devenir des conclusions de production. »

### Transition

« Une priorité n’est utile que si elle peut être suivie jusqu’à sa correction et à sa validation. »

---

## Slide 11 — 03 — Traçabilité des corrections

### Objectif

Présenter le lien entre le diagnostic et l’action corrective.

### Explication

Chaque action suit la chaîne : constat, preuve, correction, validation attendue.

### Script oral

« Pour chaque point important, j’utilise la chaîne “constat, preuve, correction, validation attendue”.
Le constat explique le problème observé. La preuve indique où et comment il a été identifié. La correction décrit l’action proposée, sans prétendre qu’elle est déjà déployée. Enfin, la validation attendue précise ce qu’il faudra contrôler après intervention.
Cette structure facilite le suivi, la relecture et le contre-audit, car elle évite les recommandations isolées de leur justification. »

### Transition

« Une partie de ces corrections a été préparée sous la forme d’un plugin must-use de durcissement. »

---

## Slide 12 — 04 — Plugin must-use de durcissement

### Objectif

Présenter la contribution technique concrète du projet.

### Explication

Le plugin must-use développé localement centralise plusieurs contrôles de durcissement et se charge indépendamment de l’activation classique des plugins.

### Script oral

« La contribution technique principale est un plugin must-use de durcissement préparé localement. Ce type de plugin est chargé automatiquement par WordPress et permet de centraliser des contrôles transverses, indépendamment de l’activation classique des extensions.
Le module couvre notamment la limitation des tentatives de connexion, la réduction de l’énumération des utilisateurs, la réduction d’informations de version, la restriction de certains uploads dangereux et la désactivation de l’éditeur de fichiers.
Je précise que le code a été développé et contrôlé dans le périmètre local. Sa mise en production et son comportement sur la cible doivent encore être validés avec une procédure de sauvegarde, de retour arrière et de contrôle fonctionnel. »

### Transition

« La question suivante est donc : comment vérifier que ces mesures fonctionnent réellement et sans effet de bord ? »

---

## Slide 13 — 04 — Contrôles de validation

### Objectif

Différencier développement, préparation, simulation et vérification sur la cible.

### Explication

Les contrôles locaux peuvent être reproductibles, mais ils ne remplacent pas la validation sur la production autorisée.

### Script oral

« La validation est organisée par niveaux. Un contrôle peut être développé dans le code, préparé dans un runbook, validé par une simulation contrôlée, puis vérifié sur la cible.
Dans l’état actuel, les supports disponibles couvrent les niveaux développé, préparé et simulé. Ils ne permettent pas de revendiquer une vérification de production, un déploiement réel, une validation TLS ou headers finale, ni un contre-audit distant.
Cette distinction est importante : elle donne une image honnête de l’avancement et indique précisément les prochaines vérifications nécessaires. »

### Transition

« Pour restituer cet état sans produire un score trompeur, j’ai utilisé un tableau de bord factuel. »

---

## Slide 14 — 04 — Tableau de bord factuel

### Objectif

Montrer l’avancement réel du projet avec des catégories vérifiables.

### Explication

Le tableau de bord distingue les constats documentés, les actions préparées, les contrôles locaux et la validation cible à planifier ; il n’utilise pas de score global artificiel.

### Script oral

« Le tableau de bord résume l’état du projet en quatre catégories : les constats documentés, les actions préparées, les contrôles locaux et la validation cible à planifier.
J’ai retenu cette présentation parce qu’elle est plus informative qu’une note globale. Une note unique peut donner l’impression qu’un environnement a été entièrement audité ou sécurisé, alors que certaines vérifications restent dépendantes de la cible.
Le tableau de bord permet donc de voir ce qui est déjà objectivé et ce qui doit encore faire l’objet d’une intervention ou d’un contrôle autorisé. »

### Transition

« Cette représentation permet de tirer un bilan équilibré, en distinguant les apports du projet de ses limites. »

---

## Slide 15 — 05 — Bilan et limitations

### Objectif

Conclure honnêtement sur la valeur du travail et ses limites.

### Explication

Le projet apporte une méthode structurée et des remédiations préparées, mais ne constitue pas une certification complète de la sécurité de la production.

### Script oral

« Le principal résultat de SecurePress est une démarche structurée, prudente et traçable. Elle améliore la séparation entre faits, risques potentiels et hypothèses, et elle relie les recommandations à des validations attendues.
Les limites viennent du périmètre : copie locale, sources disponibles, absence d’accès direct à la production et absence de certaines preuves runtime, notamment l’état complet de la base et des contrôles réseau.
Je ne présente donc pas ce travail comme un audit de production complet. Je le présente comme une base technique solide pour préparer un durcissement contrôlé et un audit complémentaire. »

### Transition

« Les prochaines étapes découlent directement de ces limites et de la méthode mise en place. »

---

## Slide 16 — 05 — Perspectives roadmap

### Objectif

Montrer comment le prototype peut évoluer vers un processus de sécurité durable.

### Explication

Les perspectives portent sur l’automatisation de l’inventaire, la traçabilité continue, des validations reproductibles, des profils de durcissement et l’intégration dans le cycle de sécurité.

### Script oral

« La première perspective est d’automatiser davantage l’inventaire et la traçabilité des versions, des preuves et des corrections.
La deuxième consiste à étendre les validations reproductibles, avec des contrôles adaptés à l’environnement réellement autorisé. On peut ensuite définir des profils de durcissement selon le contexte, par exemple un site vitrine, une boutique ou une plateforme de télécommunication.
À terme, SecurePress pourrait s’intégrer dans un cycle continu de sécurité, avec une vérification régulière des composants, des configurations et des actions de remédiation. »

### Transition

« Je termine ici la présentation et je suis prêt à répondre à vos questions sur la méthode, les résultats et les limites. »

---

## Slide 17 — Q&A

### Objectif

Ouvrir l’échange et orienter les questions vers les axes techniques importants.

### Explication

La slide finale rappelle les trois thèmes sur lesquels le jury peut approfondir : méthode, preuves et limites, évolution future.

### Script oral

« Merci pour votre attention. Je suis maintenant disponible pour répondre à vos questions, notamment sur la méthode d’analyse, la qualification des preuves, les contrôles de validation et les perspectives d’évolution de SecurePress. »

### Réflexe à conserver pendant les questions

Si une question porte sur la production, répondre en trois temps :

1. rappeler ce qui est effectivement observé dans la copie ;
2. préciser ce qui ne peut pas être conclu sans accès ou preuve supplémentaire ;
3. proposer le contrôle qui permettrait de valider le point sur la cible.
