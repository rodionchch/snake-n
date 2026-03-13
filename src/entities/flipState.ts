import * as THREE from 'three'

export interface FlipRefs {
  isFlipping: boolean
  flipProgress: number    // 0 → 1 во время анимации
  flipAxis: 'x' | 'z'
  flipSign: 1 | -1
  flipCount: number       // сколько переворотов завершено
  // Сторона, на которой спавнится еда (0 или 1). Доступна когда flipCount%2 === foodSide.
  foodSide: 0 | 1
  rotX: number
  rotZ: number
  startRotX: number
  startRotZ: number
}

export const flipRefs: FlipRefs = {
  isFlipping: false,
  flipProgress: 0,
  flipAxis: 'z',
  flipSign: 1,
  flipCount: 0,
  foodSide: 0,
  rotX: 0,
  rotZ: 0,
  startRotX: 0,
  startRotZ: 0,
}

export function resetFlipRefs(): void {
  flipRefs.isFlipping   = false
  flipRefs.flipProgress = 0
  flipRefs.flipCount    = 0
  flipRefs.foodSide     = 0
  flipRefs.rotX         = 0
  flipRefs.rotZ         = 0
  flipRefs.startRotX    = 0
  flipRefs.startRotZ    = 0

  const group = flipGroupRef.current
  if (group) group.rotation.set(0, 0, 0)
}

// Shared ref на <group> который оборачивает всю сцену — обновляется из GameCanvas
export const flipGroupRef: { current: THREE.Group | null } = { current: null }
