# SecurePress Local Source and Live Operations Design

Date: 11 September 2026
Status: Approved direction; written specification pending review

## Decision

SecurePress will begin with a source-registration step. The operator will provide a readable local path label and either select the local WordPress folder through the browser or choose the prepared LNET TELCO source package. SecurePress will inspect the selected folder structure when a folder is available, persist the resulting source manifest, and keep discovery disabled until the source is ready.

The browser-native implementation is the first target because it keeps the jury workflow offline and requires no external service. A local Node companion remains an explicit future adapter for exact arbitrary Windows-path validation. The interface will not claim to have checked a path that the browser could not access.

All visible product copy will be English. The application will continue to distinguish local package evidence from target verification and will not claim that a remote WordPress site was contacted or changed.

## User outcome

A new operator should be able to understand the complete story without prior context:

1. Register the local WordPress source.
2. See the source being verified and understand why it is ready or blocked.
3. Start discovery only after the source is ready.
4. Watch components appear as the package is indexed.
5. Watch findings appear as evidence is qualified.
6. Review and apply a local change set with clear scope.
7. Run controls and see each result progress to PASS or Target verification required.
8. Download a PDF containing the source, evidence, changes, controls, activity, and limits.

## Scope

### Included

- A source setup surface before the existing workflow.
- Persistent local source registration and a derived source manifest.
- Folder-structure verification through the browser File System Access API when supported.
- A prepared offline LNET TELCO source-package path for reliable jury presentation.
- Readiness gating for discovery, analysis, remediation, controls, and report status.
- Longer, configurable operation pacing in normal UI mode.
- Progressive component, finding, and control-result disclosure derived from real scenario collections and progress counts.
- English-only visible UI copy, including scenario evidence and validation text.
- A downloadable PDF report beside the existing print action.
- Unit, component, accessibility, and E2E coverage for the new flow.

### Not included

- A remote WordPress connector, credentials, external API, or network call.
- Claims that a target server was scanned, modified, or dynamically re-tested.
- An arbitrary absolute-path filesystem service inside the static browser build.
- A complete vulnerability scanner for every possible WordPress installation.
- A new visual brand or a complete dashboard redesign.

## Product language

Use these terms consistently:

- Local source package
- Source path
- Verify source
- Source ready
- Source verification failed
- Discovery run
- Finding analysis
- Change set
- Control campaign
- Workspace copy
- Target verification required
- Target verification pending
- Download report
- Print report

Avoid visible French copy and avoid presenting the product as a remote scanner. Internal function names such as startGuidedDemo and simulation-engine may remain stable during this migration to reduce persistence and test migration risk.

## Source registration flow

### Initial surface

The first route renders a focused source-registration page when no ready source is persisted. It contains:

- Product identity and a short statement that SecurePress analyzes a local WordPress source package.
- A labelled Source path input for the operator-readable path label.
- A Select local folder action. The action uses the browser directory picker when available.
- A Use prepared LNET TELCO package action for the offline jury workflow.
- A Verify source action that remains disabled until a path label and either a selected folder or prepared package are available.
- A status region with the states Not registered, Verifying source, Source ready, and Source verification failed.
- A compact evidence note explaining that local package evidence is distinct from target verification.

The prepared package uses the existing deterministic TELCO scenario and a default label such as C:\\SecurePress\\targets\\lnet-telco-wordpress. The UI must make clear that this is the prepared local workspace copy, not a remote target.

### Folder verification

The browser adapter inspects the selected directory for a minimal WordPress structure:

- wp-config.php
- wp-includes
- wp-content/plugins
- wp-content/themes

It derives a manifest containing the selected folder name, visible file-marker count, WordPress version when readable, plugin and theme directory counts when available, and a verification timestamp. It must return a useful failure message when the folder is not a WordPress source package.

The selected directory handle is transient and is never serialized. The verified manifest and operator path label are persisted. After reload, the workspace can show the last verified manifest without pretending that the browser still holds a live filesystem handle.

### State boundary

Add a persisted WorkspaceSource value to AssessmentState. The exact types are:

- SourceStatus = unconfigured | checking | ready | invalid
- SourceMode = folder | prepared
- WorkspaceSource = { status: SourceStatus; mode: SourceMode | null; pathLabel: string; displayName: string; wordpressVersion: string | null; fileMarkerCount: number; pluginCount: number; themeCount: number; verifiedAt: string | null; message: string }

The source field contains:

- status: unconfigured, checking, ready, or invalid
- mode: folder or prepared
- pathLabel
- displayName
- wordpressVersion
- fileMarkerCount
- pluginCount
- themeCount
- verifiedAt
- message

The transient directory handle and current source-check progress remain in React state. Persist only serializable source metadata.

The source adapter exposes inspectSelectedDirectory(handle): Promise<WorkspaceSource> and getPreparedSource(pathLabel): WorkspaceSource. The provider exposes source, sourceCheckProgress, sourceChecking, verifySelectedSource, usePreparedSource, and clearSource. Existing reset behavior clears the source and returns to source setup.

## Operations and progressive disclosure

### Pacing

The normal provider delay becomes visibly paced, approximately 180-260ms per engine step. Test providers continue to pass delayMs: 0. No test may depend on fixed sleeps; tests wait for rendered state or promise completion.

### Discovery

Discovery emits a preparation update, then one update per component from telcoScenario.inventory.components, then a summary update. The component table derives a temporary visible slice from the active discovery progress. Rows appear in deterministic package order. The final AssessmentState is still committed only when the operation completes.

The screen shows the current component count, the active component name, and a live status such as Indexing 9 of 22 components. A failed run shows the last safe count without marking the package ready for later stages.

### Finding analysis

Analysis emits a preparation update, then one update per finding, then a summary update. The findings surface derives a temporary visible slice from active analysis progress. Each row retains the real finding ID, title, severity, evidence status, and change-set relationship from the scenario.

The score and final workflow state must not move to the completed state until the engine result resolves. During the run, the UI must communicate that findings are being qualified, not already finalized.

### Change sets

Change-set application keeps its four named phases and uses the same pacing and progress surface. The remediation card moves through Ready to apply, Applying change set, and Change set applied. The local result is tied to the selected finding ID and does not claim a remote mutation.

### Control campaign

The campaign emits a preparation update, one update per validation check, and a final closure update. The validation page derives a transient per-check state: queued, running, PASS, or Target verification required. The canonical result is committed only after the campaign completes. Target-only checks remain Target verification required even after the local campaign closes.

Hardening controls continue to work as individual operations and receive the same English state vocabulary.

### Shared activity

The existing operation activity model remains the single source of truth for completed and failed workflow runs. Source verification is represented by WorkspaceSource.status, WorkspaceSource.message, and WorkspaceSource.verifiedAt; it is not inserted into the workflow timeline as a false target operation. Every completed workflow operation records a duration, final step, processed count, and total.

## Report download

Add a Download report button beside Print report with the same visual weight and keyboard behavior. The action creates a local PDF in the browser and downloads a stable filename such as securepress-lnet-telco-report.pdf.

The PDF must contain:

- SecurePress title, project name, source path label, source mode, verification timestamp, and WordPress version.
- A scope statement: local source package evidence, generated workspace change sets, and target verification pending.
- Posture score, finding count, applied change-set count, residual risk, and operation durations.
- A findings table with ID, title, severity, evidence status, recommendation, change-set status, and validation status.
- A controls section with each control result and target-verification boundary.
- An ordered activity timeline with timestamps and statuses.
- An explicit statement that no external dynamic counter-audit was executed.

PDF generation lives behind a report-pdf service so ReportPage remains a composition component. The service must be deterministic and testable without opening a browser print dialog. Generated output must be reopened or text-inspected in tests and visually rendered during final verification.

## English migration

Translate all visible strings under securepress-demo/src, including:

- Sidebar, top bar, setup, workflow stepper, guided walkthrough, and reset dialog.
- Page headings, eyebrows, buttons, prerequisite messages, progress phases, statuses, tables, drawers, and empty states.
- Scenario findings, remediations, validation checks, report summaries, and provenance notes.
- Dates, labels, and generated operation messages.

Use one English date formatter for operation timestamps. Keep technical IDs such as F-001 and V-FILE-EDITOR unchanged. Regression tests should reject visible French copy in the rendered primary workflow while permitting internal identifiers and test names that retain legacy compatibility.

## Error handling and truthfulness

- Empty path labels are rejected before verification.
- A folder without the required WordPress markers produces Source verification failed with a recovery action.
- Unsupported directory-picker browsers can still use the prepared package path.
- A failed operation keeps prior committed assessment results and records a failed run.
- A running operation disables conflicting actions, reset, and guided-start controls.
- The report always distinguishes package evidence from target evidence.
- No source file contents, credentials, or personal filesystem details are uploaded or sent externally.

## Accessibility and responsive behavior

- Every setup input has a visible label and an error/status association.
- Verification uses an aria-live status and an accessible progressbar.
- Progressive rows and result changes are announced without forcing focus away from the active control.
- Keyboard focus remains visible, dialogs retain their existing focus trap, and reset remains guarded while busy.
- Reduced-motion users receive state changes without animated-only meaning.
- Source path and status content wrap cleanly at 390px, 1024px, and 1440px.
- The report buttons remain equal-height and usable on mobile.

## Verification plan

Unit and component tests cover:

- Source manifest parsing and required-marker failures.
- Prepared-package registration and persisted source state.
- Source readiness gating and reset behavior.
- One-by-one discovery and analysis progress with delayMs: 0.
- Per-control campaign state and target-only outcomes.
- English copy regression and operation labels.
- PDF bytes, filename, representative text, and download action.

E2E coverage follows this state-driven path:

1. Start from a clean source setup state.
2. Verify the prepared package and assert Source ready.
3. Run discovery and observe a disabled button, changing phase text, and rows appearing before completion.
4. Run finding analysis and observe progressive findings.
5. Apply a change set and assert the local workspace result.
6. Run the control campaign and assert PASS plus Target verification required.
7. Download the PDF and verify the download filename.
8. Reload and verify source metadata, activity, and results persist.
9. Reset and verify the source setup state returns.

Final checks remain npm.cmd run check, npm.cmd run e2e, npm.cmd run audit:dist, npm.cmd run lint, and git diff --check. The untracked Rapport-PFE-LNET.pdf and SecurePress-presentation-kit-backup.zip must remain untouched.

## Acceptance criteria

1. A new user cannot start discovery until a local source is registered and ready.
2. A selected local folder is checked for a minimal WordPress structure, and the prepared package is available for offline presentation.
3. Discovery, analysis, and controls visibly progress for several seconds in normal UI mode.
4. Components, findings, and control outcomes appear incrementally from deterministic scenario data.
5. The interface is entirely English in the primary workflow.
6. A PDF report downloads beside the print action and contains the complete local-workspace story.
7. The app remains offline, deterministic, accessible, responsive, and explicit about pending target verification.
