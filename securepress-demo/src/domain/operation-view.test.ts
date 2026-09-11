import { describe, expect, test } from 'vitest'
import { telcoScenario } from '../data/scenario'
import type { OperationRun } from './models'
import { selectVisibleComponents, selectVisibleFindings } from './operation-view'
import type { ProgressUpdate } from '../services/simulation-engine'

const runningDiscovery: OperationRun = {
  id: 'discovery-1',
  kind: 'discovery',
  status: 'running',
  startedAt: '2026-09-11T10:00:00.000Z',
  message: 'Discovery run in progress',
}

const runningAnalysis: OperationRun = {
  id: 'analysis-1',
  kind: 'analysis',
  status: 'running',
  startedAt: '2026-09-11T10:00:00.000Z',
  message: 'Finding analysis in progress',
}

function progress(processed: number, total: number): ProgressUpdate {
  return {
    percent: total === 0 ? 0 : Math.round((processed / total) * 100),
    message: 'Working',
    step: 'Working',
    processed,
    total,
  }
}

describe('progressive operation views', () => {
  test('exposes only indexed components during a running discovery', () => {
    expect(
      selectVisibleComponents(telcoScenario.inventory.components, runningDiscovery, progress(7, 22), false),
    ).toHaveLength(7)
    expect(
      selectVisibleComponents(telcoScenario.inventory.components, runningDiscovery, progress(0, 22), false),
    ).toHaveLength(0)
    expect(
      selectVisibleComponents(telcoScenario.inventory.components, null, null, true),
    ).toHaveLength(22)
  })

  test('exposes qualified findings progressively and the final collection only after completion', () => {
    expect(
      selectVisibleFindings(telcoScenario.findings, runningAnalysis, progress(3, 10), false),
    ).toHaveLength(3)
    expect(
      selectVisibleFindings(telcoScenario.findings, runningAnalysis, progress(0, 10), false),
    ).toHaveLength(0)
    expect(
      selectVisibleFindings(telcoScenario.findings, null, null, true),
    ).toHaveLength(10)
  })
})
