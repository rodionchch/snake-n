import { useFrame } from '@react-three/fiber'
import { snakeRefs } from '../entities/snakeState'
import { gridToWorldX, gridToWorldZ, lerp } from '../utils/math'
import type { Direction } from '../entities/types'

const BACK_DIST  = 11
const CAM_HEIGHT = 8
// Скорость плавного поворота камеры при смене направления (frame-rate independent)
const DIR_SPEED  = 5

const BACK_VECTORS: Record<Direction, [number, number]> = {
  right: [-1,  0],
  left:  [ 1,  0],
  down:  [ 0, -1],
  up:    [ 0,  1],
}

// Сглаженный вектор «назад» — поворачивается плавно при повороте змейки
let smoothBackX = -1
let smoothBackZ =  0

export function CameraSystem(): null {
  useFrame(({ camera }, delta) => {
    const head     = snakeRefs.body[0]
    const prevHead = snakeRefs.prevBody[0]
    if (!head) return

    // Интерполированная позиция головы — здесь вся плавность движения
    const t  = snakeRefs.tickProgress
    const hx = lerp(prevHead ? gridToWorldX(prevHead.x) : gridToWorldX(head.x), gridToWorldX(head.x), t)
    const hz = lerp(prevHead ? gridToWorldZ(prevHead.z) : gridToWorldZ(head.z), gridToWorldZ(head.z), t)

    // Экспоненциальное сглаживание направления (не зависит от FPS)
    const [bx, bz] = BACK_VECTORS[snakeRefs.direction]
    const dirAlpha = 1 - Math.exp(-DIR_SPEED * delta)
    smoothBackX = lerp(smoothBackX, bx, dirAlpha)
    smoothBackZ = lerp(smoothBackZ, bz, dirAlpha)

    const len = Math.sqrt(smoothBackX ** 2 + smoothBackZ ** 2) || 1
    const nx = smoothBackX / len
    const nz = smoothBackZ / len

    // Камера точно следит за головой — позиция без lerp (lerp только у направления)
    // Это устраняет рассинхрон между позицией камеры и lookAt-целью
    camera.position.set(hx + nx * BACK_DIST, CAM_HEIGHT, hz + nz * BACK_DIST)
    camera.lookAt(hx, 0.3, hz)
  })

  return null
}
