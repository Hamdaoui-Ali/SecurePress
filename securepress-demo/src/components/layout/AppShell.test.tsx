import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { expect, test, vi } from 'vitest'
import { AppShell } from './AppShell'

test('affiche les marqueurs permanents du mode démonstration', () => {
  render(
    <HashRouter>
      <AppShell onReset={vi.fn()} onStartGuidedDemo={vi.fn()}>
        <p>Contenu de test</p>
      </AppShell>
    </HashRouter>,
  )

  expect(screen.getByText('MODE DÉMO')).toBeVisible()
  expect(
    screen.getByText(/Aucun système réel n’est connecté/i),
  ).toBeVisible()
  expect(
    screen.getByRole('button', { name: /Réinitialiser la démo/i }),
  ).toBeVisible()
})
