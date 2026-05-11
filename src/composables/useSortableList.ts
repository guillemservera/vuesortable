import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onUpdated, shallowRef } from 'vue'
import type { CSSProperties, Ref } from 'vue'
import {
  DATA_ATTRIBUTES,
  DEFAULT_ACTIVATION_THRESHOLD,
  DEFAULT_IGNORE_SELECTOR,
  SELECTORS,
} from '../constants'
import type {
  SortableCollision,
  SortableDefaultSlotProps,
  SortableDragPayload,
  SortableItemAttrsResult,
  SortableItemEntry,
  SortableListAttrs,
  SortableMovePayload,
  SortableOrientation,
  SortableOverlayRenderState,
  SortablePlaceholderAttrsResult,
  SortablePlaceholderEntry,
  SortableProps,
  SortableRenderEntry,
} from '../types'
import { canUseDOM, isHTMLElement, safeClosest } from '../utils/dom'
import {
  clamp,
  estimateItemGap,
  findPreviewIndex,
  getRootGeometry,
  measureSortableLayout,
} from '../utils/geometry'
import type { LayoutSnapshot, MeasuredEntry, OverlayPosition } from '../utils/geometry'
import { normalizeMotion } from '../utils/motion'

type MotionRect = {
  left: number
  top: number
}

type OverlayState<T> = {
  element: T
  height: number
  index: number
  key: string
  left: number
  width: number
  y: number
}

type DragState<T> = OverlayState<T> & {
  delayPassed: boolean
  from: number
  item: T
  layout: LayoutSnapshot<T>
  pointerOffsetX: number
  pointerOffsetY: number
  previewIndex: number
  startX: number
  startY: number
  started: boolean
}

type DropState<T> = OverlayState<T> & {
  dropping: boolean
  entries: SortableItemEntry<T>[]
  from: number
  item: T
  to: number
}

type UseSortableListEmits<T> = {
  updateModelValue: (value: T[]) => void
  dragStart: (payload: SortableDragPayload<T>) => void
  dragMove: (payload: SortableMovePayload<T>) => void
  reorder: (payload: SortableDragPayload<T>) => void
  dragEnd: (payload: SortableDragPayload<T>) => void
  dragCancel: (payload: SortableDragPayload<T>) => void
}

export type UseSortableListOptions<T> = {
  props: Readonly<SortableProps<T>>
  rootRef: Ref<HTMLElement | null>
  emit: UseSortableListEmits<T>
}

const ROOT_STYLE: CSSProperties = {
  position: 'relative',
}

const INTERACTION_STYLE: CSSProperties = {
  touchAction: 'none',
}

const LIVE_REGION_STYLE: CSSProperties = {
  clipPath: 'inset(50%)',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
}

export function useSortableList<T = unknown>(options: UseSortableListOptions<T>) {
  const { emit, props, rootRef } = options

  const dragState = shallowRef<DragState<T> | null>(null)
  const dropState = shallowRef<DropState<T> | null>(null)
  const announcement = shallowRef('')

  let activationDelayTimer: number | null = null
  let dropAnimationFrame: number | null = null
  let dropAnimationTimer: number | null = null
  let listMotionFrame: number | null = null
  let listMotionCleanupTimer: number | null = null
  let shouldRunListMotion = false

  const listMotionRects = new Map<string, MotionRect>()
  const listMotionElements = new Set<HTMLElement>()

  const orientation = computed<SortableOrientation>(() => props.orientation ?? 'vertical')
  const collision = computed<SortableCollision>(() => props.collision ?? 'biased-center')
  const motion = computed(() => normalizeMotion(props.motion))

  const entries = computed<SortableItemEntry<T>[]>(() =>
    props.modelValue.map((element, index) => ({
      element,
      index,
      key: resolveItemKey(element),
      type: 'item',
    })),
  )

  const layoutEntries = computed<SortableRenderEntry<T>[]>(() => {
    const state = dragState.value
    if (state?.started) {
      return buildLayoutEntries(entries.value, state.key, state.previewIndex, state.height, state.width)
    }

    const dropping = dropState.value
    if (dropping) {
      return buildLayoutEntries(dropping.entries, dropping.key, dropping.to, dropping.height, dropping.width)
    }

    return entries.value
  })

  const overlayState = computed(() => {
    if (dragState.value?.started) return dragState.value
    return dropState.value
  })

  const isDragging = computed(() => dragState.value?.started === true)
  const isDropping = computed(() => dropState.value !== null)
  const isSorting = computed(() => isDragging.value || isDropping.value)

  const overlayStyle = computed<CSSProperties | undefined>(() => {
    const overlay = overlayState.value
    if (!overlay) return undefined

    const dropMotion = motion.value.drop
    const style: CSSProperties = {
      height: `${overlay.height}px`,
      left: '0px',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0px',
      transform: `translate3d(${overlay.left}px, ${overlay.y}px, 0)`,
      width: `${overlay.width}px`,
    }

    if (dropState.value?.dropping && dropMotion !== false) {
      style.transition = `transform ${dropMotion.duration}ms ${dropMotion.easing}`
    }

    return style
  })

  function resolveItemKey(item: T) {
    if (typeof props.itemKey === 'function') return String(props.itemKey(item))
    return String((item as Record<PropertyKey, unknown>)[props.itemKey as PropertyKey])
  }

  function getRootElement() {
    return isHTMLElement(rootRef.value) ? rootRef.value : null
  }

  function getItemElement(key: string) {
    const root = getRootElement()
    if (!root) return null

    return Array
      .from(root.querySelectorAll<HTMLElement>(SELECTORS.item))
      .find(element => element.dataset.vuesortableItemKey === key) ?? null
  }

  function getItemHandleElement(key: string) {
    return getItemElement(key)?.querySelector<HTMLElement>(SELECTORS.handle) ?? null
  }

  function shouldIgnoreTarget(target: EventTarget | null) {
    if (props.handle) return safeClosest(target, props.handle) === null
    return Boolean(safeClosest(target, props.ignore ?? DEFAULT_IGNORE_SELECTOR))
  }

  function handlePointerDown(event: PointerEvent, entry: SortableItemEntry<T>, force = false) {
    if (props.disabled || dropState.value || dragState.value || !canUseDOM()) return
    if (typeof event.button === 'number' && event.button !== 0) return
    if (!force && shouldIgnoreTarget(event.target)) return

    const root = getRootElement()
    const itemElement = getItemElement(entry.key)
    if (!root || !itemElement) return

    const rootRect = root.getBoundingClientRect()
    const itemRect = itemElement.getBoundingClientRect()
    const layout = measureSortableLayout(root, rootRect, entries.value, SELECTORS.item)
    const rootGeometry = getRootGeometry(root, rootRect)
    const measuredItem = layout.items.find(item => item.key === entry.key)
    const height = measuredItem?.height ?? itemRect.height
    const width = measuredItem?.width ?? itemRect.width
    const initialLeft = measuredItem?.left ?? itemRect.left - rootGeometry.left
    const initialY = measuredItem?.top ?? itemRect.top - rootGeometry.top
    const left = orientation.value === 'horizontal'
      ? clamp(initialLeft, 0, Math.max(0, rootGeometry.width - width))
      : initialLeft
    const y = orientation.value === 'horizontal'
      ? initialY
      : clamp(initialY, 0, Math.max(0, rootGeometry.height - height))

    dragState.value = {
      delayPassed: !shouldDelayActivation(event),
      element: entry.element,
      from: entry.index,
      height,
      index: entry.index,
      item: entry.element,
      key: entry.key,
      layout,
      left,
      pointerOffsetX: event.clientX - itemRect.left,
      pointerOffsetY: event.clientY - itemRect.top,
      previewIndex: entry.index,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      width,
      y,
    }

    startActivationDelay(event)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerCancel)
    event.preventDefault()
  }

  function shouldDelayActivation(event: PointerEvent) {
    const activation = props.activation
    const delay = activation?.delay ?? 0
    if (delay <= 0) return false
    if (!activation?.delayOnTouchOnly) return true

    return event.pointerType === 'touch'
  }

  function startActivationDelay(event: PointerEvent) {
    if (!canUseDOM() || !shouldDelayActivation(event)) return

    const delay = props.activation?.delay ?? 0
    activationDelayTimer = window.setTimeout(() => {
      activationDelayTimer = null
      const state = dragState.value
      if (!state) return
      dragState.value = { ...state, delayPassed: true }
    }, delay)
  }

  function handlePointerMove(event: PointerEvent) {
    const state = dragState.value
    if (!state) return

    if (!state.delayPassed) {
      event.preventDefault()
      return
    }

    const threshold = props.activation?.threshold ?? DEFAULT_ACTIVATION_THRESHOLD
    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)
    if (!state.started && distance < threshold) return

    const position = resolveOverlayPosition(event, state)
    const previewIndex = findPreviewIndex(position, state, orientation.value, collision.value)

    if (!state.started) {
      const nextState = {
        ...state,
        index: previewIndex,
        left: position.left,
        previewIndex,
        started: true,
        y: position.y,
      }
      requestListMotion()
      dragState.value = nextState
      emit.dragStart(payloadFromState(nextState))
      emit.dragMove(movePayloadFromState(nextState, event))
      event.preventDefault()
      return
    }

    if (previewIndex !== state.previewIndex) {
      const nextState = {
        ...state,
        index: previewIndex,
        left: position.left,
        previewIndex,
        y: position.y,
      }
      requestListMotion()
      dragState.value = nextState
      emit.dragMove(movePayloadFromState(nextState, event))
    }
    else if (position.left !== state.left || position.y !== state.y) {
      const nextState = {
        ...state,
        left: position.left,
        y: position.y,
      }
      dragState.value = nextState
      emit.dragMove(movePayloadFromState(nextState, event))
    }

    event.preventDefault()
  }

  function handlePointerUp() {
    const state = dragState.value
    if (!state) return

    clearActivationDelay()

    if (!state.started) {
      cleanupDrag(false)
      return
    }

    const payload = payloadFromState(state)
    const allowed = props.canMove?.({
      from: payload.from,
      item: payload.item,
      items: [...props.modelValue],
      key: payload.key,
      to: payload.to,
    }) ?? true
    const moved = payload.from !== payload.to
    const finalEntries = allowed && moved ? buildFinalEntries(state) : entries.value
    const targetPosition = allowed
      ? readPlaceholderPosition(state.key) ?? estimateTargetPosition(state)
      : originalTargetPosition(state)

    if (allowed && moved) requestListMotion()

    if (allowed && moved) {
      emit.updateModelValue(finalEntries.map(entry => entry.element))
      emit.reorder(payload)
    }
    else if (!allowed) {
      emit.dragCancel(payload)
    }

    emit.dragEnd(payload)
    clearPointerListeners()
    dragState.value = null

    startDropAnimation({
      dropping: false,
      element: state.element,
      entries: finalEntries,
      from: state.from,
      height: state.height,
      index: allowed ? payload.to : state.from,
      item: state.item,
      key: state.key,
      left: state.left,
      to: allowed ? payload.to : state.from,
      width: state.width,
      y: state.y,
    }, targetPosition)
  }

  function handlePointerCancel() {
    cleanupDrag(true)
  }

  function handleKeyboardMove(event: KeyboardEvent, entry: SortableItemEntry<T>) {
    if (props.disabled || event.defaultPrevented) return
    if (event.altKey || event.ctrlKey || event.metaKey) return

    const to = getKeyboardTargetIndex(event.key, entry.index)
    if (to === null) return

    event.preventDefault()
    reorderFromKeyboard(entry, to)
  }

  function getKeyboardTargetIndex(key: string, currentIndex: number) {
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        return clamp(currentIndex + 1, 0, entries.value.length - 1)
      case 'ArrowUp':
      case 'ArrowLeft':
        return clamp(currentIndex - 1, 0, entries.value.length - 1)
      case 'Home':
        return 0
      case 'End':
        return entries.value.length - 1
      default:
        return null
    }
  }

  function reorderFromKeyboard(entry: SortableItemEntry<T>, targetIndex: number) {
    if (targetIndex === entry.index) return

    const payload: SortableDragPayload<T> = {
      from: entry.index,
      item: entry.element,
      key: entry.key,
      to: targetIndex,
    }
    const allowed = props.canMove?.({
      from: payload.from,
      item: payload.item,
      items: [...props.modelValue],
      key: payload.key,
      to: payload.to,
    }) ?? true

    if (!allowed) {
      announcement.value = `Could not move ${getAnnouncementLabel(entry)}.`
      return
    }

    const finalEntries = moveEntry(entries.value, entry.index, targetIndex)
    emit.updateModelValue(finalEntries.map(item => item.element))
    emit.reorder(payload)
    announcement.value = `Moved ${getAnnouncementLabel(entry)} from position ${entry.index + 1} to ${targetIndex + 1}.`
    focusHandleAfterUpdate(entry.key)
  }

  function getAnnouncementLabel(entry: SortableItemEntry<T>) {
    return entry.key.trim() || `item ${entry.index + 1}`
  }

  async function focusHandleAfterUpdate(key: string) {
    if (!canUseDOM()) return

    await nextTick()
    getItemHandleElement(key)?.focus()
  }

  function resolveOverlayPosition(event: PointerEvent, state: DragState<T>): OverlayPosition {
    const root = getRootElement()
    if (!root) return { left: state.left, y: state.y }

    const rootGeometry = getRootGeometry(root)
    if (orientation.value === 'horizontal') {
      return {
        left: clamp(
          event.clientX - rootGeometry.left - state.pointerOffsetX,
          0,
          Math.max(0, rootGeometry.width - state.width),
        ),
        y: state.y,
      }
    }

    return {
      left: state.left,
      y: clamp(
        event.clientY - rootGeometry.top - state.pointerOffsetY,
        0,
        Math.max(0, rootGeometry.height - state.height),
      ),
    }
  }

  function buildFinalEntries(state: DragState<T>) {
    const active = entries.value.find(entry => entry.key === state.key)
    if (!active) return entries.value

    const withoutActive = entries.value.filter(entry => entry.key !== state.key)
    const finalIndex = clamp(state.previewIndex, 0, withoutActive.length)
    const next = [...withoutActive]
    next.splice(finalIndex, 0, active)
    return next
  }

  function readPlaceholderPosition(activeKey: string): OverlayPosition | null {
    const root = getRootElement()
    if (!root) return null

    const placeholder = Array
      .from(root.querySelectorAll<HTMLElement>(SELECTORS.placeholder))
      .find(element => element.dataset.vuesortablePlaceholder === activeKey)

    if (!placeholder) return null

    const rootGeometry = getRootGeometry(root)
    const rect = placeholder.getBoundingClientRect()
    return {
      left: rect.left - rootGeometry.left,
      y: rect.top - rootGeometry.top,
    }
  }

  function estimateTargetPosition(state: DragState<T>): OverlayPosition {
    const measuredItems = state.layout.items.filter(item => item.key !== state.key)
    const finalIndex = clamp(state.previewIndex, 0, measuredItems.length)

    if (finalIndex < measuredItems.length) {
      const targetItem = measuredItems[finalIndex]
      return {
        left: targetItem?.left ?? state.left,
        y: targetItem?.top ?? state.y,
      }
    }

    const previousItem = measuredItems[measuredItems.length - 1]
    if (!previousItem) return { left: 0, y: 0 }

    if (orientation.value === 'horizontal') {
      return {
        left: previousItem.left + previousItem.width + estimateItemGap(measuredItems, orientation.value),
        y: previousItem.top,
      }
    }

    return {
      left: previousItem.left,
      y: previousItem.top + previousItem.height + estimateItemGap(measuredItems, orientation.value),
    }
  }

  function originalTargetPosition(state: DragState<T>) {
    const original = state.layout.items.find(item => item.key === state.key)
    if (!original) return { left: state.left, y: state.y }

    return {
      left: original.left,
      y: original.top,
    }
  }

  function requestListMotion() {
    shouldRunListMotion = motion.value.list !== false
  }

  function getListMotionElements() {
    const root = getRootElement()
    if (!root) return []

    return Array.from(root.querySelectorAll<HTMLElement>(SELECTORS.motion))
  }

  function captureListMotionRects() {
    listMotionRects.clear()
    if (!shouldRunListMotion || motion.value.list === false || !isSorting.value) return

    for (const element of getListMotionElements()) {
      const key = element.dataset.vuesortableMotionKey
      if (!key) continue

      const rect = element.getBoundingClientRect()
      listMotionRects.set(key, {
        left: rect.left,
        top: rect.top,
      })
    }
  }

  function animateListMotion() {
    if (!shouldRunListMotion) return
    shouldRunListMotion = false

    const listMotion = motion.value.list
    if (!canUseDOM() || listMotion === false || !isSorting.value || listMotionRects.size === 0) return

    const moves = getListMotionElements()
      .map((element) => {
        const key = element.dataset.vuesortableMotionKey
        const previous = key ? listMotionRects.get(key) : undefined
        if (!previous) return null

        const rect = element.getBoundingClientRect()
        const deltaX = previous.left - rect.left
        const deltaY = previous.top - rect.top
        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return null

        return { deltaX, deltaY, element }
      })
      .filter((move): move is { deltaX: number, deltaY: number, element: HTMLElement } => move !== null)

    if (moves.length === 0) return

    cancelListMotionFrame()
    for (const { deltaX, deltaY, element } of moves) {
      listMotionElements.add(element)
      element.style.transition = 'none'
      element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`
    }

    listMotionFrame = window.requestAnimationFrame(() => {
      listMotionFrame = null

      for (const { element } of moves) {
        element.style.transition = `transform ${listMotion.duration}ms ${listMotion.easing}`
        element.style.transform = ''
      }

      listMotionCleanupTimer = window.setTimeout(() => {
        listMotionCleanupTimer = null

        for (const { element } of moves) {
          element.style.transition = ''
          listMotionElements.delete(element)
        }
      }, listMotion.duration)
    })
  }

  function clearListMotionStyles() {
    for (const element of listMotionElements) {
      element.style.transition = ''
      element.style.transform = ''
    }
    listMotionElements.clear()
  }

  function cancelListMotionFrame() {
    if (canUseDOM() && listMotionFrame !== null) {
      window.cancelAnimationFrame(listMotionFrame)
      listMotionFrame = null
    }

    if (canUseDOM() && listMotionCleanupTimer !== null) {
      window.clearTimeout(listMotionCleanupTimer)
      listMotionCleanupTimer = null
    }

    clearListMotionStyles()
  }

  function startDropAnimation(nextDropState: DropState<T>, targetPosition: OverlayPosition) {
    dropState.value = nextDropState

    const dropMotion = motion.value.drop
    if (!canUseDOM() || dropMotion === false || dropMotion.duration <= 0) {
      finishDropAnimation()
      return
    }

    dropAnimationFrame = window.requestAnimationFrame(() => {
      const currentDropState = dropState.value
      if (!currentDropState) return

      dropState.value = {
        ...currentDropState,
        dropping: true,
        left: targetPosition.left,
        y: targetPosition.y,
      }

      dropAnimationTimer = window.setTimeout(finishDropAnimation, dropMotion.duration)
    })
  }

  function finishDropAnimation() {
    if (canUseDOM() && dropAnimationFrame !== null) {
      window.cancelAnimationFrame(dropAnimationFrame)
      dropAnimationFrame = null
    }
    if (canUseDOM() && dropAnimationTimer !== null) {
      window.clearTimeout(dropAnimationTimer)
      dropAnimationTimer = null
    }

    dropState.value = null
  }

  function clearActivationDelay() {
    if (canUseDOM() && activationDelayTimer !== null) {
      window.clearTimeout(activationDelayTimer)
    }
    activationDelayTimer = null
  }

  function clearPointerListeners() {
    if (!canUseDOM()) return

    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
    document.removeEventListener('pointercancel', handlePointerCancel)
  }

  function cleanupDrag(emitCancel: boolean) {
    const state = dragState.value
    clearActivationDelay()
    clearPointerListeners()
    cancelListMotionFrame()
    dragState.value = null

    if (emitCancel && state?.started) {
      emit.dragCancel(payloadFromState(state))
    }
  }

  function payloadFromState(state: DragState<T>): SortableDragPayload<T> {
    return {
      from: state.from,
      item: state.item,
      key: state.key,
      to: state.previewIndex,
    }
  }

  function movePayloadFromState(state: DragState<T>, event: PointerEvent): SortableMovePayload<T> {
    return {
      ...payloadFromState(state),
      activeIndex: state.previewIndex,
      pointer: {
        x: event.clientX,
        y: event.clientY,
      },
    }
  }

  function getListAttrs(): SortableListAttrs {
    return {
      [DATA_ATTRIBUTES.list]: '',
      role: 'list',
    }
  }

  function getItemAttrs(entry: SortableItemEntry<T>): SortableItemAttrsResult {
    const active = overlayState.value?.key === entry.key
    const attrs: Record<string, unknown> = {
      [DATA_ATTRIBUTES.item]: '',
      [DATA_ATTRIBUTES.itemKey]: entry.key,
      [DATA_ATTRIBUTES.motionKey]: entry.key,
      'aria-disabled': props.disabled ? 'true' : 'false',
      'aria-posinset': entry.index + 1,
      'aria-setsize': entries.value.length,
      'data-vuesortable-active': active ? 'true' : 'false',
      'data-vuesortable-dragging': isSorting.value ? 'true' : 'false',
      'data-vuesortable-disabled': props.disabled ? 'true' : 'false',
      onPointerdown: (event: PointerEvent) => handlePointerDown(event, entry),
      role: 'listitem',
    }

    if (!props.disabled) attrs.style = INTERACTION_STYLE

    return { attrs }
  }

  function getHandleAttrs(entry: SortableItemEntry<T>): Record<string, unknown> {
    const attrs: Record<string, unknown> = {
      [DATA_ATTRIBUTES.handle]: '',
      'aria-disabled': props.disabled ? 'true' : 'false',
      'aria-keyshortcuts': 'ArrowUp ArrowDown ArrowLeft ArrowRight Home End',
      'aria-label': `Reorder ${getAnnouncementLabel(entry)}`,
      'aria-roledescription': 'sortable handle',
      onPointerdown: (event: PointerEvent) => handlePointerDown(event, entry, true),
      onKeydown: (event: KeyboardEvent) => handleKeyboardMove(event, entry),
      role: 'button',
      tabindex: props.disabled ? -1 : 0,
    }

    if (!props.disabled) attrs.style = INTERACTION_STYLE

    return attrs
  }

  function getPlaceholderAttrs(entry: SortablePlaceholderEntry): SortablePlaceholderAttrsResult {
    return {
      attrs: {
        [DATA_ATTRIBUTES.placeholder]: entry.activeKey,
        [DATA_ATTRIBUTES.motionKey]: entry.key,
      },
      style: placeholderStyle(entry),
    }
  }

  function placeholderStyle(entry: SortablePlaceholderEntry): CSSProperties {
    return {
      flexShrink: '0',
      height: `${entry.height}px`,
      pointerEvents: 'none',
      width: `${entry.width}px`,
    }
  }

  function getOverlayRenderState(): SortableOverlayRenderState<T> | null {
    const overlay = overlayState.value
    if (!overlay) return null

    return {
      attrs: {
        [DATA_ATTRIBUTES.overlay]: '',
        [DATA_ATTRIBUTES.overlayKey]: overlay.key,
        'data-vuesortable-dragging': isSorting.value ? 'true' : 'false',
        'data-vuesortable-dropping': dropState.value?.dropping ? 'true' : 'false',
      },
      dragging: isDragging.value,
      element: overlay.element,
      index: overlay.index,
      key: overlay.key,
      style: overlayStyle.value ?? {},
    }
  }

  function getDefaultSlotProps(): SortableDefaultSlotProps<T> {
    return {
      dragging: isDragging.value,
      dropping: isDropping.value,
      entries: layoutEntries.value,
      getHandleAttrs,
      getItemAttrs,
      getPlaceholderAttrs,
      listAttrs: getListAttrs(),
      overlay: getOverlayRenderState(),
    }
  }

  onBeforeUpdate(captureListMotionRects)
  onUpdated(animateListMotion)

  onBeforeUnmount(() => {
    cleanupDrag(false)
    finishDropAnimation()
  })

  return {
    announcement,
    entries,
    getDefaultSlotProps,
    getHandleAttrs,
    getItemAttrs,
    getListAttrs,
    getOverlayRenderState,
    getPlaceholderAttrs,
    isDragging,
    isDropping,
    isSorting,
    layoutEntries,
    liveRegionStyle: LIVE_REGION_STYLE,
    overlayState,
    overlayStyle,
    rootStyle: ROOT_STYLE,
  }
}

function buildLayoutEntries<T>(
  sourceEntries: SortableItemEntry<T>[],
  activeKey: string,
  previewIndex: number,
  activeHeight: number,
  activeWidth: number,
) {
  const withoutActive = sourceEntries.filter(entry => entry.key !== activeKey)
  const insertionIndex = clamp(previewIndex, 0, withoutActive.length)
  const next: SortableRenderEntry<T>[] = [...withoutActive]

  next.splice(insertionIndex, 0, {
    activeKey,
    height: activeHeight,
    key: `vuesortable-placeholder:${activeKey}`,
    type: 'placeholder',
    width: activeWidth,
  })

  return next
}

function moveEntry<T>(sourceEntries: SortableItemEntry<T>[], from: number, to: number) {
  const next = [...sourceEntries]
  const [entry] = next.splice(from, 1)
  if (!entry) return sourceEntries

  next.splice(clamp(to, 0, next.length), 0, entry)
  return next.map((item, index) => ({ ...item, index }))
}
