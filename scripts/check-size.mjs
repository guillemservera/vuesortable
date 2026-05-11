import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

const maxRawBytes = 17 * 1024
const maxGzipBytes = 6 * 1024

const source = await readFile(new URL('../dist/index.js', import.meta.url))
const rawBytes = source.byteLength
const gzipBytes = gzipSync(source).byteLength

function format(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`
}

if (rawBytes > maxRawBytes) {
  throw new Error(`dist/index.js is ${format(rawBytes)} raw. Budget is ${format(maxRawBytes)}.`)
}

if (gzipBytes > maxGzipBytes) {
  throw new Error(`dist/index.js is ${format(gzipBytes)} gzip. Budget is ${format(maxGzipBytes)}.`)
}

console.log(`Size check passed: ${format(rawBytes)} raw, ${format(gzipBytes)} gzip.`)
