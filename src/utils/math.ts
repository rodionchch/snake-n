import type { GridPos } from '../entities/types'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  CELL_SIZE,
  MOVE_INTERVAL_BASE,
  MOVE_INTERVAL_MIN,
} from './constants'

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function gridToWorldX(gx: number): number {
  return (gx - GRID_WIDTH / 2 + 0.5) * CELL_SIZE
}

export function gridToWorldZ(gz: number): number {
  return (gz - GRID_HEIGHT / 2 + 0.5) * CELL_SIZE
}

export function randomGridPos(exclude: GridPos[] = []): GridPos {
  const available: GridPos[] = []
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let z = 0; z < GRID_HEIGHT; z++) {
      if (!exclude.some(e => e.x === x && e.z === z)) {
        available.push({ x, z })
      }
    }
  }
  if (available.length === 0) return { x: 0, z: 0 }
  return available[Math.floor(Math.random() * available.length)]
}

// Скорость растёт с очками: уменьшаем интервал между ходами
export function getMoveInterval(score: number): number {
  return Math.max(MOVE_INTERVAL_MIN, MOVE_INTERVAL_BASE - score * 0.002)
}
