import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { snakeRefs } from '../entities/snakeState'
import { flipGroupRef } from '../entities/flipState'
import { gridToWorldX, gridToWorldZ, lerp } from '../utils/math'
import { SNAKE_HEAD_R } from '../utils/constants'
import type { Direction } from '../entities/types'

const BACK_DIST = 11
const CAM_HEIGHT = 8
// Скорость плавного поворота камеры при смене направления (frame-rate independent)
const DIR_SPEED = 5

const BACK_VECTORS: Record<Direction, [number, number]> = {
  right: [-1,  0],
  left:  [ 1,  0],
  down:  [ 0, -1],
  up:    [ 0,  1],
}

let smoothBackX = -1
let smoothBackZ =  0

// Переиспользуемые объекты — не создавать в useFrame
const _localHead = new THREE.Vector3()
const _backDir   = new THREE.Vector3()
const _worldUp   = new THREE.Vector3()

export function CameraSystem(): null {
  useFrame(({ camera }, delta) => {
    const head     = snakeRefs.body[0]
    const prevHead = snakeRefs.prevBody[0]
    if (!head) return

    const group = flipGroupRef.current
    if (!group) return

    // Интерполированная позиция головы в локальном пространстве группы
    const t = snakeRefs.tickProgress
    const wrappedX = prevHead && Math.abs(prevHead.x - head.x) > 1
    const wrappedZ = prevHead && Math.abs(prevHead.z - head.z) > 1
    const lhx = wrappedX
      ? gridToWorldX(head.x)
      : lerp(prevHead ? gridToWorldX(prevHead.x) : gridToWorldX(head.x), gridToWorldX(head.x), t)
    const lhz = wrappedZ
      ? gridToWorldZ(head.z)
      : lerp(prevHead ? gridToWorldZ(prevHead.z) : gridToWorldZ(head.z), gridToWorldZ(head.z), t)

    // Змейка всегда на верхней грани в локальном пространстве
    _localHead.set(lhx, SNAKE_HEAD_R, lhz)
    // Переводим в мировые координаты (учитывает текущий поворот доски)
    group.localToWorld(_localHead)

    // Плавный вектор «назад» в локальном пространстве
    const [bx, bz] = BACK_VECTORS[snakeRefs.direction]
    const dirAlpha = 1 - Math.exp(-DIR_SPEED * delta)
    smoothBackX = lerp(smoothBackX, bx, dirAlpha)
    smoothBackZ = lerp(smoothBackZ, bz, dirAlpha)
    const len = Math.sqrt(smoothBackX ** 2 + smoothBackZ ** 2) || 1

    // Вектор «назад» и «вверх» из локального → мирового пространства
    _backDir.set(smoothBackX / len, 0, smoothBackZ / len)
    _backDir.transformDirection(group.matrixWorld)

    // «Вверх» камеры = локальная ось Y в мировом пространстве.
    // Именно это заставляет камеру корректно переходить на другую сторону при флипе.
    _worldUp.set(0, 1, 0)
    _worldUp.transformDirection(group.matrixWorld)

    camera.position.set(
      _localHead.x + _backDir.x * BACK_DIST + _worldUp.x * CAM_HEIGHT,
      _localHead.y + _backDir.y * BACK_DIST + _worldUp.y * CAM_HEIGHT,
      _localHead.z + _backDir.z * BACK_DIST + _worldUp.z * CAM_HEIGHT,
    )

    // up устанавливается ДО lookAt — иначе камера может перевернуться
    camera.up.copy(_worldUp)
    camera.lookAt(_localHead.x, _localHead.y, _localHead.z)
  })

  return null
}
