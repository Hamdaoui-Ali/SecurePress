#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(scriptDirectory, '..')
const fallbackScript = join(scriptDirectory, 'record-fallback-video.mjs')
const defaultBaseUrl = 'http://127.0.0.1:4173'
const baseUrl = (process.env.BASE_URL || defaultBaseUrl).replace(/\/$/, '')
const outputDirectory = resolve(
  process.env.OUTPUT_DIR || join(tmpdir(), 'securepress-presentation-repeats'),
)
const runCount = Number.parseInt(process.env.RUNS || '3', 10)

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

if (!Number.isInteger(runCount) || runCount < 1 || runCount > 10) {
  throw new Error('RUNS must be an integer between 1 and 10.')
}

async function isServerReady(url) {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

function runCommand(command, args, cwd, env = process.env) {
  return new Promise((resolveCommand, rejectCommand) => {
    const commandSpec = spawnSpec(command, args)
    const child = spawn(commandSpec.command, commandSpec.args, {
      cwd,
      env,
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

async function main() {
  await mkdir(outputDirectory, { recursive: true })
  const server = await startPreviewIfNeeded()
  const results = []

  try {
    for (let run = 1; run <= runCount; run += 1) {
      const runDirectory = join(
        outputDirectory,
        'run-' + String(run).padStart(2, '0'),
      )
      await mkdir(runDirectory, { recursive: true })
      const startedAt = Date.now()
      const childEnvironment = {
        ...process.env,
        BASE_URL: baseUrl,
        OUTPUT_DIR: runDirectory,
      }

      console.log('Starting presentation repeat ' + run + '/' + runCount)
      try {
        await runCommand(
          process.execPath,
          [fallbackScript],
          projectDirectory,
          childEnvironment,
        )
        results.push({
          run,
          status: 'passed',
          seconds: Math.round((Date.now() - startedAt) / 1000),
        })
      } catch (error) {
        results.push({
          run,
          status: 'failed',
          seconds: Math.round((Date.now() - startedAt) / 1000),
          error: error.message,
        })
        console.error('Presentation repeat ' + run + ' failed:', error)
      }
    }
  } finally {
    if (server) {
      server.kill()
    }
  }

  console.log('Presentation repeat summary:')
  for (const result of results) {
    const detail = result.error ? ' — ' + result.error : ''
    console.log(
      '  run ' +
        result.run +
        ': ' +
        result.status +
        ' (' +
        result.seconds +
        's)' +
        detail,
    )
  }

  const failures = results.filter((result) => result.status === 'failed')
  if (failures.length) {
    throw new Error(failures.length + ' presentation repeat(s) failed.')
  }

  console.log('All presentation repeats completed: ' + outputDirectory)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
