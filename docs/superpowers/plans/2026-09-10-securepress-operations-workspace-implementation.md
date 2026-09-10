# SecurePress Operations Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SecurePress feel like a credible security-operations workspace for a real project package: discovery, finding analysis, change-set preparation, and control campaigns should have believable state, progress, timing, evidence, and persistence while remaining honest that this build evaluates a local TELCO workspace package rather than mutating a remote WordPress target.
**Architecture:** Add a durable operation-run model around the existing deterministic scenario. The engine emits structured multi-phase progress; the provider owns transient execution state and persists completed runs/history; shared operation components render status across shell and feature pages; existing findings, score, guided workflow, reset, report, offline behavior, and responsive layout remain compatible.
**Tech Stack:** React 18, TypeScript, Vite, Vitest, React Testing Library, Playwright, CSS, localStorage, existing SecurePress scenario/engine.
**Spec:** `docs/superpowers/specs/2026-09-10-securepress-operations-workspace-design.md`

## Global Constraints

- Do not connect to a remote WordPress site, send credentials, call external APIs, or claim that a remote target was changed or dynamically verified.
- Keep the local workspace boundary truthful but discreet: use labels such as `TELCO workspace`, `Source package · indexed`, `Target verification required`, and `Target verification pending`.
- Remove the visible demo disclaimer and the exact phrase `Aucune configuration réelle n’a été modifiée` from the product workflow. Provenance/report surfaces may continue to explain the local evaluation boundary.
- Use the existing deterministic scenario as the source of findings, components, remediation state, score, and control results. Do not replace it with random values or fake network calls.
- Keep all operations offline and testable with `delayMs: 0`; user-facing progress may use a short configurable delay in normal mode, but E2E tests must wait on state rather than fixed sleeps.
- Preserve localStorage reset behavior, guided presentation flow, print/report output, responsive layout, accessibility semantics, and the existing untracked user files `Rapport-PFE-LNET.pdf` and `SecurePress-presentation-kit-backup.zip`.
- Do not alter or move existing release tags. Keep generated presentation build/capture/video output ignored unless a later explicit request requires committed artifacts.
- Each task below is test-first: add or update the named tests, run them to observe the expected failure, implement the smallest coherent change, then rerun the focused tests before committing.

---

## Task 1: Define persisted operation runs and backward-compatible state

**Files:**
- Modify `securepress-demo/src/domain/models.ts`.
- Modify `securepress-demo/src/domain/schema.ts`.
- Modify `securepress-demo/src/services/storage.ts` and `securepress-demo/src/services/storage.test.ts`.
- Add `securepress-demo/src/domain/schema.test.ts` if schema behavior is not already covered.

- [ ] Add `OperationKind` values `discovery`, `analysis`, `change-set`, and `controls`.
- [ ] Add `OperationStatus` values `idle`, `running`, `completed`, and `failed`.
- [ ] Add `OperationRun` with `id`, `kind`, `status`, `startedAt`, optional `completedAt`, `message`, optional `currentStep`, optional `processed`, optional `total`, and optional `durationMs`.
- [ ] Extend `AssessmentState` with persisted `lastRun: OperationRun | null` and `operationHistory: OperationRun[]`; keep the currently running operation transient in the provider rather than writing a `running` record on every progress tick.
- [ ] Add schema parsing/defaults so states saved by the current release load with an empty operation history and no last run.
- [ ] Cap or normalize history to a small bounded list, retain newest-first ordering, and ensure malformed operation entries cannot make the app fail to boot.
- [ ] Add tests for a completed run round-trip, failed run round-trip, bounded history, old localStorage payloads, and invalid operation payloads.

**Expected failure before implementation:** TypeScript/schema tests cannot reference operation fields and old fixtures lack the new state defaults.

**Verification:** `npm.cmd test -- --run src/services/storage.test.ts src/domain/schema.test.ts` and `npm.cmd run typecheck`.

**Commit:** `feat: add persisted operation run model`.

## Task 2: Make the simulation engine emit structured, believable phases

**Files:**
- Modify `securepress-demo/src/services/simulation-engine.ts`.
- Modify `securepress-demo/src/services/simulation-engine.test.ts`.
- Modify any scenario fixture only if a phase needs a count derived from existing data.

- [ ] Extend `ProgressUpdate` with `step`, `processed`, and `total` while preserving `percent` and `message` compatibility for existing consumers.
- [ ] Give each engine operation named phases and derive totals from real scenario collections instead of hardcoded progress percentages.
- [ ] Use these phase labels/messages as the baseline vocabulary:
  - Discovery: `Lecture du package TELCO`, `Indexation du noyau WordPress`, `Inventaire des thèmes`, `Inventaire des extensions`, `Contrôle de la configuration`, `Synthèse des composants`.
  - Analysis: `Chargement des constats`, `Analyse des preuves`, `Corrélation risque/remédiation`, `Finalisation de l’analyse`.
  - Change set: `Préparation du change set`, `Vérification des dépendances`, `Enregistrement des changements`, `Finalisation du change set`.
  - Controls: `Initialisation de la campagne de contrôles`, `Contrôles fonctionnels`, `Contrôles de durcissement`, `Contrôles d’intégrité`, `Clôture de la campagne`.
- [ ] Keep delay injectable through `SimulationOptions`; normal UI execution can remain visibly paced, while tests pass `delayMs: 0`.
- [ ] Ensure every operation emits an initial, intermediate, and final progress update, and that progress reaches 100 only after the resulting state is ready.
- [ ] Add tests asserting phase order, monotonic progress, processed/total values, deterministic output, zero-delay completion, and error propagation.

**Expected failure before implementation:** Existing engine tests cannot assert structured phase data and currently observe only coarse messages.

**Verification:** `npm.cmd test -- --run src/services/simulation-engine.test.ts`.

**Commit:** `feat: add phased security operation progress`.

## Task 3: Orchestrate operations and persist completed activity in the provider

**Files:**
- Modify `securepress-demo/src/app/AssessmentProvider.tsx`.
- Modify `securepress-demo/src/app/AssessmentProvider.test.tsx`.
- Modify `securepress-demo/src/domain/models.ts` only if a provider-facing type needs a small refinement.

- [ ] Expose `activeOperation`, `lastRun`, and `operationHistory` through the assessment context alongside the existing `busy` and `progress` values.
- [ ] Replace the one generic transition path with a typed operation wrapper that records `startedAt`, updates the current step/counts from engine progress, and records `completedAt` and `durationMs` on success.
- [ ] Record failed operations with a useful message while preserving the prior assessment state; never mark a failed operation as completed.
- [ ] Persist only completed/failed history entries through the existing storage boundary and keep the active run responsive without serializing every tick.
- [ ] Add timeline labels derived from operation results: `Discovery run completed · 17 components indexed`, `Finding analysis completed · 10 findings`, `Change set applied · F-001`, `Hardening check completed · <control id>`, and `Control campaign completed · target verification pending`.
- [ ] Keep guided actions and reset behavior wired through the same operation wrapper so the presentation flow cannot bypass activity tracking.
- [ ] Add provider tests for running state, progress propagation, completion metadata, failure metadata, history ordering, localStorage persistence, reset clearing, and deterministic timestamps using injected `now`.

**Expected failure before implementation:** Provider tests cannot observe active operation metadata, run history, or operation-specific timeline entries.

**Verification:** `npm.cmd test -- --run src/app/AssessmentProvider.test.tsx`.

**Commit:** `feat: persist workspace operation activity`.

## Task 4: Add shared operational status UI and migrate the shell

**Files:**
- Add `securepress-demo/src/components/operations/OperationProgress.tsx`.
- Add `securepress-demo/src/components/operations/OperationActivity.tsx`.
- Add `securepress-demo/src/components/layout/WorkspaceContextBar.tsx`.
- Modify `securepress-demo/src/components/layout/AppShell.tsx`.
- Modify `securepress-demo/src/components/layout/TopBar.tsx`.
- Modify `securepress-demo/src/components/layout/AppShell.test.tsx`.
- Remove `securepress-demo/src/components/layout/DemoBanner.tsx` after all imports are migrated, or leave it as an unused compatibility file only if the build requires it.
- Modify `securepress-demo/src/App.css`, `securepress-demo/src/index.css`, and/or `securepress-demo/src/styles/app.css` for the new states without breaking print styles.

- [ ] Build `OperationProgress` with an accessible `progressbar`, operation title, current phase, processed/total counts when present, elapsed/completed duration, and a completed/failed state.
- [ ] Build `OperationActivity` to show the latest operation and a compact recent activity list with timestamps/status, without overwhelming the main workflow.
- [ ] Replace `DemoBanner` with `WorkspaceContextBar` that communicates `TELCO workspace`, `Source package · indexed`, and `Target verification required` without calling the product a demo or simulation.
- [ ] Update the top bar action to `Reset workspace` or equivalent product language while preserving the confirmation dialog and test selectors.
- [ ] Keep visible focus, keyboard navigation, color contrast, reduced-motion behavior, and mobile wrapping intact.
- [ ] Add component/shell tests for idle, running, completed, failed, and empty-history states.

**Expected failure before implementation:** Shell tests still find the old simulation banner and no shared operation status region.

**Verification:** `npm.cmd test -- --run src/components/layout/AppShell.test.tsx` and `npm.cmd run lint`.

**Commit:** `feat: add operations workspace shell status`.

## Task 5: Make overview, discovery, and analysis read like active workspace work

**Files:**
- Modify `securepress-demo/src/features/overview/OverviewPage.tsx`.
- Modify `securepress-demo/src/features/overview/PostureGauge.tsx`.
- Modify `securepress-demo/src/features/overview/WorkflowStepper.tsx`.
- Modify `securepress-demo/src/features/inventory/InventoryPage.tsx` and `InventoryProgress.tsx`.
- Modify `securepress-demo/src/features/inventory/ComponentTable.tsx`.
- Modify `securepress-demo/src/features/audit/AuditPage.tsx` and `AuditProgress.tsx`.
- Modify `securepress-demo/src/features/audit/FindingTable.tsx` and `FindingDrawer.tsx` only where status/copy is surfaced.
- Update `securepress-demo/src/features/overview/OverviewPage.test.tsx`, `InventoryPage.test.tsx`, and `AuditPage.test.tsx`.

- [ ] Replace `Indice pédagogique simulé` with `Security posture score` and keep the 42-to-82 score change tied to actual assessment state.
- [ ] Use operational actions such as `Run discovery` and `Analyze findings`; buttons show busy/disabled state and the shared progress component while work is active.
- [ ] Render meaningful workspace facts from the scenario: component count, indexed package, finding count, last run time, operation duration, and next action.
- [ ] Show `Workspace ready` after discovery and `Finding analysis completed` after analysis, with no claim that a remote site was contacted.
- [ ] Keep tables and filters usable during/after runs, and ensure partial progress does not expose final results before the engine resolves.
- [ ] Add tests for operation buttons, progress phase text, disabled states, completed activity, score transitions, and no visible demo/simulation copy in the primary pages.

**Expected failure before implementation:** Existing page tests expect old French simulation copy and the current buttons do not expose operation progress or completion activity.

**Verification:** `npm.cmd test -- --run src/features/overview/OverviewPage.test.tsx src/features/inventory/InventoryPage.test.tsx src/features/audit/AuditPage.test.tsx`.

**Commit:** `feat: present discovery and analysis as workspace operations`.

## Task 6: Turn remediation into a credible change-set workflow

**Files:**
- Modify `securepress-demo/src/features/remediation/RemediationCard.tsx`.
- Modify `securepress-demo/src/features/remediation/RemediationPage.tsx`.
- Modify `securepress-demo/src/features/remediation/ArtifactPreview.tsx`.
- Modify `securepress-demo/src/features/remediation/BeforeAfterDiff.tsx` only if status labels need alignment.
- Modify `securepress-demo/src/features/remediation/RemediationPage.test.tsx`.

- [ ] Rename the action to `Apply change set · F-001` and show a staged/applying/applied state tied to provider state.
- [ ] Replace `Appliqué dans la simulation` with `Change set applied` and replace `Aucune configuration réelle n’a été modifiée` with truthful workspace language such as `Workspace update recorded · <duration>` plus `Target verification required`.
- [ ] Keep the before/after diff and artifact preview as evidence of the proposed local change set; label the preview as a generated workspace artifact rather than an executed remote mutation.
- [ ] Prevent duplicate application, show progress phases from the change-set operation, and update score/findings only after completion.
- [ ] Add tests for idle/applying/applied/error states, button labels, persisted activity, score/finding changes, and absence of the old disclaimer.

**Expected failure before implementation:** Remediation tests still expect simulation wording and the old no-real-configuration disclaimer.

**Verification:** `npm.cmd test -- --run src/features/remediation/RemediationPage.test.tsx`.

**Commit:** `feat: model remediation as a change set`.

## Task 7: Align controls, validation, reports, and guided workflow

**Files:**
- Modify `securepress-demo/src/features/validation/ValidationPage.tsx`.
- Modify `securepress-demo/src/features/validation/HardeningControl.tsx`.
- Modify `securepress-demo/src/features/validation/TestGroup.tsx`.
- Modify `securepress-demo/src/features/validation/LoginAttemptsDemo.tsx` and `UploadPolicyDemo.tsx`.
- Modify `securepress-demo/src/features/validation/ValidationPage.test.tsx`.
- Modify `securepress-demo/src/features/report/ReportPage.tsx`, `AssessmentTimeline.tsx`, `ResidualRisk.tsx`, and `ReportPage.test.tsx`.
- Modify `securepress-demo/src/components/workflow/GuidedDemo.tsx`, `GuidedDemoOverlay.tsx`, and `GuidedDemo.test.tsx`.
- Modify `securepress-demo/src/data/guided-steps.ts` and validation data only for wording/operation metadata.

- [ ] Replace `Lancer la validation simulée` with `Run control campaign` and show the multi-phase controls operation with `PASS` results after completion.
- [ ] Replace `PASS simulé` and similar primary-surface labels with `PASS`, while keeping the report/provenance boundary visible through `Target verification pending`.
- [ ] Use `Control campaign completed · target verification pending` in the activity/timeline rather than implying live external verification.
- [ ] Update report copy to distinguish indexed local evidence, generated change-set evidence, and pending target verification without calling the whole product a demo.
- [ ] Keep the printable report coherent and ensure `Contre-audit dynamique externe — NON EXÉCUTÉ` remains explicit where appropriate.
- [ ] Update guided narration and step labels so the guided experience explains discovery, analysis, change set, and controls as product operations.
- [ ] Add tests for validation progress, PASS status, report provenance, timeline activity, guided labels, and reset after a completed campaign.

**Expected failure before implementation:** Validation/report/guided tests still assert simulation wording and control actions are not represented as operation runs.

**Verification:** `npm.cmd test -- --run src/features/validation/ValidationPage.test.tsx src/features/report/ReportPage.test.tsx src/components/workflow/GuidedDemo.test.tsx`.

**Commit:** `feat: align controls and reports with operations workspace`.

## Task 8: Complete the product-language, accessibility, and regression sweep

**Files:**
- Search and update all affected files under `securepress-demo/src`, `securepress-demo/e2e`, and relevant user-facing docs.
- Add or update focused assertions in `securepress-demo/src/app/App.smoke.test.tsx` and `securepress-demo/src/data/scenario.test.ts` only where global copy/state contracts require it.

- [ ] Run a repository search for `simulation`, `simulé`, `simulée`, `demo`, `démo`, `Aucune configuration réelle`, and `Indice pédagogique`; remove or rewrite visible workflow occurrences that conflict with the approved product language.
- [ ] Keep internal identifiers and filenames stable where changing them would add migration risk; user-facing labels are the priority.
- [ ] Ensure every long-running action has a visible busy state, an accessible progressbar/status, a usable error state, and a clear post-completion result.
- [ ] Verify French copy remains grammatically correct where retained, English product labels are intentional, and technical identifiers such as finding IDs and control IDs remain unchanged.
- [ ] Add a regression test that the primary rendered app does not contain the old disclaimer and that the workspace context bar remains present.

**Expected failure before implementation:** The text search should find old copy in secondary components/tests until each occurrence is intentionally migrated or documented as provenance.

**Verification:** `rg -n -i "simulation|simulé|simulée|demo|démo|Aucune configuration réelle|Indice pédagogique" securepress-demo/src securepress-demo/e2e` followed by `npm.cmd run check`.

**Commit:** `fix: remove demo framing from workspace workflow`.

## Task 9: Add operation-focused E2E coverage and complete release verification

**Files:**
- Add `securepress-demo/e2e/operations-workspace.spec.ts`.
- Modify existing E2E specs only when selectors or reset expectations intentionally change.
- Refresh presentation source/copy only if the implemented product labels are embedded in tracked presentation files.

- [ ] Add a state-driven E2E flow covering discovery, analysis, change set, controls, persistence after reload, and reset.
- [ ] Use locator/state waits rather than fixed sleeps. The core flow should follow this shape:
  - Navigate to `/#/inventaire`, click `Run discovery`, assert disabled state and visible progress, wait for a phase/completion message, then assert the action is enabled again.
  - Navigate to audit, click `Analyze findings`, and wait for `Finding analysis completed`.
  - Navigate to remediation, apply one change set, assert `Change set applied` and `Target verification required`.
  - Navigate to validation, run the control campaign, assert `PASS` and `Control campaign completed`.
  - Reload and assert the last operation/activity remains available; reset and assert the clean workspace state.
- [ ] Verify offline behavior still blocks network access and the app boots from a production build.
- [ ] Run the full gates from `securepress-demo`: `npm.cmd run check`, `npm.cmd run e2e`, `npm.cmd run audit:dist`, and `npm.cmd run release:check`.
- [ ] Run the presentation workflow only if tracked presentation artifacts need updated labels; keep local generated build/capture/video output ignored.
- [ ] Review `git diff --check`, `git status --short`, and the final diff to confirm only intended source/tests/docs changed and the PDF/ZIP remain untracked and untouched.

**Expected failure before implementation:** The new E2E spec cannot find operation labels/progress/completion activity until Tasks 1–8 are complete.

**Verification:** Full checks above plus a final Playwright run with no fixed-delay synchronization.

**Commit:** `test: cover operations workspace flow`.

## Completion checklist

- [ ] All focused unit/component tests pass.
- [ ] Full typecheck, lint, build, offline, audit, release, and E2E checks pass.
- [ ] No old demo disclaimer remains in the primary workflow.
- [ ] Operations show meaningful phases, counts, completion timing, and persisted activity.
- [ ] All claims remain honest about local workspace scope and pending target verification.
- [ ] User-owned untracked files are preserved and not staged.
- [ ] Final commits are reviewable by responsibility: state, engine, provider, shell, features, copy, tests.

## Suggested execution order

Execute Tasks 1–3 as the data/engine/provider foundation, then Tasks 4–7 for the UI migration, Task 8 for the copy and accessibility sweep, and Task 9 for integration verification. Use one commit per task; this yields approximately nine implementation commits in addition to the already-created spec and this plan, unless a reviewer requests a safe squash.
