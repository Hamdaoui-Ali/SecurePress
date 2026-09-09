# SecurePress Audit Lab - Spécification de conception

**Date :** 9 septembre 2026  
**Statut :** conception approuvée, prête pour planification  
**Langue de l'interface :** français  
**Type :** application web locale de démonstration  

## 1. Objectif

SecurePress Audit Lab doit présenter, pendant une soutenance, la démarche suivie pour analyser et préparer la sécurisation de la plateforme WordPress TELCO.

L'application reproduit les étapes et les résultats décrits dans le rapport, mais toutes ses interactions restent déterministes et simulées. Elle ne se connecte à aucun serveur WordPress, aucune base de données et aucun outil de scan.

Le jury doit comprendre en moins de six minutes :

1. ce qui a été observé dans la copie hors production ;
2. comment les risques ont été qualifiés ;
3. quelles remédiations ont été développées ou préparées ;
4. comment ces remédiations devraient être validées ;
5. quelles validations restent non démontrées sur l'environnement cible.

## 2. Sources fonctionnelles

La conception reprend les éléments techniques du rapport :

- plateforme TELCO ;
- WordPress 6.4.3 ;
- thème Astra 4.6.3 ;
- WooCommerce 8.4.0 ;
- quatre thèmes et dix-sept répertoires d'extensions ;
- revue statique de `wp-config.php`, `.htaccess`, `wp-content`, des versions et du code ;
- fichier `wp-config.php` renforcé ;
- compte de base de données proposé `telco_app` ;
- module `telco-security-hardening.php` ;
- guide de remédiation et commandes WP-CLI ;
- protocoles de tests fonctionnels, d'intégrité et de contre-vérification.

Info Cards 1.0.2 doit être présenté comme une extension tierce présente et analysée dans l'archive. Le module Telco Security Hardening constitue le développement de sécurité mis en avant dans la démonstration.

## 3. Principes de vérité

Le produit doit séparer trois dimensions pour chaque constat.

### 3.1 État de la preuve

- `observed_in_snapshot` : constaté directement dans les fichiers disponibles ;
- `documented_in_audit` : mentionné dans le rapport d'audit, mais non vérifiable dans l'archive actuelle ;
- `not_observable_offline` : dépend de l'environnement d'exécution ou de la cible.

### 3.2 État de la remédiation

- `not_started` ;
- `recommended` ;
- `prepared` ;
- `developed` ;
- `applied_in_simulation`.

### 3.3 État de la validation

- `not_run` ;
- `simulated_pass` ;
- `simulated_fail` ;
- `target_validation_required` ;
- `dynamic_retest_not_executed`.

Une réussite simulée ne doit jamais modifier l'état de preuve en « vérifié sur cible ».

## 4. Périmètre du MVP

Le MVP contient une coque d'application et six étapes principales.

### 4.1 Coque permanente

La coque contient :

- une barre latérale compacte ;
- le titre SecurePress Audit Lab ;
- le nom du projet TELCO ;
- un badge permanent `MODE DÉMO` ;
- une bannière indiquant qu'aucun système réel n'est connecté ;
- un indicateur de progression ;
- un bouton `Réinitialiser la démo` ;
- un bouton `Démarrer la démo guidée`.

### 4.2 Étape 1 - Vue d'ensemble

La vue d'ensemble présente :

- le périmètre de l'évaluation ;
- le mode `Copie hors production / Audit statique` ;
- le nombre de composants et de constats ;
- la progression du workflow ;
- la répartition des constats ;
- l'indice pédagogique de posture ;
- les limites de l'évaluation.

Répartition cohérente du scénario :

- 10 constats ;
- 2 critiques ;
- 3 élevés ;
- 3 moyens ;
- 1 faible ;
- 1 à sévérité variable.

### 4.3 Étape 2 - Inventaire

L'utilisateur lance un inventaire simulé. Une progression courte affiche les opérations suivantes :

1. lecture de l'instantané ;
2. détection du noyau ;
3. inspection des thèmes ;
4. inspection des extensions ;
5. inspection de la configuration ;
6. construction de l'inventaire.

Le tableau affiche le noyau, les quatre thèmes et les dix-sept extensions. Une colonne distingue :

- présence confirmée dans les fichiers ;
- activation inconnue ;
- information dépendante de la base WordPress.

Le message `Présent dans les fichiers ne signifie pas actif ou exploitable` reste visible.

### 4.4 Étape 3 - Audit et qualification

Le bouton `Lancer l'audit statique simulé` produit dix constats locaux.

| ID | Constat | Sévérité du scénario | État de preuve |
|---|---|---|---|
| F-001 | Compte de base de données `root` | Critique | Constaté dans l'instantané |
| F-002 | Mot de passe de base vide | Critique | Constaté dans l'instantané |
| F-003 | Clés et sels WordPress d'exemple | Élevée | Constaté dans l'instantané |
| F-004 | Éditeur de fichiers non désactivé | Moyenne | Constaté dans la configuration |
| F-005 | HTTPS d'administration non imposé | Élevée | Validation cible requise |
| F-006 | Versions nécessitant une revue | Variable | Présence confirmée, exploitabilité inconnue |
| F-007 | Restriction XML-RPC non démontrée | Moyenne | Validation cible requise |
| F-008 | Protection de sauvegarde à confirmer | Élevée | Mentionnée dans le rapport d'audit |
| F-009 | Permissions potentiellement trop larges | Moyenne | Procédure préparée |
| F-010 | Modération des commentaires à revoir | Faible | Données d'exécution indisponibles |

La liste permet le filtrage par sévérité, preuve et état. Un panneau de détail affiche :

- preuve ;
- confiance ;
- exposition ;
- impact ;
- recommandation ;
- remédiation associée ;
- validation requise ;
- limite de l'observation.

La démo guidée ouvre prioritairement F-001, F-003 et F-006.

### 4.5 Étape 4 - Remédiation

Chaque remédiation utilise une carte avant/après :

- état initial ;
- mesure proposée ;
- justification ;
- artefact associé ;
- bouton `Appliquer dans la simulation` ;
- état de validation distinct.

Les six mesures pouvant passer à `applied_in_simulation` dans le scénario guidé sont :

1. compte de base dédié ;
2. mot de passe fort représenté par une valeur masquée ;
3. clés et sels uniques représentés par des valeurs masquées ;
4. `DISALLOW_FILE_EDIT` ;
5. restriction XML-RPC proposée dans la simulation, avec validation cible toujours requise ;
6. permissions renforcées dans la simulation.

Les autres mesures restent `prepared` ou `target_validation_required`.

Le `.htaccess` renforcé doit être affiché comme mesure documentée dont l'artefact était absent des éléments examinés. L'application ne doit pas inventer son contenu complet.

### 4.6 Étape 5 - Durcissement et validation

Le centre de durcissement représente les contrôles du module `telco-security-hardening.php` :

- cinq échecs de connexion puis blocage simulé de quinze minutes ;
- restriction de `?author=N` ;
- restriction des routes REST d'utilisateurs ;
- réduction de la divulgation de version ;
- blocage des formats de téléversement dangereux ;
- désactivation de l'éditeur de fichiers.

La validation regroupe :

- tests fonctionnels publics ;
- tests de l'administration ;
- tests d'Info Cards ;
- tests WooCommerce conditionnels ;
- tests du module de durcissement ;
- contrôles d'intégrité ;
- tests de non-régression ;
- contre-vérification.

Tous les résultats produits par l'application portent explicitement le suffixe `simulé`.

Le contre-audit dynamique externe reste toujours `NON EXÉCUTÉ`.

### 4.7 Étape 6 - Comparaison et rapport

La dernière étape présente :

- une comparaison avant/après ;
- les constats traités dans la simulation ;
- les mesures seulement préparées ;
- les validations encore nécessaires ;
- le risque résiduel ;
- la timeline de la démonstration ;
- un résumé imprimable depuis le navigateur.

L'export PDF avancé n'appartient pas au premier incrément. La fonction d'impression du navigateur suffit pour le MVP.

## 5. Indice pédagogique de posture

L'indice n'est pas une mesure normative. Il est calculé à partir de points de risque stockés dans les données du scénario.

| Constat | Points initiaux |
|---|---:|
| F-001 | 12 |
| F-002 | 12 |
| F-003 | 6 |
| F-004 | 3 |
| F-005 | 5 |
| F-006 | 5 |
| F-007 | 3 |
| F-008 | 6 |
| F-009 | 4 |
| F-010 | 2 |

Formule :

```text
indice = 100 - somme des points de risque encore ouverts
```

L'état initial vaut `42 / 100`. Les remédiations guidées de F-001, F-002, F-003, F-004, F-007 et F-009 retirent 40 points de risque du scénario. Les risques F-005, F-006, F-008 et F-010 restant à confirmer totalisent 18 points ; l'indice projeté vaut donc `82 / 100`.

L'interface affiche toujours `Indice pédagogique simulé` et propose une explication du calcul.

## 6. Parcours guidé de soutenance

Le parcours cible dure entre quatre et six minutes.

| Temps indicatif | Action | Message principal |
|---|---|---|
| 0:00-0:30 | Vue d'ensemble | Copie hors production, audit statique, limites explicites |
| 0:30-1:15 | Inventaire | Présence différente d'activation et d'exploitabilité |
| 1:15-2:15 | Audit | Résultats simulés issus du scénario du rapport |
| 2:15-3:15 | F-001 puis F-003 | Preuve, gravité, confiance et exposition |
| 3:15-4:15 | Remédiation | Avant/après et contribution technique |
| 4:15-5:00 | Validation | Sécurité et non-régression doivent être testées ensemble |
| 5:00-5:30 | Rapport | Développé, préparé, simulé et non démontré |

Le mode guidé met en évidence le prochain bouton sans bloquer la navigation libre.

## 7. Architecture technique

### 7.1 Stack

- React ;
- Vite ;
- TypeScript ;
- Tailwind CSS ;
- Lucide pour les icônes ;
- Recharts uniquement pour les graphiques utiles ;
- état React et `localStorage` ;
- aucun backend ;
- aucune base de données ;
- aucune API externe.

### 7.2 Organisation proposée

```text
src/
|- app/
|  |- App.tsx
|  |- routes.tsx
|  `- providers.tsx
|- components/
|  |- layout/
|  |- workflow/
|  |- inventory/
|  |- findings/
|  |- remediation/
|  |- validation/
|  `- ui/
|- data/
|  |- project.ts
|  |- components.ts
|  |- findings.ts
|  |- remediations.ts
|  `- tests.ts
|- domain/
|  |- assessment.ts
|  |- finding.ts
|  |- remediation.ts
|  `- validation.ts
|- services/
|  |- simulation-engine.ts
|  |- scoring.ts
|  `- storage.ts
`- styles/
```

### 7.3 Flux des données

```text
Données TypeScript locales
        |
        v
SimulationEngine
        |
        v
État de l'assessment
        |
        +--> compteurs dérivés
        +--> progression
        +--> timeline
        +--> indice pédagogique
        `--> rapport imprimable
```

Les composants d'interface ne doivent pas contenir leurs propres copies des compteurs ou statuts.

## 8. Moteur de simulation

Le service `SimulationEngine` expose :

```ts
runInventory()
runStaticAudit()
qualifyFindings()
applyRemediation(findingId)
runHardeningCheck(controlId)
runValidation()
resetDemo()
```

Chaque opération :

1. attend une durée courte configurable ;
2. retourne des données prédéfinies ;
3. modifie uniquement l'état local ;
4. ajoute un événement dans la timeline ;
5. reste reproductible après réinitialisation ;
6. n'exécute aucune commande et aucun appel réseau.

Les erreurs de simulation sont limitées aux transitions invalides, aux données locales corrompues et aux erreurs de stockage.

## 9. Persistance et réinitialisation

L'état est conservé sous une clé versionnée, par exemple :

```text
securepress.audit-lab.v1
```

Au chargement :

- une donnée valide restaure la progression ;
- une donnée absente initialise le scénario ;
- une donnée incompatible ou corrompue déclenche une restauration sûre avec un message non bloquant.

`Réinitialiser la démo` supprime uniquement la clé de l'application et restaure l'état initial.

## 10. Direction visuelle

L'interface adopte un style professionnel de centre d'évaluation de sécurité :

- fond clair pour la projection ;
- barre latérale bleu nuit ;
- cartes blanches avec bordures nettes ;
- rouge réservé aux constats critiques ;
- orange pour les risques élevés ou moyens ;
- vert pour les validations simulées réussies ;
- gris ou violet pour les éléments préparés et non exécutés ;
- tableaux lisibles à distance ;
- animations de progression inférieures à trois secondes ;
- aucun cliché visuel de type terminal vert, matrice ou pirate.

Le badge `MODE DÉMO` et la bannière de simulation ne disparaissent jamais.

## 11. Accessibilité et projection

- contraste compatible avec une projection lumineuse ;
- taille minimale de 16 px pour le texte courant ;
- navigation complète au clavier ;
- focus visible ;
- statuts exprimés par du texte et pas uniquement par la couleur ;
- tableaux adaptables aux écrans étroits ;
- réduction des animations si `prefers-reduced-motion` est activé ;
- libellés en français et acronymes expliqués lors de leur première apparition.

## 12. Fonctionnement hors ligne

Le build final doit intégrer localement :

- scripts ;
- styles ;
- icônes ;
- polices éventuelles ;
- données ;
- images utilisées par la démonstration.

Le code ne doit contenir aucun CDN, outil d'analytics, police distante, télémétrie, lien d'image distante ou requête vers un domaine externe.

## 13. Stratégie de test

### 13.1 Tests unitaires

- calcul des compteurs ;
- calcul de l'indice 42 puis 82 ;
- transitions du moteur de simulation ;
- correspondance finding-remédiation-validation ;
- restauration et réinitialisation du stockage.

### 13.2 Tests de composants

- badges de gravité et de statut ;
- filtres des constats ;
- panneau de détail ;
- comparaison avant/après ;
- dialogue de réinitialisation ;
- progression guidée.

### 13.3 Tests de parcours

- exécution complète du scénario ;
- rechargement après une remédiation ;
- reset depuis chaque étape ;
- fonctionnement sans accès Internet ;
- démonstration complète en moins de six minutes ;
- absence de statut « vérifié sur cible » ;
- cohérence du rapport final avec l'état courant.

## 14. Critères d'acceptation

Le MVP est accepté lorsque :

- les six étapes fonctionnent dans l'ordre et en navigation libre ;
- le badge `MODE DÉMO` reste visible ;
- aucun appel réseau externe n'est produit ;
- les dix constats proviennent d'une source locale unique ;
- chaque constat possède une preuve, une remédiation et une validation ;
- les trois dimensions de statut restent indépendantes ;
- Info Cards est correctement attribué à un tiers ;
- le module Telco Security Hardening est clairement identifié comme contribution technique ;
- l'indice passe de 42 à 82 selon la formule documentée ;
- les compteurs restent cohérents après chaque action ;
- le contre-audit dynamique reste non exécuté ;
- la réinitialisation restaure exactement le scénario initial ;
- le parcours guidé tient en moins de six minutes ;
- le build fonctionne sans Internet.

## 15. Hors périmètre du premier incrément

- connexion à un WordPress réel ;
- exécution de WP-CLI ;
- scan WPScan, Nuclei, ZAP ou Burp Suite ;
- base de données réelle ;
- authentification réelle ;
- génération PDF avancée ;
- scénarios multiples ;
- mode sombre ;
- animation d'architecture complexe ;
- déploiement sur un hébergement distant.

Ces fonctions peuvent être réévaluées après validation du MVP, sans modifier le principe de simulation locale.
