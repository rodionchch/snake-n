import type { Direction, GridPos } from './types'
import { GRID_WIDTH, GRID_HEIGHT, INITIAL_LENGTH } from '../utils/constants'

export interface SnakeRefs {
  body: GridPos[]
  prevBody: GridPos[]
  tickProgress: number
  direction: Direction
}

export const snakeRefs: SnakeRefs = {
  body: [],
  prevBody: [],
  tickProgress: 0,
  direction: 'right',
}

export function resetSnakeRefs(): void {
  const midX = Math.floor(GRID_WIDTH / 2)
  const midZ = Math.floor(GRID_HEIGHT / 2)
  const initial = Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
    x: midX - i,
    z: midZ,
  }))
  snakeRefs.body         = initial.map(p => ({ ...p }))
  snakeRefs.prevBody     = initial.map(p => ({ ...p }))
  snakeRefs.tickProgress = 0
  snakeRefs.direction    = 'right'
}
