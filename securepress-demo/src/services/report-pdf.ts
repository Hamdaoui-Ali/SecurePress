import { jsPDF } from 'jspdf'
import type {
  AssessmentState,
  OperationKind,
  OperationRun,
  Scenario,
  ValidationStatus,
} from '../domain/models'

export interface ReportPdfInput {
  scenario: Scenario
  state: AssessmentState
  generatedAt: Date
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 44
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

function pdfText(value: string): string {
  return value
    .replace(/[·•]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
}

function validationLabel(status: ValidationStatus): string {
  switch (status) {
    case 'simulated_pass':
      return 'PASS - local check'
    case 'simulated_fail':
      return 'FAIL - local check'
    case 'target_validation_required':
      return 'TARGET VERIFICATION REQUIRED'
    case 'dynamic_retest_not_executed':
      return 'DYNAMIC RETEST NOT EXECUTED'
    default:
      return 'NOT RUN'
  }
}

function operationLabel(kind: OperationKind): string {
  switch (kind) {
    case 'discovery':
      return 'Discovery'
    case 'analysis':
      return 'Finding analysis'
    case 'change-set':
      return 'Change set'
    case 'controls':
      return 'Control campaign'
  }
}

function operationStatusLabel(status: OperationRun['status']): string {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    case 'running':
      return 'Running'
    default:
      return 'Idle'
  }
}

function sourceModeLabel(state: AssessmentState): string {
  return state.source.mode === 'prepared' ? 'Prepared demonstration package' : 'Selected local folder'
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatOperationTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? timestamp : formatTimestamp(date)
}

class PdfWriter {
  private readonly doc: jsPDF
  private y = MARGIN

  constructor() {
    this.doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      compress: true,
    })
    this.doc.setProperties({
      title: 'SecurePress local security assessment report',
      subject: 'LNET TELCO WordPress source package assessment',
      author: 'SecurePress',
      creator: 'SecurePress Operations',
    })
  }

  private ensureSpace(height: number) {
    if (this.y + height <= PAGE_HEIGHT - MARGIN - 22) return
    this.finishPage()
    this.doc.addPage()
    this.y = MARGIN
  }

  private finishPage() {
    const pageNumber = this.doc.getNumberOfPages()
    this.doc.setDrawColor(210, 218, 228)
    this.doc.line(MARGIN, PAGE_HEIGHT - 35, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 35)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(8)
    this.doc.setTextColor(108, 119, 132)
    this.doc.text('SecurePress Operations - local evidence report', MARGIN, PAGE_HEIGHT - 21)
    this.doc.text('Page ' + pageNumber, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 21, {
      align: 'right',
    })
    this.doc.setTextColor(24, 35, 49)
  }

  text(
    value: string,
    options: {
      size?: number
      color?: [number, number, number]
      bold?: boolean
      gapAfter?: number
      maxWidth?: number
      lineHeight?: number
    } = {},
  ) {
    const size = options.size ?? 9.5
    const lineHeight = options.lineHeight ?? size * 1.38
    const maxWidth = options.maxWidth ?? CONTENT_WIDTH
    const lines = this.doc.splitTextToSize(pdfText(value), maxWidth)
    this.ensureSpace(lines.length * lineHeight + (options.gapAfter ?? 0))
    this.doc.setFont('helvetica', options.bold ? 'bold' : 'normal')
    this.doc.setFontSize(size)
    this.doc.setTextColor(...(options.color ?? [34, 47, 62]))
    this.doc.text(lines, MARGIN, this.y, { lineHeightFactor: lineHeight / size })
    this.y += lines.length * lineHeight + (options.gapAfter ?? 0)
  }

  title(value: string) {
    this.ensureSpace(72)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(23)
    this.doc.setTextColor(20, 46, 78)
    const lines = this.doc.splitTextToSize(pdfText(value), CONTENT_WIDTH)
    this.doc.text(lines, MARGIN, this.y)
    this.y += lines.length * 28 + 8
  }

  section(value: string) {
    this.ensureSpace(45)
    this.y += 8
    this.doc.setDrawColor(26, 112, 154)
    this.doc.setLineWidth(1.4)
    this.doc.line(MARGIN, this.y, MARGIN + 34, this.y)
    this.y += 18
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(14)
    this.doc.setTextColor(20, 46, 78)
    this.doc.text(pdfText(value), MARGIN, this.y)
    this.y += 23
  }

  labelValue(label: string, value: string) {
    this.ensureSpace(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.setTextColor(92, 105, 120)
    this.doc.text(pdfText(label.toUpperCase()), MARGIN, this.y)
    this.y += 12
    this.text(value, { size: 9.5, gapAfter: 7 })
  }

  bullet(value: string) {
    this.ensureSpace(22)
    this.doc.setFillColor(26, 112, 154)
    this.doc.circle(MARGIN + 3, this.y - 3, 2, 'F')
    const previousMargin = this.y
    this.y = previousMargin
    const lines = this.doc.splitTextToSize(pdfText(value), CONTENT_WIDTH - 16)
    this.ensureSpace(lines.length * 13 + 4)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9.5)
    this.doc.setTextColor(34, 47, 62)
    this.doc.text(lines, MARGIN + 12, this.y, { lineHeightFactor: 1.38 })
    this.y += lines.length * 13 + 4
  }

  rule() {
    this.ensureSpace(16)
    this.doc.setDrawColor(224, 230, 237)
    this.doc.setLineWidth(0.7)
    this.doc.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y)
    this.y += 12
  }

  spacer(amount = 8) {
    this.y += amount
  }

  reserve(height: number) {
    this.ensureSpace(height)
  }

  output(): Uint8Array {
    this.finishPage()
    const bytes = this.doc.output('arraybuffer') as ArrayBuffer
    return new Uint8Array(bytes)
  }
}

export function buildReportPdf(input: ReportPdfInput): Uint8Array {
  const { scenario, state, generatedAt } = input
  const writer = new PdfWriter()
  const totalRiskPoints = scenario.findings.reduce(
    (total, finding) => total + finding.riskPoints,
    0,
  )
  const remainingRiskPoints = scenario.findings
    .filter((finding) => !state.appliedFindingIds.includes(finding.id))
    .reduce((total, finding) => total + finding.riskPoints, 0)
  const postureScore = Math.max(0, 100 - remainingRiskPoints)
  const operations = state.operationHistory.length > 0
    ? [...state.operationHistory].sort(
        (left, right) => Date.parse(left.startedAt) - Date.parse(right.startedAt),
      )
    : []

  writer.title('SecurePress local security assessment report')
  writer.text(
    'LNET TELCO WordPress source package - generated ' + formatTimestamp(generatedAt),
    { size: 11, color: [26, 112, 154], bold: true, gapAfter: 14 },
  )
  writer.text(
    'This report records a local source-package assessment. It does not claim that a live website was contacted or that target-side verification was completed.',
    { size: 10, gapAfter: 14 },
  )

  writer.section('1. Source registration and evidence boundary')
  writer.labelValue('Source status', state.source.status === 'ready' ? 'READY - verified locally' : state.source.status)
  writer.labelValue('Source mode', sourceModeLabel(state))
  writer.labelValue('Source path', state.source.pathLabel || 'Not registered')
  writer.labelValue('WordPress version', state.source.wordpressVersion || scenario.project.wordpressVersion)
  writer.labelValue(
    'Verified markers',
    state.source.fileMarkerCount + ' required WordPress markers; ' +
      state.source.pluginCount + ' plugins and ' + state.source.themeCount + ' themes counted',
  )
  writer.bullet('Discovery evidence is limited to the registered local source package.')
  writer.bullet('Component presence does not establish activation or exposure on a target.')
  writer.bullet('Target verification remains a separate authorized step.')

  writer.section('2. Assessment summary')
  writer.labelValue('Calculated posture', postureScore + ' / 100')
  writer.labelValue('Risk points', remainingRiskPoints + ' open of ' + totalRiskPoints + ' total')
  writer.labelValue('Qualified findings', scenario.findings.length + ' findings')
  writer.labelValue('Applied change sets', state.appliedFindingIds.length + ' of ' + scenario.findings.length)
  writer.labelValue('Recorded operations', operations.length + ' completed or failed operations')

  writer.reserve(190)
  writer.section('3. Qualified findings and proposed change sets')
  for (const finding of scenario.findings) {
    writer.reserve(155)
    const remediation = scenario.remediations.find((item) => item.id === finding.remediationId)
    const check = scenario.validationChecks.find((item) => finding.validationIds.includes(item.id))
    const validationStatus = check
      ? state.validationResults[check.id] ?? check.initialStatus
      : 'not_run'
    const changeStatus = state.appliedFindingIds.includes(finding.id)
      ? 'CHANGE SET APPLIED'
      : 'CHANGE SET PENDING'

    writer.text(finding.id + ' - ' + finding.title, {
      size: 10.5,
      bold: true,
      color: [20, 46, 78],
      gapAfter: 3,
    })
    writer.text(
      'Severity: ' + finding.severity.toUpperCase() +
        ' | Confidence: ' + finding.confidence +
        ' | ' + changeStatus,
      { size: 8.5, color: [92, 105, 120], gapAfter: 5 },
    )
    writer.text('Evidence: ' + finding.evidence, { size: 9, gapAfter: 3 })
    writer.text('Exposure: ' + finding.exposure, { size: 9, gapAfter: 3 })
    writer.text('Impact: ' + finding.impact, { size: 9, gapAfter: 3 })
    writer.text(
      'Proposed change: ' + (remediation?.title ?? 'No change set defined'),
      { size: 9, gapAfter: 3 },
    )
    writer.text(
      'Validation: ' + validationLabel(validationStatus as ValidationStatus),
      { size: 9, gapAfter: 5 },
    )
    writer.rule()
  }

  writer.section('4. Control results and verification boundary')
  for (const check of scenario.validationChecks) {
    const status = state.validationResults[check.id] ?? check.initialStatus
    writer.text(check.id + ' - ' + check.title, {
      size: 9.5,
      bold: true,
      gapAfter: 2,
    })
    writer.text(validationLabel(status), {
      size: 8.5,
      color: status === 'simulated_pass' ? [37, 120, 77] : [164, 99, 33],
      gapAfter: 2,
    })
    writer.text('Expected: ' + check.expectedResult, { size: 8.8, gapAfter: 5 })
  }
  writer.bullet('PASS indicates a deterministic local control result only.')
  writer.bullet('Target verification is required before treating a prepared change as deployed.')
  writer.bullet('External dynamic retest: NOT EXECUTED.')

  writer.section('5. Operation history')
  if (operations.length === 0) {
    writer.text('No operations were completed in this session.', { size: 9.5 })
  } else {
    for (const operation of operations) {
      writer.text(operationLabel(operation.kind) + ' - ' + operationStatusLabel(operation.status), {
        size: 9.5,
        bold: true,
        gapAfter: 2,
      })
      writer.text(operation.message, { size: 9, gapAfter: 2 })
      writer.text(
        formatOperationTimestamp(operation.completedAt ?? operation.startedAt) +
          (operation.durationMs !== undefined
            ? ' | Duration: ' + Math.round(operation.durationMs / 1000) + 's'
            : ''),
        { size: 8.5, color: [92, 105, 120], gapAfter: 7 },
      )
    }
  }

  writer.section('6. Closing note')
  writer.text(
    'SecurePress generated this report from the local source manifest, indexed component inventory, qualified findings, proposed change sets, control results, and recorded workspace operations. A live target must be verified separately under an authorized process.',
    { size: 9.5, gapAfter: 5 },
  )

  return writer.output()
}

export function downloadReportPdf(
  input: ReportPdfInput,
  filename = 'securepress-lnet-telco-report.pdf',
): void {
  const bytes = buildReportPdf(input)
  const blobData = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(blobData).set(bytes)
  const blob = new Blob([blobData], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.click()
  URL.revokeObjectURL(url)
}
