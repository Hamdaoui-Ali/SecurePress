# SecurePress Guided Assessment Flow Design

## Goal

Make the demo tell one credible, linear story from registering a local WordPress source through discovery, finding analysis, workspace corrections, controls, and the final report.

The interface must never present evidence as if it already exists before the operation that produces it has completed. The source boundary must remain explicit: this browser demo inspects a selected local folder or the prepared package, and it does not contact a live website.

## Approved workflow

1. Choose source
2. Verify source
3. Discovery
4. Finding analysis
5. Prepare and apply corrections
6. Run controls
7. Review and download report

The overview is a progress surface, not a second copy of every result. It exposes only the evidence available at the current stage and points to the next action.

## Design decisions

### 1. Source selection must be honest

The current free-text path field creates a false affordance: a typed operating-system path looks accepted, but a browser cannot inspect it without a directory handle. Replace it with an explicit source chooser:

- `Select local WordPress folder` is the primary action and uses the browser folder picker when available.
- `Use prepared LNET TELCO package` is the deterministic demo path and displays its prepared local path.
- The selected source is shown as a read-only registered-source summary; the UI explains that browser verification is granted by folder selection, not by typing a path.
- `Verify source` is the only action that begins inspection. It is disabled until a folder or the prepared package is selected.

This keeps the demo realistic without claiming that a browser can inspect an arbitrary typed path. Supporting typed absolute paths would require a local backend or desktop adapter and is outside this branch.

### 2. Source verification is a visible checklist

During verification, `SourceStatus` shows five ordered checks:

1. Checking folder access and path existence
2. Reading WordPress files
3. Detecting WordPress version
4. Reading plugins and themes
5. Source verified

The active step is visibly running and completed steps are marked complete. The progress model remains ephemeral and is not persisted as assessment evidence. When complete, the status states `Source verified. No website was contacted.` and the app redirects to the overview.

### 3. Evidence is stage-gated

The overview disclosure rules are:

- Source verified: source summary, workflow, evidence boundary, and `Start discovery`. No component count, finding count, score, or severity distribution.
- Discovery completed: indexed component count and `Continue to finding analysis`. Finding and posture data remain hidden.
- Finding analysis completed: finding counts, severity distribution, baseline posture score, and `Continue to corrections` become visible.
- Corrections/control work: applied change sets and projected posture are visible with the target-verification caveat.
- Control campaign completed: validation status and report action are visible.

The report route is also evidence-gated. A direct visit before finding analysis shows a pending-report explanation rather than the comparison table. A direct visit after analysis but before the control campaign points back to controls; the printable/downloadable report is available once the campaign has completed.

Pages may still render a prerequisite message if reached directly by URL, but the sidebar locks future navigation and explains the missing prerequisite. This keeps direct-link testability while giving normal users a single path.

### 4. Every operation ends with a next action

The operation pages keep their progressive simulation behavior and add a single primary continuation when complete:

- Discovery: `Continue to finding analysis`
- Finding analysis: `Continue to corrections`
- Corrections: `Continue to controls`
- Controls: `Review report`

The links use the existing router and are disabled while an operation is active. Re-running an earlier operation remains possible from that page for demo exploration.

### 5. Navigation communicates locked state

The sidebar uses the current assessment state to classify each workflow item as current, completed, or locked. Locked items are rendered as non-navigating controls with an accessible explanation, for example `Finding analysis — Locked until discovery is complete`. Overview remains available after source verification; completed steps remain available for review.

On narrow screens the workflow rail remains horizontally scrollable, but each item is allowed to retain its full label and the locked state is not communicated by clipping alone.

## State and component boundaries

- `AssessmentProvider` owns source verification phases and exposes a typed checklist progress object.
- `SourceStatus` renders the checklist and source boundary copy.
- `Sidebar` derives navigation availability from `AssessmentState`; no page owns navigation state.
- `OverviewPage` derives disclosure from `AssessmentState` and renders only stage-appropriate panels.
- `ReportPage` renders its full comparison only after the control campaign has a completed external-retest marker; otherwise it renders the missing-prerequisite state.
- Feature pages own their completion CTA, while the simulation engine remains unchanged except for existing operation state consumption.
- A small workflow helper in `domain/selectors.ts` provides the shared stage/lock/next-action decisions so sidebar, overview, and tests do not duplicate prerequisite logic.

## Error handling

- A missing source selection keeps `Verify source` disabled and gives a direct selection message.
- A picker failure remains local to setup and does not alter the saved assessment.
- A source inspection failure marks the source invalid, keeps the user on setup, and preserves the failed message.
- Direct navigation to a locked page shows its existing prerequisite banner; it does not fabricate results or redirect away from the page.
- Operation failure keeps the relevant page available for retry and does not advance the workflow.

## Testing strategy

Test first, then implement in slices:

- Source tests assert the explicit chooser, disabled verification before selection, and the ordered checklist while verification runs.
- Selector tests assert stage-gated navigation and next-action decisions.
- Overview tests assert that early stages do not contain findings or posture data, and later stages reveal them.
- Sidebar tests assert locked labels and completed/current states.
- Feature page tests assert continuation CTAs only appear after their operation prerequisite completes.
- Existing operation and guided-demo tests remain green; E2E follows the user-visible linear path and captures desktop/mobile screenshots for the final review.

## Non-goals

- No live WordPress connection or server-side file inspection.
- No arbitrary typed-path support in a browser-only build.
- No redesign of the existing evidence data, correction artifacts, or PDF generation.
- No new authentication, persistence backend, or deployment integration.
