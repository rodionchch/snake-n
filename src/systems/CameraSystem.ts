import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { snakeRefs } from '../entities/snakeState'
import { gridToWorldX, gridToWorldZ, lerp } from '../utils/math'
import type { Direction } from '../entities/types'

// Дистанция позади головы и высота камеры
const BACK_DIST   = 11
const CAM_HEIGHT  = 8
const CAM_LERP    = 0.1   // плавность позиции
const DIR_LERP    = 0.09  // плавность поворота при смене направления

// Вектор «назад» для каждого направления движения
const BACK_VECTORS: Record<Direction, [number, number]> = {
  right: [-1,  0],
  left:  [ 1,  0],
  down:  [ 0, -1],
  up:    [ 0,  1],
}

// Сглаженный вектор «назад» — меняется плавно при повороте змейки
const smoothBack = new THREE.Vector3(-1, 0, 0)
const targetPos  = new THREE.Vector3()
const lookTarget = new THREE.Vector3()

export function CameraSystem(): null {
  const initialized = useRef(false)

  useFrame(({ camera }) => {
    const head     = snakeRefs.body[0]
    const prevHead = snakeRefs.prevBody[0]
    if (!head) return

    // Интерполированная мировая позиция головы (для плавного движения)
    const t  = snakeRefs.tickProgress
    const hx = lerp(prevHead ? gridToWorldX(prevHead.x) : gridToWorldX(head.x), gridToWorldX(head.x), t)
    const hz = lerp(prevHead ? gridToWorldZ(prevHead.z) : gridToWorldZ(head.z), gridToWorldZ(head.z), t)

    // Плавно поворачиваем вектор «назад» по направлению змейки
    const [bx, bz] = BACK_VECTORS[snakeRefs.direction]
    smoothBack.x = lerp(smoothBack.x, bx, DIR_LERP)
    smoothBack.z = lerp(smoothBack.z, bz, DIR_LERP)
    // Нормализуем, чтобы длина оставалась 1
    const len = Math.sqrt(smoothBack.x ** 2 + smoothBack.z ** 2) || 1
    const nx = smoothBack.x / len
    const nz = smoothBack.z / len

    targetPos.set(hx + nx * BACK_DIST, CAM_HEIGHT, hz + nz * BACK_DIST)
    lookTarget.set(hx, 0.3, hz)

    if (!initialized.current) {
      camera.position.copy(targetPos)
      camera.lookAt(lookTarget)
      initialized.current = true
      return
    }

    camera.position.lerp(targetPos, CAM_LERP)
    camera.lookAt(lookTarget)
  })

  return null
}
