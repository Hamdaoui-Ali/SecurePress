# SecurePress Guided Assessment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the SecurePress demo into a truthful, linear assessment workflow that reveals only earned evidence from source selection through the final report.

**Architecture:** Keep the existing React/Vite state machine and simulation engine. Add typed source-verification checklist progress, centralize workflow prerequisite selectors, make the overview and sidebar stage-aware, and add continuation actions to each operation page. Keep direct routes renderable with prerequisite messaging while locking future sidebar navigation and gating the full report.

**Tech Stack:** React 19, TypeScript, React Router, Vitest + Testing Library, Playwright, existing CSS design system.

**Spec:** `docs/superpowers/specs/2026-09-11-securepress-guided-assessment-flow-design.md`

## Global Constraints

- The browser must never claim it inspected an arbitrary typed OS path; source verification accepts a selected folder handle or the prepared package.
- The source checklist must show folder access, WordPress file reading, version detection, plugin/theme reading, and final verification.
- Overview metrics are hidden until their producing operation completes.
- Locked navigation must explain the exact prerequisite and must not navigate.
- All visible product copy remains English.
- No live website is contacted; local evidence and target-verification limits stay explicit.
- Every production behavior change follows a failing test before implementation.

---

### Task 1: Add shared workflow and source-verification state contracts

**Files:**
- Modify: `src/app/AssessmentProvider.tsx`
- Modify: `src/domain/selectors.ts`
- Test: `src/domain/selectors.test.ts`
- Test: `src/app/AssessmentProvider.test.tsx`

**Interfaces:**
- Produce `SourceCheckStepId`, `SourceCheckStepStatus`, `SourceCheckStep`, and `SourceCheckProgress` from `AssessmentProvider.tsx`.
- Produce `selectWorkflowStep(state, stage)`, `selectNextWorkflowAction(state)`, and `isControlCampaignComplete(state)` from `src/domain/selectors.ts`.
- `selectNextWorkflowAction` returns `{ label: string; to: string }` for `/inventaire`, `/audit`, `/remediation`, `/validation`, or `/rapport`.

- [ ] **Step 1: Write failing selector tests.**

Add cases proving:

```ts
expect(selectNextWorkflowAction(createInitialAssessment())).toEqual({
  label: 'Start discovery',
  to: '/inventaire',
})
expect(selectWorkflowStep(createInitialAssessment(), 'audit')).toMatchObject({
  status: 'locked',
  reason: 'Complete discovery first',
})
expect(selectWorkflowStep({ ...createInitialAssessment(), inventoryCompleted: true }, 'audit')).toMatchObject({
  status: 'available',
})
```

Also cover audit-complete → corrections, applied change set → controls, completed control campaign → report, and the report campaign marker.

- [ ] **Step 2: Run the selector tests and verify they fail for the missing exports.**

Run: `npm.cmd test -- src/domain/selectors.test.ts`

Expected: FAIL because the new selector functions do not exist.

- [ ] **Step 3: Implement the selectors with one prerequisite table.**

Use `inventoryCompleted`, `auditCompleted`, `appliedFindingIds.length`, and `validationResults['external-dynamic-retest'] === 'dynamic_retest_not_executed'`. Keep `selectWorkflowProgress` compatible with existing `WorkflowStage` values but treat a completed control campaign as the report stage for presentation.

- [ ] **Step 4: Add failing source-progress contract assertions.**

Extend the provider test to start a prepared-source verification with a non-zero delay and assert that the first visible progress object has five ordered steps, the first step is `running`, and later steps are `pending`.

- [ ] **Step 5: Implement staged source progress updates.**

Replace the two generic verification messages with five named phases. The final progress object must mark all steps `complete`, use `percent: 100`, and say `Source verified. No website was contacted.`. Invalid source handling must still set `percent: 0` and preserve the failure message.

- [ ] **Step 6: Run the focused tests and commit.**

Run: `npm.cmd test -- src/domain/selectors.test.ts src/app/AssessmentProvider.test.tsx`

Expected: PASS.

Commit: `git add src/app/AssessmentProvider.tsx src/domain/selectors.ts src/domain/selectors.test.ts src/app/AssessmentProvider.test.tsx && git commit -m "feat: add guided workflow state selectors"`

### Task 2: Make source setup an explicit chooser with a verification checklist

**Files:**
- Modify: `src/features/source/SourceSetupPage.tsx`
- Modify: `src/features/source/SourceStatus.tsx`
- Modify: `src/features/source/SourceSetupPage.test.tsx`
- Modify: `src/styles/app.css`

**Interfaces:**
- `SourceSetupPage` no longer exposes an editable path input. It exposes the folder-picker action, the prepared-source action, a registered-source summary, and a disabled-until-selected `Verify source` button.
- `SourceStatus` renders the `SourceCheckProgress.steps` list when checking and the verified boundary copy when ready.

- [ ] **Step 1: Update source tests first.**

Change the setup assertions to expect `Select local WordPress folder`, a prepared-source button, a read-only registered-source summary, and a disabled `Verify source` button before selection. Add a test that clicks the prepared package, verifies the button becomes enabled, starts verification with a delayed provider, and observes all checklist labels plus `Checking folder access and path existence`.

- [ ] **Step 2: Run the source tests and verify the new assertions fail against the editable path UI.**

Run: `npm.cmd test -- src/features/source/SourceSetupPage.test.tsx`

Expected: FAIL because the current input and button semantics do not match.

- [ ] **Step 3: Implement the chooser and checklist UI.**

Use the existing picker and prepared-source callbacks. Keep the chosen path label in a read-only `output`/summary element so the prepared path remains visible. Keep the direct selection error and make `Verify source` disabled when there is no candidate. Render checklist status with text, not color alone, and preserve `aria-live="polite"`.

- [ ] **Step 4: Add the focused CSS.**

Style the registered-source summary, source choice row, checklist rows, running marker, completed marker, and a clear source-boundary note. Ensure the action row wraps on narrow screens and no long path forces horizontal overflow.

- [ ] **Step 5: Run the focused source tests and commit.**

Run: `npm.cmd test -- src/features/source/SourceSetupPage.test.tsx`

Expected: PASS.

Commit: `git add src/features/source/SourceSetupPage.tsx src/features/source/SourceStatus.tsx src/features/source/SourceSetupPage.test.tsx src/styles/app.css && git commit -m "feat: make source verification visibly staged"`

### Task 3: Gate overview evidence and lock future sidebar steps

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/features/overview/OverviewPage.tsx`
- Modify: `src/features/overview/WorkflowStepper.tsx`
- Modify: `src/features/overview/OverviewPage.test.tsx`
- Modify: `src/components/layout/AppShell.test.tsx`
- Test: `src/components/layout/Sidebar.test.tsx`
- Modify: `src/styles/app.css`

**Interfaces:**
- `Sidebar` consumes `AssessmentState` and renders unlocked `NavLink`s plus non-navigating locked items with `aria-label` text that contains the prerequisite.
- `OverviewPage` uses `selectNextWorkflowAction` and renders a `Link` for the next action.
- `WorkflowStepper` uses shared step status and shows `Locked until …` for future stages.

- [ ] **Step 1: Write failing stage-gating tests.**

Update overview tests so a source-ready initial state contains `Source verified`, `Start discovery`, and `Evidence will appear as each operation completes`, but does not contain `Findings available`, `Critical findings`, or `Security posture score`. Add tests for inventory-complete (components visible, findings hidden) and audit-complete (findings and score visible). Add sidebar tests asserting `Finding analysis — Locked until discovery is complete` is present and not a link before discovery, then becomes a link after discovery.

- [ ] **Step 2: Run the overview/sidebar tests and verify they fail because the current overview is fully populated and all nav items are links.**

Run: `npm.cmd test -- src/features/overview/OverviewPage.test.tsx src/components/layout/AppShell.test.tsx src/components/layout/Sidebar.test.tsx`

Expected: FAIL with early evidence present and locked navigation absent.

- [ ] **Step 3: Implement shared stage-gated overview rendering.**

Render a source summary and next-action card before discovery. Render inventory metrics only after `inventoryCompleted`. Render findings, posture, and severity distribution only after `auditCompleted`. Keep evidence limits visible in every state and include the selected source label in the source summary.

- [ ] **Step 4: Implement locked sidebar and stepper states.**

Pass `state` through `AppShell` to `Sidebar`. Use the selectors for status and reason. A locked item must be a `span`/`div` with `aria-disabled="true"` or an equivalent non-interactive element; completed and available items remain ordinary router links. Preserve the mobile horizontal rail but give each item `min-width` and `white-space: nowrap` so labels do not clip.

- [ ] **Step 5: Run focused tests and commit.**

Run: `npm.cmd test -- src/features/overview/OverviewPage.test.tsx src/components/layout/AppShell.test.tsx src/components/layout/Sidebar.test.tsx`

Expected: PASS.

Commit: `git add src/components/layout src/features/overview src/styles/app.css && git commit -m "feat: reveal assessment evidence by workflow stage"`

### Task 4: Add linear continuation actions and gate the report

**Files:**
- Modify: `src/features/inventory/InventoryPage.tsx`
- Modify: `src/features/audit/AuditPage.tsx`
- Modify: `src/features/remediation/RemediationPage.tsx`
- Modify: `src/features/validation/ValidationPage.tsx`
- Modify: `src/features/report/ReportPage.tsx`
- Modify: `src/features/inventory/InventoryPage.test.tsx`
- Modify: `src/features/audit/AuditPage.test.tsx`
- Modify: `src/features/remediation/RemediationPage.test.tsx`
- Modify: `src/features/validation/ValidationPage.test.tsx`
- Modify: `src/features/report/ReportPage.test.tsx`
- Modify: `src/styles/app.css`

**Interfaces:**
- Each page adds one router `Link` with the exact continuation labels: `Continue to finding analysis`, `Continue to corrections`, `Continue to controls`, and `Review report`.
- `ReportPage` renders a pending state until `isControlCampaignComplete(state)` is true; the full report actions and comparison table are only rendered in the completed state.

- [ ] **Step 1: Write failing continuation and report-gate tests.**

Add assertions that completion reveals each continuation link, running state does not show it, and an initial report shows `Report pending` with a link to discovery/finding analysis instead of `42 / 100`, the comparison table, or download actions. Add a post-analysis/pre-controls case that points to `Run control campaign`.

- [ ] **Step 2: Run the feature tests and verify they fail against the current pages.**

Run: `npm.cmd test -- src/features/inventory/InventoryPage.test.tsx src/features/audit/AuditPage.test.tsx src/features/remediation/RemediationPage.test.tsx src/features/validation/ValidationPage.test.tsx src/features/report/ReportPage.test.tsx`

Expected: FAIL because continuation links and report gating do not exist.

- [ ] **Step 3: Implement the continuation links.**

Render them after each completed operation, hide them while `busy`, and use the existing `.button` styles plus a new `.workflow-continue` wrapper. Keep operation controls available for repeat runs.

- [ ] **Step 4: Stage the correction page without breaking F-001/F-002 operation coverage.**

Do not render the ten-card grid before audit. After audit, keep the highest-priority F-001 card visible in a `Priority correction` section and place the remaining cards in a native `details` disclosure titled `Additional change sets (9)`. Update the existing F-002 test to open the disclosure before clicking it. Keep target-verification status visible on applied cards.

- [ ] **Step 5: Implement report gating.**

Use the shared campaign selector. Before audit, show `Report pending` and a `Continue to finding analysis` link. After audit but before controls, show `Controls required before final report` and a `Run control campaign` link. Only the campaign-complete branch renders Print/Download, posture, comparison, residual risk, and timeline.

- [ ] **Step 6: Run focused tests and commit.**

Run: `npm.cmd test -- src/features/inventory/InventoryPage.test.tsx src/features/audit/AuditPage.test.tsx src/features/remediation/RemediationPage.test.tsx src/features/validation/ValidationPage.test.tsx src/features/report/ReportPage.test.tsx`

Expected: PASS.

Commit: `git add src/features src/styles/app.css && git commit -m "feat: guide users through operations to the report"`

### Task 5: Update end-to-end flow, responsive checks, and finish verification

**Files:**
- Modify: `e2e/helpers.ts`
- Modify: `e2e/guided-demo.spec.ts`
- Modify: `e2e/accessibility-layout.spec.ts`
- Modify: `e2e/operations-workspace.spec.ts`
- Modify: `e2e/smoke.spec.ts`
- Modify: `e2e/offline.spec.ts`
- Modify: `e2e/reset-and-persistence.spec.ts`
- Modify: `docs/ACCESSIBILITY.md` if the final keyboard labels change

- [ ] **Step 1: Update E2E helpers and the guided path.**

Keep `prepareSource` on the prepared-package path, then assert the overview starts without findings. Make the guided path follow source setup → overview → discovery → analysis → corrections → controls → report, checking the continuation link at each step.

- [ ] **Step 2: Run the targeted E2E tests and verify the new flow.**

Run: `npm.cmd run e2e -- e2e/guided-demo.spec.ts e2e/accessibility-layout.spec.ts`

Expected: PASS with no console errors, no framework overlay, and no clipped mobile workflow labels.

- [ ] **Step 3: Run the complete verification suite.**

Run:

```text
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run e2e
npm.cmd run audit:dist
```

Expected: all commands pass. Capture rendered screenshots outside the repository for source-checking, early overview, completed analysis, corrections, controls, final report, and one mobile viewport.

- [ ] **Step 4: Review the rendered flow and fix only verified mismatches.**

Use Playwright because the Browser plugin is not available in this session. Check page identity, meaningful content, framework-overlay absence, console errors, interaction state changes, and desktop/mobile layout. Re-run the relevant tests after any fix.

- [ ] **Step 5: Commit E2E/test updates and verify the branch.**

Run: `git status --short --branch`, inspect `git diff main...HEAD`, and commit the final test updates with `git add e2e docs/ACCESSIBILITY.md && git commit -m "test: verify the guided assessment flow"`.

Final expected state: feature branch `codex/securepress-guided-assessment-flow` contains the complete workflow redesign, main is unchanged, and all verification commands pass.
