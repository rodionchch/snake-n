import type { GridPos } from '../entities/types'
import { GRID_WIDTH, GRID_HEIGHT } from '../utils/constants'

const OBSTACLE_COUNT = 22
const SAFE_RADIUS = 4

// BFS из стартовой точки — возвращает количество достижимых клеток
function floodFill(start: GridPos, blocked: Set<string>): number {
  const visited = new Set<string>()
  const queue: GridPos[] = [start]
  visited.add(`${start.x},${start.z}`)

  while (queue.length > 0) {
    const { x, z } = queue.shift()!
    const neighbors: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (const [dx, dz] of neighbors) {
      const nx = x + dx
      const nz = z + dz
      if (nx < 0 || nx >= GRID_WIDTH || nz < 0 || nz >= GRID_HEIGHT) continue
      const nk = `${nx},${nz}`
      if (!visited.has(nk) && !blocked.has(nk)) {
        visited.add(nk)
        queue.push({ x: nx, z: nz })
      }
    }
  }
  return visited.size
}

export function generateObstacles(snakeBody: GridPos[]): GridPos[] {
  const midX = Math.floor(GRID_WIDTH / 2)
  const midZ = Math.floor(GRID_HEIGHT / 2)

  // Безопасная зона: центр арены + начальное тело змейки
  const safeSet = new Set<string>()
  for (let dx = -SAFE_RADIUS; dx <= SAFE_RADIUS; dx++) {
    for (let dz = -SAFE_RADIUS; dz <= SAFE_RADIUS; dz++) {
      const x = midX + dx
      const z = midZ + dz
      if (x >= 0 && x < GRID_WIDTH && z >= 0 && z < GRID_HEIGHT) {
        safeSet.add(`${x},${z}`)
      }
    }
  }
  snakeBody.forEach(p => safeSet.add(`${p.x},${p.z}`))

  // Кандидаты — все клетки вне безопасной зоны
  const candidates: GridPos[] = []
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let z = 0; z < GRID_HEIGHT; z++) {
      if (!safeSet.has(`${x},${z}`)) {
        candidates.push({ x, z })
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const obstacles: GridPos[] = []
  const blockedSet = new Set<string>()

  for (const pos of candidates) {
    if (obstacles.length >= OBSTACLE_COUNT) break
    const k = `${pos.x},${pos.z}`
    blockedSet.add(k)

    // Проверяем: минимум 90% свободных клеток должны быть достижимы из центра
    const reachable = floodFill({ x: midX, z: midZ }, blockedSet)
    const totalFree = GRID_WIDTH * GRID_HEIGHT - blockedSet.size
    if (reachable >= totalFree * 0.9) {
      obstacles.push(pos)
    } else {
      blockedSet.delete(k)
    }
  }

  return obstacles
}
