import type { GridPos } from '../entities/types'
import { GRID_WIDTH, GRID_HEIGHT } from '../utils/constants'

export function checkWallCollision(head: GridPos): boolean {
  return head.x < 0 || head.x >= GRID_WIDTH || head.z < 0 || head.z >= GRID_HEIGHT
}

// После unshift: body[0] — новая голова, body[1..2] — шея (не может совпасть).
// Проверяем с body[3] чтобы избежать ложных срабатываний на коротких хвостах.
export function checkSelfCollision(body: GridPos[]): boolean {
  const { x, z } = body[0]
  return body.slice(3).some(seg => seg.x === x && seg.z === z)
}
