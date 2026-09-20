# SecurePress — Project Documentation

Client-facing explanation and technical reference for the SecurePress project.

| Field | Value |
|---|---|
| Product | SecurePress Operations / SecurePress Audit Lab |
| Current implementation | Local, offline security-workspace demonstration |
| Demonstration scenario | LNET TELCO WordPress source package |
| Scenario ID | `TELCO-AUDIT-2026` |
| WordPress version in scenario | `6.4.3` |
| Primary audience | Client stakeholders, security reviewers, application engineers, project jury |
| Repository application | [`securepress-demo/`](../securepress-demo/) |
| Documentation date | 20 September 2026 |

> **Important scope statement:** SecurePress currently demonstrates the workflow of a WordPress security assessment. It reads a selected local source package or a prepared offline scenario, produces deterministic findings and workspace change sets, and records local validation results. It does not connect to, scan, modify, or dynamically retest a production website.

## 1. Executive summary

SecurePress is a security operations workspace designed to make a WordPress assessment understandable, repeatable, and defensible. It guides an operator through a complete evidence story:

```text
Register local source
        ↓
Verify source structure
        ↓
Discover components
        ↓
Analyze and qualify findings
        ↓
Prepare and apply workspace change sets
        ↓
Run local controls
        ↓
Separate local results from target verification
        ↓
Generate a traceable report
```

The product solves a communication and process problem as much as a technical one. A security finding is not presented as a vague warning: it is linked to evidence, severity, confidence, exposure, impact, a proposed correction, and a validation boundary. The interface also makes the difference between “observed in the source package”, “simulated locally”, and “still requires verification on the authorized target” visible throughout the workflow.

The current implementation is intentionally safe for a demonstration or academic presentation because it uses fictitious/anonymized data and stays offline. It is a strong workflow prototype and presentation tool; it is not yet a production multi-user security platform or a live vulnerability scanner.

## 2. How to explain the project to a client

### 2.1 Short client explanation

> SecurePress is a local security workspace for analyzing a WordPress source package in a controlled way. It first verifies what source is being examined, then inventories the components, qualifies security findings, links each finding to a proposed change set, runs deterministic local controls, and produces a report. Every result keeps its provenance: the client can see what was proven from the package, what was simulated in the workspace, and what still has to be validated on the authorized target. No production system is contacted or changed by the current demonstration.

### 2.2 Business value

SecurePress provides five practical benefits:

1. **Clarity:** the client sees the complete assessment workflow instead of isolated screenshots or raw commands.
2. **Traceability:** each finding connects to a remediation, a validation check, and a report row.
3. **Risk prioritization:** the highest-risk issue is brought forward first, while the remaining findings stay reviewable.
4. **Operational visibility:** discovery, analysis, change sets, and controls show progress, status, duration, and recent activity.
5. **Safe demonstration:** the workflow can be explained without exposing confidential company data or touching production.

### 2.3 Success definition

The project succeeds when a new operator can start from a local source package and explain, without prior context:

- what was inspected;
- what evidence was found;
- how risk was prioritized;
- which corrections were prepared;
- which controls passed locally;
- which facts remain unverified on the target; and
- how the report was generated from the same workspace state.

## 3. Project goal and objectives

### 3.1 Main goal

Provide a credible and interactive demonstration of the security-audit and hardening workflow used for a WordPress project, while maintaining a strict boundary between local evidence and production claims.

### 3.2 Objectives

| Objective | What the implementation provides |
|---|---|
| Establish scope | A source-registration screen and a persisted source manifest |
| Make discovery explainable | Progressive indexing of the component inventory |
| Qualify risk | Findings with severity, confidence, evidence, exposure, impact, and recommendations |
| Connect findings to action | Ten finding-linked remediation/change-set records |
| Show validation | A control campaign, hardening controls, and explicit target-verification states |
| Preserve evidence | Timeline and operation history stored in the local assessment state |
| Produce a handoff artifact | Printable report and downloadable PDF |
| Protect confidentiality | No credentials, external connector, network call, or production mutation |

## 4. Scope and non-goals

### 4.1 Current scope

The current application includes:

- local source registration through a browser folder picker when supported;
- a prepared offline LNET TELCO source-package path for reliable demonstrations;
- source-structure verification;
- component discovery and inventory;
- static finding analysis;
- finding filtering and detail inspection;
- change-set preparation and local application state;
- individual hardening controls;
- a multi-phase control campaign;
- before/after and residual-risk reporting;
- guided walkthrough mode;
- local persistence with schema validation and recovery;
- print and browser-generated PDF report export;
- automated unit, component, E2E, build, lint, and offline-distribution checks.

### 4.2 Deliberate non-goals

The current product does not provide:

- a remote WordPress connector;
- credential storage or authentication against a live site;
- network scanning, exploitation, or attack simulation;
- automatic modification of the selected local folder;
- automatic modification of a production database, server, or WordPress installation;
- a complete CVE or exploitability engine;
- a guarantee that an extension is active merely because it is present in files;
- proof of runtime settings that cannot be observed from a source package;
- multi-user accounts, role-based access control, or server-side audit logs;
- an encrypted shared database;
- scheduled assessments or production alerting.

These items belong to a future productionization phase and require additional authorization, architecture, and security controls.

## 5. Product terminology and evidence rules

SecurePress uses precise language to avoid overclaiming.

| Term | Meaning in the project |
|---|---|
| Local source package | The folder or prepared package selected for inspection in the browser |
| Source manifest | Serializable metadata derived from source verification: path label, display name, version, markers, plugin count, theme count, and timestamp |
| Observed in package | Evidence directly read from the indexed offline source |
| Documented finding | A finding carried by audit material but not fully demonstrated by the current source package |
| Not observable locally | A claim requiring runtime or target-side evidence that the offline workflow cannot provide |
| Simulated pass | A deterministic result produced by the local control engine |
| Target verification required | A local result is insufficient; an authorized target must be checked separately |
| Change set | A proposed correction recorded and applied to the SecurePress workspace state; it is not a remote deployment |
| Dynamic retest not executed | The application intentionally did not run an external live retest |
| Posture score | A deterministic scenario score based on remaining risk points; it is not a compliance certification or normative security rating |

The most important client message is:

> **A local PASS proves what the local scenario evaluated. It does not prove that a production target is configured, deployed, reachable, or secure.**

## 6. End-to-end workflow

### 6.1 Workflow stages

| Stage | Route | Entry condition | Main action | Output | Next gate |
|---|---|---|---|---|---|
| Source setup | `/setup` | No ready source is persisted | Select a folder or the prepared package and verify it | `WorkspaceSource` manifest | Source status must be `ready` |
| Overview | `/` | Source is ready | Review context, workflow state, next action, and limits | Shared workspace orientation | Discovery becomes available |
| Discovery | `/inventaire` | Source is ready | Index package components | 22 component records | `inventoryCompleted = true` |
| Finding analysis | `/audit` | Discovery completed | Qualify the scenario findings | 10 finding records | `auditCompleted = true` |
| Change sets | `/remediation` | Finding analysis completed | Review and apply a finding-linked correction | Applied finding IDs and operation history | Change-set state is recorded locally |
| Controls and validation | `/validation` | Finding analysis completed | Run individual controls or the full campaign | Validation results and target limits | Campaign completion unlocks report |
| Comparison and report | `/rapport` | Control campaign completed | Review posture, findings, residual risk, timeline, print, or download PDF | Client-ready local report | Target work remains separate |

The route names `/inventaire` and `/rapport` are historical internal paths. The visible product copy is English: Discovery and Comparison & report.

### 6.2 Detailed workflow

#### Step 1 — Register and verify the source

The first screen prevents the user from entering the assessment without a source boundary.

The operator can:

- select a local WordPress folder through `window.showDirectoryPicker()` when the browser supports it;
- choose the prepared LNET TELCO source package for an offline presentation; or
- type an operator-readable path label.

A typed path is only a label. It is not inspected by the browser. The source is ready only when the application has either a selected directory handle or the prepared package and the verification process completes.

For a selected folder, the adapter checks four minimum markers:

1. `wp-config.php`;
2. `wp-includes`;
3. `wp-content/plugins`;
4. `wp-content/themes`.

When available, it also reads `wp-includes/version.php`, counts plugin directories, and counts theme directories. The directory handle remains transient and is not serialized into localStorage.

#### Step 2 — Discover the package

Discovery uses deterministic scenario data and reveals the component table progressively. The application reports which component is being indexed and how many of the total have been processed. The result describes package presence; it does not infer activation, runtime exposure, or exploitability.

Current scenario inventory:

- 1 WordPress core record;
- 4 theme records;
- 17 plugin records;
- 22 total indexed component records.

#### Step 3 — Analyze and qualify findings

Finding analysis processes the ten scenario findings one by one. The UI exposes severity counts, search, severity filters, evidence-status filters, and change-set filters. Opening a finding shows:

- observed evidence;
- confidence;
- exposure and impact;
- the recommended change;
- the associated artifact;
- associated validation checks; and
- the source and evidence limit.

#### Step 4 — Review and apply change sets

The remediation screen presents the highest-risk finding first, then the remaining change sets. Each card separates:

- baseline state;
- proposed state;
- rationale;
- workspace artifact;
- validation expectation; and
- application status.

Applying a change set runs a visible local operation with phases for preparation, dependency checking, recording workspace changes, and finalization. It updates `appliedFindingIds` in the assessment state. It does not write to the source folder or a remote system.

#### Step 5 — Run controls and validation

The validation screen contains local demonstrations, hardening controls, grouped validation checks, and a control campaign. During the campaign, checks move through queued/running/completed states in the UI. The canonical result is one of:

- `simulated_pass`;
- `simulated_fail`;
- `target_validation_required`; or
- `dynamic_retest_not_executed`.

Target-only checks remain visibly separate. After the campaign, SecurePress explicitly records that the external dynamic retest was not executed.

#### Step 6 — Review and export the report

The report is locked until the control campaign has completed. It recalculates its summary from the current scenario and assessment state and includes:

- registered source and evidence boundary;
- calculated posture and remaining risk points;
- all qualified findings;
- change-set status;
- validation status;
- operation timeline;
- target-verification boundary; and
- the explicit statement that no external dynamic retest was executed.

The user can print through the browser or download `securepress-lnet-telco-report.pdf` through the local jsPDF service.

### 6.3 Guided walkthrough

The guided walkthrough contains eight steps:

1. Start the workspace assessment;
2. run discovery;
3. run finding analysis;
4. inspect F-001;
5. apply the priority change set sequence;
6. run the control campaign;
7. review the comparison;
8. finish the report.

The walkthrough is useful for a client presentation because it moves through the same evidence-producing workflow as the normal interface, while keeping the target-verification boundary visible.

## 7. Architecture

### 7.1 Runtime architecture

```text
Browser
│
├── main.tsx
│   └── React StrictMode
│       └── App
│           ├── AssessmentProvider
│           │   ├── persisted AssessmentState
│           │   ├── source lifecycle
│           │   ├── SimulationEngine
│           │   └── operation/progress state
│           └── HashRouter
│               ├── /setup → SourceSetupPage
│               └── ready source → AppShell
│                   ├── Sidebar / TopBar / WorkspaceContextBar
│                   ├── OperationProgress / OperationActivity
│                   └── workflow route page
│                       ├── OverviewPage
│                       ├── InventoryPage
│                       ├── AuditPage
│                       ├── RemediationPage
│                       ├── ValidationPage
│                       └── ReportPage
│
├── Domain layer
│   ├── models.ts
│   ├── schema.ts
│   ├── selectors.ts
│   └── operation-view.ts
│
├── Scenario data
│   ├── project.ts
│   ├── components.ts
│   ├── findings.ts
│   ├── remediations.ts
│   └── validation-checks.ts
│
└── Browser services
    ├── source-adapter.ts
    ├── simulation-engine.ts
    ├── storage.ts
    └── report-pdf.ts
```

### 7.2 Architectural principles

| Principle | Implementation |
|---|---|
| Local-first | The application runs as a static Vite bundle and uses browser APIs only |
| Single state boundary | `AssessmentProvider` exposes workflow state and operations to pages |
| Pure domain decisions | Selectors calculate workflow, severity, posture, and remaining risk without UI side effects |
| Deterministic evidence | `telcoScenario` is validated with Zod before use |
| Truthful progress | The engine emits progress; pages derive temporary visible slices without committing incomplete results |
| Serializable state | The source manifest and completed operation records can be stored and restored; transient handles are excluded |
| Explicit limits | Evidence-status and validation-status types encode what is not observable or not executed |
| Portable reporting | PDF creation lives in a service rather than inside the React report component |

### 7.3 Main modules

| Module | Responsibility | Key files |
|---|---|---|
| App shell | Composition of route layout, navigation, context, activity, and progress | [`AppShell.tsx`](../securepress-demo/src/components/layout/AppShell.tsx), [`Sidebar.tsx`](../securepress-demo/src/components/layout/Sidebar.tsx), [`TopBar.tsx`](../securepress-demo/src/components/layout/TopBar.tsx) |
| Assessment provider | Owns state transitions, source lifecycle, operation locking, persistence, and guided mode | [`AssessmentProvider.tsx`](../securepress-demo/src/app/AssessmentProvider.tsx) |
| Source adapter | Verifies a selected directory or creates the prepared manifest | [`source-adapter.ts`](../securepress-demo/src/services/source-adapter.ts) |
| Simulation engine | Runs deterministic phases for discovery, analysis, change sets, and controls | [`simulation-engine.ts`](../securepress-demo/src/services/simulation-engine.ts) |
| Domain model | Types, validation schemas, selectors, and transient operation views | [`models.ts`](../securepress-demo/src/domain/models.ts), [`schema.ts`](../securepress-demo/src/domain/schema.ts), [`selectors.ts`](../securepress-demo/src/domain/selectors.ts), [`operation-view.ts`](../securepress-demo/src/domain/operation-view.ts) |
| Scenario data | Defines the current LNET TELCO demonstration dataset | [`data/`](../securepress-demo/src/data/) |
| Report service | Creates and downloads the local PDF | [`report-pdf.ts`](../securepress-demo/src/services/report-pdf.ts) |
| Persistence | Loads, validates, migrates, limits, and clears local state | [`storage.ts`](../securepress-demo/src/services/storage.ts) |

### 7.4 Data flow

```text
Scenario data
  ↓ validated by ScenarioSchema
AssessmentProvider
  ├── source setup → source-adapter → WorkspaceSource
  ├── runInventory → simulation-engine → progress → inventory state
  ├── runStaticAudit → simulation-engine → progress → finding state
  ├── applyRemediation → simulation-engine → appliedFindingIds
  ├── runValidation → simulation-engine → validationResults
  └── every committed transition → Zod-safe localStorage payload
                                      ↓
                              ReportPage / report-pdf
```

The UI reads from the provider and from pure selectors. Pages do not maintain independent copies of the finding counts, posture calculation, or operation status.

## 8. Domain model and state management

### 8.1 Core assessment state

`AssessmentState` is the central serializable workflow record:

| Field | Type/shape | Purpose |
|---|---|---|
| `source` | `WorkspaceSource` | Verified local source metadata and status |
| `stage` | `WorkflowStage` | Current workflow position |
| `inventoryCompleted` | boolean | Discovery gate |
| `auditCompleted` | boolean | Finding-analysis gate |
| `visibleFindingIds` | finding IDs | Findings exposed by completed analysis |
| `appliedFindingIds` | finding IDs | Change sets recorded in the workspace |
| `completedHardeningCheckIds` | string[] | Individually completed hardening controls |
| `validationResults` | record of status values | Local and target-verification outcomes |
| `timeline` | timestamped labels | Reportable activity trail |
| `guidedStep` | number or null | Eight-step walkthrough position |
| `lastRun` | completed/failed operation | Most recent operation shown in the UI |
| `operationHistory` | up to 20 completed/failed operations | Recent local activity history |

### 8.2 Source model

`WorkspaceSource` contains:

```text
status: unconfigured | checking | ready | invalid
mode: folder | prepared | null
pathLabel: string
displayName: string
wordpressVersion: string | null
fileMarkerCount: number
pluginCount: number
themeCount: number
verifiedAt: ISO timestamp | null
message: string
```

Only serializable source metadata is persisted. The live browser directory handle is transient. This prevents the application from pretending that a filesystem permission or handle is still available after a reload.

### 8.3 Operation model

An `OperationRun` records:

- an ID;
- operation kind: discovery, analysis, change-set, or controls;
- optional finding ID;
- status: idle, running, completed, or failed;
- start and completion timestamps;
- message and current step;
- processed and total counts; and
- duration in milliseconds.

When an operation is running, conflicting actions are disabled. When it completes or fails, the run is added to the local operation history and the timeline. A failure preserves the previously committed assessment results.

### 8.4 Persistence and recovery

- Storage key: `securepress.audit-lab.v1`.
- Storage location: browser `localStorage` for the current origin.
- Validation: Zod schemas validate persisted source, assessment, operation, finding, remediation, and validation structures.
- Recovery: malformed JSON or invalid state returns a safe initial assessment rather than blocking application startup.
- History limit: the 20 newest valid completed/failed runs are retained.
- Reset: only the SecurePress storage key is cleared; unrelated localStorage keys are preserved.

## 9. Technical operation details

### 9.1 Source verification

The source adapter has two paths:

1. **Prepared source:** `getPreparedSource()` derives its counts and WordPress version from `telcoScenario` and returns a ready manifest with the message “Source verified. No website was contacted.”
2. **Selected folder:** `inspectSelectedDirectory()` uses the browser directory handle to check the four WordPress markers, read the version where available, and count child plugin/theme directories.

The browser-native flow does not provide arbitrary Windows-path access by itself. An operator-readable path can be displayed and persisted as a label, but only a selected handle or prepared package can be inspected.

### 9.2 Simulation engine

The engine emits `ProgressUpdate` records with:

```text
percent
message
step
processed
total
```

Current operation behavior:

| Operation | Progress phases | State committed at completion |
|---|---|---|
| Discovery | Prepare source package → one phase per component → Source inventory ready | `stage = inventory`, `inventoryCompleted = true` |
| Finding analysis | Prepare finding analysis → one phase per finding → Finding analysis ready | `stage = audit`, `auditCompleted = true`, all ten finding IDs visible |
| Change set | Prepare → check dependencies → record workspace changes → finalize | Finding ID added to `appliedFindingIds` |
| Individual hardening check | Prepare → run control → control ready | Control ID added and result recorded |
| Control campaign | Prepare → functional → hardening → integrity → finalize | All ten checks receive local/target statuses; external retest marker is added |

The normal UI uses an injected delay of 450 ms per engine phase so the operation is observable during a presentation. Tests inject `delayMs: 0` so they remain deterministic and fast.

### 9.3 Workflow gates

Workflow availability is derived rather than hard-coded into each page:

- Overview and Discovery require `source.status === 'ready'`.
- Finding analysis requires `inventoryCompleted`.
- Change sets and Controls require `auditCompleted`.
- Report requires the control-campaign marker `external-dynamic-retest = dynamic_retest_not_executed`.

This keeps the client-facing sequence coherent: a report cannot appear complete before the evidence-producing operations have run.

### 9.4 Report generation

`report-pdf.ts` is a browser-side service built on jsPDF. It:

- receives the scenario, current assessment state, and generation timestamp;
- calculates remaining risk and posture from the same state used by the UI;
- includes source registration, findings, proposed change sets, controls, and operation history;
- writes a multi-page A4 PDF with wrapped text and page footers; and
- downloads a stable filename: `securepress-lnet-telco-report.pdf`.

The print action remains separate and uses the browser print stylesheet. The PDF download does not require a server or external API.

## 10. Current demonstration dataset

### 10.1 Project record

| Field | Current value |
|---|---|
| Project ID | `TELCO-AUDIT-2026` |
| Project name | `LNET TELCO` |
| WordPress | `6.4.3` |
| Plugin records | 17 |
| Theme records | 4 |
| Core records | 1 |
| Total component records | 22 |
| Findings | 10 |
| Remediations | 10 |
| Validation checks | 10 |

The project specification previously used the label “SecurePress Audit Lab” and an earlier fictitious scenario name. The current source code is the runtime authority for the current demonstration: the active scenario is LNET TELCO and the visible application is SecurePress Operations.

### 10.2 Findings catalogue

| ID | Finding | Severity | Risk points | Confidence | Evidence status | Validation |
|---|---|---:|---:|---|---|---|
| F-001 | Database account `root` | Critical | 12 | High | Observed in package | V-DB-ACCOUNT |
| F-002 | Empty database password | Critical | 12 | High | Observed in package | V-DB-PASSWORD |
| F-003 | Example WordPress keys and salts | High | 6 | High | Observed in package | V-WP-SALTS |
| F-004 | File editor not disabled | Medium | 3 | High | Observed in package | V-FILE-EDITOR |
| F-005 | Administration HTTPS not enforced | High | 5 | Medium | Not observable locally | V-HTTPS-TARGET |
| F-006 | Versions require review | Variable | 5 | Medium | Observed in package | V-COMPONENT-VERSIONS |
| F-007 | XML-RPC restriction not demonstrated | Medium | 3 | Low | Not observable locally | V-XMLRPC-TARGET |
| F-008 | Backup protection requires confirmation | High | 6 | Medium | Documented finding | V-BACKUP-TARGET |
| F-009 | Permissions may be too broad | Medium | 4 | Low | Documented finding | V-PERMISSIONS |
| F-010 | Comment moderation requires review | Low | 2 | Low | Documented finding | V-COMMENTS |

The total risk-point pool is 58. The values are scenario inputs used to make prioritization and before/after comparison visible; they are not CVSS scores and do not independently establish exploitability.

### 10.3 Remediation catalogue

| Remediation | Finding | Proposed action | Artifact represented | Initial state |
|---|---|---|---|---|
| R-001 | F-001 | Create a dedicated database account | Hardened `wp-config.php` | Prepared |
| R-002 | F-002 | Replace the empty password with a strong secret | Proposed environment secret | Prepared |
| R-003 | F-003 | Regenerate WordPress keys and salts | Proposed WordPress key block | Prepared |
| R-004 | F-004 | Disable the WordPress file editor | Hardened `wp-config.php` | Developed |
| R-005 | F-005 | Enforce administration HTTPS | Proposed configuration directive | Prepared |
| R-006 | F-006 | Prepare a component/version review | Remediation guide and WP-CLI plan | Recommended |
| R-007 | F-007 | Prepare an XML-RPC restriction | Proposed restriction rule | Prepared |
| R-008 | F-008 | Move backups outside the public directory | Documented hardened `.htaccess` | Recommended |
| R-009 | F-009 | Tighten file permissions | Prepared permissions procedure | Prepared |
| R-010 | F-010 | Strengthen comment moderation | WordPress settings guide | Recommended |

Applying a remediation in the UI means that the corresponding change set is recorded in the workspace state. It does not write the artifact to the selected folder.

### 10.4 Validation catalogue

| ID | Check | Category | Initial status |
|---|---|---|---|
| V-DB-ACCOUNT | Dedicated database account | Integrity | Not run |
| V-DB-PASSWORD | Non-empty database secret | Integrity | Not run |
| V-WP-SALTS | Unique keys and salts | Integrity | Not run |
| V-FILE-EDITOR | File editor disabled | Hardening | Not run |
| V-HTTPS-TARGET | Administration HTTPS | Retest | Target verification required |
| V-COMPONENT-VERSIONS | Version review | Retest | Target verification required |
| V-XMLRPC-TARGET | XML-RPC restriction | Hardening | Target verification required |
| V-BACKUP-TARGET | Backup protection | Integrity | Target verification required |
| V-PERMISSIONS | File permissions | Integrity | Not run |
| V-COMMENTS | Comment moderation | Functional | Not run |

After a full local campaign, checks that can be evaluated deterministically receive `simulated_pass`; target-only checks remain `target_validation_required`. The separate `external-dynamic-retest` record is set to `dynamic_retest_not_executed` to make the boundary explicit.

## 11. Posture score and KPI framework

### 11.1 Current posture calculation

The application calculates the score with this formula:

```text
remaining risk points = sum(riskPoints for findings not in appliedFindingIds)
posture score = max(0, 100 - remaining risk points)
```

Scenario references:

| State | Applied change-set example | Remaining risk | Calculated posture |
|---|---|---:|---:|
| Initial workspace | None | 58 | 42 / 100 |
| Guided walkthrough result | F-001, F-002, F-003, F-004, F-007, F-009 | 18 | 82 / 100 |
| All scenario change sets applied | All ten | 0 | 100 / 100 |

The score is a teaching and workflow metric. It is not a security certification, a compliance rating, a CVSS score, or proof that the target is secure.

### 11.2 Implementation KPIs

These KPIs describe whether the current demonstration workflow is operating as designed.

| KPI | Formula | Current reference | Interpretation |
|---|---|---|---|
| Source readiness | Ready source registrations ÷ source verification attempts | Prepared package can reach ready state | Measures setup reliability, not target availability |
| Discovery coverage | Indexed component records ÷ expected component records | 22 ÷ 22 after discovery | Shows whether the source inventory completed |
| Finding-analysis coverage | Qualified findings ÷ scenario findings | 10 ÷ 10 after analysis | Shows whether the scenario was fully processed |
| Remediation traceability | Findings with a remediation and validation link ÷ total findings | 10 ÷ 10 | Shows that findings are actionable in the workspace |
| Critical change-set coverage | Applied critical findings ÷ critical findings | 0 ÷ 2 initially; 2 ÷ 2 in guided flow | Shows priority treatment inside the scenario |
| Control campaign completion | Completed campaign marker present | `external-dynamic-retest = dynamic_retest_not_executed` | Shows the local campaign closed without pretending to be a live retest |
| Target-verification coverage | Passed target-only checks ÷ target-only checks | 0 ÷ 4 in the offline demo | Intentionally remains incomplete until an authorized target is checked |
| Residual-risk points | Sum of unapplied finding risk points | 58 initially; 18 after guided flow | Shows remaining scenario exposure, not production risk |
| Operation success rate | Completed runs ÷ completed plus failed runs | Stored in operation history | Monitors local workflow reliability |
| Report generation success | Successful PDF downloads ÷ report-download attempts | Tested at service boundary | Measures handoff reliability |
| Offline compliance | Forbidden external patterns found in distribution assets | Expected: 0 | Confirms the bundle remains self-contained |

### 11.3 Recommended production KPIs

If SecurePress becomes a production platform, the client should add operational KPIs backed by a server-side audit store:

| KPI | Definition | Why it matters |
|---|---|---|
| Time to triage | Time from evidence ingestion to accepted risk decision | Measures analyst efficiency |
| Critical remediation SLA | Percentage of critical findings corrected within the agreed time | Measures risk reduction against business commitments |
| Target-verification completion | Percentage of prepared changes verified on the authorized target | Prevents “prepared” from being mistaken for “deployed” |
| Reopened finding rate | Findings that return after a corrective action | Highlights weak or incomplete remediation |
| Evidence completeness | Findings with source, confidence, impact, recommendation, and validation evidence | Measures report quality |
| Assessment repeatability | Same source/version producing the same deterministic result when expected | Supports auditability and regression detection |
| Report delivery time | Time from campaign completion to approved report | Measures client handoff speed |
| Unauthorized change rate | Target changes without an approved change set | Requires integration with a real change-management system |
| Secret exposure incidents | Secrets detected in source, logs, reports, or storage | Measures the security of the future platform itself |

## 12. Security, privacy, and trust model

### 12.1 Current protections

- No remote WordPress URL, database, server, or API is configured by the application.
- No credentials, API keys, passwords, or company-internal paths are required for the prepared scenario.
- The prepared package is deterministic and local.
- A selected folder is read through the browser permission boundary; the application does not write to it.
- Directory handles are transient and are not serialized.
- Report generation occurs in the browser and creates a local Blob download.
- The distribution audit searches built text assets for external scripts, images, stylesheets, `fetch`, `WebSocket`, analytics, telemetry, and similar external references.
- The application keeps target-only checks visibly separate from local PASS results.

### 12.2 Current limitations

The current local-only design has important limitations:

- `localStorage` is browser-local and is not encrypted at rest.
- Anyone with access to the same browser profile and origin may be able to inspect the stored assessment state.
- There is no server-side identity, access control, multi-tenancy, or immutable audit log.
- The prepared source is a scenario representation, not a complete live filesystem snapshot.
- The browser cannot validate arbitrary absolute paths from text alone.
- File presence does not prove plugin activation or runtime exposure.
- Static evidence does not prove exploitability, reachability, patch availability, or target configuration.
- The local “change set applied” state is a workspace record, not a deployment transaction.
- The application does not fetch a vulnerability database or dynamically run a target retest.

### 12.3 Requirements before production use

Before connecting SecurePress to a real client target, the project would need at least:

1. explicit target authorization and a documented rules-of-engagement workflow;
2. authenticated users and role-based access control;
3. server-side tenant and assessment isolation;
4. encrypted storage and managed secrets;
5. immutable, time-stamped audit logging;
6. a carefully scoped connector or execution agent;
7. approval and rollback for every target-side change;
8. evidence integrity, retention, and export policies;
9. current vulnerability intelligence with source attribution; and
10. independent security testing of the platform itself.

## 13. Accessibility and user experience

The UI is designed for both a client presentation and keyboard-accessible operation.

Implemented UX controls include:

- a skip link to the main content;
- native buttons, links, labels, and form controls;
- `aria-live` status regions for source verification and operation progress;
- progress bars with accessible values and text alternatives;
- visible focus styles;
- focus trapping and focus restoration for the finding drawer and reset/guided dialogs;
- Escape-key handling for dialogs and the finding drawer;
- decorative icons hidden from assistive technologies;
- reduced-motion handling;
- layout checks at 1440×900, 1024×768, and 390×844;
- no global horizontal overflow in the responsive E2E checks; and
- a print stylesheet that removes navigation and interactive controls from the report output.

These checks improve usability but do not constitute a complete WCAG conformance audit.

## 14. Development setup and operating runbook

### 14.1 Prerequisites

The repository was verified with:

- Node.js `v24.12.0`;
- npm `11.6.2`; and
- a Chromium-capable browser for Playwright and the folder-picker path.

The package declares the following principal technologies:

- React `19.2.8` and React DOM;
- TypeScript `~6.0.2`;
- Vite `^8.2.2`;
- React Router `^8.3.1`;
- Zod `^4.5.4`;
- jsPDF `^4.2.1`;
- Vitest `^5.0.0`;
- Playwright `^1.63.0`;
- React Testing Library; and
- Oxlint.

### 14.2 Install and run locally

From the application directory:

```powershell
cd securepress-demo
npm.cmd install
npm.cmd run dev
```

The Vite development server provides hot reload for the browser demo.

### 14.3 Present the production build locally

```powershell
cd securepress-demo
npm.cmd run build
npm.cmd run present
```

`present` serves the built application on `127.0.0.1:4173` with a strict port. The application uses `HashRouter`, so it can be hosted as a static bundle without server-side route rewriting.

### 14.4 Recommended release checks

```powershell
cd securepress-demo
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run e2e
npm.cmd run audit:dist
npm.cmd run lint
npm.cmd run release:check
```

The convenience command below runs typecheck, unit/component tests, and build:

```powershell
npm.cmd run check
```

The release command combines the main check, Playwright E2E tests, and the offline distribution audit:

```powershell
npm.cmd run release:check
```

### 14.5 Resetting the demo

Use **Reset workspace** in the top bar to clear the SecurePress assessment state and return to source setup. Reset does not delete unrelated browser storage keys. The prepared source must be verified again before the workflow becomes available.

## 15. Quality assurance strategy

### 15.1 Unit and domain tests

The tests cover:

- scenario schema validation;
- source marker verification and version parsing;
- source-state defaults and persistence;
- localStorage recovery and migration;
- workflow selectors and posture calculation;
- operation-view progressive rows;
- simulation-engine phases and failure handling;
- report PDF signature and download filename.

### 15.2 Component tests

Component tests cover the source setup surface, application shell, sidebar, overview, discovery, audit, remediation, validation, report, guided walkthrough, and operation-provider behavior.

### 15.3 End-to-end tests

Playwright tests exercise the browser build and include the source setup path, guided/demo flow, operation workspace, reset and persistence, offline behavior, report layout, operation-action layout, accessibility, and responsive projection.

### 15.4 Offline distribution audit

[`scripts/audit-dist.mjs`](../securepress-demo/scripts/audit-dist.mjs) scans built text assets and fails if it finds external script/image/style references, remote `fetch` or WebSocket calls, Google Fonts/Tag Manager references, analytics, or telemetry patterns.

### 15.5 Verification recorded during this documentation pass

The baseline application check completed before the documentation edit with:

- 21 Vitest test files;
- 132 tests passing; and
- a successful Vite production build.

The final verification section of the handoff should be based on a fresh run after the Markdown change, not on this baseline alone.

## 16. Delivery, ownership, and operating model

| Role | Responsibility in the current project |
|---|---|
| Demonstration operator | Selects or loads the prepared source, runs the workflow, and explains evidence boundaries |
| Security reviewer | Reviews finding severity, evidence confidence, impact, proposed remediation, and target-verification requirements |
| Client stakeholder | Confirms the business priority and decides which future target-side validations are authorized |
| Application maintainer | Maintains scenario data, workflow rules, tests, accessibility, and release checks |
| Future platform owner | Would own identity, tenant isolation, connectors, secrets, retention, and production operations |

The current product is operated as a controlled local demonstration. The operator should not describe a simulated PASS as a production deployment result and should not apply the represented configuration changes outside the approved process.

## 17. Roadmap

### 17.1 Current milestone — local evidence workspace

Delivered in the current implementation:

- verified local source gate;
- deterministic LNET TELCO scenario;
- progressive discovery and finding analysis;
- finding-linked change sets;
- local controls and explicit target-verification status;
- persistent local workspace state;
- guided presentation flow;
- printable and downloadable report;
- accessibility, responsive, and offline checks.

### 17.2 Next milestone — production-ready assessment foundation

Recommended next steps:

1. add authenticated user and project accounts;
2. move assessment state from localStorage to a protected backend;
3. add an immutable activity/audit log;
4. add a formal evidence-upload model with integrity hashes;
5. add CVE/advisory enrichment with source attribution;
6. add approval workflows for remediation plans;
7. add a target-verification adapter that runs only under explicit authorization;
8. add rollback and change-set versioning; and
9. add report templates per client/project.

### 17.3 Later product expansion

Potential later capabilities include:

- scheduled assessments;
- organization and tenant administration;
- role-based review and approval;
- trend dashboards across assessments;
- integrations with ticketing and change-management systems;
- controlled deployment agents;
- notifications and SLA monitoring; and
- evidence retention and legal/compliance export policies.

Each item expands the security and operational scope of the product and should be designed as a separate, authorized subsystem.

## 18. Suggested client demonstration script

### 18.1 Five-minute flow

1. **Introduce the boundary.** Explain that the workspace is local and that no production system is contacted.
2. **Register the source.** Choose the prepared LNET TELCO package and show the verification checklist.
3. **Run discovery.** Point out that 22 components appear progressively and that presence does not prove activation.
4. **Analyze findings.** Run finding analysis, open F-001, and show evidence, confidence, impact, remediation, and validation.
5. **Apply a change set.** Apply the priority correction and explain that it updates the workspace record only.
6. **Run controls.** Show local PASS results and the separate Target verification required states.
7. **Review posture.** Explain the 42/100 baseline and the projected change-set score as deterministic scenario math.
8. **Export the report.** Download the PDF and point to the source, evidence, controls, operation history, and “dynamic retest not executed” statement.

### 18.2 Closing statement

> SecurePress demonstrates a complete security decision workflow, not just a list of vulnerabilities. The important result is the traceability from source evidence to risk decision, proposed correction, local validation, and the remaining target-side work.

## 19. Repository map and source of truth

### 19.1 Repository structure

```text
SecurePress/
├── SecurePress_Audit_Lab_Project_Spec.md     Original functional scope
├── docs/
│   ├── SECUREPRESS-PROJECT-DOCUMENTATION.md  This client/technical guide
│   └── superpowers/
│       ├── specs/                             Approved design records
│       └── plans/                             Implementation plans
├── securepress-demo/
│   ├── src/                                   React/TypeScript application
│   ├── e2e/                                   Playwright browser tests
│   ├── scripts/                               Build and distribution checks
│   ├── docs/                                  Release/accessibility notes
│   ├── package.json                           Commands and dependencies
│   └── vite.config.ts                         Vite/Vitest configuration
├── presentation-kit/                          Demo deck and QA exports
├── Rapport-PFE-LNET.pdf                       Supporting report artifact
└── SecurePress-presentation-kit-backup.zip    Supporting backup artifact
```

### 19.2 Source-of-truth rules

Use these sources in this order when maintaining the documentation:

1. **Runtime behavior:** current files under `securepress-demo/src/`.
2. **Scenario facts:** `securepress-demo/src/data/` and `securepress-demo/src/domain/`.
3. **Commands and dependencies:** `securepress-demo/package.json` and lockfile.
4. **Acceptance intent:** the approved design files under `docs/superpowers/specs/`.
5. **Historical context:** `SecurePress_Audit_Lab_Project_Spec.md`, presentation materials, and the stage report.

If a historical specification and the current implementation differ, this guide should describe the current implementation and note the intended evolution rather than silently mixing the two.

### 19.3 Key implementation references

- [`securepress-demo/src/app/routes.tsx`](../securepress-demo/src/app/routes.tsx) — route gate and workflow routes.
- [`securepress-demo/src/app/AssessmentProvider.tsx`](../securepress-demo/src/app/AssessmentProvider.tsx) — state transitions, source lifecycle, progress, persistence, and guided mode.
- [`securepress-demo/src/domain/models.ts`](../securepress-demo/src/domain/models.ts) — core types and status vocabulary.
- [`securepress-demo/src/domain/schema.ts`](../securepress-demo/src/domain/schema.ts) — runtime validation and recovery boundaries.
- [`securepress-demo/src/domain/selectors.ts`](../securepress-demo/src/domain/selectors.ts) — workflow gates, severity, posture, and risk calculations.
- [`securepress-demo/src/services/source-adapter.ts`](../securepress-demo/src/services/source-adapter.ts) — local source verification.
- [`securepress-demo/src/services/simulation-engine.ts`](../securepress-demo/src/services/simulation-engine.ts) — deterministic operation phases.
- [`securepress-demo/src/services/storage.ts`](../securepress-demo/src/services/storage.ts) — localStorage persistence and migration.
- [`securepress-demo/src/services/report-pdf.ts`](../securepress-demo/src/services/report-pdf.ts) — PDF generation and download.
- [`securepress-demo/src/data/scenario.ts`](../securepress-demo/src/data/scenario.ts) — scenario composition and schema parsing.
- [`securepress-demo/docs/RELEASE-CHECKLIST.md`](../securepress-demo/docs/RELEASE-CHECKLIST.md) — prior release verification record.
- [`securepress-demo/docs/ACCESSIBILITY.md`](../securepress-demo/docs/ACCESSIBILITY.md) — accessibility and projection verification notes.

## 20. Glossary

| Term | Definition |
|---|---|
| Assessment | One end-to-end evaluation of a registered source package |
| Evidence boundary | The explicit statement of what the current source or operation can prove |
| Finding | A qualified security observation with severity, confidence, evidence, impact, recommendation, and validation link |
| Hardening control | A control intended to reduce attack surface or strengthen configuration |
| Local workspace | The browser-side assessment state for the current demonstration |
| Manifest | Structured metadata describing the verified source package |
| Remediation | A proposed correction linked to a finding |
| Scenario | Deterministic project data used to drive the demonstration |
| Source adapter | Service that verifies a selected folder or prepares the known offline package |
| Target | The real, authorized WordPress environment that is outside the current demonstration |
| Validation | A check of a proposed or existing control; in the demo it may be local, simulated, or target-required |
| Workspace change set | A recorded local representation of a remediation action, not a live deployment |

## 21. Final project statement

SecurePress is a focused, honest, and presentable security-workflow prototype. Its main achievement is not that it claims to secure a live WordPress site automatically; it is that it makes the security process understandable and traceable while respecting confidentiality and authorization boundaries. The architecture is deliberately prepared for future productionization, but the current client promise should remain precise:

> **SecurePress demonstrates how a WordPress assessment can move from local evidence to qualified risk, prepared remediation, local validation, and a traceable report — with target-side verification clearly identified as the next authorized step.**
