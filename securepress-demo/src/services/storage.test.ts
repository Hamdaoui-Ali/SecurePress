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

  test('réinitialise uniquement la clé de la démo', () => {
    localStorage.setItem('unrelated', 'keep')
    saveAssessment(createInitialAssessment())

    clearAssessment()

    expect(localStorage.getItem('unrelated')).toBe('keep')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
