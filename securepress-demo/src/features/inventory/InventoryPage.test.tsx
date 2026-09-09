import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { saveAssessment } from '../../services/storage'
import { InventoryPage } from './InventoryPage'

beforeEach(() => {
  localStorage.clear()
})

function renderInventory() {
  return render(
    <AssessmentProvider delayMs={0}>
      <InventoryPage />
    </AssessmentProvider>,
  )
}

test('lance l’inventaire et affiche ses résultats simulés', async () => {
  const user = userEvent.setup()
  renderInventory()

  await user.click(
    screen.getByRole('button', { name: /Lancer l’inventaire simulé/i }),
  )

  expect(screen.getByText('Inventaire terminé')).toBeVisible()
  expect(screen.getByText('17 extensions identifiées')).toBeVisible()
  expect(
    screen.getByText(
      'Présent dans les fichiers ne signifie pas actif ou exploitable.',
    ),
  ).toBeVisible()
  expect(screen.getByRole('table')).toBeVisible()
})

test('conserve le tableau après rechargement d’un inventaire terminé', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'inventory',
    inventoryCompleted: true,
  })

  renderInventory()

  expect(
    screen.getByRole('button', { name: /Relancer la simulation/i }),
  ).toBeVisible()
  expect(screen.getByRole('table')).toBeVisible()
})
