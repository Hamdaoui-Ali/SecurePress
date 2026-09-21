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
  process.env.OUTPUT_DIR || join(tmpdir(), 'securepress-fallback-video'),
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

async function runOperation(page, route, guideId, completionText, timeout = 15_000) {
  await page.goto(baseUrl + '/#/' + route)
  const operation = page.locator('[data-guide-id="' + guideId + '"]')
  await expect(operation).toBeEnabled()
  await operation.click()
  await expect(page.getByText(completionText, { exact: true })).toBeVisible({
    timeout,
  })
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

    await runOperation(page, 'inventaire', 'run-inventory', 'Workspace ready')
    await capture(page, '02-discovery-complete')

    await runOperation(
      page,
      'audit',
      'run-audit',
      'Finding analysis completed',
      10_000,
    )
    await capture(page, '03-analysis-complete')

    await page.goto(baseUrl + '/#/remediation')
    const changeSet = page.locator('[data-guide-id="apply-F-001"]')
    await expect(changeSet).toBeEnabled()
    await changeSet.click()
    await expect(
      page.locator('#remediation-F-001').getByText('Change set applied', {
        exact: true,
      }),
    ).toBeVisible({ timeout: 10_000 })
    await capture(page, '04-change-set-applied')

    await page.goto(baseUrl + '/#/validation')
    const controlCampaign = page.locator('[data-guide-id="run-validation"]')
    await expect(controlCampaign).toBeEnabled()
    await controlCampaign.click()
    await expect(page.getByText(/Control campaign completed/).first()).toBeVisible({
      timeout: 15_000,
    })
    await capture(page, '05-control-campaign')

    await page.goto(baseUrl + '/#/rapport')
    await expect(
      page
        .getByRole('region', { name: 'Posture summary' })
        .getByText(/\d+ \/ 100/),
    ).toBeVisible()
    const downloadButton = page.getByRole('button', { name: 'Download report' })
    await expect(downloadButton).toBeVisible()
    await capture(page, '06-final-report')
    const downloadPromise = page.waitForEvent('download')
    await downloadButton.click()
    const download = await downloadPromise
    const reportFile = join(outputDirectory, download.suggestedFilename())
    await download.saveAs(reportFile)
    console.log('Downloaded ' + reportFile)
  } finally {
    await context.close()
    await moveVideo(video, join(outputDirectory, 'fallback-presentation.webm'))
    await browser.close()
    if (server) {
      server.kill()
    }
  }

  console.log('Fallback recording completed: ' + outputDirectory)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
