import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store'
import { snakeRefs } from '../entities/snakeState'
import { flipRefs } from '../entities/flipState'
import { inputState } from './InputSystem'
import { checkSelfCollision, checkObstacleCollision } from '../systems/CollisionSystem'
import { spawnFoodPosition, hasEatenFood } from '../systems/FoodSpawnSystem'
import { getMoveInterval } from '../utils/math'
import { GRID_WIDTH, GRID_HEIGHT } from '../utils/constants'
import type { Direction, GridPos } from '../entities/types'

// Поворот CCW (от игрока — «налево»): right→up→left→down→right
const TURN_LEFT: Record<Direction, Direction> = {
  right: 'up',
  up:    'left',
  left:  'down',
  down:  'right',
}

// Поворот CW (от игрока — «направо»): right→down→left→up→right
const TURN_RIGHT: Record<Direction, Direction> = {
  right: 'down',
  down:  'left',
  left:  'up',
  up:    'right',
}

function calcNextHead(body: GridPos[], dir: Direction): GridPos {
  const { x, z } = body[0]
  switch (dir) {
    case 'up':    return { x,     z: z - 1 }
    case 'down':  return { x,     z: z + 1 }
    case 'left':  return { x: x - 1, z }
    case 'right': return { x: x + 1, z }
  }
}

interface WrapResult {
  wrapped: GridPos
  axis: 'x' | 'z'
  sign: 1 | -1
}

// Если голова вышла за пределы — возвращает обёрнутую позицию + параметры флипа
function tryWrapEdge(pos: GridPos): WrapResult | null {
  const { x, z } = pos
  // Доска катится в направлении выхода
  if (x >= GRID_WIDTH)  return { wrapped: { x: 0,              z }, axis: 'z', sign: -1 }
  if (x < 0)            return { wrapped: { x: GRID_WIDTH - 1, z }, axis: 'z', sign:  1 }
  if (z >= GRID_HEIGHT) return { wrapped: { x, z: 0               }, axis: 'x', sign:  1 }
  if (z < 0)            return { wrapped: { x, z: GRID_HEIGHT - 1  }, axis: 'x', sign: -1 }
  return null
}

export function GameLoop(): null {
  const accRef = useRef(0)

  useFrame((_, delta) => {
    const { status, score, food, obstacles, incrementScore, growSnake, setFood, endGame } =
      useGameStore.getState()

    if (status !== 'running') return
    if (!snakeRefs.body.length) return

    accRef.current += delta
    const interval = getMoveInterval(score)

    if (accRef.current >= interval) {
      accRef.current -= interval

      if (!food.active) {
        setFood({ position: spawnFoodPosition(snakeRefs.body, obstacles), active: true })
      } else {
        // Применяем накопленный поворот
        const turn = inputState.turn
        if (turn === 'left')  snakeRefs.direction = TURN_LEFT[snakeRefs.direction]
        if (turn === 'right') snakeRefs.direction = TURN_RIGHT[snakeRefs.direction]
        inputState.turn = null

        let head = calcNextHead(snakeRefs.body, snakeRefs.direction)

        // Проверяем выход за границу — оборачиваем и запускаем flip
        const wrap = tryWrapEdge(head)
        if (wrap) {
          head = wrap.wrapped
          // Новый флип запускается только если предыдущий завершён
          if (!flipRefs.isFlipping) {
            flipRefs.startRotX    = flipRefs.rotX
            flipRefs.startRotZ    = flipRefs.rotZ
            flipRefs.flipAxis     = wrap.axis
            flipRefs.flipSign     = wrap.sign
            flipRefs.flipProgress = 0
            flipRefs.isFlipping   = true
          }
        }

        snakeRefs.prevBody = snakeRefs.body.map(p => ({ ...p }))
        snakeRefs.body.unshift(head)

        if (checkSelfCollision(snakeRefs.body) || checkObstacleCollision(head, obstacles)) {
          endGame()
        } else {
          if (hasEatenFood(head, food.position)) {
            snakeRefs.body.push({ ...snakeRefs.body[snakeRefs.body.length - 1] })
            incrementScore(10)
            growSnake(1)
            setFood({ position: spawnFoodPosition(snakeRefs.body, obstacles), active: true })
          }
          snakeRefs.body.pop()
        }
      }
    }

    snakeRefs.tickProgress = Math.min(accRef.current / interval, 1)
  })

  return null
}
