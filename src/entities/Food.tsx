import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store'

import { gridToWorldX, gridToWorldZ } from '../utils/math'
import { CELL_SIZE } from '../utils/constants'

const FOOD_SIZE = CELL_SIZE * 0.65

export function Food() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const { food } = useGameStore.getState()
    const pos = food.position
    mesh.position.set(gridToWorldX(pos.x), FOOD_SIZE / 2 + 0.05, gridToWorldZ(pos.z))
    mesh.visible = food.active
    mesh.rotation.y += delta * 1.5
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[FOOD_SIZE, FOOD_SIZE, FOOD_SIZE]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.2} />
    </mesh>
  )
}
