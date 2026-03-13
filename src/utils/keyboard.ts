import type { Direction } from '../entities'

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
}

export function keyToDirection(key: string): Direction | null {
  return KEY_TO_DIRECTION[key] ?? null
}
