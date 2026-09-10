import { beforeEach, describe, expect, test } from 'vitest'
import { createInitialAssessment } from '../domain/models'
import {
  clearAssessment,
  loadAssessment,
  saveAssessment,
  STORAGE_KEY,
} from './storage'

describe('assessment storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test.each([
    ['absent', null, 'initialized'],
    ['corrompu', '{bad-json', 'recovered'],
  ] as const)(
    'retourne un état sûr pour un stockage %s',
    (_label, stored, expectedStatus) => {
      if (stored) localStorage.setItem(STORAGE_KEY, stored)
      expect(loadAssessment().status).toBe(expectedStatus)
    },
  )

  test('restaure un état valide', () => {
    const state = { ...createInitialAssessment(), stage: 'audit' as const }
    saveAssessment(state)

    expect(loadAssessment()).toEqual({ status: 'restored', state })
  })

  test('restaure un dernier run terminé', () => {
    const state = {
      ...createInitialAssessment(),
      lastRun: {
        id: 'run-001',
        kind: 'analysis' as const,
        status: 'completed' as const,
        startedAt: '2026-09-10T10:00:00.000Z',
        completedAt: '2026-09-10T10:00:04.000Z',
        message: 'Audit completed',
        currentStep: 'Summarizing findings',
        processed: 10,
        total: 10,
        durationMs: 4000,
      },
    }
    saveAssessment(state)

    expect(loadAssessment()).toEqual({ status: 'restored', state })
  })

  test('restaure un dernier run échoué', () => {
    const state = {
      ...createInitialAssessment(),
      lastRun: {
        id: 'run-002',
        kind: 'controls' as const,
        status: 'failed' as const,
        startedAt: '2026-09-10T10:05:00.000Z',
        completedAt: '2026-09-10T10:05:01.000Z',
        message: 'Control simulation failed',
        durationMs: 1000,
      },
    }
    saveAssessment(state)

    expect(loadAssessment()).toEqual({ status: 'restored', state })
  })

  test('normalise l’historique aux 20 derniers runs valides', () => {
    const history = Array.from({ length: 22 }, (_, index) => ({
      id: `run-${index + 1}`,
      kind: 'discovery' as const,
      status: index % 2 === 0 ? ('completed' as const) : ('failed' as const),
      startedAt: `2026-09-10T10:${String(index).padStart(2, '0')}:00.000Z`,
      message: `Run ${index + 1}`,
    }))
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...createInitialAssessment(), operationHistory: history }),
    )

    const result = loadAssessment()

    expect(result).toMatchObject({ status: 'restored' })
    if (result.status === 'restored') {
      expect(result.state.operationHistory).toHaveLength(20)
      expect(result.state.operationHistory.map((run) => run.id)).toEqual(
        Array.from({ length: 20 }, (_, index) => `run-${22 - index}`),
      )
    }
  })

  test('ignore les runs invalides sans empêcher la restauration', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...createInitialAssessment(),
        lastRun: { id: 'bad', status: 'completed' },
        operationHistory: [
          {
            id: 'run-valid',
            kind: 'change-set',
            status: 'completed',
            startedAt: '2026-09-10T10:10:00.000Z',
            message: 'Change set generated',
          },
          { id: 'run-invalid', kind: 'analysis', status: 'running' },
        ],
      }),
    )

    expect(loadAssessment()).toMatchObject({
      status: 'restored',
      state: {
        lastRun: null,
        operationHistory: [
          {
            id: 'run-valid',
            kind: 'change-set',
            status: 'completed',
          },
        ],
      },
    })
  })

  test('réinitialise uniquement la clé de la démo', () => {
    localStorage.setItem('unrelated', 'keep')
    saveAssessment(createInitialAssessment())

    clearAssessment()

    expect(localStorage.getItem('unrelated')).toBe('keep')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
