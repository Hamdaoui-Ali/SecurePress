import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import App from '../App'

test('affiche le nom du laboratoire', () => {
  render(<App />)
  expect(
    screen.getByRole('heading', { name: /SecurePress Audit Lab/i }),
  ).toBeInTheDocument()
})
