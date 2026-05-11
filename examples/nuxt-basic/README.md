# VueSortable Nuxt 4 SSR Fixture

This fixture verifies that `vuesortable` works in a Nuxt 4 app with SSR enabled.

It intentionally does not use:

- `<ClientOnly>`
- `.client.vue`
- `ssr: false`
- a Nuxt plugin
- a Nuxt module

## Usage

From the repository root:

```bash
pnpm install
pnpm build
pnpm --filter @vuesortable/nuxt-basic dev
```

## SSR verification

From the repository root:

```bash
pnpm test:nuxt
```

This builds the package, runs `nuxt generate`, and verifies that the generated HTML contains the VueSortable list.
