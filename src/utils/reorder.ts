export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items]
  if (!Number.isInteger(from) || from < 0 || from >= next.length) return next

  const [item] = next.splice(from, 1)
  if (item === undefined) return next

  const target = clampIndex(to, next.length)
  next.splice(target, 0, item)
  return next
}

export function reorderItems<T>(items: readonly T[], from: number, to: number): T[] {
  return moveItem(items, from, to)
}

function clampIndex(index: number, max: number) {
  if (!Number.isFinite(index)) return 0
  return Math.min(max, Math.max(0, index))
}
