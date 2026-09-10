import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../App'

test('keeps the workspace context and removes the legacy disclaimer', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: /SecurePress Operations/i }),
  ).toBeInTheDocument()
  expect(screen.getByText('TELCO workspace')).toBeInTheDocument()
  expect(
    screen.queryByText(/Aucune configuration r.elle n.?a .t. modifi.e/i),
  ).not.toBeInTheDocument()
})
