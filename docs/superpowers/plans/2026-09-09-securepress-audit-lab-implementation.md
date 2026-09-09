# SecurePress Audit Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une application React locale, fiable et présentable en moins de six minutes, qui reproduit le workflow d'audit et de remédiation WordPress décrit dans le rapport TELCO sans appeler de système réel.

**Architecture:** Une application monopage Vite utilise des données TypeScript immuables, un moteur de simulation déterministe et un état persistant dans `localStorage`. Les six étapes de la soutenance consomment le même état afin que les compteurs, statuts, graphiques, comparaisons et résultats restent cohérents.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, React Router, Lucide, Recharts, Zod, Vitest, Testing Library, Playwright et `localStorage`.

**Spec:** `docs/superpowers/specs/2026-09-09-securepress-audit-lab-design.md`

## Global Constraints

- L'interface et les messages destinés au jury sont en français.
- Le projet applicatif réside dans `securepress-demo/` ; le rapport et les documents restent à la racine du workspace.
- Node.js doit satisfaire le minimum courant de Vite : `20.19+` ou `22.12+`. Utiliser de préférence une version LTS supportée.
- Le build ne contient aucun backend, aucune base de données, aucune API externe, aucun CDN, aucune police distante et aucune télémétrie.
- Les données reprennent TELCO, WordPress 6.4.3, Astra 4.6.3, WooCommerce 8.4.0, quatre thèmes et dix-sept extensions.
- Info Cards 1.0.2 est une extension tierce analysée ; `telco-security-hardening.php` est la contribution technique de sécurité mise en avant.
- Une réussite simulée ne devient jamais `Vérifié sur cible`.
- Le badge `MODE DÉMO` et le message indiquant l'absence de connexion réelle restent visibles sur tous les écrans.
- Tous les compteurs et l'indice 42 → 82 sont dérivés des données et de l'état ; aucune valeur agrégée n'est copiée dans plusieurs composants.
- Chaque constat possède séparément un état de preuve, un état de remédiation et un état de validation.
- Le contre-audit dynamique externe reste `NON EXÉCUTÉ` dans tous les scénarios.
- `npm run check` doit exécuter le typage, les tests unitaires et le build avant chaque livraison.
- Les commits proposés dans ce plan supposent que DYX-001 a initialisé Git à la racine du workspace.

## Definition of Done globale

Le projet est prêt à présenter lorsque :

- les tâches DYX-001 à DYX-017 sont terminées ;
- `npm run check` et `npm run e2e` réussissent ;
- le parcours guidé complet dure moins de six minutes ;
- le build fonctionne après coupure d'Internet ;
- le reset restaure exactement l'état initial ;
- une copie du build, les captures, la vidéo et le guide de lancement sont disponibles dans `presentation-kit/`.

## Carte des fichiers

```text
SecurePress/
|- Rapport-PFE-LNET.pdf
|- SecurePress_Audit_Lab_Project_Spec.md
|- docs/superpowers/
|  |- specs/2026-09-09-securepress-audit-lab-design.md
|  `- plans/2026-09-09-securepress-audit-lab-implementation.md
|- securepress-demo/
|  |- src/
|  |  |- app/                 # routeur, provider et coque principale
|  |  |- components/          # composants visuels regroupés par fonctionnalité
|  |  |- data/                # scénario TELCO immuable
|  |  |- domain/              # types, schémas et sélecteurs purs
|  |  |- features/            # six étapes de la démonstration
|  |  |- services/            # moteur de simulation et stockage
|  |  |- test/                # configuration et utilitaires de tests
|  |  `- styles/              # tokens visuels et impression
|  |- e2e/                    # tests Playwright
|  |- public/                 # images et icônes locales
|  |- playwright.config.ts
|  |- vite.config.ts
|  `- package.json
`- presentation-kit/
   |- README-LANCEMENT.md
   |- CHECKLIST-JOUR-J.md
   |- SCRIPT-SOUTENANCE.md
   |- captures/
   |- video/
   `- build/
```

## Vue du backlog

| ID | Livrable vérifiable | Dépend de |
|---|---|---|
| DYX-001 | Projet Vite, Git et commandes qualité | - |
| DYX-002 | Harnais Vitest, Testing Library et Playwright | DYX-001 |
| DYX-003 | Modèle de domaine et données TELCO validées | DYX-002 |
| DYX-004 | Sélecteurs et calcul exact de posture | DYX-003 |
| DYX-005 | Stockage local versionné et reset | DYX-003 |
| DYX-006 | Moteur de simulation et transitions | DYX-004, DYX-005 |
| DYX-007 | Coque, navigation et identité visuelle | DYX-006 |
| DYX-008 | Vue d'ensemble | DYX-007 |
| DYX-009 | Inventaire simulé | DYX-007 |
| DYX-010 | Audit, filtres et détail d'un constat | DYX-007, DYX-009 |
| DYX-011 | Centre de remédiation avant/après | DYX-010 |
| DYX-012 | Durcissement et validation | DYX-011 |
| DYX-013 | Comparaison, timeline et rapport imprimable | DYX-012 |
| DYX-014 | Démo guidée et réinitialisation globale | DYX-008 à DYX-013 |
| DYX-015 | Accessibilité, responsive et projection | DYX-014 |
| DYX-016 | Recette E2E, hors ligne et build final | DYX-015 |
| DYX-017 | Kit de soutenance et répétition générale | DYX-016 |

---

### Task DYX-001: Fondation reproductible du projet

**Goal:** Obtenir un projet React TypeScript exécutable, versionné et doté d'une commande qualité unique.

**Dependencies:** Aucune.

**Files:**
- Create: `.gitignore`
- Create: `securepress-demo/` avec le template Vite React TypeScript
- Modify: `securepress-demo/package.json`
- Modify: `securepress-demo/vite.config.ts`
- Create: `securepress-demo/src/styles/app.css`

**Interfaces:**
- Consumes: Node.js et npm disponibles dans PowerShell.
- Produces: commandes `npm run dev`, `npm run build`, `npm run typecheck`, `npm run test`, `npm run e2e`, `npm run check` et `npm run present`.

**Action:** Initialiser le dépôt, créer l'application et verrouiller les dépendances.

**Why:** Toutes les tâches suivantes ont besoin d'une base reproductible et d'une porte qualité commune.

- [ ] **Step 1: Vérifier les prérequis**

```powershell
node --version
npm --version
```

Expected: Node affiche au minimum `v20.19.0` ou `v22.12.0`.

- [ ] **Step 2: Initialiser Git à la racine si nécessaire**

```powershell
git init
git branch -M main
```

Expected: `git status --short --branch` affiche la branche `main`.

- [ ] **Step 3: Créer le projet Vite sans prompt interactif**

```powershell
npm create vite@latest securepress-demo -- --template react-ts --no-interactive
Set-Location securepress-demo
npm install
```

Expected: `securepress-demo/package.json` existe et `npm run dev -- --host 127.0.0.1` démarre l'application.

- [ ] **Step 4: Définir les exclusions Git**

Créer `.gitignore` à la racine :

```gitignore
securepress-demo/node_modules/
securepress-demo/dist/
securepress-demo/coverage/
securepress-demo/playwright-report/
securepress-demo/test-results/
*.log
.DS_Store
Thumbs.db
```

- [ ] **Step 5: Installer les dépendances applicatives**

```powershell
npm install react-router lucide-react recharts zod clsx
npm install -D tailwindcss @tailwindcss/vite
```

Expected: les paquets figurent dans `package.json` et `package-lock.json`.

- [ ] **Step 6: Configurer Vite et Tailwind**

Utiliser cette base dans `vite.config.ts` :

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
```

Créer `src/styles/app.css` :

```css
@import "tailwindcss";

:root {
  color: #13213c;
  background: #f4f7fb;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

Importer ce fichier depuis `src/main.tsx`.

- [ ] **Step 7: Ajouter les scripts de qualité**

Ajouter à `package.json` :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "check": "npm run typecheck && npm run test && npm run build",
    "present": "vite preview --host 127.0.0.1 --port 4173 --strictPort"
  }
}
```

- [ ] **Step 8: Vérifier le build initial**

```powershell
npm run typecheck
npm run build
```

Expected: les deux commandes sortent avec le code `0` et `dist/index.html` existe.

- [ ] **Step 9: Commit**

```powershell
Set-Location ..
git add .gitignore securepress-demo docs
git commit -m "chore: scaffold SecurePress demo"
```

**Verification:** `git status --short` ne montre aucun fichier de la tâche non suivi.

**Expected result:** Le projet vide se lance, se construit et peut être servi localement.

---

### Task DYX-002: Harnais de tests automatisés

**Goal:** Installer les tests unitaires, les tests de composants et un premier test navigateur.

**Dependencies:** DYX-001.

**Files:**
- Modify: `securepress-demo/vite.config.ts`
- Modify: `securepress-demo/package.json`
- Create: `securepress-demo/src/test/setup.ts`
- Create: `securepress-demo/src/test/render.tsx`
- Create: `securepress-demo/src/app/App.smoke.test.tsx`
- Create: `securepress-demo/playwright.config.ts`
- Create: `securepress-demo/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: scripts de DYX-001.
- Produces: environnement JSDOM, matchers DOM et serveur Playwright sur le port 4173.

**Action:** Configurer Vitest, Testing Library et Playwright Chromium.

**Why:** Chaque fonctionnalité suivante doit commencer par un test en échec et finir par une preuve automatisée.

- [ ] **Step 1: Installer les dépendances de test**

```powershell
Set-Location securepress-demo
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Ajouter la configuration Vitest**

Mettre `defineConfig` depuis `vitest/config` et ajouter :

```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
}
```

- [ ] **Step 3: Créer le setup de test**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Écrire le smoke test en échec**

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('affiche le nom du laboratoire', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /SecurePress Audit Lab/i })).toBeInTheDocument()
})
```

Run: `npm test -- src/app/App.smoke.test.tsx`  
Expected: FAIL tant que `App` n'affiche pas le titre.

- [ ] **Step 5: Faire passer le smoke test avec le titre minimal**

```tsx
export default function App() {
  return <h1>SecurePress Audit Lab</h1>
}
```

Run: `npm test -- src/app/App.smoke.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Configurer Playwright**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npm run present',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- [ ] **Step 7: Créer et exécuter le premier test E2E**

```ts
import { expect, test } from '@playwright/test'

test('ouvre la démo locale', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /SecurePress Audit Lab/i })).toBeVisible()
})
```

Run: `npm run e2e -- e2e/smoke.spec.ts`  
Expected: PASS sur Chromium.

- [ ] **Step 8: Commit**

```powershell
Set-Location ..
git add securepress-demo
git commit -m "test: add unit and browser test harness"
```

**Verification:** `npm test` et `npm run e2e -- e2e/smoke.spec.ts` réussissent.

**Expected result:** Toute tâche future peut prouver son comportement par test.

---

### Task DYX-003: Modèle de domaine et scénario TELCO

**Goal:** Centraliser les informations du rapport dans des données typées et validées au démarrage.

**Dependencies:** DYX-002.

**Files:**
- Create: `securepress-demo/src/domain/models.ts`
- Create: `securepress-demo/src/domain/schema.ts`
- Create: `securepress-demo/src/data/project.ts`
- Create: `securepress-demo/src/data/components.ts`
- Create: `securepress-demo/src/data/findings.ts`
- Create: `securepress-demo/src/data/remediations.ts`
- Create: `securepress-demo/src/data/validation-checks.ts`
- Create: `securepress-demo/src/data/scenario.ts`
- Test: `securepress-demo/src/data/scenario.test.ts`

**Interfaces:**
- Consumes: Zod.
- Produces: `Scenario`, `Finding`, `Remediation`, `ValidationCheck`, `ComponentRecord` et constante `telcoScenario`.

**Action:** Définir les types, saisir les dix constats et valider les relations.

**Why:** Une source unique évite les incohérences de compteurs et de statuts entre écrans.

- [ ] **Step 1: Écrire le test de cohérence en échec**

```ts
import { describe, expect, test } from 'vitest'
import { telcoScenario } from './scenario'

describe('TELCO scenario', () => {
  test('contient le périmètre attendu', () => {
    expect(telcoScenario.project.wordpressVersion).toBe('6.4.3')
    expect(telcoScenario.inventory.pluginCount).toBe(17)
    expect(telcoScenario.inventory.themeCount).toBe(4)
    expect(telcoScenario.findings).toHaveLength(10)
  })

  test('relie chaque constat à une remédiation et une validation', () => {
    for (const finding of telcoScenario.findings) {
      expect(telcoScenario.remediations.some((item) => item.id === finding.remediationId && item.findingId === finding.id)).toBe(true)
      expect(finding.validationIds.every((id) => telcoScenario.validationChecks.some((item) => item.id === id))).toBe(true)
    }
  })
})
```

Run: `npm test -- src/data/scenario.test.ts`  
Expected: FAIL avec module `./scenario` introuvable.

- [ ] **Step 2: Définir les unions de statut**

```ts
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'variable'
export type Confidence = 'high' | 'medium' | 'low'
export type EvidenceStatus = 'observed_in_snapshot' | 'documented_in_audit' | 'not_observable_offline'
export type RemediationStatus = 'not_started' | 'recommended' | 'prepared' | 'developed' | 'applied_in_simulation'
export type ValidationStatus = 'not_run' | 'simulated_pass' | 'simulated_fail' | 'target_validation_required' | 'dynamic_retest_not_executed'
export type WorkflowStage = 'overview' | 'inventory' | 'audit' | 'remediation' | 'validation' | 'report'
```

- [ ] **Step 3: Définir les interfaces du domaine et l'état initial**

```ts
export interface Finding {
  id: `F-${string}`
  title: string
  severity: Severity
  riskPoints: number
  confidence: Confidence
  evidence: string
  evidenceStatus: EvidenceStatus
  exposure: string
  impact: string
  recommendation: string
  remediationId: string
  validationIds: string[]
  sourceNote: string
}

export interface ComponentRecord {
  id: string
  name: string
  type: 'core' | 'theme' | 'plugin'
  version: string | null
  presence: 'confirmed_in_files'
  activation: 'confirmed' | 'unknown'
  sourceNote: string
}

export interface Remediation {
  id: string
  findingId: Finding['id']
  title: string
  before: string
  after: string
  rationale: string
  artifact: string
  initialStatus: RemediationStatus
}

export interface ValidationCheck {
  id: string
  title: string
  category: 'functional' | 'hardening' | 'integrity' | 'regression' | 'retest'
  expectedResult: string
  initialStatus: ValidationStatus
}

export interface Scenario {
  project: { id: 'TELCO-AUDIT-2026'; name: 'TELCO'; wordpressVersion: '6.4.3' }
  inventory: { pluginCount: 17; themeCount: 4; components: ComponentRecord[] }
  findings: Finding[]
  remediations: Remediation[]
  validationChecks: ValidationCheck[]
}

export interface TimelineEvent {
  id: string
  timestamp: string
  label: string
}

export interface AssessmentState {
  stage: WorkflowStage
  inventoryCompleted: boolean
  auditCompleted: boolean
  visibleFindingIds: Finding['id'][]
  appliedFindingIds: Finding['id'][]
  completedHardeningCheckIds: string[]
  validationResults: Record<string, ValidationStatus>
  timeline: TimelineEvent[]
  guidedStep: number | null
}

export function createInitialAssessment(): AssessmentState {
  return {
    stage: 'overview', inventoryCompleted: false, auditCompleted: false,
    visibleFindingIds: [], appliedFindingIds: [], completedHardeningCheckIds: [],
    validationResults: {}, timeline: [], guidedStep: null,
  }
}
```

- [ ] **Step 4: Saisir les dix constats avec les points exacts**

Utiliser ce mapping :

```ts
const riskPoints = {
  'F-001': 12, 'F-002': 12, 'F-003': 6, 'F-004': 3, 'F-005': 5,
  'F-006': 5, 'F-007': 3, 'F-008': 6, 'F-009': 4, 'F-010': 2,
} as const
```

Utiliser ce mapping complet :

| ID | Titre | Sévérité | Preuve | Points | Remédiation | Validation principale |
|---|---|---|---|---:|---|---|
| F-001 | Compte de base de données `root` | critical | observed_in_snapshot | 12 | R-001 | V-DB-ACCOUNT |
| F-002 | Mot de passe de base vide | critical | observed_in_snapshot | 12 | R-002 | V-DB-PASSWORD |
| F-003 | Clés et sels WordPress d'exemple | high | observed_in_snapshot | 6 | R-003 | V-WP-SALTS |
| F-004 | Éditeur de fichiers non désactivé | medium | observed_in_snapshot | 3 | R-004 | V-FILE-EDITOR |
| F-005 | HTTPS d'administration non imposé | high | not_observable_offline | 5 | R-005 | V-HTTPS-TARGET |
| F-006 | Versions nécessitant une revue | variable | observed_in_snapshot | 5 | R-006 | V-COMPONENT-VERSIONS |
| F-007 | Restriction XML-RPC non démontrée | medium | not_observable_offline | 3 | R-007 | V-XMLRPC-TARGET |
| F-008 | Protection de sauvegarde à confirmer | high | documented_in_audit | 6 | R-008 | V-BACKUP-TARGET |
| F-009 | Permissions potentiellement trop larges | medium | documented_in_audit | 4 | R-009 | V-PERMISSIONS |
| F-010 | Modération des commentaires à revoir | low | documented_in_audit | 2 | R-010 | V-COMMENTS |

Les remédiations associées sont : `root → telco_app`, mot de passe vide → valeur forte masquée, clés d'exemple → valeurs uniques masquées, éditeur actif → `DISALLOW_FILE_EDIT`, HTTPS non imposé → `FORCE_SSL_ADMIN` avec validation cible, versions présentes → plan WP-CLI non exécuté, XML-RPC non démontré → restriction proposée avec validation cible, sauvegarde non confirmée → stockage hors répertoire public, permissions à revoir → répertoires 755/fichiers 644/`wp-config.php` 640, commentaires ouverts → modération et inscription requise.

- [ ] **Step 5: Saisir l'inventaire sans inventer les noms absents du rapport**

Créer les entrées nommées pour WordPress, Astra, WooCommerce, Spectra, Essential Blocks, Depicter, Smart Slider 3, Carousel Slider, Editor Plus, Super Block Slider, Variation Swatches, Cart Abandonment Recovery, Akismet, Starter Templates et Info Cards.

Compléter les quantités avec `Thème inventorié non détaillé 02` à `04` et `Extension inventoriée non détaillée 14` à `17`, accompagnés de la note `Nom non détaillé dans le rapport`. Le total dérivé doit rester quatre thèmes et dix-sept extensions.

- [ ] **Step 6: Ajouter les schémas Zod et valider au chargement**

Définir d'abord les schémas référencés :

```ts
export const FindingSchema = z.object({
  id: z.string().regex(/^F-\d{3}$/),
  title: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'variable']),
  riskPoints: z.number().int().positive(),
  confidence: z.enum(['high', 'medium', 'low']),
  evidence: z.string().min(1),
  evidenceStatus: z.enum(['observed_in_snapshot', 'documented_in_audit', 'not_observable_offline']),
  exposure: z.string().min(1), impact: z.string().min(1), recommendation: z.string().min(1),
  remediationId: z.string().regex(/^R-\d{3}$/),
  validationIds: z.array(z.string().min(1)).min(1),
  sourceNote: z.string().min(1),
})

export const RemediationSchema = z.object({
  id: z.string().regex(/^R-\d{3}$/), findingId: z.string().regex(/^F-\d{3}$/),
  title: z.string().min(1), before: z.string().min(1), after: z.string().min(1),
  rationale: z.string().min(1), artifact: z.string().min(1),
  initialStatus: z.enum(['not_started', 'recommended', 'prepared', 'developed', 'applied_in_simulation']),
})

export const ValidationCheckSchema = z.object({
  id: z.string().min(1), title: z.string().min(1),
  category: z.enum(['functional', 'hardening', 'integrity', 'regression', 'retest']),
  expectedResult: z.string().min(1),
  initialStatus: z.enum(['not_run', 'simulated_pass', 'simulated_fail', 'target_validation_required', 'dynamic_retest_not_executed']),
})

export const AssessmentStateSchema = z.object({
  stage: z.enum(['overview', 'inventory', 'audit', 'remediation', 'validation', 'report']),
  inventoryCompleted: z.boolean(), auditCompleted: z.boolean(),
  visibleFindingIds: z.array(z.string().regex(/^F-\d{3}$/)),
  appliedFindingIds: z.array(z.string().regex(/^F-\d{3}$/)),
  completedHardeningCheckIds: z.array(z.string()),
  validationResults: z.record(z.string(), z.enum(['not_run', 'simulated_pass', 'simulated_fail', 'target_validation_required', 'dynamic_retest_not_executed'])),
  timeline: z.array(z.object({ id: z.string(), timestamp: z.string(), label: z.string() })),
  guidedStep: z.number().int().min(0).max(7).nullable(),
})
```

```ts
export const ScenarioSchema = z.object({
  project: z.object({
    id: z.literal('TELCO-AUDIT-2026'),
    name: z.literal('TELCO'),
    wordpressVersion: z.literal('6.4.3'),
  }),
  inventory: z.object({
    pluginCount: z.literal(17), themeCount: z.literal(4),
    components: z.array(z.object({
      id: z.string(), name: z.string().min(1), type: z.enum(['core', 'theme', 'plugin']),
      version: z.string().nullable(), presence: z.literal('confirmed_in_files'),
      activation: z.enum(['confirmed', 'unknown']), sourceNote: z.string().min(1),
    })),
  }),
  findings: z.array(FindingSchema).length(10),
  remediations: z.array(RemediationSchema).min(10),
  validationChecks: z.array(ValidationCheckSchema).min(10),
})
```

Exporter `telcoScenario = ScenarioSchema.parse(rawScenario)`.

- [ ] **Step 7: Exécuter les tests**

Run: `npm test -- src/data/scenario.test.ts`  
Expected: PASS avec 10 constats, 17 extensions et 4 thèmes.

- [ ] **Step 8: Commit**

```powershell
git add securepress-demo/src/domain securepress-demo/src/data
git commit -m "feat: add validated TELCO assessment scenario"
```

**Verification:** Modifier temporairement un `remediationId` doit faire échouer le test relationnel ; annuler ensuite cette modification.

**Expected result:** Toutes les pages peuvent consommer un scénario cohérent et typé.

---

### Task DYX-004: Sélecteurs et indice pédagogique

**Goal:** Calculer toutes les métriques à partir des données et de l'état courant.

**Dependencies:** DYX-003.

**Files:**
- Create: `securepress-demo/src/domain/selectors.ts`
- Test: `securepress-demo/src/domain/selectors.test.ts`

**Interfaces:**
- Consumes: `Scenario`, `AssessmentState` et `Finding`.
- Produces: `selectSeverityCounts`, `selectAppliedCount`, `selectRemainingRiskPoints`, `selectPostureScore`, `selectWorkflowProgress`.

**Action:** Écrire les fonctions pures utilisées par le dashboard et le rapport.

**Why:** Une métrique calculée une seule fois ne peut pas diverger entre deux écrans.

- [ ] **Step 1: Écrire les tests de score en échec**

```ts
test('calcule la posture initiale à 42', () => {
  expect(selectPostureScore(telcoScenario, createInitialAssessment())).toBe(42)
})

test('calcule la posture projetée à 82', () => {
  const state = {
    ...createInitialAssessment(),
    appliedFindingIds: ['F-001', 'F-002', 'F-003', 'F-004', 'F-007', 'F-009'],
  } satisfies AssessmentState
  expect(selectPostureScore(telcoScenario, state)).toBe(82)
})
```

Run: `npm test -- src/domain/selectors.test.ts`  
Expected: FAIL avec sélecteurs non définis.

- [ ] **Step 2: Implémenter le calcul de risque restant**

```ts
export function selectRemainingRiskPoints(scenario: Scenario, state: AssessmentState): number {
  return scenario.findings
    .filter((finding) => !state.appliedFindingIds.includes(finding.id))
    .reduce((total, finding) => total + finding.riskPoints, 0)
}

export function selectPostureScore(scenario: Scenario, state: AssessmentState): number {
  return Math.max(0, 100 - selectRemainingRiskPoints(scenario, state))
}
```

- [ ] **Step 3: Implémenter la répartition des sévérités**

Le résultat attendu est :

```ts
{ critical: 2, high: 3, medium: 3, low: 1, variable: 1 }
```

- [ ] **Step 4: Tester progression et compteurs après remédiation**

Run: `npm test -- src/domain/selectors.test.ts`  
Expected: PASS pour les valeurs 42 et 82 et les cinq catégories de sévérité.

- [ ] **Step 5: Commit**

```powershell
git add securepress-demo/src/domain
git commit -m "feat: derive assessment metrics and posture score"
```

**Verification:** Aucun composant React ne doit contenir les nombres agrégés `10`, `42` ou `82` en dehors des textes de tests et explications.

**Expected result:** Une API pure fournit les mêmes métriques à toutes les vues.

---

### Task DYX-005: Persistance locale versionnée

**Goal:** Restaurer la progression après rechargement et réinitialiser seulement les données de la démo.

**Dependencies:** DYX-003.

**Files:**
- Create: `securepress-demo/src/services/storage.ts`
- Test: `securepress-demo/src/services/storage.test.ts`

**Interfaces:**
- Produces: `loadAssessment(): LoadResult`, `saveAssessment(state): void`, `clearAssessment(): void`.
- Storage key: `securepress.audit-lab.v1`.

**Action:** Encapsuler `localStorage` et gérer les données absentes ou corrompues.

**Why:** La soutenance doit survivre à un rechargement tout en offrant un reset fiable.

- [ ] **Step 1: Tester les trois cas de chargement**

```ts
test.each([
  ['absent', null, 'initialized'],
  ['corrompu', '{bad-json', 'recovered'],
])('retourne un état sûr pour un stockage %s', (_label, stored, expectedStatus) => {
  if (stored) localStorage.setItem(STORAGE_KEY, stored)
  expect(loadAssessment().status).toBe(expectedStatus)
})
```

- [ ] **Step 2: Implémenter la constante et le résultat discriminé**

```ts
export const STORAGE_KEY = 'securepress.audit-lab.v1'

export type LoadResult =
  | { status: 'restored'; state: AssessmentState }
  | { status: 'initialized'; state: AssessmentState }
  | { status: 'recovered'; state: AssessmentState }
```

- [ ] **Step 3: Valider les données restaurées avec Zod**

Toute exception JSON ou Zod retourne `recovered` et l'état initial ; elle ne bloque pas le rendu.

- [ ] **Step 4: Tester que clearAssessment ne supprime aucune autre clé**

```ts
localStorage.setItem('unrelated', 'keep')
clearAssessment()
expect(localStorage.getItem('unrelated')).toBe('keep')
expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
```

- [ ] **Step 5: Exécuter et committer**

Run: `npm test -- src/services/storage.test.ts`  
Expected: PASS.

```powershell
git add securepress-demo/src/services
git commit -m "feat: persist and safely reset demo state"
```

**Verification:** Stockage valide restauré, stockage corrompu récupéré, autre clé conservée.

**Expected result:** Le stockage local est fiable et isolé.

---

### Task DYX-006: Moteur de simulation déterministe

**Goal:** Faire progresser l'assessment sans réseau ni commande système.

**Dependencies:** DYX-004, DYX-005.

**Files:**
- Create: `securepress-demo/src/services/simulation-engine.ts`
- Test: `securepress-demo/src/services/simulation-engine.test.ts`
- Create: `securepress-demo/src/app/AssessmentProvider.tsx`
- Test: `securepress-demo/src/app/AssessmentProvider.test.tsx`

**Interfaces:**
- Produces: `createSimulationEngine(options)`, `AssessmentProvider`, `useAssessment()`.
- Actions: `runInventory`, `runStaticAudit`, `applyRemediation`, `runHardeningCheck`, `runValidation`, `resetDemo`.

**Action:** Implémenter les transitions, les progressions et la timeline.

**Why:** Les écrans doivent être interactifs, cohérents et reproductibles.

- [ ] **Step 1: Tester l'état initial et une transition interdite**

```ts
test('refuse la validation avant l’audit', async () => {
  const engine = createSimulationEngine({ delayMs: 0, now: () => new Date('2026-09-09T10:00:00Z') })
  await expect(engine.runValidation(createInitialAssessment())).rejects.toThrow('AUDIT_REQUIRED')
})
```

- [ ] **Step 2: Tester le parcours nominal complet**

Après inventaire puis audit, vérifier `stage`, `inventoryCompleted`, `auditCompleted`, les dix findings visibles et deux événements de timeline.

- [ ] **Step 3: Définir l'interface du moteur**

```ts
export interface SimulationOptions {
  delayMs: number
  now: () => Date
}

export interface ProgressUpdate {
  percent: number
  message: string
}
```

- [ ] **Step 4: Implémenter les actions avec copies immuables**

Chaque action retourne un nouvel `AssessmentState`. `applyRemediation` rejette un identifiant inconnu et ignore sans duplication une remédiation déjà appliquée.

- [ ] **Step 5: Ajouter le provider React**

```ts
export interface AssessmentContextValue {
  state: AssessmentState
  busy: boolean
  progress: ProgressUpdate | null
  runInventory(): Promise<void>
  runStaticAudit(): Promise<void>
  applyRemediation(findingId: Finding['id']): Promise<void>
  runValidation(): Promise<void>
  resetDemo(): void
}
```

- [ ] **Step 6: Persister après chaque transition réussie**

Le provider appelle `saveAssessment(nextState)` après mise à jour et jamais pendant un état intermédiaire.

- [ ] **Step 7: Exécuter les tests**

Run: `npm test -- src/services/simulation-engine.test.ts src/app/AssessmentProvider.test.tsx`  
Expected: PASS, y compris avec `delayMs: 0`.

- [ ] **Step 8: Commit**

```powershell
git add securepress-demo/src/services securepress-demo/src/app
git commit -m "feat: add deterministic assessment engine"
```

**Verification:** Aucun fichier du moteur ne contient `fetch`, `XMLHttpRequest`, `WebSocket`, `child_process` ou `exec`.

**Expected result:** Le workflow complet est pilotable par une API React stable.

---

### Task DYX-007: Coque, navigation et design system

**Goal:** Créer une interface projetable avec le mode démo toujours visible.

**Dependencies:** DYX-006.

**Files:**
- Modify: `securepress-demo/src/app/App.tsx`
- Create: `securepress-demo/src/app/routes.tsx`
- Create: `securepress-demo/src/components/layout/AppShell.tsx`
- Create: `securepress-demo/src/components/layout/Sidebar.tsx`
- Create: `securepress-demo/src/components/layout/TopBar.tsx`
- Create: `securepress-demo/src/components/layout/DemoBanner.tsx`
- Create: `securepress-demo/src/components/ui/Badge.tsx`
- Create: `securepress-demo/src/components/ui/Button.tsx`
- Create: `securepress-demo/src/components/ui/Card.tsx`
- Modify: `securepress-demo/src/styles/app.css`
- Test: `securepress-demo/src/components/layout/AppShell.test.tsx`

**Interfaces:**
- Consumes: `AssessmentProvider` et six `WorkflowStage`.
- Produces: layout partagé et primitives visuelles.

**Action:** Construire la navigation HashRouter et les composants de base.

**Why:** Toutes les vues doivent partager la même hiérarchie, les mêmes statuts et le même message de simulation.

- [ ] **Step 1: Écrire le test permanent en échec**

```tsx
expect(screen.getByText('MODE DÉMO')).toBeVisible()
expect(screen.getByText(/Aucun système réel n’est connecté/i)).toBeVisible()
expect(screen.getByRole('button', { name: /Réinitialiser la démo/i })).toBeVisible()
```

- [ ] **Step 2: Définir les tokens visuels**

Utiliser bleu nuit `#13213c`, bleu action `#2563eb`, vert `#15803d`, orange `#c2410c`, rouge `#b91c1c`, violet préparation `#6d28d9` et fond `#f4f7fb`.

- [ ] **Step 3: Créer les primitives accessibles**

`Button` accepte `variant`, `busy` et `disabled`. `Badge` reçoit toujours un libellé texte. `Card` utilise un titre associé avec `aria-labelledby`.

- [ ] **Step 4: Créer les six routes HashRouter**

```ts
const routes = ['/', '/inventaire', '/audit', '/remediation', '/validation', '/rapport'] as const
```

- [ ] **Step 5: Faire passer le test de coque**

Run: `npm test -- src/components/layout/AppShell.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Vérifier manuellement à 1440×900**

Run: `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`  
Expected: la bannière, le titre TELCO et les six liens restent lisibles sans défilement horizontal.

- [ ] **Step 7: Commit**

```powershell
git add securepress-demo/src
git commit -m "feat: add presentation-ready application shell"
```

**Verification:** Le mode démo est visible sur chacune des six routes.

**Expected result:** Une coque professionnelle accueille les écrans fonctionnels.

---

### Task DYX-008: Vue d'ensemble

**Goal:** Résumer le périmètre, les risques et l'avancement en moins de trente secondes.

**Dependencies:** DYX-007.

**Files:**
- Create: `securepress-demo/src/features/overview/OverviewPage.tsx`
- Create: `securepress-demo/src/features/overview/MetricCard.tsx`
- Create: `securepress-demo/src/features/overview/PostureGauge.tsx`
- Create: `securepress-demo/src/features/overview/WorkflowStepper.tsx`
- Test: `securepress-demo/src/features/overview/OverviewPage.test.tsx`

**Interfaces:**
- Consumes: sélecteurs de DYX-004 et état de DYX-006.
- Produces: première étape du parcours.

**Action:** Afficher les métriques dérivées, la posture et les limites.

**Why:** Le jury doit comprendre le projet avant toute interaction.

- [ ] **Step 1: Tester les métriques initiales en échec**

Vérifier 17 extensions, 4 thèmes, 10 constats, 2 critiques et `42 / 100` avec le libellé `Indice pédagogique simulé`.

- [ ] **Step 2: Implémenter les cartes en utilisant uniquement les sélecteurs**

Ne pas coder les agrégats directement dans JSX.

- [ ] **Step 3: Ajouter les limites visibles**

Afficher `Audit statique`, `Copie hors production`, `Activation des extensions inconnue` et `Contre-audit dynamique non exécuté`.

- [ ] **Step 4: Tester la vue projetée après remédiations**

Avec les six findings appliqués, vérifier que la jauge affiche `82 / 100` et `Projeté, non vérifié sur cible`.

- [ ] **Step 5: Exécuter et committer**

Run: `npm test -- src/features/overview/OverviewPage.test.tsx`  
Expected: PASS.

```powershell
git add securepress-demo/src/features/overview
git commit -m "feat: add assessment overview dashboard"
```

**Verification:** Les valeurs changent automatiquement lorsque l'état fourni au test change.

**Expected result:** La page d'accueil explique immédiatement le projet et ses limites.

---

### Task DYX-009: Inventaire simulé

**Goal:** Montrer l'inventaire des composants et la différence entre présence et activation.

**Dependencies:** DYX-007.

**Files:**
- Create: `securepress-demo/src/features/inventory/InventoryPage.tsx`
- Create: `securepress-demo/src/features/inventory/InventoryProgress.tsx`
- Create: `securepress-demo/src/features/inventory/ComponentTable.tsx`
- Test: `securepress-demo/src/features/inventory/InventoryPage.test.tsx`

**Interfaces:**
- Consumes: `runInventory`, `progress`, `telcoScenario.components`.
- Produces: état `inventoryCompleted` et événement timeline.

**Action:** Ajouter la progression, le tableau et les explications.

**Why:** L'inventaire est la première preuve méthodologique du rapport.

- [ ] **Step 1: Tester le clic de lancement en échec**

Après clic, attendre `Inventaire terminé` et vérifier `17 extensions identifiées`.

- [ ] **Step 2: Afficher les messages de progression dans l'ordre**

Les six messages de la section 4.3 du design doivent être rendus dans une région `aria-live="polite"`.

- [ ] **Step 3: Construire le tableau**

Colonnes : composant, type, version, présence, activation et note de source.

- [ ] **Step 4: Ajouter le message pédagogique**

Le texte exact est : `Présent dans les fichiers ne signifie pas actif ou exploitable.`

- [ ] **Step 5: Tester le cas déjà exécuté**

Après rechargement d'un état complété, le bouton affiche `Relancer la simulation` et le tableau reste visible.

- [ ] **Step 6: Exécuter et committer**

Run: `npm test -- src/features/inventory/InventoryPage.test.tsx`  
Expected: PASS.

```powershell
git add securepress-demo/src/features/inventory
git commit -m "feat: add simulated WordPress inventory"
```

**Verification:** Le tableau représente quatre thèmes et dix-sept extensions sans appeler le réseau.

**Expected result:** L'inventaire peut être présenté en moins de 45 secondes.

---

### Task DYX-010: Audit, filtres et qualification

**Goal:** Générer les dix constats et expliquer chaque décision de risque.

**Dependencies:** DYX-007, DYX-009.

**Files:**
- Create: `securepress-demo/src/features/audit/AuditPage.tsx`
- Create: `securepress-demo/src/features/audit/AuditProgress.tsx`
- Create: `securepress-demo/src/features/audit/FindingTable.tsx`
- Create: `securepress-demo/src/features/audit/FindingFilters.tsx`
- Create: `securepress-demo/src/features/audit/FindingDrawer.tsx`
- Create: `securepress-demo/src/components/ui/SeverityBadge.tsx`
- Create: `securepress-demo/src/components/ui/StatusBadge.tsx`
- Test: `securepress-demo/src/features/audit/AuditPage.test.tsx`

**Interfaces:**
- Consumes: `runStaticAudit`, findings et trois axes de statut.
- Produces: sélection d'un finding et navigation vers sa remédiation.

**Action:** Construire l'audit simulé, les filtres et le panneau de preuve.

**Why:** Cette page démontre la qualification prudente, cœur du projet.

- [ ] **Step 1: Tester le prérequis d'inventaire**

Sans inventaire, le bouton d'audit est désactivé et explique `Terminez d’abord l’inventaire simulé`.

- [ ] **Step 2: Tester la génération des dix constats**

Après audit, vérifier 2 critiques, 3 élevés, 3 moyens, 1 faible et 1 variable.

- [ ] **Step 3: Ajouter les filtres contrôlés**

Filtres : texte, sévérité, état de preuve, état de remédiation. Un bouton `Effacer les filtres` restaure dix lignes.

- [ ] **Step 4: Construire le drawer accessible**

Le drawer est un `dialog` avec titre, fermeture Échap et retour du focus. Il affiche preuve, confiance, exposition, impact, recommandation, source et validation.

- [ ] **Step 5: Tester F-001 et F-006**

F-001 doit afficher `Critique` et `Constaté dans l’instantané`. F-006 doit afficher `Sévérité variable` et `Exploitabilité inconnue`.

- [ ] **Step 6: Tester les filtres**

Le filtre `Critique` retourne exactement F-001 et F-002.

- [ ] **Step 7: Exécuter et committer**

Run: `npm test -- src/features/audit/AuditPage.test.tsx`  
Expected: PASS.

```powershell
git add securepress-demo/src/features/audit securepress-demo/src/components/ui
git commit -m "feat: add static audit and risk qualification"
```

**Verification:** Aucun libellé ne transforme « présence » en « vulnérabilité exploitable ».

**Expected result:** Le présentateur peut ouvrir F-001 en moins de deux clics.

---

### Task DYX-011: Centre de remédiation

**Goal:** Relier chaque constat à une correction et montrer l'avant/après.

**Dependencies:** DYX-010.

**Files:**
- Create: `securepress-demo/src/features/remediation/RemediationPage.tsx`
- Create: `securepress-demo/src/features/remediation/RemediationCard.tsx`
- Create: `securepress-demo/src/features/remediation/BeforeAfterDiff.tsx`
- Create: `securepress-demo/src/features/remediation/ArtifactPreview.tsx`
- Test: `securepress-demo/src/features/remediation/RemediationPage.test.tsx`

**Interfaces:**
- Consumes: `applyRemediation(findingId)` et sélecteurs de posture.
- Produces: `appliedFindingIds`, statuts de remédiation et événements timeline.

**Action:** Créer les cartes avant/après et l'application simulée.

**Why:** La valeur du stage réside autant dans la remédiation structurée que dans la détection.

- [ ] **Step 1: Tester F-001 en échec**

Vérifier l'état initial `root`, l'état proposé `telco_app` et le badge `Remédiation préparée`.

- [ ] **Step 2: Implémenter le diff sémantique**

Utiliser deux colonnes intitulées `État initial` et `État renforcé proposé`; ne jamais afficher de vrai secret.

- [ ] **Step 3: Ajouter l'action simulée**

Après clic sur F-001, afficher `Appliqué dans la simulation` et `Aucune configuration réelle n’a été modifiée`.

- [ ] **Step 4: Gérer les statuts particuliers**

F-005 conserve `Validation cible requise`. Le `.htaccess` affiche `Artefact mentionné mais absent`. F-006 reste `Mise à jour recommandée`.

- [ ] **Step 5: Afficher les aperçus sans exécution**

Les extraits `DISALLOW_FILE_EDIT`, `FORCE_SSL_ADMIN` et WP-CLI portent le badge `Aperçu uniquement — non exécuté`.

- [ ] **Step 6: Tester l'idempotence**

Deux clics sur une remédiation ne créent qu'un événement et ne retirent les points qu'une fois.

- [ ] **Step 7: Exécuter et committer**

Run: `npm test -- src/features/remediation/RemediationPage.test.tsx`  
Expected: PASS.

```powershell
git add securepress-demo/src/features/remediation
git commit -m "feat: add simulated remediation center"
```

**Verification:** Appliquer les six findings guidés fait passer l'indice à 82 sans modifier leur état de preuve.

**Expected result:** Les remédiations sont compréhensibles sans lire le code.

---

### Task DYX-012: Contrôles de durcissement et validation

**Goal:** Simuler les contrôles du module et les tests de non-régression.

**Dependencies:** DYX-011.

**Files:**
- Create: `securepress-demo/src/features/validation/ValidationPage.tsx`
- Create: `securepress-demo/src/features/validation/HardeningControl.tsx`
- Create: `securepress-demo/src/features/validation/LoginAttemptsDemo.tsx`
- Create: `securepress-demo/src/features/validation/UploadPolicyDemo.tsx`
- Create: `securepress-demo/src/features/validation/TestGroup.tsx`
- Test: `securepress-demo/src/features/validation/ValidationPage.test.tsx`

**Interfaces:**
- Consumes: `runHardeningCheck` et `runValidation`.
- Produces: résultats `simulated_pass` et état final `dynamic_retest_not_executed`.

**Action:** Construire les démonstrations de contrôles et la campagne de tests.

**Why:** Une correction de sécurité n'est crédible que si la validation et la non-régression sont visibles.

- [ ] **Step 1: Tester la limitation de connexion**

Simuler cinq échecs ; le cinquième affiche `Blocage temporaire simulé : 15 minutes`.

- [ ] **Step 2: Tester les téléversements**

`shell.php` est `BLOQUÉ`; `document.pdf` et `photo.jpg` sont `AUTORISÉS`.

- [ ] **Step 3: Afficher les autres contrôles du module**

Inclure énumération par auteur, routes REST utilisateurs, divulgation de version et éditeur de fichiers.

- [ ] **Step 4: Organiser les groupes de validation**

Groupes : public, administration, Info Cards, WooCommerce, durcissement, intégrité, non-régression et contre-vérification.

- [ ] **Step 5: Garantir les libellés de vérité**

Chaque réussite affiche `PASS simulé`. Le bloc externe affiche toujours `Contre-audit dynamique externe — NON EXÉCUTÉ`.

- [ ] **Step 6: Tester le lancement global**

Après `Lancer la validation simulée`, vérifier les résultats, la timeline et l'absence de `Vérifié sur cible` dans le document.

- [ ] **Step 7: Exécuter et committer**

Run: `npm test -- src/features/validation/ValidationPage.test.tsx`  
Expected: PASS.

```powershell
git add securepress-demo/src/features/validation
git commit -m "feat: add hardening and simulated validation lab"
```

**Verification:** La validation ne peut démarrer avant l'audit et aucune simulation n'appelle une URL.

**Expected result:** Le jury voit la relation correction → test → limite résiduelle.

---

### Task DYX-013: Comparaison, timeline et rapport imprimable

**Goal:** Terminer le récit par une synthèse cohérente avec l'état courant.

**Dependencies:** DYX-012.

**Files:**
- Create: `securepress-demo/src/features/report/ReportPage.tsx`
- Create: `securepress-demo/src/features/report/ComparisonTable.tsx`
- Create: `securepress-demo/src/features/report/AssessmentTimeline.tsx`
- Create: `securepress-demo/src/features/report/ResidualRisk.tsx`
- Create: `securepress-demo/src/styles/print.css`
- Test: `securepress-demo/src/features/report/ReportPage.test.tsx`

**Interfaces:**
- Consumes: scénario, état courant et tous les sélecteurs.
- Produces: résumé final imprimable.

**Action:** Créer l'avant/après, la chronologie et la sortie papier.

**Why:** Le dernier écran doit prouver la cohérence de toute la démonstration.

- [ ] **Step 1: Tester le rapport initial**

Sans remédiation, afficher 10 constats, posture 42, zéro remédiation appliquée et risque élevé simulé.

- [ ] **Step 2: Tester le rapport projeté**

Après les six findings guidés, afficher posture 82, six remédiations simulées, quatre risques restant à confirmer et risque résiduel non nul.

- [ ] **Step 3: Construire la comparaison**

Colonnes : contrôle, état initial, état renforcé proposé, remédiation, validation et limite.

- [ ] **Step 4: Construire la timeline**

Afficher uniquement les événements réellement déclenchés dans la session, triés par timestamp simulé.

- [ ] **Step 5: Ajouter l'impression navigateur**

Le bouton appelle `window.print()`. `print.css` masque navigation et boutons, conserve le disclaimer et force un fond blanc lisible.

- [ ] **Step 6: Tester le disclaimer final**

Le rapport doit inclure `Rapport généré depuis un environnement local simulé` et `Aucun serveur réel n’a été évalué par cette application`.

- [ ] **Step 7: Exécuter et committer**

Run: `npm test -- src/features/report/ReportPage.test.tsx`  
Expected: PASS.

```powershell
git add securepress-demo/src/features/report securepress-demo/src/styles
git commit -m "feat: add comparison and printable demo report"
```

**Verification:** Le rapport change immédiatement avec l'état et ne contient aucune valeur agrégée indépendante.

**Expected result:** L'écran final résume la démonstration et ses limites.

---

### Task DYX-014: Parcours guidé et reset global

**Goal:** Réduire les erreurs de manipulation pendant la soutenance.

**Dependencies:** DYX-008, DYX-009, DYX-010, DYX-011, DYX-012, DYX-013.

**Files:**
- Create: `securepress-demo/src/components/workflow/GuidedDemo.tsx`
- Create: `securepress-demo/src/components/workflow/GuidedDemoOverlay.tsx`
- Create: `securepress-demo/src/components/workflow/ResetDemoDialog.tsx`
- Create: `securepress-demo/src/data/guided-steps.ts`
- Test: `securepress-demo/src/components/workflow/GuidedDemo.test.tsx`
- Test: `securepress-demo/e2e/guided-demo.spec.ts`

**Interfaces:**
- Consumes: routeur et actions du provider.
- Produces: `startGuidedDemo`, `nextGuidedStep`, `exitGuidedDemo`, `resetDemo`.

**Action:** Guider huit actions sans empêcher la navigation libre.

**Why:** La démo doit rester fluide même sous pression.

- [ ] **Step 1: Définir les huit étapes exactes**

```ts
export const guidedSteps = [
  'overview', 'run-inventory', 'run-audit', 'open-f001',
  'apply-remediation', 'run-validation', 'review-comparison', 'finish-report',
] as const
```

- [ ] **Step 2: Tester le démarrage**

Le bouton `Démarrer la démo guidée` remet la démo à zéro après confirmation et met en évidence la première action.

- [ ] **Step 3: Ajouter l'overlay non bloquant**

L'overlay affiche `Étape N sur 8`, une explication courte, `Suivant`, `Précédent` et `Quitter le guide`.

- [ ] **Step 4: Connecter chaque étape à la bonne route et cible**

Utiliser des identifiants stables `data-guide-id`; ne pas sélectionner par texte visuel fragile.

- [ ] **Step 5: Tester le reset**

Après reset, vérifier route `/`, score 42, aucun événement, aucune remédiation appliquée et inventaire non lancé.

- [ ] **Step 6: Écrire le parcours E2E**

Playwright exécute les huit étapes et vérifie l'arrivée au rapport avec score 82 et contre-audit non exécuté.

- [ ] **Step 7: Exécuter et committer**

Run: `npm test -- src/components/workflow/GuidedDemo.test.tsx`  
Run: `npm run e2e -- e2e/guided-demo.spec.ts`  
Expected: PASS.

```powershell
git add securepress-demo/src/components/workflow securepress-demo/src/data/guided-steps.ts securepress-demo/e2e
git commit -m "feat: add guided presentation workflow"
```

**Verification:** Le guide peut être quitté puis repris sans corrompre l'assessment.

**Expected result:** Le présentateur dispose d'un chemin sûr de huit actions.

---

### Task DYX-015: Accessibilité, responsive et projection

**Goal:** Garantir la lisibilité au vidéoprojecteur, au clavier et sur trois tailles d'écran.

**Dependencies:** DYX-014.

**Files:**
- Modify: `securepress-demo/src/styles/app.css`
- Modify: `securepress-demo/src/components/layout/AppShell.tsx`
- Modify: `securepress-demo/src/components/layout/Sidebar.tsx`
- Modify: `securepress-demo/src/components/layout/TopBar.tsx`
- Modify: `securepress-demo/src/components/ui/Button.tsx`
- Modify: `securepress-demo/src/features/audit/FindingDrawer.tsx`
- Modify: `securepress-demo/src/components/workflow/GuidedDemoOverlay.tsx`
- Modify: `securepress-demo/src/components/workflow/ResetDemoDialog.tsx`
- Create: `securepress-demo/e2e/accessibility-layout.spec.ts`
- Create: `securepress-demo/docs/ACCESSIBILITY.md`

**Interfaces:**
- Consumes: toutes les pages terminées.
- Produces: règles de focus, réduction du mouvement et preuves visuelles.

**Action:** Réaliser une passe d'accessibilité et de responsive ciblée.

**Why:** Une excellente logique perd sa valeur si le jury ne peut pas lire ou suivre l'écran.

- [ ] **Step 1: Ajouter les règles globales**

Inclure focus visible de 3 px, texte courant minimal 16 px, largeur de ligne raisonnable et règle `prefers-reduced-motion`.

- [ ] **Step 2: Tester le clavier**

Tabuler depuis la top bar jusqu'au contenu, ouvrir et fermer le drawer, ouvrir et annuler le reset, puis vérifier le retour du focus.

- [ ] **Step 3: Tester les trois viewports**

Playwright utilise 1440×900, 1024×768 et 390×844. Aucun viewport ne doit produire de défilement horizontal global.

- [ ] **Step 4: Vérifier la projection**

À 1440×900 et zoom navigateur 100 %, le badge, les métriques, les titres de tableau et l'action guidée sont visibles sans zoom manuel.

- [ ] **Step 5: Vérifier les couleurs**

Chaque badge inclut du texte ; rouge, orange, vert et violet ne sont jamais l'unique moyen de transmettre l'état.

- [ ] **Step 6: Documenter les contrôles**

`ACCESSIBILITY.md` liste navigation clavier, focus, contrastes, mouvement réduit, responsive et impression, avec la date de vérification.

- [ ] **Step 7: Exécuter et committer**

Run: `npm run e2e -- e2e/accessibility-layout.spec.ts`  
Expected: PASS sur les trois viewports.

```powershell
git add securepress-demo
git commit -m "fix: improve accessibility and projected layout"
```

**Verification:** Toutes les actions principales sont réalisables sans souris.

**Expected result:** La démo reste claire en projection et sur écran réduit.

---

### Task DYX-016: Recette, preuve hors ligne et build final

**Goal:** Produire un build testé qui ne dépend d'aucune ressource externe.

**Dependencies:** DYX-015.

**Files:**
- Create: `securepress-demo/e2e/offline.spec.ts`
- Create: `securepress-demo/e2e/reset-and-persistence.spec.ts`
- Create: `securepress-demo/scripts/audit-dist.mjs`
- Modify: `securepress-demo/package.json`
- Create: `securepress-demo/docs/RELEASE-CHECKLIST.md`

**Interfaces:**
- Consumes: application terminée.
- Produces: commande `npm run release:check` et dossier `dist/` validé.

**Action:** Vérifier types, tests, build, réseau, persistance et fichiers distribués.

**Why:** Le risque principal le jour J est une dépendance invisible au réseau ou un état impossible à réinitialiser.

- [ ] **Step 1: Écrire le test réseau**

```ts
test('ne contacte aucun hôte externe', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) external.push(request.url())
  })
  await page.goto('/')
  await page.getByRole('button', { name: /Démarrer la démo guidée/i }).click()
  expect(external).toEqual([])
})
```

- [ ] **Step 2: Tester persistance et reset dans le navigateur**

Appliquer F-001, recharger, vérifier son statut, réinitialiser, recharger et vérifier son retour à `prepared`.

- [ ] **Step 3: Auditer les fichiers du build**

`audit-dist.mjs` parcourt `dist` et échoue si un fichier texte contient `http://`, `https://`, `fonts.googleapis.com`, `analytics` ou `telemetry`, à l'exception de la chaîne locale `http://127.0.0.1` si elle apparaît dans une documentation non distribuée.

Utiliser cette implémentation :

```js
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const textExtensions = new Set(['.html', '.js', '.css', '.json', '.svg', '.map'])
const forbidden = [
  /<(?:script|img|link)[^>]+(?:src|href)=["']https?:\/\//i,
  /url\(\s*["']?https?:\/\//i,
  /\b(?:fetch|WebSocket)\(\s*["'`]https?:\/\//i,
  /fonts\.googleapis\.com/i,
  /googletagmanager/i,
]

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  }))
  return nested.flat()
}

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url))
const files = (await walk(distDirectory)).filter((file) => textExtensions.has(extname(file)))
const failures = []
for (const file of files) {
  const content = await readFile(file, 'utf8')
  for (const pattern of forbidden) {
    if (pattern.test(content)) failures.push(`${file}: ${pattern}`)
  }
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Offline audit passed for ${files.length} text assets.`)
```

- [ ] **Step 4: Ajouter le script de release**

```json
{
  "scripts": {
    "audit:dist": "node scripts/audit-dist.mjs",
    "release:check": "npm run check && npm run e2e && npm run audit:dist"
  }
}
```

- [ ] **Step 5: Exécuter la recette complète**

Run: `npm run release:check`  
Expected: typecheck PASS, unit tests PASS, build PASS, E2E PASS, audit dist PASS.

- [ ] **Step 6: Tester avec Internet coupé**

Désactiver temporairement Wi-Fi/Ethernet depuis Windows, lancer `npm run present`, exécuter le parcours guidé et réactiver la connexion après le test.

Expected: aucun écran vide, aucune icône absente et aucun délai réseau.

- [ ] **Step 7: Écrire la checklist de release**

Inscrire versions Node/npm, date de build, résultat des commandes, navigateur testé, résolution et durée réelle du parcours.

- [ ] **Step 8: Commit et tag candidat**

```powershell
git add securepress-demo
git commit -m "test: verify offline release candidate"
git tag securepress-demo-rc1
```

**Verification:** `dist/` fonctionne via `npm run present` sans Internet.

**Expected result:** Un candidat de release mesuré et reproductible est disponible.

---

### Task DYX-017: Kit de soutenance et répétition générale

**Goal:** Préparer le lancement, les supports de secours et le discours final.

**Dependencies:** DYX-016.

**Files:**
- Create: `presentation-kit/README-LANCEMENT.md`
- Create: `presentation-kit/CHECKLIST-JOUR-J.md`
- Create: `presentation-kit/SCRIPT-SOUTENANCE.md`
- Create: `presentation-kit/QUESTIONS-JURY.md`
- Create: `presentation-kit/captures/`
- Create: `presentation-kit/video/`
- Create: `presentation-kit/build/`

**Interfaces:**
- Consumes: `securepress-demo/dist/` et parcours guidé final.
- Produces: paquet autonome de présentation.

**Action:** Documenter, capturer, enregistrer et répéter la soutenance.

**Why:** Le produit n'est prêt que si sa présentation reste possible malgré un problème de terminal, de navigateur ou de réseau.

- [ ] **Step 1: Copier le build validé**

```powershell
Copy-Item -LiteralPath 'securepress-demo/dist' -Destination 'presentation-kit/build' -Recurse -Force
```

Expected: `presentation-kit/build/index.html` existe.

- [ ] **Step 2: Rédiger le guide de lancement**

Inclure exactement : installation de Node si nécessaire, `npm ci`, `npm run present`, URL `http://127.0.0.1:4173`, mode plein écran avec `F11`, et commande d'arrêt `Ctrl+C`.

- [ ] **Step 3: Rédiger le script de 5 min 30**

Utiliser les sept créneaux temporels de la section 6 du design. Chaque créneau contient une phrase à dire, une action à cliquer et le message à retenir.

- [ ] **Step 4: Préparer les réponses jury**

Inclure : solution réelle ou démo, scans réels, choix de l'audit statique, présence contre activation, score pédagogique, Info Cards tierce, contribution personnelle, limites et étapes nécessaires pour valider sur cible.

- [ ] **Step 5: Capturer les six écrans principaux**

Produire des PNG 1440×900 après reset, puis après scénario complet. Nommer `01-overview.png` à `06-report.png`.

- [ ] **Step 6: Enregistrer une vidéo de secours**

Créer une vidéo locale de moins de six minutes avec narration ou sous-titres, montrant le parcours guidé complet.

- [ ] **Step 7: Exécuter dix répétitions chronométrées**

Pour chaque répétition, noter durée, hésitation, bouton difficile à trouver et question potentielle. Les dix essais doivent se terminer sans reset imprévu ; au moins les trois derniers doivent durer entre 4:30 et 5:45.

- [ ] **Step 8: Tester le matériel réel ou équivalent**

Vérifier vidéoprojecteur ou écran 16:9, alimentation, mode plein écran, résolution 1440×900 ou 1920×1080, son de la vidéo et lisibilité depuis le fond de la salle.

- [ ] **Step 9: Préparer trois copies**

Conserver une copie sur le PC, une sur clé USB et une archive ZIP locale distincte. Chaque copie contient le build, les captures, la vidéo, le script et le guide.

- [ ] **Step 10: Commit final**

```powershell
git add presentation-kit
git commit -m "docs: add SecurePress presentation kit"
git tag securepress-demo-v1.0.0
```

**Verification:** Une personne suivant uniquement `README-LANCEMENT.md` peut ouvrir la démo et atteindre le premier écran.

**Expected result:** Le projet et son plan B sont prêts pour la soutenance.

---

## Couverture de la spécification

| Section de conception | Tâches responsables |
|---|---|
| Objectif, sources et principes de vérité | DYX-003, DYX-006, DYX-007 |
| Coque et six étapes du MVP | DYX-007 à DYX-013 |
| Indice pédagogique | DYX-004, DYX-008, DYX-013 |
| Parcours guidé | DYX-014, DYX-017 |
| Architecture et flux des données | DYX-001 à DYX-006 |
| Moteur de simulation | DYX-006 |
| Persistance et réinitialisation | DYX-005, DYX-014, DYX-016 |
| Direction visuelle | DYX-007, DYX-015 |
| Accessibilité et projection | DYX-015 |
| Fonctionnement hors ligne | DYX-001, DYX-016 |
| Stratégie de test | DYX-002 puis tests de chaque tâche, DYX-016 |
| Critères d'acceptation | DYX-016, DYX-017 |
| Respect du hors périmètre | contraintes globales et revue de chaque tâche |

L'auto-revue ne relève aucune exigence de conception sans tâche responsable.

## Ordre d'exécution recommandé

### Sprint 1 - Socle démontrable

Exécuter DYX-001 à DYX-006. Le résultat est invisible ou sobre, mais tout le domaine, le score, la persistance et la simulation sont testés.

**Gate:** ne pas commencer les pages tant que les dix constats, les relations et le calcul 42 → 82 ne passent pas.

### Sprint 2 - Parcours fonctionnel

Exécuter DYX-007 à DYX-013. À la fin, les six écrans fonctionnent en navigation libre.

**Gate:** effectuer une première présentation manuelle complète avant d'ajouter le guide.

### Sprint 3 - Soutenance fiable

Exécuter DYX-014 à DYX-017. Ajouter le guide, terminer l'accessibilité, prouver le hors ligne et préparer les supports de secours.

**Gate final:** `npm run release:check`, trois répétitions successives sous 5:45 et vérification d'une copie USB.

## Références techniques officielles

- Vite : https://vite.dev/guide/
- Build Vite : https://vite.dev/guide/build
- Tailwind avec Vite : https://tailwindcss.com/docs/installation/using-vite
- Vitest : https://vitest.dev/guide/
- React Router : https://reactrouter.com/start/declarative/installation
- Playwright : https://playwright.dev/docs/intro

## Prochaine action

Commencer par DYX-001 : vérifier Node/npm, initialiser Git, créer `securepress-demo/`, installer les dépendances, puis confirmer que le build initial réussit avant de passer au harnais de tests.
