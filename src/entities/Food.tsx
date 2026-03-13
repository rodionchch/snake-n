import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store'
import { gridToWorldX, gridToWorldZ } from '../utils/math'
import { CELL_SIZE, BOARD_HALF_T } from '../utils/constants'
import { flipRefs } from './flipState'

const FOOD_SIZE = CELL_SIZE * 0.65
const FOOD_Y    = BOARD_HALF_T + 0.05 + FOOD_SIZE / 2

export function Food() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return

    const { food } = useGameStore.getState()
    if (!food.active) { mesh.visible = false; return }

    // Как только флип стартовал — считаем что мы уже на следующей стороне.
    // Это делает смену видимости мгновенной в момент пересечения края.
    const effectiveCount = flipRefs.isFlipping
      ? flipRefs.flipCount + 1
      : flipRefs.flipCount
    const accessible = flipRefs.foodSide === (effectiveCount % 2)
    mesh.visible = accessible
    if (!accessible) return

    const pos = food.position
    mesh.position.set(gridToWorldX(pos.x), FOOD_Y, gridToWorldZ(pos.z))
    mesh.rotation.y += delta * 1.5
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[FOOD_SIZE, FOOD_SIZE, FOOD_SIZE]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.2} />
    </mesh>
  )
}
