import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../App'

test('starts with the local source setup gate', () => {
  const { container } = render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Choose your WordPress source' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Verify source' }),
  ).toBeInTheDocument()
  expect(container).not.toHaveTextContent(/Aucune configuration r.elle/i)
})
