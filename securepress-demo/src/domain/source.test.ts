import { describe, expect, test } from 'vitest'
import { createInitialWorkspaceSource } from './models'
import { getPreparedSource, inspectSelectedDirectory } from '../services/source-adapter'

type DirectoryEntry = {
  kind: 'file' | 'directory'
  name: string
  children?: DirectoryEntry[]
  getFile?: () => Promise<{ text: () => Promise<string> }>
}

function createDirectory(entries: DirectoryEntry[], name = 'lnet-telco-wordpress'): FileSystemDirectoryHandle {
  const byName = new Map(entries.map((entry) => [entry.name, entry]))
  return {
    kind: 'directory',
    name,
    getFileHandle: async (name: string) => {
      const entry = byName.get(name)
      if (!entry || entry.kind !== 'file' || !entry.getFile) throw new Error('Not found')
      return { kind: 'file', name, getFile: entry.getFile } as unknown as FileSystemFileHandle
    },
    getDirectoryHandle: async (name: string) => {
      const entry = byName.get(name)
      if (!entry || entry.kind !== 'directory') throw new Error('Not found')
      return createDirectory(entry.children ?? [], entry.name)
    },
    entries: async function* () {
      for (const entry of entries) yield [entry.name, { kind: entry.kind, name: entry.name } as FileSystemHandle]
    },
  } as unknown as FileSystemDirectoryHandle
}

describe('workspace source adapter', () => {
  const verifiedAt = new Date('2026-09-11T10:00:00.000Z')

  test('creates an unconfigured source by default', () => {
    expect(createInitialWorkspaceSource()).toEqual({
      status: 'unconfigured',
      mode: null,
      pathLabel: '',
      displayName: '',
      wordpressVersion: null,
      fileMarkerCount: 0,
      pluginCount: 0,
      themeCount: 0,
      verifiedAt: null,
      message: 'No local source registered',
    })
  })

  test('accepts the prepared TELCO source', () => {
    expect(getPreparedSource('C:\\SecurePress\\targets\\lnet-telco-wordpress', verifiedAt)).toEqual({
      status: 'ready',
      mode: 'prepared',
      pathLabel: 'C:\\SecurePress\\targets\\lnet-telco-wordpress',
      displayName: 'LNET TELCO WordPress source package',
      wordpressVersion: '6.4.3',
      fileMarkerCount: 4,
      pluginCount: 17,
      themeCount: 4,
      verifiedAt: '2026-09-11T10:00:00.000Z',
      message: 'Prepared local source package verified',
    })
  })

  test('rejects a folder without WordPress source markers', async () => {
    const result = await inspectSelectedDirectory(createDirectory([]), 'C:\\tmp\\empty', verifiedAt)

    expect(result).toMatchObject({
      status: 'invalid',
      mode: 'folder',
      pathLabel: 'C:\\tmp\\empty',
      displayName: 'empty',
      message: 'The selected folder does not contain the required WordPress source markers.',
    })
  })

  test('verifies a selected WordPress folder and counts its components', async () => {
    const source = await inspectSelectedDirectory(createDirectory([
      { kind: 'file', name: 'wp-config.php', getFile: async () => ({ text: async () => '' }) },
      { kind: 'directory', name: 'wp-includes', children: [
        { kind: 'file', name: 'version.php', getFile: async () => ({ text: async () => "$wp_version = '6.4.3';" }) },
      ] },
      { kind: 'directory', name: 'wp-content', children: [
        { kind: 'directory', name: 'plugins', children: [
          { kind: 'directory', name: 'akismet' },
          { kind: 'directory', name: 'securepress-toolkit' },
        ] },
        { kind: 'directory', name: 'themes', children: [
          { kind: 'directory', name: 'twentytwentyfour' },
        ] },
      ] },
    ]), 'C:\\SecurePress\\targets\\lnet-telco-wordpress', verifiedAt)

    expect(source).toMatchObject({ status: 'ready', mode: 'folder', wordpressVersion: '6.4.3', fileMarkerCount: 4, pluginCount: 2, themeCount: 1 })
  })

  test('extracts the WordPress version from wp-includes/version.php', async () => {
    const source = await inspectSelectedDirectory(createDirectory([
      { kind: 'file', name: 'wp-config.php', getFile: async () => ({ text: async () => '' }) },
      { kind: 'directory', name: 'wp-includes', children: [
        { kind: 'file', name: 'version.php', getFile: async () => ({ text: async () => "$wp_version = '6.5.2';" }) },
      ] },
      { kind: 'directory', name: 'wp-content', children: [
        { kind: 'directory', name: 'plugins' },
        { kind: 'directory', name: 'themes' },
      ] },
    ]), 'C:\\tmp\\wordpress', verifiedAt)

    expect(source.wordpressVersion).toBe('6.5.2')
  })
})
