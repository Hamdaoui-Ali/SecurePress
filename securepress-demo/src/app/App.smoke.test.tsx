import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../App'

test('keeps the workspace context and removes the legacy disclaimer', () => {
  const { container } = render(<App />)

  expect(
    screen.getByRole('heading', { name: /SecurePress Operations/i }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('complementary', { name: 'Workspace context' }),
  ).toHaveTextContent('LNET TELCO workspace')
  expect(container).not.toHaveTextContent(
    /Aucune configuration r.elle n.?a .t. modifi.e/i,
  )
})
