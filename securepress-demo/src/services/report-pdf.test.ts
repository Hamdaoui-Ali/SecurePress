import { beforeEach, expect, test, vi } from 'vitest'
import { createInitialAssessment, type AssessmentState } from '../domain/models'
import { telcoScenario } from '../data/scenario'
import { getPreparedSource } from './source-adapter'
import { buildReportPdf, downloadReportPdf } from './report-pdf'

beforeEach(() => {
  vi.restoreAllMocks()
})

function reportState(): AssessmentState {
  const initial = createInitialAssessment()
  return {
    ...initial,
    source: getPreparedSource(
      'C:\\SecurePress\\targets\\lnet-telco-wordpress',
      new Date('2026-09-11T10:00:00.000Z'),
    ),
    stage: 'report' as const,
    inventoryCompleted: true,
    auditCompleted: true,
    visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
    appliedFindingIds: ['F-001', 'F-004'],
    validationResults: {
      'V-FILE-EDITOR': 'simulated_pass' as const,
      'V-HTTPS-TARGET': 'target_validation_required' as const,
      'external-dynamic-retest': 'dynamic_retest_not_executed' as const,
    },
    lastRun: {
      id: 'controls-2026-09-11T10:00:00.000Z-1',
      kind: 'controls' as const,
      status: 'completed' as const,
      startedAt: '2026-09-11T10:00:00.000Z',
      completedAt: '2026-09-11T10:00:08.000Z',
      durationMs: 8_000,
      message: 'Control campaign completed - target verification pending',
      currentStep: 'Finalizing control campaign',
      processed: 10,
      total: 10,
    },
    operationHistory: [],
  }
}

test('builds a readable PDF with source, findings, controls, and operations', () => {
  const pdf = buildReportPdf({
    scenario: telcoScenario,
    state: reportState(),
    generatedAt: new Date('2026-09-11T10:10:00.000Z'),
  })

  expect(new TextDecoder().decode(pdf.slice(0, 4))).toBe('%PDF')
  expect(pdf.byteLength).toBeGreaterThan(8_000)
})

test('downloads the generated report with the stable filename', () => {
  const createObjectUrl = vi.fn(() => 'blob:securepress-report')
  const revokeObjectUrl = vi.fn()
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectUrl,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectUrl,
  })
  let clickedAnchor: HTMLAnchorElement | null = null
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clickedAnchor = this
  })

  downloadReportPdf({
    scenario: telcoScenario,
    state: reportState(),
    generatedAt: new Date('2026-09-11T10:10:00.000Z'),
  })

  expect(createObjectUrl).toHaveBeenCalledOnce()
  expect(createObjectUrl).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf' }))
  expect(clickedAnchor).not.toBeNull()
  expect(clickedAnchor!.download).toBe('securepress-lnet-telco-report.pdf')
  expect(clickedAnchor!.href).toBe('blob:securepress-report')
  expect(revokeObjectUrl).toHaveBeenCalledWith('blob:securepress-report')
})
