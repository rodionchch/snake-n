import type { GridPos } from '../entities/types'
import { randomGridPos } from '../utils/math'

export function spawnFoodPosition(snakeBody: GridPos[]): GridPos {
  return randomGridPos(snakeBody)
}

export function hasEatenFood(head: GridPos, foodPos: GridPos): boolean {
  return head.x === foodPos.x && head.z === foodPos.z
}
