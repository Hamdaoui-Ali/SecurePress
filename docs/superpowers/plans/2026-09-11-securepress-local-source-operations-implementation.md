# SecurePress Local Source and Live Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a truthful local WordPress source-registration gate, visibly progressive workspace operations, an English-only interface, and a downloadable PDF report to SecurePress.

**Architecture:** Persist a serializable WorkspaceSource manifest beside the existing assessment state, while keeping the selected directory handle and active source-check progress transient in the provider. Extend the deterministic engine with item-level progress; pages derive temporary visible slices from active progress and commit final state only after operations resolve. Keep report generation in a browser-side service and keep all claims scoped to the local workspace package.

**Tech Stack:** React 19, TypeScript, Vite, React Router, Vitest, React Testing Library, Playwright, CSS, localStorage, browser File System Access API, jsPDF.

**Spec:** docs/superpowers/specs/2026-09-11-securepress-local-source-operations-design.md

## Global Constraints

- No remote WordPress connector, credentials, external API, or network call.
- The browser-native flow verifies a selected folder or the prepared LNET TELCO package; it never claims to inspect an arbitrary absolute path entered as text.
- Local package evidence, generated workspace change sets, and target verification pending remain distinct in visible copy and the PDF report.
- Visible product copy under securepress-demo/src is English; technical IDs such as F-001 and V-FILE-EDITOR remain unchanged.
- Normal UI pacing is visibly staged; tests pass delayMs: 0 and wait on rendered state or promises instead of fixed sleeps.
- Existing localStorage reset behavior, guided flow, print output, responsive layout, accessibility semantics, and deterministic TELCO scenario data remain working.
- Preserve the untracked user files Rapport-PFE-LNET.pdf and SecurePress-presentation-kit-backup.zip; never stage, overwrite, move, or delete them.
- Do not modify release tags or commit generated presentation output.
- Each task follows RED -> GREEN -> REFACTOR: write a focused failing test, run it to confirm the intended failure, implement the smallest change, run focused tests, then commit only that task.

---

### Task 1: Add the serializable local source model and adapter

**Files:**
- Modify: securepress-demo/src/domain/models.ts
- Modify: securepress-demo/src/domain/schema.ts
- Modify: securepress-demo/src/services/storage.ts
- Add: securepress-demo/src/services/source-adapter.ts
- Add: securepress-demo/src/domain/source.test.ts
- Modify: securepress-demo/src/domain/schema.test.ts
- Modify: securepress-demo/src/services/storage.test.ts

**Interfaces:**
- `SourceStatus = 'unconfigured' | 'checking' | 'ready' | 'invalid'`.
- `SourceMode = 'folder' | 'prepared'`.
- `WorkspaceSource = { status: SourceStatus; mode: SourceMode | null; pathLabel: string; displayName: string; wordpressVersion: string | null; fileMarkerCount: number; pluginCount: number; themeCount: number; verifiedAt: string | null; message: string }`.
- `DirectoryHandleLike = { name: string; getFileHandle(name: string): Promise<unknown>; getDirectoryHandle(name: string): Promise<unknown>; entries?: () => AsyncIterable<[string, unknown]> }`.
- `AssessmentState.source: WorkspaceSource`.
- `createInitialWorkspaceSource(): WorkspaceSource` returns the unconfigured source.
- `getPreparedSource(pathLabel: string, now: Date): WorkspaceSource` returns a ready manifest from the existing TELCO scenario with the prepared-package message.
- `inspectSelectedDirectory(handle: DirectoryHandleLike, pathLabel: string, now: Date): Promise<WorkspaceSource>` returns a ready or invalid manifest after checking the required WordPress markers.

- [ ] **Step 1: Write failing model and adapter tests.**

  Add tests named `creates an unconfigured source by default`, `accepts the prepared TELCO source`, `rejects a directory without WordPress markers`, `counts WordPress source markers`, and `extracts a readable WordPress version when version.php is available`. Use an in-memory fake directory handle whose `getFileHandle` and `getDirectoryHandle` methods model the File System Access API; do not touch the real filesystem from unit tests.

- [ ] **Step 2: Run the focused tests to verify the failure.**

  Run `npm.cmd test -- --run src/domain/source.test.ts src/domain/schema.test.ts src/services/storage.test.ts` from securepress-demo. Expected failure: WorkspaceSource, source defaults, and adapter functions are not defined.

- [ ] **Step 3: Implement the model, schema defaults, migration, and adapter.**

  Extend `createInitialAssessment()` with `source: createInitialWorkspaceSource()`. Make old stored payloads load with the unconfigured source. Use Zod `.catch`/`.default` at the source boundary so malformed source metadata recovers to an unconfigured source instead of preventing boot. Do not persist a directory handle. In `source-adapter.ts`, inspect `wp-config.php`, `wp-includes`, `wp-content/plugins`, and `wp-content/themes`; count child directories when the API exposes entries; return a useful invalid message when markers are absent. Keep the prepared manifest derived from `telcoScenario`, not duplicated counts.

- [ ] **Step 4: Run the focused tests to verify GREEN.**

  Run `npm.cmd test -- --run src/domain/source.test.ts src/domain/schema.test.ts src/services/storage.test.ts` and `npm.cmd run typecheck`. Expected result: all focused tests pass and old localStorage payloads still load.

- [ ] **Step 5: Commit the source model.**

  Run `git add securepress-demo/src/domain securepress-demo/src/services` and commit with `feat: add local source registration state`.

### Task 2: Build source setup and gate the workspace

**Files:**
- Add: securepress-demo/src/features/source/SourceSetupPage.tsx
- Add: securepress-demo/src/features/source/SourceSetupPage.test.tsx
- Add: securepress-demo/src/features/source/SourceStatus.tsx
- Modify: securepress-demo/src/app/AssessmentProvider.tsx
- Modify: securepress-demo/src/app/AssessmentProvider.test.tsx
- Modify: securepress-demo/src/app/routes.tsx
- Modify: securepress-demo/src/app/App.tsx
- Modify: securepress-demo/src/components/layout/AppShell.tsx
- Modify: securepress-demo/src/components/layout/TopBar.tsx
- Modify: securepress-demo/src/components/layout/Sidebar.tsx
- Modify: securepress-demo/src/components/layout/WorkspaceContextBar.tsx
- Modify: securepress-demo/src/index.css
- Modify: securepress-demo/src/styles/app.css

**Interfaces:**
- Provider transient draft: `sourceDraft: { mode: SourceMode; pathLabel: string; directoryHandle: DirectoryHandleLike | null } | null`.
- Provider methods: `setSourcePath(pathLabel: string): void`, `selectLocalFolder(handle: DirectoryHandleLike): void`, `usePreparedSource(): void`, `verifySelectedSource(): Promise<boolean>`, and `clearSource(): void`.
- Provider values: `source`, `sourceDraft`, `sourceChecking`, and `sourceCheckProgress`.

- [ ] **Step 1: Write failing provider and setup tests.**

  Add tests named `starts with source setup when no source is persisted`, `prefills the prepared package without marking it ready`, `verifies the prepared source and unlocks discovery`, `rejects verification without a path or source candidate`, `persists a verified source`, and `reset clears the source and returns to setup`. Assert the setup page exposes a labelled Source path input, Select local folder, Use prepared LNET TELCO package, Verify source, and an accessible status region.

- [ ] **Step 2: Run the focused tests to verify the failure.**

  Run `npm.cmd test -- --run src/features/source/SourceSetupPage.test.tsx src/app/AssessmentProvider.test.tsx`. Expected failure: the source page, provider source methods, and setup gate do not exist.

- [ ] **Step 3: Implement the provider source lifecycle and route gate.**

  Keep the directory handle in a ref or transient state only. `verifySelectedSource()` should set a transient checking state, emit a small accessible progress sequence, call either `getPreparedSource` or `inspectSelectedDirectory`, persist only the resulting WorkspaceSource, and return `true` on ready. Add a route gate that renders `/setup` until `source.status === 'ready'`, redirects ready `/setup` users to `/`, and keeps the existing AppShell for the ready workflow. Reset should navigate to `/#/setup` after clearing persisted assessment state.

- [ ] **Step 4: Implement the setup UI and context-bar path display.**

  Use a visible label and helper text for the operator path label. Use `window.showDirectoryPicker` when present and report unsupported browser capability without breaking the prepared-package path. Show the states Not registered, Verifying source, Source ready, and Source verification failed with `aria-live="polite"`. The ready context bar should show the source display name, shortened path label, WordPress version, and Target verification required. Keep nav hidden or reduced on setup so the first action is obvious.

- [ ] **Step 5: Run the focused tests to verify GREEN.**

  Run `npm.cmd test -- --run src/features/source/SourceSetupPage.test.tsx src/app/AssessmentProvider.test.tsx src/components/layout/AppShell.test.tsx` and `npm.cmd run typecheck`.

- [ ] **Step 6: Commit the source setup gate.**

  Commit with `feat: gate workspace on verified local source`.

### Task 3: Make discovery and analysis reveal deterministic results progressively

**Files:**
- Modify: securepress-demo/src/services/simulation-engine.ts
- Modify: securepress-demo/src/services/simulation-engine.test.ts
- Modify: securepress-demo/src/app/AssessmentProvider.tsx
- Add: securepress-demo/src/domain/operation-view.ts
- Add: securepress-demo/src/domain/operation-view.test.ts
- Modify: securepress-demo/src/features/inventory/InventoryPage.tsx
- Modify: securepress-demo/src/features/inventory/ComponentTable.tsx
- Modify: securepress-demo/src/features/inventory/InventoryProgress.tsx
- Modify: securepress-demo/src/features/inventory/InventoryPage.test.tsx
- Modify: securepress-demo/src/features/audit/AuditPage.tsx
- Modify: securepress-demo/src/features/audit/FindingTable.tsx
- Modify: securepress-demo/src/features/audit/AuditProgress.tsx
- Modify: securepress-demo/src/features/audit/AuditPage.test.tsx

**Interfaces:**
- Preserve `ProgressUpdate` fields `percent`, `message`, `step`, `processed`, and `total`.
- Add pure helpers `selectVisibleComponents(components, activeOperation, progress, completed)` and `selectVisibleFindings(findings, activeOperation, progress, completed)`.
- Use `activeOperation.kind === 'discovery'` or `'analysis'` and `progress.processed` to derive temporary visible slices; never mutate committed assessment state for a partial slice.

- [ ] **Step 1: Write failing engine and view-helper tests.**

  Add tests asserting discovery emits a preparation update, one update per component, and a summary; analysis emits a preparation update, one update per finding, and a summary; processed values are monotonic; `selectVisibleComponents` exposes fewer than all rows during a running operation; and `selectVisibleFindings` exposes the final collection only after completion.

- [ ] **Step 2: Run the focused tests to verify the failure.**

  Run `npm.cmd test -- --run src/services/simulation-engine.test.ts src/domain/operation-view.test.ts`. Expected failure: the current engine emits only coarse phase counts and the helper module is absent.

- [ ] **Step 3: Implement item-level engine progress and English phase messages.**

  Build discovery phases from `telcoScenario.inventory.components`, analysis phases from `telcoScenario.findings`, and control phases from `telcoScenario.validationChecks`. Use messages such as `Preparing source package`, `Indexing {component}`, `Qualifying {findingId}`, and `Running {controlId}`. Keep final state changes inside the final callback so rows cannot imply committed results before resolution. Set the provider default delay to a visible 200ms range while preserving injected `delayMs`.

- [ ] **Step 4: Implement pure progressive selectors and page rendering.**

  During discovery, render the indexed component table with the currently processed rows and a live count such as `Indexing 9 of 22 components`. During analysis, render qualified finding rows as they become available and keep the final score/workflow flags unchanged until completion. When no rows are available, show a queued state rather than the complete table.

- [ ] **Step 5: Run focused tests and the typecheck.**

  Run `npm.cmd test -- --run src/services/simulation-engine.test.ts src/domain/operation-view.test.ts src/features/inventory/InventoryPage.test.tsx src/features/audit/AuditPage.test.tsx` and `npm.cmd run typecheck`.

- [ ] **Step 6: Commit progressive discovery and analysis.**

  Commit with `feat: reveal discovery and findings progressively`.

### Task 4: Make remediation and controls visibly live

**Files:**
- Modify: securepress-demo/src/features/remediation/RemediationPage.tsx
- Modify: securepress-demo/src/features/remediation/RemediationCard.tsx
- Modify: securepress-demo/src/features/remediation/ArtifactPreview.tsx
- Modify: securepress-demo/src/features/remediation/RemediationPage.test.tsx
- Modify: securepress-demo/src/features/validation/ValidationPage.tsx
- Modify: securepress-demo/src/features/validation/HardeningControl.tsx
- Modify: securepress-demo/src/features/validation/TestGroup.tsx
- Modify: securepress-demo/src/features/validation/ValidationPage.test.tsx
- Modify: securepress-demo/src/services/simulation-engine.ts
- Modify: securepress-demo/src/services/simulation-engine.test.ts
- Modify: securepress-demo/src/styles/app.css

**Interfaces:**
- Add `selectCampaignCheckState(checks, state, activeOperation, progress): Record<string, 'queued' | 'running' | 'pass' | 'target'>` in operation-view.ts.
- Preserve canonical `ValidationStatus` values in persisted state; queued/running are transient view states only.

- [ ] **Step 1: Write failing remediation and control-state tests.**

  Add tests for Ready to apply, Applying change set, Change set applied, and failed change-set states. Add tests asserting a campaign exposes queued checks, one running check, PASS for completed local checks, and Target verification required for target-only checks. Add an assertion that the controls page renders all visible labels in English.

- [ ] **Step 2: Run the focused tests to verify the failure.**

  Run `npm.cmd test -- --run src/features/remediation/RemediationPage.test.tsx src/features/validation/ValidationPage.test.tsx`. Expected failure: existing cards use the old mixed-language copy and validation rows do not expose transient queued/running states.

- [ ] **Step 3: Implement the transient control view and English change-set states.**

  Derive campaign check states from progress and the deterministic validation list. Keep target-only controls at `Target verification required` after completion. Render the active phase and processed count in the shared operation surface. Update remediation copy to `Apply change set`, `Applying change set`, `Change set applied`, `Workspace update recorded`, and `Target verification required`.

- [ ] **Step 4: Run focused tests and refactor shared status rendering.**

  Run the focused remediation/validation tests again, then extract only duplicated state-label logic that has at least two consumers. Keep CSS selectors stable where tests or guided selectors depend on them.

- [ ] **Step 5: Commit live remediation and controls.**

  Commit with `feat: show live remediation and control states`.

### Task 5: Add a deterministic downloadable PDF report

**Files:**
- Modify: securepress-demo/package.json
- Modify: securepress-demo/package-lock.json
- Add: securepress-demo/src/services/report-pdf.ts
- Add: securepress-demo/src/services/report-pdf.test.ts
- Modify: securepress-demo/src/features/report/ReportPage.tsx
- Modify: securepress-demo/src/features/report/ReportPage.test.tsx
- Modify: securepress-demo/src/styles/app.css

**Interfaces:**
- `ReportPdfInput = { source: WorkspaceSource; state: AssessmentState; scenario: Scenario; generatedAt: Date }`.
- `buildReportPdf(input): Uint8Array` returns a complete PDF byte array.
- `downloadReportPdf(input, filename = 'securepress-lnet-telco-report.pdf'): void` creates a local Blob, triggers one download, and revokes the object URL.

- [ ] **Step 1: Add jsPDF and write failing report-service tests.**

  Add jsPDF as a regular dependency. Write tests named `builds a non-empty PDF with report metadata` and `downloads the stable report filename`. Mock only browser URL/anchor behavior at the boundary; assert the generated byte array begins with a PDF signature and the download anchor receives the expected filename.

- [ ] **Step 2: Run the focused tests to verify the failure.**

  Run `npm.cmd test -- --run src/services/report-pdf.test.ts`. Expected failure: the service and dependency are absent.

- [ ] **Step 3: Implement the report builder.**

  Use jsPDF with wrapped text, page breaks, simple table rows, and ASCII punctuation. Include the source manifest, posture summary, findings, change sets, controls, operation timeline, and explicit local-scope/target-verification wording. Keep the service independent from React and avoid `window.print()`.

- [ ] **Step 4: Add the Download report action beside Print report.**

  Pass the current source, state, scenario, and generated timestamp to `downloadReportPdf`. Use equal-size buttons, an accessible name, and a status message confirming local download initiation. Keep print behavior unchanged.

- [ ] **Step 5: Run focused tests and build.**

  Run `npm.cmd test -- --run src/services/report-pdf.test.ts src/features/report/ReportPage.test.tsx` and `npm.cmd run typecheck`.

- [ ] **Step 6: Commit PDF report export.**

  Commit with `feat: add downloadable workspace report`.

### Task 6: Complete the English product-language migration

**Files:**
- Modify: securepress-demo/src/components/layout/Sidebar.tsx
- Modify: securepress-demo/src/components/layout/TopBar.tsx
- Modify: securepress-demo/src/components/layout/WorkspaceContextBar.tsx
- Modify: securepress-demo/src/components/workflow/GuidedDemo.tsx
- Modify: securepress-demo/src/components/workflow/GuidedDemoOverlay.tsx
- Modify: securepress-demo/src/components/workflow/ResetDemoDialog.tsx
- Modify: securepress-demo/src/data/guided-steps.ts
- Modify: securepress-demo/src/data/findings.ts
- Modify: securepress-demo/src/data/remediations.ts
- Modify: securepress-demo/src/data/validation-checks.ts
- Modify: securepress-demo/src/features/overview/OverviewPage.tsx
- Modify: securepress-demo/src/features/overview/PostureGauge.tsx
- Modify: securepress-demo/src/features/overview/WorkflowStepper.tsx
- Modify: securepress-demo/src/features/audit/FindingDrawer.tsx
- Modify: securepress-demo/src/features/audit/FindingFilters.tsx
- Modify: securepress-demo/src/features/validation/LoginAttemptsDemo.tsx
- Modify: securepress-demo/src/features/validation/UploadPolicyDemo.tsx
- Modify: securepress-demo/src/features/validation/TestGroup.tsx
- Modify: securepress-demo/src/features/report/ComparisonTable.tsx
- Modify: securepress-demo/src/features/report/ResidualRisk.tsx
- Modify: securepress-demo/src/features/report/AssessmentTimeline.tsx
- Modify: securepress-demo/src/features/report/ReportPage.tsx
- Modify: securepress-demo/src/app/App.tsx
- Modify: securepress-demo/src/services/simulation-engine.ts
- Modify: securepress-demo/src/index.css
- Modify: securepress-demo/src/styles/app.css
- Add or modify: securepress-demo/src/data/english-copy.test.ts

- [ ] **Step 1: Write the failing English regression test.**

  Render the ready prepared-package workflow and assert that the primary surface contains English labels such as `Overview`, `Inventory`, `Finding analysis`, `Remediation`, `Controls`, `Report`, `Start guided walkthrough`, and `Download report`. Assert that visible text does not contain the known French workflow terms or the old disclaimer. Keep internal identifiers and test filenames out of the rendered-text assertion.

- [ ] **Step 2: Run the focused regression test to verify the failure.**

  Run `npm.cmd test -- --run src/data/english-copy.test.ts src/app/App.smoke.test.tsx`. Expected failure: current sidebar, validation, report, and guided surfaces still render French strings.

- [ ] **Step 3: Translate visible strings and date formatting.**

  Translate scenario evidence, recommendations, validation descriptions, empty states, buttons, headings, status badges, guided narration, and report copy. Use one English `Intl.DateTimeFormat('en-GB', ...)` formatter for operation dates. Preserve F-/V- IDs and the existing product meaning. Keep internal `simulation-engine`, `GuidedDemo`, and storage identifiers stable unless a rename is required for a visible label.

- [ ] **Step 4: Run focused regression tests and the linter.**

  Run `npm.cmd test -- --run src/data/english-copy.test.ts src/app/App.smoke.test.tsx src/components/layout/AppShell.test.tsx src/components/workflow/GuidedDemo.test.tsx` and `npm.cmd run lint`. Fix newly introduced warnings; do not broaden the task into unrelated refactors.

- [ ] **Step 5: Commit the English migration.**

  Commit with `fix: standardize SecurePress interface in English`.

### Task 7: Update integration tests and perform visual workflow verification

**Files:**
- Add: securepress-demo/e2e/local-source-operations.spec.ts
- Modify: securepress-demo/e2e/operations-workspace.spec.ts
- Modify: securepress-demo/e2e/reset-and-persistence.spec.ts
- Modify: securepress-demo/e2e/accessibility-layout.spec.ts
- Modify: securepress-demo/e2e/smoke.spec.ts
- Modify: securepress-demo/src/app/OperationsReview.test.tsx
- Modify: securepress-demo/src/features/overview/OverviewPage.test.tsx
- Modify: securepress-demo/src/features/inventory/InventoryPage.test.tsx
- Modify: securepress-demo/src/features/audit/AuditPage.test.tsx
- Modify: securepress-demo/src/features/report/ReportPage.test.tsx
- Modify: securepress-demo/src/components/layout/AppShell.test.tsx
- Modify: securepress-demo/src/app/AssessmentProvider.test.tsx

- [ ] **Step 1: Write the failing E2E flow.**

  Add a state-driven Playwright flow: clear localStorage, assert `/setup`, enter or select the prepared package, verify source, assert `Source ready`, run discovery, assert a disabled button plus a changing phase and partial rows, run finding analysis, apply F-001, run the control campaign, download the PDF, reload, and reset back to setup. Use locator waits and visible text; do not use fixed sleeps.

- [ ] **Step 2: Run the focused E2E test to verify the failure.**

  Run `npm.cmd run e2e -- e2e/local-source-operations.spec.ts`. Expected failure: `/setup`, source readiness, progressive rows, or PDF download selectors are not yet present until earlier tasks are complete.

- [ ] **Step 3: Update component and existing E2E fixtures.**

  Make test providers seed a ready WorkspaceSource where a page test begins inside the workflow. Update old French selectors and route expectations to English labels. Preserve operation, reset, guided, offline, and responsive coverage.

- [ ] **Step 4: Run focused tests and Playwright.**

  Run the focused component test list from the earlier tasks, then `npm.cmd run e2e -- e2e/local-source-operations.spec.ts e2e/operations-workspace.spec.ts e2e/accessibility-layout.spec.ts`. Capture the setup, running discovery, partial findings, controls, and report-download states for visual review using the connected browser.

- [ ] **Step 5: Commit integration coverage.**

  Commit with `test: cover local source and live operations flow`.

### Task 8: Run release verification and inspect the generated PDF

**Files:**
- Inspect: securepress-demo/docs/RELEASE-CHECKLIST.md
- Verification output: securepress-demo/tmp/pdfs/ and securepress-demo/output/pdf/ only when the repository's existing ignore rules allow temporary PDF QA artifacts.

- [ ] **Step 1: Run the complete application gates.**

  Run `npm.cmd run check`, `npm.cmd run e2e`, `npm.cmd run audit:dist`, `npm.cmd run lint`, and `git diff --check` from securepress-demo/repository root as appropriate. Record exit codes and test counts; do not claim success from a partial command.

- [ ] **Step 2: Capture and inspect the PDF.**

  Download the report from the running browser, render it with Poppler `pdftoppm -png`, inspect representative pages with `view_image`, and check for clipped text, broken tables, missing scope language, or unreadable typography. Keep only approved output artifacts and remove temporary render files with recoverable cleanup.

- [ ] **Step 3: Verify responsive and accessibility states.**

  Inspect setup, workspace context, operation progress, and report actions at 1440x900, 1024x768, and 390x844. Verify keyboard focus, `aria-live` progress, disabled busy actions, reduced-motion behavior, and no horizontal overflow beyond intentional table scrolling.

- [ ] **Step 4: Review the final diff and protected files.**

  Run `git status --short --branch`, `git diff --stat`, `git diff --check`, and `git ls-files --others --exclude-standard`. Confirm only intended source/tests/docs/lockfile changes are present and Rapport-PFE-LNET.pdf plus SecurePress-presentation-kit-backup.zip remain untracked and untouched.

- [ ] **Step 5: Commit only if verification required a tracked correction.**

  If a tracked correction was needed, run its focused test first and commit with a message that names the correction. Otherwise leave the verification artifacts out of the final commit.

## Completion checklist

- [ ] Source setup is the first-run entry point and discovery is gated on Source ready.
- [ ] Selected local folders are structurally checked; prepared LNET TELCO package works offline.
- [ ] Discovery, analysis, remediation, and controls visibly progress with incremental deterministic results.
- [ ] All primary workflow copy is English.
- [ ] Download report produces a complete local-workspace PDF beside Print report.
- [ ] Local source evidence and pending target verification remain clearly separated.
- [ ] Unit, component, E2E, typecheck, build, offline audit, lint, and diff checks pass.
- [ ] User-owned untracked PDF and ZIP remain untouched.
