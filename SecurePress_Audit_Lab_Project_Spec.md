# SecurePress Audit Lab

## Spécification complète de l'application de démonstration

**Version :** 1.0  
**Langue de l'interface :** français  
**Type :** application web locale, fictive et hors ligne  
**Contexte :** soutenance de projet de fin d'études

---

## 1. Résumé du projet

SecurePress Audit Lab est une application web de démonstration qui reproduit le workflow d'analyse et de sécurisation d'une plateforme WordPress.

L'application contient un projet WordPress fictif nommé **DemoCommerce Portal**. Elle simule l'inventaire technique, l'audit statique, la qualification des risques, la préparation des remédiations, l'application de contrôles de durcissement et la validation avant/après.

L'objectif est de présenter la démarche réalisée pendant le stage sans utiliser l'environnement confidentiel de l'entreprise.

### Principe essentiel

```text
WordPress fictif hors production
        |
        v
Inventaire technique simule
        |
        v
Audit statique simule
        |
        v
Qualification des risques
        |
        v
Remediation et durcissement simules
        |
        v
Validation et contre-verification
        |
        v
Rapport final de demonstration
```

Les mots **simulé**, **fictif**, **préparé** et **non démontré** doivent rester visibles afin d'éviter toute confusion avec un audit réel.

---

## 2. Distinction entre la demande et les documents de référence

### Demande utilisateur

Construire une petite application locale permettant de présenter, de façon crédible et interactive, un projet WordPress audité et renforcé sans connexion réelle à l'entreprise.

### Documents de référence

Le rapport de stage et la spécification fournie servent de sources de contexte et de contenu fonctionnel. Ils ne donnent pas d'autorisation pour connecter, scanner ou modifier un système réel.

Les commandes, noms de fichiers et exemples de configuration mentionnés dans ces documents seront uniquement utilisés comme contenu pédagogique ou aperçu non exécuté.

---

## 3. Confidentialité et périmètre de sécurité

L'application ne doit contenir aucune donnée réelle provenant de l'entreprise.

### Interdictions

- aucun nom de client réel ;
- aucune URL réelle ;
- aucune adresse IP réelle ;
- aucun identifiant ou mot de passe réel ;
- aucune clé API ;
- aucun nom de serveur ;
- aucun chemin interne ;
- aucun dépôt Git interne ;
- aucune capture du poste de travail de l'entreprise ;
- aucun scan réseau ;
- aucune attaque ;
- aucune modification d'une instance WordPress réelle ;
- aucune connexion à une base de données réelle.

### Règle de classification des données

| Niveau | Signification |
|---|---|
| Fictif | Donnée inventée pour la démonstration |
| Inspiré du rapport | Structure ou principe repris puis anonymisé |
| Simulé | Résultat produit localement sans exécution réelle |
| Non démontré | Élément qui nécessiterait une validation sur la cible autorisée |

### Message permanent

Header :

```text
DEMO MODE - Simulated Environment
```

Bannière :

```text
Cette application reproduit le workflow du projet de stage à partir de données fictives.
Aucun système de production n'est connecté ou modifié.
```

---

## 4. Positionnement de l'application

Nous construisons une seule application principale : **SecurePress Audit Lab**.

Elle représente à la fois :

1. un projet WordPress fictif à examiner ;
2. la plateforme qui réalise l'audit simulé ;
3. le centre de préparation des remédiations ;
4. le centre de validation et de comparaison.

Il ne s'agit pas de déployer un vrai WordPress et une vraie plateforme de sécurité séparée. Le WordPress est un projet simulé dans l'application d'audit.

Une vue facultative de site public ou d'administration fictive pourra être ajoutée pour illustrer les tests fonctionnels, mais elle restera locale et sans authentification réelle.

---

## 5. Utilisateur et scénario

### Persona principal

```text
Security Engineer / Application Engineer
```

Cette personne examine une copie applicative hors production avant une éventuelle mise en service.

### Projet WordPress fictif

```text
Nom                 DemoCommerce Portal
Assessment ID       DEMO-2026-001
Environnement       Offline Snapshot
Type d'audit        Static Security Review
Mode                Simulation
CMS                 WordPress 6.4.3
Theme               Astra 4.6.3
E-commerce          WooCommerce 8.4.0
Custom component    Info Cards 1.0.2
Base de donnees     MySQL compatible
```

Ces éléments sont fictifs ou inspirés du périmètre technique du rapport. Ils ne constituent pas une preuve sur l'environnement de production.

---

## 6. Workflow fonctionnel

```text
INVENTAIRE -> AUDIT -> QUALIFICATION -> REMEDIATION -> VALIDATION -> RAPPORT
```

Chaque phase doit disposer de :

- un statut ;
- une date et une heure simulées ;
- des résultats prédéfinis ;
- des preuves fictives ;
- des actions disponibles ;
- des éléments restant à vérifier.

### États de l'assessment

```text
NOT_STARTED
INVENTORY_RUNNING
INVENTORY_COMPLETE
AUDIT_RUNNING
AUDIT_COMPLETE
QUALIFIED
REMEDIATING
READY_FOR_VALIDATION
VALIDATING
VALIDATED
REPORT_READY
```

### Statuts visibles des constats

```text
Constaté dans l'instantané
Risque potentiel
À valider en environnement cible
Remédiation préparée
Développé
Simulé validé
Non démontré
```

Le statut **Confirmé** ne doit être utilisé seul que si le contexte de confirmation est explicite. Dans la démo, préférer **Confirmé dans l'instantané** ou **Simulé validé**.

---

## 7. Navigation principale

Sidebar :

```text
Vue d'ensemble
Inventaire
Audit statique
Constats
Qualification des risques
Remédiation
Contrôles de durcissement
Validation
Comparaison avant / après
Rapport final
Paramètres de démo
```

Header :

```text
SecurePress Audit Lab
DemoCommerce Portal
DEMO MODE
Reset Demo
```

---

## 8. Écran Vue d'ensemble

### Objectif

Donner au jury une compréhension immédiate de l'état du projet, de l'avancement du workflow et des priorités de sécurité.

### Informations projet

```text
Project              DemoCommerce Portal
Assessment ID        DEMO-2026-001
Environment          Offline Snapshot
Mode                 Simulation
Status               Remediation in progress
```

### Progression du workflow

```text
✓ Inventaire
✓ Audit statique
✓ Qualification des risques
● Remédiation
○ Validation
○ Rapport final
```

### Jeu de données initial de démonstration

Les nombres doivent être calculés depuis les données locales, et non écrits indépendamment dans chaque écran.

```text
Extensions                  17
Findings                    10
Critiques                    2
Élevés                       3
Moyens                       3
Faibles                      2
Remédiations                10
Simulées validées            6
À revoir                     4
```

Ces chiffres appartiennent au scénario fictif de la démo. Ils ne doivent jamais être présentés comme des résultats exacts de production.

### Posture de sécurité pédagogique

```text
Posture initiale simulée       42 / 100
Posture projetée simulée       82 / 100
```

Le mot **simulée** ou **projetée** doit toujours accompagner ces scores. Le score n'est pas une mesure normative issue d'un outil réel.

---

## 9. Écran Inventaire

### Objectif

Reproduire l'étape d'inventaire technique : noyau WordPress, thèmes, extensions, composants personnalisés et fichiers de configuration.

### Action

Bouton :

```text
Lancer l'inventaire
```

Progression simulée de 3 à 5 secondes :

```text
Lecture de l'instantané applicatif...
Détection du noyau WordPress...
Inspection des thèmes...
Inspection des extensions...
Inspection des fichiers de configuration...
Inspection des composants personnalisés...
Construction de l'inventaire...
Inventaire terminé.
```

### Tableau des composants

| Composant | Type | Version | Source | Activation |
|---|---|---:|---|---|
| WordPress | Noyau | 6.4.3 | Détecté | Confirmé dans les fichiers |
| Astra | Thème | 4.6.3 | Détecté | Présent |
| WooCommerce | Extension | 8.4.0 | Détecté | Présence uniquement |
| Spectra | Extension | 2.11.3 | Détecté | Présence uniquement |
| Essential Blocks | Extension | 4.4.12 | Détecté | Présence uniquement |
| Smart Slider 3 | Extension | 3.5.1.21 | Détecté | Présence uniquement |
| Info Cards | Composant personnalisé | 1.0.2 | Détecté | Composant personnalisé |

### Message pédagogique

```text
Détecté dans les fichiers ≠ activé en production
```

La présence d'une extension dans les fichiers ne permet pas d'affirmer seule qu'elle est active, exposée ou exploitable.

---

## 10. Écran Audit statique

### Objectif

Simuler une revue statique des éléments suivants :

```text
wp-config.php
.htaccess
wp-content/plugins/
wp-content/themes/
wp-content/uploads/
code du composant personnalisé
métadonnées de configuration
```

### Action

Bouton :

```text
Lancer l'évaluation statique
```

Progression :

```text
[1/6] Analyse de la configuration
[2/6] Vérification des paramètres d'authentification
[3/6] Vérification des versions des composants
[4/6] Revue des fonctionnalités exposées
[5/6] Revue du code personnalisé
[6/6] Construction des constats
```

### Findings du scénario

#### F-001 - Compte de base de données administratif utilisé par l'application

```text
Sévérité       Critique
Confiance      Élevée
Preuve         wp-config.php fictif
Exposition     Non confirmée en production
État           Remédiation préparée
```

#### F-002 - Mot de passe de base vide ou faible

```text
Sévérité       Critique
Confiance      Élevée
Preuve         wp-config.php fictif
Exposition     Non confirmée en production
État           Remédiation préparée
```

#### F-003 - Clés et sels WordPress utilisant des valeurs d'exemple

```text
Sévérité       Élevée
Confiance      Élevée
Preuve         wp-config.php fictif
État           Remédiation préparée
```

#### F-004 - Éditeur de fichiers non désactivé

```text
Sévérité       Moyenne
Confiance      Élevée
Preuve         Configuration fictive
État           Correction préparée
```

#### F-005 - HTTPS d'administration non imposé dans la configuration

```text
Sévérité       Élevée
Confiance      Moyenne
Preuve         Configuration fictive
Exposition     À valider en runtime
État           À valider en environnement cible
```

#### F-006 - Versions de composants nécessitant une revue de sécurité

```text
Sévérité       Variable
Confiance      Moyenne
Preuve         Métadonnées de version
État           Mise à jour recommandée
```

#### F-007 - Restrictions XML-RPC non démontrées

```text
Sévérité       Moyenne
Confiance      Moyenne
Preuve         .htaccess / fichiers applicatifs fictifs
État           À valider en environnement cible
```

#### F-008 - Protection des sauvegardes à confirmer

```text
Sévérité       Élevée
Confiance      Moyenne
Preuve         Référence documentaire fictive
État           Non démontré
```

#### F-009 - Permissions de fichiers potentiellement trop larges

```text
Sévérité       Moyenne
Confiance      Moyenne
Preuve         Métadonnées statiques fictives
État           Procédure préparée
```

#### F-010 - Modération des commentaires à revoir

```text
Sévérité       Faible / Moyenne
Confiance      Moyenne
Preuve         Paramètres applicatifs non disponibles
État           À valider en environnement cible
```

---

## 11. Qualification des risques

### Objectif

Montrer que la priorisation ne dépend pas uniquement de la sévérité technique ou d'un numéro de version.

Chaque constat doit prendre en compte :

- la preuve disponible ;
- la sévérité technique ;
- l'exposition réelle ;
- le niveau de confiance ;
- l'impact potentiel ;
- la facilité de correction ;
- la priorité de traitement.

### Fiche d'un constat

```text
ID
F-003

Titre
Clés et sels WordPress utilisant des valeurs d'exemple

Sévérité
ÉLEVÉE

Preuve
wp-config.php fictif

Confiance
ÉLEVÉE

Exposition
Dépend de l'environnement cible

Impact potentiel
Affaiblissement de la protection des sessions et de l'authentification

Action recommandée
Générer des clés et sels WordPress uniques.

État
Remédiation préparée
```

### Matrice de risque pédagogique

```text
                         IMPACT
                    Faible  Moyen  Élevé

Probable            Moyen   Élevé  Critique
Possible            Faible  Moyen  Élevé
Peu probable        Faible  Faible Moyen
```

Cette matrice est une visualisation pédagogique du scénario. Elle ne constitue pas une norme ou un résultat d'outil réel.

---

## 12. Priorité des remédiations

L'ordre de traitement simulé doit suivre la logique suivante :

1. sécuriser le compte de base de données ;
2. remplacer le mot de passe faible ou vide ;
3. renouveler les clés et sels WordPress ;
4. déployer les protections applicatives ;
5. corriger ou mettre à jour les composants prioritaires ;
6. renforcer l'authentification ;
7. protéger les fichiers sensibles et les sauvegardes ;
8. contrôler les téléversements ;
9. corriger les permissions ;
10. vérifier l'intégrité et réaliser la contre-vérification.

---

## 13. Centre de remédiation

### Objectif

Présenter clairement l'état initial, la mesure proposée, sa justification et son état de validation.

### Structure

```text
État initial | État renforcé proposé
Pourquoi ce changement ?
Appliquer dans la simulation
```

### Exemple : compte de base de données

État initial :

```text
Utilisateur        root
Mot de passe       Vide / faible
Privilèges         Administratifs
```

État proposé :

```text
Utilisateur        demo_wp_app
Mot de passe       Valeur forte générée fictivement
Privilèges         Limités à l'application
```

Explication :

```text
L'application doit utiliser un compte dédié plutôt qu'un compte administratif,
afin de réduire l'impact potentiel d'une compromission.
```

Action :

```text
Appliquer dans la simulation
```

Résultat :

```text
Simulation appliquée avec succès.
Aucune configuration de production n'a été modifiée.
```

---

## 14. Contrôles de durcissement

Le centre de durcissement représente le module préparé dans le projet, sans exécuter de code réel.

Contrôles :

```text
Limitation des tentatives de connexion
Blocage temporaire après plusieurs échecs
Protection contre l'énumération des utilisateurs
Réduction de la divulgation de version
Restriction des téléversements dangereux
Désactivation de l'éditeur de fichiers WordPress
Exigence HTTPS pour l'administration
```

Chaque contrôle doit afficher son état :

```text
Préparé
Appliqué dans la simulation
À valider sur la cible
Non démontré
```

Un switch activé ne doit jamais signifier qu'un vrai serveur a été modifié.

### Limitation des connexions

Scénario local :

```text
Tentative 1 -> Échec d'authentification
Tentative 2 -> Échec d'authentification
Tentative 3 -> Échec d'authentification
Tentative 4 -> Échec d'authentification
Tentative 5 -> Échec d'authentification

Protection déclenchée
Blocage temporaire simulé : 15 minutes
```

### Protection de l'énumération des utilisateurs

Avant :

```text
/wp-json/wp/v2/users
Route publique disponible dans le scénario
```

Après :

```text
Accès restreint dans la simulation
```

L'application ne doit appeler aucune URL réelle.

### Réduction de divulgation de version

Avant :

```html
<meta name="generator" content="WordPress 6.x">
```

Après :

```text
Métadonnée generator supprimée dans la simulation
Paramètres de version réduits
```

### Restriction des téléversements

Formats bloqués dans la simulation :

```text
.svg .svgz .html .htm .php .php3 .php4 .php5 .phtml
```

Formats autorisés :

```text
.jpg .jpeg .png .webp .pdf
```

Tests :

```text
shell.php       -> BLOQUÉ
document.pdf    -> AUTORISÉ
photo.jpg       -> AUTORISÉ
```

### Protection de l'éditeur de fichiers

Avant :

```text
WordPress File Editor
Activé
```

Après :

```text
DISALLOW_FILE_EDIT
Activé dans la configuration simulée
```

### HTTPS d'administration

Avant :

```text
Administration HTTPS
Non imposée dans la configuration
```

Après :

```text
FORCE_SSL_ADMIN
Préparé dans la configuration simulée
```

Message obligatoire :

```text
La configuration TLS réelle doit être validée dans l'environnement cible.
```

---

## 15. Plan de mise à jour des composants

| Composant | Version actuelle | Action | Validation |
|---|---:|---|---|
| WordPress Core | 6.4.3 | Mise à jour planifiée | Oui |
| Astra | 4.6.3 | Mise à jour planifiée | Oui |
| WooCommerce | 8.4.0 | Mise à jour planifiée | Oui |
| Spectra | 2.11.3 | Revue / mise à jour | Oui |
| Smart Slider 3 | 3.5.1.21 | Revue / mise à jour | Oui |

Ne pas afficher de version cible si elle n'est pas nécessaire au scénario.

### Aperçu WP-CLI

Les commandes suivantes peuvent être affichées comme aperçu uniquement :

```bash
wp core update
wp theme update astra
wp plugin update woocommerce
wp plugin update --all
wp core verify-checksums
wp plugin verify-checksums --all
```

Badge obligatoire :

```text
Aperçu uniquement - les commandes ne sont pas exécutées
```

---

## 16. Centre de validation

### Objectif

Montrer que toute correction de sécurité doit être suivie de tests fonctionnels, de tests de non-régression, de contrôles d'intégrité et d'une contre-vérification.

### Catégories

```text
Tests fonctionnels
Contrôles de durcissement
Contrôles d'intégrité
Tests de non-régression
Contre-vérification
```

### Tests fonctionnels publics

```text
✓ Ouverture de la page d'accueil
✓ Navigation entre les pages
✓ Affichage des images
✓ Chargement des feuilles de style
✓ Exécution des scripts JavaScript
✓ Utilisation des menus
✓ Rendu ordinateur
✓ Rendu tablette
✓ Rendu téléphone
```

### Tests d'administration fictive

```text
✓ Accès à la page de connexion
✓ Authentification avec un compte de démonstration
✓ Refus d'un mot de passe incorrect
✓ Blocage simulé après plusieurs échecs
✓ Accès au tableau de bord fictif
✓ Création et modification d'une page simulée
✓ Gestion des médias fictifs
✓ Déconnexion correcte
```

### Composant Info Cards

```text
✓ Insertion du bloc dans l'éditeur
✓ Ajout d'une carte
✓ Suppression d'une carte
✓ Modification du titre
✓ Modification de la description
✓ Ajout d'une image
✓ Configuration des boutons
✓ Configuration des couleurs
✓ Adaptation du nombre de colonnes
✓ Rendu responsive
```

### WooCommerce fictif

Si le scénario est activé :

```text
✓ Affichage des produits
✓ Ajout au panier
✓ Modification des quantités
✓ Validation du panier
✓ Accès à la page de commande simulée
```

---

## 17. Contrôles du module de durcissement

```text
Limitation des connexions       PASS simulé
Énumération des utilisateurs    PASS simulé
Divulgation de version          PASS simulé
Téléversements dangereux        PASS simulé
Éditeur de fichiers             PASS simulé
```

### Contrôles d'intégrité

```text
Checksum du noyau WordPress     PASS simulé
Intégrité des extensions        PASS simulé
Fichiers inattendus             0 simulé
Fichiers du noyau modifiés      0 simulé
```

Message obligatoire :

```text
Ces résultats sont simulés et ne proviennent pas d'un scan réel.
```

### Contre-vérification

```text
✓ Compte de base de données revu
✓ Mot de passe fort planifié
✓ Clés et sels WordPress renouvelés
✓ DISALLOW_FILE_EDIT configuré
✓ FORCE_SSL_ADMIN préparé
✓ Versions des composants revues
✓ Exposition XML-RPC revue
✓ Protection des sauvegardes revue
✓ Permissions revues
✓ Limitation des connexions vérifiée
✓ Énumération des utilisateurs vérifiée
✓ Restrictions de téléversement vérifiées
✓ Contrôles d'intégrité réalisés
```

Statut final obligatoire :

```text
Contre-audit dynamique externe
NON EXÉCUTÉ
```

---

## 18. Comparaison avant / après

| Contrôle | État initial | État renforcé proposé | Statut |
|---|---|---|---|
| Utilisateur DB | Administratif | Compte dédié | Préparé |
| Mot de passe DB | Vide / faible | Valeur forte | Préparé |
| Clés WordPress | Valeurs d'exemple | Valeurs uniques | Préparé |
| Éditeur de fichiers | Activé | Désactivé | Simulé validé |
| HTTPS administration | Non imposé | Imposé | À valider |
| Protection connexion | Absente | Limitation | Simulé validé |
| Énumération utilisateurs | Publique | Restreinte | Simulé validé |
| Divulgation de version | Visible | Réduite | Simulé validé |
| Téléversements dangereux | Non contrôlés | Restreints | Simulé validé |
| Mises à jour | Versions anciennes | Plan de mise à jour | Planifié |
| Intégrité | Non vérifiée | Contrôles préparés | Simulé validé |
| Scan dynamique | Non démontré | Contre-audit externe | En attente |

### Niveaux de vérité

```text
DÉVELOPPÉ
La mesure existe dans un artefact ou un module.

PRÉPARÉ
La configuration ou la procédure est fournie, mais son déploiement n'est pas prouvé.

SIMULÉ VALIDÉ
Le scénario local considère le contrôle comme réussi.

VÉRIFIÉ SUR CIBLE
Une preuve démontre l'application dans l'environnement évalué.
```

La démo ne doit pas utiliser **Vérifié sur cible**, car aucune cible réelle n'est évaluée.

---

## 19. Timeline de l'assessment

```text
10:03:14 Projet chargé
10:03:18 Inventaire démarré
10:03:21 WordPress détecté
10:03:22 17 extensions identifiées
10:03:27 Audit statique démarré
10:03:31 10 constats générés
10:03:45 Qualification des risques terminée
10:04:20 Simulation de remédiation démarrée
10:04:28 Contrôles de durcissement appliqués dans la simulation
10:04:40 Validation simulée terminée
```

Les timestamps sont générés localement et n'ont aucune valeur probante sur un système réel.

---

## 20. Panneau de preuve

Pour chaque constat :

```text
Preuve
wp-config.php fictif

Source
Instantané hors ligne

Confiance
Élevée

Validation runtime
Requise / Non requise

Limitation
Résultat de démonstration uniquement
```

Ne jamais afficher de vraie valeur de mot de passe, de clé ou de secret.

---

## 21. Rapport final

### Résumé

```text
RAPPORT D'ÉVALUATION DE SÉCURITÉ

Projet
DemoCommerce Portal

Assessment
DEMO-2026-001

Mode
Simulation hors ligne

Constats
10

Critiques
2

Élevés
3
```

### Résumé des remédiations

```text
Actions de remédiation      10
Préparées                    4
Appliquées dans la simulation 6
À valider sur la cible       4
```

### Risque résiduel

```text
Posture initiale simulée     Risque élevé
Posture projetée simulée     Risque moyen / faible
Risque résiduel              Moyen
```

Le risque résiduel ne doit jamais devenir artificiellement nul.

### Export PDF optionnel

Bouton :

```text
Générer le rapport de démo
```

Le PDF local peut contenir :

1. les informations du projet ;
2. l'inventaire ;
3. les constats ;
4. la qualification des risques ;
5. les remédiations ;
6. les résultats de validation ;
7. la comparaison avant / après ;
8. le risque résiduel ;
9. le disclaimer.

Disclaimer obligatoire :

```text
Ce rapport a été généré à partir d'un environnement hors ligne simulé.
Aucun serveur de production, aucune infrastructure cliente, aucun endpoint externe
et aucune instance WordPress réelle n'ont été évalués.
```

---

## 22. Mode de présentation guidée

Bouton :

```text
Démarrer la démo guidée
```

Étapes :

```text
1. Lancer l'inventaire
2. Lancer l'audit statique
3. Ouvrir un constat critique
4. Appliquer une remédiation simulée
5. Activer des contrôles de durcissement
6. Lancer la validation
7. Examiner la comparaison avant / après
8. Générer le rapport
```

Le mode guidé doit réduire les risques d'erreur pendant la soutenance et rester réinitialisable.

---

## 23. Paramètres de démonstration

```text
Scénario                 Standard Security Assessment
Durée des simulations    3 secondes
Validation automatique   Activée
Explications pédagogiques Activées
```

Actions :

```text
Réinitialiser la démo
Réinitialiser toutes les données locales
```

La réinitialisation doit restaurer l'état initial du scénario fictif.

---

## 24. Modèle de données local

Les compteurs, statuts et graphiques doivent être dérivés des données locales afin de rester cohérents.

### project.json

```json
{
  "id": "DEMO-2026-001",
  "name": "DemoCommerce Portal",
  "environment": "offline_snapshot",
  "cms": "WordPress",
  "version": "6.4.3",
  "mode": "simulation"
}
```

### components.json

Contient le noyau, les thèmes, les extensions, le composant Info Cards et les fichiers de configuration fictifs.

### findings.json

```json
{
  "id": "F-001",
  "title": "Compte de base administratif",
  "severity": "critical",
  "confidence": "high",
  "evidence": "wp-config.php fictif",
  "exposure": "not_confirmed",
  "status": "remediation_prepared",
  "recommendation": "Utiliser un compte de base dédié à l'application."
}
```

### remediations.json

```json
{
  "findingId": "F-001",
  "before": {
    "dbUser": "root"
  },
  "after": {
    "dbUser": "demo_wp_app"
  },
  "status": "prepared"
}
```

### tests.json

Contient les tests fonctionnels, les contrôles de durcissement, les contrôles d'intégrité et les contrôles de contre-vérification.

---

## 25. Moteur de simulation

Créer un service local nommé `SimulationEngine`.

Responsabilités :

```text
runInventory()
runStaticAudit()
qualifyFindings()
applyRemediation(findingId)
runValidation()
generateReport()
resetDemo()
```

Chaque action doit :

1. modifier l'état local ;
2. afficher une progression courte ;
3. retourner des données prédéfinies ;
4. ajouter un événement dans la timeline ;
5. ne déclencher aucun appel réseau ou système.

---

## 26. Persistance

Utiliser `localStorage` pour conserver :

- l'étape courante ;
- les remédiations simulées ;
- les contrôles activés ;
- les tests exécutés ;
- les événements de timeline.

Le bouton **Reset Demo** doit supprimer uniquement les données locales de l'application et restaurer le scénario initial.

---

## 27. Design UI

### Direction visuelle

Application professionnelle de cybersécurité, sobre et lisible.

Préférer :

- fond blanc ou gris très clair ;
- sidebar sombre ;
- bleu nuit comme couleur principale ;
- vert pour les résultats PASS ;
- orange pour les risques moyens ;
- rouge uniquement pour les risques critiques ;
- cartes et tableaux simples ;
- explications courtes et pédagogiques ;
- contraste adapté à un vidéoprojecteur.

Éviter :

- esthétique hacker cliché ;
- effet matrice ;
- crânes et icônes agressives ;
- rouge omniprésent ;
- animations longues ;
- terminal affiché comme élément principal.

### Composants UI

```text
Sidebar
TopBar
DemoBadge
ConfidentialityBanner
ProjectHeader
WorkflowStepper
MetricCard
SeverityBadge
StatusBadge
FindingTable
FindingDrawer
RiskMatrix
BeforeAfterDiff
RemediationCard
HardeningControl
TestResultCard
Timeline
SecurityScore
ReportSummary
ResetDemoDialog
GuidedDemoOverlay
```

---

## 28. Stack technique

### Choix MVP

```text
Frontend           Next.js
UI                 React
Langage            TypeScript
Style              Tailwind CSS
Icônes             Lucide
Graphiques         Recharts
État               React state + localStorage
Backend            Aucun
Base de données    Aucune
API externe        Aucune
```

L'application doit pouvoir fonctionner localement sans Internet pendant la soutenance.

Le rapport PDF est optionnel pour le MVP et peut être ajouté avec un générateur local côté navigateur ou côté runtime local, sans service distant.

---

## 29. Structure de projet cible

```text
securepress-demo/
|
|- app/
|  |- page.tsx
|  |- inventory/
|  |- audit/
|  |- findings/
|  |- qualification/
|  |- remediation/
|  |- hardening/
|  |- validation/
|  |- comparison/
|  |- report/
|  `- settings/
|
|- components/
|  |- layout/
|  |- dashboard/
|  |- inventory/
|  |- findings/
|  |- remediation/
|  |- validation/
|  `- ui/
|
|- data/
|  |- project.json
|  |- components.json
|  |- findings.json
|  |- remediations.json
|  `- tests.json
|
|- lib/
|  |- simulation-engine.ts
|  |- scoring.ts
|  |- storage.ts
|  `- report-generator.ts
|
`- public/
```

---

## 30. Priorités de réalisation

### MUST HAVE - MVP

- layout général ;
- badge et bannière DEMO MODE ;
- dashboard ;
- inventaire ;
- audit statique ;
- liste et détail des constats ;
- qualification des risques ;
- remédiation avant / après ;
- contrôles de durcissement ;
- validation ;
- comparaison ;
- réinitialisation de la démo.

### SHOULD HAVE

- timeline ;
- score de sécurité simulé ;
- recherche et filtres ;
- rapport PDF local ;
- interface responsive ;
- mode de présentation guidée.

### NICE TO HAVE

- aperçu visuel du site public fictif ;
- diagramme d'architecture animé ;
- mode sombre ;
- export JSON ;
- scénarios de démo supplémentaires.

---

## 31. Scénario de soutenance cible

Durée : **4 à 6 minutes**.

### Introduction

```text
Cette interface est une démonstration locale construite pour reproduire le workflow
de mon projet de stage sans utiliser l'environnement confidentiel de l'entreprise.
```

### Déroulé

1. ouvrir la vue d'ensemble ;
2. lancer l'inventaire ;
3. expliquer que la présence d'une extension ne prouve pas son activation en production ;
4. lancer l'audit statique ;
5. ouvrir le constat critique lié au compte de base de données ;
6. expliquer la preuve, la sévérité, la confiance et l'exposition ;
7. afficher l'état initial et l'état renforcé proposé ;
8. appliquer la correction dans la simulation ;
9. activer quelques contrôles de durcissement ;
10. lancer la validation ;
11. afficher la comparaison avant / après ;
12. terminer par le rapport et le statut « contre-audit dynamique non exécuté ».

### Phrase de conclusion

```text
La plateforme distingue ce qui a été constaté, préparé, développé, simulé et ce qui
nécessite encore une validation dans l'environnement cible.
```

---

## 32. Questions probables du jury

### Est-ce la vraie solution utilisée en entreprise ?

```text
Non. L'environnement réel et les développements du stage sont confidentiels.
Cette application est une reproduction fonctionnelle locale qui reprend la démarche
et les principes du projet avec des données fictives.
```

### Les scans sont-ils réels ?

```text
Non. Les résultats sont simulés pour garantir une démonstration reproductible,
hors ligne et sans action intrusive.
```

### Pourquoi ne pas utiliser WPScan ou Nuclei en direct ?

```text
La démonstration doit rester reproductible et sans risque de toucher une cible non
autorisée. Elle se concentre donc sur la méthode d'analyse et de remédiation.
```

### Une version ancienne signifie-t-elle forcément qu'elle est vulnérable ?

```text
Non. L'exploitabilité dépend notamment de l'activation du composant, de sa configuration
et de son exposition réelle.
```

### Pourquoi un audit statique ne suffit-il pas ?

```text
Il détecte des configurations et composants à risque, mais TLS, les headers HTTP,
l'exposition réseau et l'exploitabilité réelle nécessitent une validation dynamique
dans un environnement autorisé.
```

### Pourquoi tester après une remédiation ?

```text
Une correction de sécurité peut provoquer une régression fonctionnelle. Les tests
vérifient que le risque est réduit sans dégrader le fonctionnement du site.
```

---

## 33. Tests de préparation

Avant la soutenance :

- lancer la démo au moins 10 fois ;
- vérifier le bouton Reset Demo ;
- vérifier tous les boutons et transitions ;
- vérifier la cohérence des compteurs ;
- vérifier les statuts de chaque finding ;
- vérifier le fonctionnement sans Internet ;
- tester en plein écran ;
- tester la résolution du vidéoprojecteur ;
- vérifier le rapport généré ;
- vérifier l'absence de données réelles ;
- vérifier que le badge DEMO MODE reste visible ;
- effectuer une démonstration complète en moins de 6 minutes.

### Plan B jour J

Préparer :

1. l'application locale ;
2. un build local de secours ;
3. des captures des écrans principaux ;
4. une vidéo courte de la démo ;
5. le rapport PDF généré ;
6. une copie du projet sur clé USB.

---

## 34. Critères d'acceptation

La version MVP est acceptée lorsque :

- le workflow complet peut être exécuté en moins de 6 minutes ;
- toutes les données affichées sont fictives ;
- aucune action réseau ou serveur réel n'est exécutée ;
- le badge DEMO MODE est visible en permanence ;
- le jury comprend le principe sans lire le code ;
- la différence entre présence, activation et exploitabilité est claire ;
- chaque finding est relié à une remédiation ;
- chaque remédiation est reliée à des tests ;
- la comparaison avant / après est lisible ;
- le rapport final correspond à l'état de l'application ;
- la distinction entre préparé, simulé validé et vérifié sur cible est explicite ;
- le bouton Reset permet de recommencer immédiatement.

---

## 35. Roadmap

### Sprint 1 - Core Demo

```text
Layout
Dashboard
Inventory
Static Audit
Findings
Remediation
Validation
```

Objectif : disposer rapidement d'un scénario complet et présentable.

### Sprint 2 - Quality

```text
Risk qualification
Before / After
Charts
Timeline
Filters
Responsive UI
```

### Sprint 3 - Soutenance Ready

```text
Guided Demo
PDF Report
Reset robust
Animations courtes
Vérification de cohérence des données
Build hors ligne
```

---

## 36. Décision finale

Le projet à construire est :

```text
SecurePress Audit Lab
Une application web locale de démonstration
qui contient un WordPress fictif,
simule son audit de sécurité,
présente des mesures de durcissement,
et compare l'état initial à l'état renforcé.
```

Garanties :

```text
100 % local
100 % données fictives
0 connexion de production
0 scan réseau
0 attaque
0 modification d'un vrai WordPress
0 dépendance Internet pendant la démo
```

Cette spécification constitue la base de conception pour commencer l'implémentation écran par écran.
