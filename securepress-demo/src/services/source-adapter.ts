import { telcoScenario } from '../data/scenario'
import {
  createInitialWorkspaceSource,
  type DirectoryHandleLike,
  type WorkspaceSource,
} from '../domain/models'

const REQUIRED_MARKER_COUNT = 4
const INVALID_SOURCE_MESSAGE =
  'The selected folder does not contain the required WordPress source markers.'

interface FileHandleLike {
  getFile(): Promise<{ text(): Promise<string> }>
}

function displayNameFromPath(pathLabel: string, fallback: string): string {
  const normalized = pathLabel.trim().replace(/[\\/]+$/, '')
  return normalized.split(/[\\/]/).pop() || fallback
}

function isDirectoryHandle(value: unknown): value is DirectoryHandleLike {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<DirectoryHandleLike>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.getFileHandle === 'function' &&
    typeof candidate.getDirectoryHandle === 'function'
  )
}

function isFileHandle(value: unknown): value is FileHandleLike {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as Partial<FileHandleLike>).getFile === 'function',
  )
}

async function hasFile(handle: DirectoryHandleLike, name: string): Promise<boolean> {
  try {
    await handle.getFileHandle(name)
    return true
  } catch {
    return false
  }
}

async function getDirectory(
  handle: DirectoryHandleLike,
  name: string,
): Promise<DirectoryHandleLike | null> {
  try {
    const candidate = await handle.getDirectoryHandle(name)
    return isDirectoryHandle(candidate) ? candidate : null
  } catch {
    return null
  }
}

async function countChildDirectories(handle: DirectoryHandleLike | null): Promise<number> {
  if (!handle?.entries) return 0

  let count = 0
  for await (const [, entry] of handle.entries()) {
    if (
      entry &&
      typeof entry === 'object' &&
      (entry as { kind?: unknown }).kind === 'directory'
    ) {
      count += 1
    }
  }
  return count
}

async function readWordPressVersion(
  includesDirectory: DirectoryHandleLike | null,
): Promise<string | null> {
  if (!includesDirectory) return null

  try {
    const candidate = await includesDirectory.getFileHandle('version.php')
    if (!isFileHandle(candidate)) return null
    const contents = await (await candidate.getFile()).text()
    return contents.match(/\$wp_version\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? null
  } catch {
    return null
  }
}

export function getPreparedSource(pathLabel: string, now: Date): WorkspaceSource {
  return {
    status: 'ready',
    mode: 'prepared',
    pathLabel,
    displayName: 'LNET TELCO WordPress source package',
    wordpressVersion: telcoScenario.project.wordpressVersion,
    fileMarkerCount: REQUIRED_MARKER_COUNT,
    pluginCount: telcoScenario.inventory.pluginCount,
    themeCount: telcoScenario.inventory.themeCount,
    verifiedAt: now.toISOString(),
    message: 'Prepared local source package verified',
  }
}

export async function inspectSelectedDirectory(
  handle: DirectoryHandleLike,
  pathLabel: string,
  now: Date,
): Promise<WorkspaceSource> {
  const displayName = displayNameFromPath(pathLabel, handle.name)
  const hasConfig = await hasFile(handle, 'wp-config.php')
  const includesDirectory = await getDirectory(handle, 'wp-includes')
  const contentDirectory = await getDirectory(handle, 'wp-content')
  const pluginsDirectory = await getDirectory(contentDirectory ?? handle, 'plugins')
  const themesDirectory = await getDirectory(contentDirectory ?? handle, 'themes')
  const fileMarkerCount = [
    hasConfig,
    Boolean(includesDirectory),
    Boolean(pluginsDirectory),
    Boolean(themesDirectory),
  ].filter(Boolean).length

  if (fileMarkerCount !== REQUIRED_MARKER_COUNT) {
    return {
      ...createInitialWorkspaceSource(),
      status: 'invalid',
      mode: 'folder',
      pathLabel,
      displayName,
      fileMarkerCount,
      message: INVALID_SOURCE_MESSAGE,
    }
  }

  return {
    status: 'ready',
    mode: 'folder',
    pathLabel,
    displayName,
    wordpressVersion: await readWordPressVersion(includesDirectory),
    fileMarkerCount,
    pluginCount: await countChildDirectories(pluginsDirectory),
    themeCount: await countChildDirectories(themesDirectory),
    verifiedAt: now.toISOString(),
    message: 'Local WordPress source verified',
  }
}
