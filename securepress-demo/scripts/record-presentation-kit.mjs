#!/usr/bin/env node

import { chromium, expect } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(scriptDirectory, '..')
const defaultBaseUrl = 'http://127.0.0.1:4173'
const baseUrl = (process.env.BASE_URL || defaultBaseUrl).replace(/\/$/, '')
const outputDirectory = resolve(
  process.env.OUTPUT_DIR || join(tmpdir(), 'securepress-presentation-kit'),
)
const viewport = { width: 1440, height: 900 }
const storageKey = 'securepress.audit-lab.v1'

function spawnSpec(command, args) {
  if (
    process.platform !== 'win32' ||
    !/\.(?:cmd|bat)$/i.test(String(command))
  ) {
    return { command, args }
  }

  const quote = (value) => {
    const text = String(value)
    return /[ "]/.test(text) ? '"' + text.replace(/"/g, '\\"') + '"' : text
  }

  return {
    command: process.env.ComSpec || 'cmd.exe',
    args: ['/d', '/s', '/c', [command, ...args].map(quote).join(' ')],
  }
}

async function isServerReady(url) {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

function runCommand(command, args, cwd) {
  return new Promise((resolveCommand, rejectCommand) => {
    const commandSpec = spawnSpec(command, args)
    const child = spawn(commandSpec.command, commandSpec.args, {
      cwd,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    })

    child.once('error', rejectCommand)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveCommand()
        return
      }
      const status = signal || ('code ' + code)
      rejectCommand(
        new Error(command + ' ' + args.join(' ') + ' exited with ' + status),
      )
    })
  })
}

async function startPreviewIfNeeded() {
  if (await isServerReady(baseUrl)) {
    console.log('Using existing preview server at ' + baseUrl)
    return null
  }

  if (baseUrl !== defaultBaseUrl) {
    throw new Error(
      'No server is reachable at ' +
        baseUrl +
        '. Start one manually or use the default BASE_URL.',
    )
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  console.log('No preview server found; building the app before starting one.')
  await runCommand(npmCommand, ['run', 'build'], projectDirectory)

  const commandSpec = spawnSpec(npmCommand, ['run', 'present'])
  const server = spawn(commandSpec.command, commandSpec.args, {
    cwd: projectDirectory,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  })

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await isServerReady(baseUrl)) {
      console.log('Started preview server at ' + baseUrl)
      return server
    }
    if (server.exitCode !== null) {
      throw new Error('Preview server exited with code ' + server.exitCode)
    }
    await delay(250)
  }

  server.kill()
  throw new Error('Preview server did not become ready at ' + baseUrl)
}

async function prepareSource(page) {
  await page.goto(baseUrl + '/#/setup')
  await expect(
    page.getByRole('heading', { name: 'Choose your WordPress source' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Use prepared LNET TELCO package' })
    .click()
  await page.getByRole('button', { name: 'Verify source' }).click()
  await expect(
    page.getByRole('heading', { name: 'Build the workspace assessment' }),
  ).toBeVisible()
}

async function capture(page, name) {
  const file = join(outputDirectory, name + '.png')
  await page.screenshot({ path: file, fullPage: true })
  console.log('Captured ' + file)
}

async function moveVideo(video, file) {
  if (video) {
    await video.saveAs(file)
    console.log('Recorded ' + file)
  }
}

async function main() {
  await mkdir(outputDirectory, { recursive: true })
  const server = await startPreviewIfNeeded()
  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
  })
  const context = await browser.newContext({
    viewport,
    recordVideo: { dir: outputDirectory, size: viewport },
  })
  await context.addInitScript(({ key }) => {
    window.localStorage.removeItem(key)
  }, { key: storageKey })

  const page = await context.newPage()
  const video = page.video()

  try {
    await prepareSource(page)
    await capture(page, '01-source-verified')

    await page.goto(baseUrl + '/#/')
    await page.getByRole('button', { name: /Start guided walkthrough/i }).click()
    const startDialog = page.getByRole('dialog', {
      name: /Start the guided walkthrough/i,
    })
    await expect(startDialog).toBeVisible()
    await startDialog.getByRole('button', { name: 'Confirm reset' }).click()

    const guide = page.getByRole('region', {
      name: /Guided workspace workflow/i,
    })
    await expect(guide.getByText('Step 1 of 8')).toBeVisible()
    await capture(page, '02-guided-overview')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 2 of 8')).toBeVisible()
    await page.locator('[data-guide-id="run-inventory"]').click()
    await expect(page.getByText('Workspace ready', { exact: true })).toBeVisible({
      timeout: 15_000,
    })
    await capture(page, '03-discovery-complete')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 3 of 8')).toBeVisible()
    await page.locator('[data-guide-id="run-audit"]').click()
    await expect(
      page.getByText('Finding analysis completed', { exact: true }),
    ).toBeVisible({ timeout: 10_000 })
    await capture(page, '04-analysis-complete')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 4 of 8')).toBeVisible()
    await page.locator('[data-guide-id="open-f001"]').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await capture(page, '05-priority-finding')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 5 of 8')).toBeVisible()
    await page.locator('[data-guide-id="apply-F-001"]').click()
    await expect(
      page.locator('#main-content').getByText('Change set applied', { exact: true }),
    ).toBeVisible()
    await capture(page, '06-change-set-applied')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 6 of 8')).toBeVisible({
      timeout: 15_000,
    })
    await page.locator('[data-guide-id="run-validation"]').click()
    await expect(
      page.getByText(/Control campaign completed/).first(),
    ).toBeVisible({ timeout: 15_000 })
    await capture(page, '07-control-campaign')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 7 of 8')).toBeVisible()
    await expect(
      page
        .getByRole('region', { name: 'Posture summary' })
        .getByText(/\d+ \/ 100/),
    ).toBeVisible()
    await capture(page, '08-posture-score')

    await guide.getByRole('button', { name: 'Next' }).click()
    await expect(guide.getByText('Step 8 of 8')).toBeVisible()
    await expect(page.getByText(/External dynamic retest/).first()).toBeVisible()
    await capture(page, '09-provenance-boundary')

    await guide.getByRole('button', { name: 'Finish walkthrough' }).click()
    await expect(
      page.getByRole('region', { name: /Guided workspace workflow/i }),
    ).toHaveCount(0)

    await page.goto(baseUrl + '/#/rapport')
    const downloadButton = page.getByRole('button', { name: 'Download report' })
    await expect(downloadButton).toBeVisible()
    await capture(page, '10-final-report')
    const downloadPromise = page.waitForEvent('download')
    await downloadButton.click()
    const download = await downloadPromise
    const reportFile = join(outputDirectory, download.suggestedFilename())
    await download.saveAs(reportFile)
    console.log('Downloaded ' + reportFile)
  } finally {
    await context.close()
    await moveVideo(video, join(outputDirectory, 'presentation-kit.webm'))
    await browser.close()
    if (server) {
      server.kill()
    }
  }

  console.log('Presentation recording completed: ' + outputDirectory)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
