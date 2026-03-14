import type { GridPos } from '../entities/types'
import { randomGridPos } from '../utils/math'
import { flipRefs } from '../entities/flipState'

export function spawnFoodPosition(snakeBody: GridPos[], obstacles: GridPos[] = []): GridPos {
  // Рандомно: сторона 0 (текущая) или 1 (другая, потребует переворот)
  flipRefs.foodSide = Math.random() < 0.5 ? 0 : 1
  return randomGridPos([...snakeBody, ...obstacles])
}

export function hasEatenFood(head: GridPos, foodPos: GridPos): boolean {
  // Та же логика что в Food.tsx: во время флипа считаем следующую сторону
  const effectiveCount = flipRefs.isFlipping
    ? flipRefs.flipCount + 1
    : flipRefs.flipCount
  const accessible = flipRefs.foodSide === (effectiveCount % 2)
  if (!accessible) return false
  return head.x === foodPos.x && head.z === foodPos.z
}
