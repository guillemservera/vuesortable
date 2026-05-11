import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderUnicodeCompact } from 'uqr'
import { createServer } from 'vite'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const playgroundRoot = resolve(repoRoot, 'playground')
const configFile = resolve(playgroundRoot, 'vite.config.ts')

function getTailscaleIpv4() {
  try {
    const output = execFileSync('tailscale', ['ip', '-4'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    return (
      output
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .find((line) => /^\d{1,3}(?:\.\d{1,3}){3}$/u.test(line)) ?? null
    )
  } catch {
    return null
  }
}

function getPublicUrl(server, ip) {
  const address = server.httpServer?.address()

  if (!address || typeof address === 'string') {
    return null
  }

  const protocol = server.config.server.https ? 'https' : 'http'
  return new URL(server.config.base || '/', `${protocol}://${ip}:${address.port}`).toString()
}

function printTailscaleQr(server) {
  if (!process.stdout.isTTY) {
    return
  }

  const tailscaleIp = getTailscaleIpv4()

  if (!tailscaleIp) {
    return
  }

  const publicUrl = getPublicUrl(server, tailscaleIp)

  if (!publicUrl) {
    return
  }

  console.log(`  ➜  Tailscale QR: ${publicUrl}`)
  console.log(renderUnicodeCompact(publicUrl, { border: 0 }))
}

async function main() {
  const server = await createServer({
    configFile,
    root: playgroundRoot,
    server: {
      host: '0.0.0.0',
    },
  })

  await server.listen()
  server.printUrls()
  printTailscaleQr(server)

  if (typeof server.bindCLIShortcuts === 'function') {
    server.bindCLIShortcuts({ print: true })
  }

  const closeServer = async () => {
    await server.close()
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void closeServer()
  })

  process.on('SIGTERM', () => {
    void closeServer()
  })
}

void main()
