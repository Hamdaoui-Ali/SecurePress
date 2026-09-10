# SecurePress Operations Workspace

Date : 10 septembre 2026<br>
Statut : direction approuvée, spécification en revue

## Décision

SecurePress évolue d’une interface explicitement présentée comme une démo vers un **workspace local d’opérations de sécurité**. L’expérience doit ressembler à une plateforme d’audit utilisée sur un projet réel : exécutions en cours, étapes de traitement, compteurs, horodatages, journaux et résultats persistants.

Le produit ne prétendra toutefois pas avoir modifié un serveur WordPress réel. La portée sera indiquée discrètement par un indicateur de contexte du type `Source : TELCO workspace package` et par des mentions ciblées comme `Validation cible requise` lorsque la preuve dépasse le workspace local.

## Objectifs

- Retirer les formulations qui exposent inutilement le caractère pédagogique ou simulé de chaque écran.
- Donner à chaque action principale un cycle `queued → running → completed` visible.
- Afficher des messages de traitement crédibles : fichiers parcourus, contrôles analysés, constats consolidés, changements préparés et validations exécutées.
- Conserver la cohérence du score `42 → 82`, de la persistance, du reset et du parcours guidé.
- Rendre les actions de remédiation lisibles comme des **change sets** appliqués au workspace, sans revendiquer une modification distante.

## Hors périmètre

- Aucun connecteur WordPress réel, compte administrateur, secret ou appel réseau.
- Aucun changement de sécurité sur une cible distante.
- Aucun faux résultat présenté comme une preuve dynamique.
- Pas de refonte graphique complète : la densité dashboard, la navigation et les écrans existants sont conservés.

## Expérience cible

### Coque produit

La top bar affiche le projet, le périmètre (`TELCO workspace`), l’état de connexion (`Workspace ready`) et la dernière exécution. La bannière actuelle très démonstrative devient un panneau compact de contexte et de provenance.

### Exécutions

L’inventaire, l’audit, la campagne de validation et les contrôles de durcissement utilisent un panneau d’activité commun. Pendant l’exécution, le bouton est désactivé, le panneau expose la phase courante, le pourcentage, un compteur d’éléments et le temps écoulé. À la fin, l’interface affiche une réussite, la durée et les métriques produites.

Le moteur reste déterministe et local, mais expose plusieurs étapes temporelles courtes au lieu d’un seul délai opaque. Les tests attendent les états rendus et ne dépendent pas de sleeps fixes.

### Remédiation

Chaque carte utilise le vocabulaire `Change set`, `Ready to apply`, `Applied`, `Target verification required`. Après application, elle affiche le nombre de contrôles concernés, la date d’exécution et une trace dans l’activité. Le texte `Aucune configuration réelle n’a été modifiée` est supprimé de la surface principale ; la limite de portée reste accessible dans le contexte du workspace et le rapport.

### Contenu

Les libellés visibles deviennent notamment :

| Actuel | Cible |
|---|---|
| Démo / démonstration | Workspace / session d’analyse |
| Inventaire simulé | Discovery run |
| Audit statique simulé | Finding analysis |
| Validation simulée | Control campaign |
| Appliquer dans la simulation | Apply change set |
| Indice pédagogique simulé | Security posture score |
| Appliqué dans la simulation | Change set applied |

Les textes de rapport conservent la distinction entre source locale et validation cible, mais l’avertissement est regroupé dans la provenance et les limites plutôt que répété dans chaque bouton.

## Modèle de données proposé

Ajouter un état d’exécution sérialisable et versionné :

```ts
type OperationKind = 'discovery' | 'analysis' | 'change-set' | 'controls'
type OperationStatus = 'idle' | 'running' | 'completed' | 'failed'

interface OperationRun {
  id: string
  kind: OperationKind
  status: OperationStatus
  startedAt: string
  completedAt?: string
  message: string
  currentStep?: string
  processed?: number
  total?: number
  durationMs?: number
}
```

L’état courant d’exécution reste éphémère pendant le traitement ; le dernier run terminé et les entrées de timeline sont persistés avec l’assessment. Les IDs de findings et les transitions existantes restent la source de vérité métier.

## Composants et interfaces

- `AssessmentProvider` expose l’opération courante, le dernier run et un journal de phases.
- `simulation-engine` fournit des mises à jour structurées, une durée mesurée et des résultats déterministes.
- `OperationProgress` rend le statut, la phase, le compteur et la durée de façon réutilisable.
- `DemoBanner` devient `WorkspaceContextBar` sans changer la coque de navigation.
- Les pages consomment le même modèle : aucune page ne fabrique un statut ou une durée indépendamment.
- `StatusBadge` garde un libellé textuel et ne dépend jamais de la couleur seule.

## Gestion des erreurs et répétitions

Une opération en cours bloque seulement l’action concurrente concernée. Une relance crée un nouveau run et conserve l’historique précédent. Une erreur affiche la phase échouée, conserve les résultats déjà acquis si cela est sûr et permet une relance. Les remédiations restent idempotentes.

## Vérification

- Tests unitaires : séquences de phases, durée, persistence du dernier run, relance et reset.
- Tests de composants : nouveau vocabulaire, compteur de traitement, état `running`, état `completed`, change set appliqué.
- E2E : inventory → analysis → finding → change set → controls → report, avec preuve visible de chaque transition.
- Responsive : 1440×900, 1024×768 et 390×844.
- Console sans erreur, aucun hôte externe, build et audit offline conservés.

## Critères d’acceptation

1. Un nouvel utilisateur perçoit une plateforme d’analyse opérationnelle dès la première vue.
2. Chaque action principale montre un traitement observable pendant au moins plusieurs étapes UI.
3. Les résultats, timestamps et métriques proviennent du même état partagé.
4. La phrase `Aucune configuration réelle n’a été modifiée` n’apparaît plus dans les cartes de remédiation.
5. La provenance locale et les validations cible requises restent compréhensibles sans dominer l’interface.
6. Les tests existants et les nouveaux tests passent sans appel réseau.
