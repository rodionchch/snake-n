import { create } from 'zustand'
import type { GridPos } from '../entities/types'
import { GRID_WIDTH, GRID_HEIGHT } from '../utils/constants'

export type GameStatus = 'idle' | 'running' | 'paused' | 'game_over'

interface SnakeState {
  length: number
}

interface FoodState {
  position: GridPos
  active: boolean
}

interface GameState {
  status: GameStatus
  score: number
  snake: SnakeState
  food: FoodState

  startGame:     () => void
  restartGame:   () => void
  endGame:       () => void
  incrementScore: (points: number) => void
  growSnake:     (count: number) => void
  setFood:       (food: FoodState) => void
}

const initialSnake: SnakeState = { length: 3 }

const initialFood: FoodState = {
  position: { x: Math.floor(GRID_WIDTH / 2) + 5, z: Math.floor(GRID_HEIGHT / 2) },
  active: false,
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  score:  0,
  snake:  initialSnake,
  food:   initialFood,

  startGame: () =>
    set({ status: 'running', score: 0, snake: { length: 3 }, food: { ...initialFood, active: false } }),

  restartGame: () =>
    set({ status: 'running', score: 0, snake: { length: 3 }, food: { ...initialFood, active: false } }),

  endGame: () => set({ status: 'game_over' }),

  incrementScore: (points) => set(s => ({ score: s.score + points })),

  growSnake: (count) => set(s => ({ snake: { length: s.snake.length + count } })),

  setFood: (food) => set({ food }),
}))
