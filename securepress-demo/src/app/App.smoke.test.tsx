import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../App'

test('shows the operations workspace name', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: /SecurePress Operations/i }),
  ).toBeInTheDocument()
})
