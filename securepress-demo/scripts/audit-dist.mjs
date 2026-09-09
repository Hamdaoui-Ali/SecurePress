import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const textExtensions = new Set(['.html', '.js', '.css', '.json', '.svg', '.map'])
const forbidden = [
  /<(?:script|img|link)[^>]+(?:src|href)=["']https?:\/\//i,
  /url\(\s*["']?https?:\/\//i,
  /\b(?:fetch|WebSocket)\(\s*["'`]https?:\/\//i,
  /fonts\.googleapis\.com/i,
  /googletagmanager/i,
  /\banalytics\b/i,
  /\btelemetry\b/i,
]

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? walk(path) : [path]
    }),
  )
  return nested.flat()
}

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url))
const files = (await walk(distDirectory)).filter((file) =>
  textExtensions.has(extname(file)),
)
const failures = []

for (const file of files) {
  const content = await readFile(file, 'utf8')
  for (const pattern of forbidden) {
    if (pattern.test(content)) failures.push(`${file}: ${pattern}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Offline audit passed for ${files.length} text assets.`)
