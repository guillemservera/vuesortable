export function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement
}

export function safeClosest(target: EventTarget | null, selector: string | undefined) {
  if (!selector || !isElement(target)) return null

  try {
    return target.closest(selector)
  }
  catch {
    return null
  }
}
