import { DEFAULT_MOTION } from '../constants'
import type { SortableMotion } from '../types'

export type NormalizedMotionConfig = {
  list: false | {
    type: 'flip'
    duration: number
    easing: string
  }
  drop: false | {
    type: 'snap'
    duration: number
    easing: string
  }
}

export function normalizeMotion(motion: SortableMotion | undefined): NormalizedMotionConfig {
  if (motion === false) return { list: false, drop: false }

  const list = motion?.list === false
    ? false
    : {
        ...DEFAULT_MOTION.list,
        ...(typeof motion?.list === 'object' ? motion.list : {}),
      }

  const drop = motion?.drop === false
    ? false
    : {
        ...DEFAULT_MOTION.drop,
        ...(typeof motion?.drop === 'object' ? motion.drop : {}),
      }

  return { list, drop }
}
