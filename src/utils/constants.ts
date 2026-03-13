export const GRID_WIDTH = 20
export const GRID_HEIGHT = 20
export const CELL_SIZE = 1.0

// Начальный интервал между ходами (секунды)
export const MOVE_INTERVAL_BASE = 0.15
export const MOVE_INTERVAL_MIN = 0.055

export const INITIAL_LENGTH = 3
// Максимальная длина змейки (capacity InstancedMesh)
export const MAX_SEGMENTS = 400

// Геометрия змейки — нужна в Snake.tsx и CameraSystem/FlipState
export const SNAKE_HEAD_R = CELL_SIZE * 0.50
export const SNAKE_SEG_H  = CELL_SIZE * 0.48

// Полутолщина доски арены (центр доски = y=0, поверхности = ±BOARD_HALF_T)
export const BOARD_HALF_T = 0.06
