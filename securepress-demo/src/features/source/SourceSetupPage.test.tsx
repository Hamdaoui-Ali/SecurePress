import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import App from '../../app/App'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { STORAGE_KEY } from '../../services/storage'
import { SourceSetupPage } from './SourceSetupPage'

function renderSetup() {
  return render(
    <AssessmentProvider delayMs={0}>
      <SourceSetupPage />
    </AssessmentProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
})

test('starts with source setup when no source is persisted', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'Connect a local WordPress source' })).toBeVisible()
  expect(screen.getByLabelText('Source path')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Select local folder' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Use prepared LNET TELCO package' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Verify source' })).toBeVisible()
  expect(screen.getByRole('status', { name: 'Source verification status' })).toHaveTextContent('Not registered')
})

test('prefills the prepared package without marking it ready', async () => {
  const user = userEvent.setup()
  renderSetup()

  await user.click(screen.getByRole('button', { name: 'Use prepared LNET TELCO package' }))

  expect(screen.getByLabelText('Source path')).toHaveValue('C:\\SecurePress\\targets\\lnet-telco-wordpress')
  expect(screen.getByRole('status', { name: 'Source verification status' })).toHaveTextContent('Not registered')
})

test('verifies the prepared source and unlocks discovery', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Use prepared LNET TELCO package' }))
  await user.click(screen.getByRole('button', { name: 'Verify source' }))

  await waitFor(() => {
    expect(screen.getByText('Run discovery')).toBeVisible()
  })
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    source: { status: 'ready', mode: 'prepared' },
  })
})

test('rejects verification without a path or source candidate', async () => {
  const user = userEvent.setup()
  renderSetup()

  await user.click(screen.getByRole('button', { name: 'Verify source' }))

  expect(screen.getByRole('status', { name: 'Source verification status' })).toHaveTextContent(
    'Select a local folder or use the prepared package before verifying.',
  )
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('persists a verified source', async () => {
  const user = userEvent.setup()
  const firstRender = renderSetup()
  await user.click(screen.getByRole('button', { name: 'Use prepared LNET TELCO package' }))
  await user.click(screen.getByRole('button', { name: 'Verify source' }))
  await waitFor(() => expect(screen.getByRole('status', { name: 'Source verification status' })).toHaveTextContent('Source ready'))

  firstRender.unmount()
  renderSetup()

  expect(screen.getByRole('status', { name: 'Source verification status' })).toHaveTextContent('Source ready')
  expect(screen.getByText('LNET TELCO WordPress source package')).toBeVisible()
})

test('reset clears the source and returns to setup', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Use prepared LNET TELCO package' }))
  await user.click(screen.getByRole('button', { name: 'Verify source' }))
  await waitFor(() => expect(screen.getByText('Run discovery')).toBeVisible())

  await user.click(screen.getByRole('button', { name: 'Reset workspace' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm reset' }))

  expect(screen.getByRole('heading', { name: 'Connect a local WordPress source' })).toBeVisible()
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})
