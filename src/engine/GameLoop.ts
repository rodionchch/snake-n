import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store'
import { snakeRefs } from '../entities/snakeState'
import { inputState } from './InputSystem'
import { checkWallCollision, checkSelfCollision } from '../systems/CollisionSystem'
import { spawnFoodPosition, hasEatenFood } from '../systems/FoodSpawnSystem'
import { getMoveInterval } from '../utils/math'
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

function nextHead(body: GridPos[], dir: Direction): GridPos {
  const { x, z } = body[0]
  switch (dir) {
    case 'up':    return { x,     z: z - 1 }
    case 'down':  return { x,     z: z + 1 }
    case 'left':  return { x: x - 1, z }
    case 'right': return { x: x + 1, z }
  }
}

export function GameLoop(): null {
  const accRef = useRef(0)

  useFrame((_, delta) => {
    const { status, score, food, incrementScore, growSnake, setFood, endGame } =
      useGameStore.getState()

    if (status !== 'running') return
    if (!snakeRefs.body.length) return

    accRef.current += delta
    const interval = getMoveInterval(score)

    if (accRef.current >= interval) {
      accRef.current -= interval

      if (!food.active) {
        setFood({ position: spawnFoodPosition(snakeRefs.body), active: true })
      } else {
        // Применяем накопленный поворот
        const turn = inputState.turn
        if (turn === 'left')  snakeRefs.direction = TURN_LEFT[snakeRefs.direction]
        if (turn === 'right') snakeRefs.direction = TURN_RIGHT[snakeRefs.direction]
        inputState.turn = null

        const head = nextHead(snakeRefs.body, snakeRefs.direction)

        if (checkWallCollision(head)) {
          endGame()
        } else {
          snakeRefs.prevBody = snakeRefs.body.map(p => ({ ...p }))
          snakeRefs.body.unshift(head)

          if (checkSelfCollision(snakeRefs.body)) {
            endGame()
          } else {
            if (hasEatenFood(head, food.position)) {
              const tail = snakeRefs.body[snakeRefs.body.length - 1]
              for (let i = 0; i < 3; i++) snakeRefs.body.push({ ...tail })
              incrementScore(10)
              growSnake(3)
              setFood({ position: spawnFoodPosition(snakeRefs.body), active: true })
            }
            snakeRefs.body.pop()
          }
        }
      }
    }

    // tickProgress обновляется ПОСЛЕ тика — остаток времени учитывается,
    // нет резкого скачка к 0 между кадрами
    snakeRefs.tickProgress = Math.min(accRef.current / interval, 1)
  })

  return null
}
