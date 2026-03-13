import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GridPos } from './types'
import { MAX_SEGMENTS, CELL_SIZE } from '../utils/constants'
import { gridToWorldX, gridToWorldZ, lerp } from '../utils/math'
import { snakeRefs } from './snakeState'

const dummy = new THREE.Object3D()

const HEAD_W = CELL_SIZE * 0.92
const HEAD_H = CELL_SIZE * 0.65
const SEG_W  = CELL_SIZE * 0.85
const SEG_H  = CELL_SIZE * 0.55

function interpX(prev: GridPos | undefined, curr: GridPos, t: number): number {
  return lerp(prev ? gridToWorldX(prev.x) : gridToWorldX(curr.x), gridToWorldX(curr.x), t)
}
function interpZ(prev: GridPos | undefined, curr: GridPos, t: number): number {
  return lerp(prev ? gridToWorldZ(prev.z) : gridToWorldZ(curr.z), gridToWorldZ(curr.z), t)
}

function SnakeHead() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const head = snakeRefs.body[0]
    if (!head) return

    const t  = snakeRefs.tickProgress
    mesh.position.set(
      interpX(snakeRefs.prevBody[0], head, t),
      HEAD_H / 2,
      interpZ(snakeRefs.prevBody[0], head, t),
    )
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[HEAD_W, HEAD_H, HEAD_W]} />
      <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={1.2} />
    </mesh>
  )
}

function SnakeBodySegments() {
  const ref = useRef<THREE.InstancedMesh>(null)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const { body, prevBody, tickProgress: t } = snakeRefs

    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const curr = body[i + 1]
      if (curr) {
        dummy.position.set(interpX(prevBody[i + 1], curr, t), SEG_H / 2, interpZ(prevBody[i + 1], curr, t))
        dummy.scale.set(SEG_W, SEG_H, SEG_W)
      } else {
        dummy.position.set(0, -100, 0)
        dummy.scale.set(0.001, 0.001, 0.001)
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    // frustumCulled=false: Three.js не скрывает новые сегменты по bounding box
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_SEGMENTS]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
    </instancedMesh>
  )
}

export function Snake() {
  return (
    <>
      <SnakeHead />
      <SnakeBodySegments />
    </>
  )
}
