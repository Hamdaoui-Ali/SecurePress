# Questions probables du jury

## Est-ce une solution réelle ou une démo ?

C’est une démo locale autonome, conçue pour montrer une méthode d’audit et de remédiation. Elle ne modifie aucun WordPress et ne prétend pas avoir évalué un serveur réel.

## Les scans sont-ils réels ?

Non. Les résultats sont issus d’un scénario TELCO TypeScript immuable et d’un moteur de simulation déterministe. La valeur est la traçabilité du raisonnement, pas une preuve d’exploitation.

## Pourquoi commencer par un audit statique ?

Parce que la copie locale permet de confirmer la présence de fichiers, de configurations et d’artefacts sans inventer l’état de la cible. Les tests dynamiques viennent ensuite, sur un environnement autorisé.

## Pourquoi distinguer présence et activation ?

Un plugin ou un thème peut être présent dans les fichiers sans être actif, chargé ou exploitable. Confondre ces états gonflerait artificiellement la conclusion.

## Que signifie le score 42 puis 82 ?

Il s’agit d’un indice pédagogique reproductible. Les remédiations guidées retirent 40 points de risque du scénario ; 18 points restent associés aux éléments nécessitant une validation cible.

## Pourquoi utiliser une Info Card tierce ?

Elle est présentée comme un composant observé dans la copie, avec son périmètre et ses limites. Sa présence ne prouve ni une vulnérabilité ni une activation sur cible.

## Quelle est votre contribution personnelle ?

La contribution porte sur la structuration de la preuve, le modèle de données TELCO, le moteur de simulation, l’interface de démonstration, le parcours guidé, les contrôles de validation et la recette hors ligne.

## Que manque-t-il pour valider sur cible ?

Une autorisation explicite, un environnement de test, des versions et configurations confirmées, des sauvegardes, des tests dynamiques non destructifs, une revue des logs et un contre-audit indépendant.

## Pourquoi le contre-audit est-il « non exécuté » ?

Parce que l’application n’a ni accès réseau ni cible WordPress. Masquer cette limite transformerait une simulation en fausse preuve.

## Comment réinitialiser la présentation ?

Le bouton « Réinitialiser la démo » efface l’état local et revient à la vue initiale `42 / 100`. Le guide peut aussi être quitté sans perdre l’assessment courant.
