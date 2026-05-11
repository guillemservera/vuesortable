# Changelog

## 0.1.0

- Initial VueSortable package contract.
- Added the headless-first `Sortable` component and `reorderItems` / `moveItem` utilities.
- Supports Vue-controlled single-list reordering with pointer gestures, handles, ignore selectors, horizontal and vertical orientation, FLIP list motion, snap drop motion, default-slot overlay and placeholder rendering, and `canMove` guards.
- Supports keyboard reordering through `getHandleAttrs(entry)`, live region announcements, and focus restoration.
- Validates SSR rendering and Nuxt 4 prerendering with dedicated tests and a Nuxt fixture.
