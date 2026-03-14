import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store'
import { gridToWorldX, gridToWorldZ } from '../utils/math'
import { CELL_SIZE } from '../utils/constants'

const OBSTACLE_SIZE = CELL_SIZE * 0.82
const MAX_OBSTACLES = 50
const dummy = new THREE.Object3D()

export function Obstacles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const { obstacles } = useGameStore.getState()

    for (let i = 0; i < obstacles.length; i++) {
      const { x, z } = obstacles[i]
      dummy.position.set(gridToWorldX(x), OBSTACLE_SIZE / 2, gridToWorldZ(z))
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    // Скрываем неиспользуемые инстансы
    for (let i = obstacles.length; i < MAX_OBSTACLES; i++) {
      dummy.position.set(0, -100, 0)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_OBSTACLES]} frustumCulled={false}>
      <boxGeometry args={[OBSTACLE_SIZE, OBSTACLE_SIZE, OBSTACLE_SIZE]} />
      <meshStandardMaterial
        color="#1a0a2e"
        emissive="#8844ff"
        emissiveIntensity={0.5}
      />
    </instancedMesh>
  )
}
