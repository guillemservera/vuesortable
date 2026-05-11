import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const htmlPath = resolve(process.cwd(), 'examples/nuxt-basic/.output/public/index.html')
const html = await readFile(htmlPath, 'utf8')

const requiredTokens = [
  'VueSortable Nuxt SSR fixture',
  'Drafts',
  'Issues',
  'Inbox',
  'data-vuesortable-root',
]

for (const token of requiredTokens) {
  if (!html.includes(token)) {
    throw new Error(`Expected prerendered Nuxt HTML to contain "${token}".`)
  }
}

if (html.includes('<div id="__nuxt"></div>')) {
  throw new Error('Nuxt output looks like an empty client-only shell. Expected SSR/prerendered content.')
}

console.log('Nuxt prerender assertion passed.')
