import { useFrame } from '@react-three/fiber'
import { flipRefs, flipGroupRef } from '../entities/flipState'
import { lerp } from '../utils/math'

const FLIP_DURATION = 0.6  // секунды на переворот 180°
const TWO_PI = Math.PI * 2

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function FlipSystem(): null {
  useFrame((_, delta) => {
    if (!flipRefs.isFlipping) return
    const group = flipGroupRef.current
    if (!group) return

    flipRefs.flipProgress = Math.min(flipRefs.flipProgress + delta / FLIP_DURATION, 1)
    const eased = easeInOutCubic(flipRefs.flipProgress)

    const targetRotX = flipRefs.startRotX + (flipRefs.flipAxis === 'x' ? Math.PI * flipRefs.flipSign : 0)
    const targetRotZ = flipRefs.startRotZ + (flipRefs.flipAxis === 'z' ? Math.PI * flipRefs.flipSign : 0)

    group.rotation.x = lerp(flipRefs.startRotX, targetRotX, eased)
    group.rotation.z = lerp(flipRefs.startRotZ, targetRotZ, eased)

    if (flipRefs.flipProgress >= 1) {
      // Нормализуем в [0, 2π) чтобы числа не росли бесконечно
      flipRefs.rotX = ((targetRotX % TWO_PI) + TWO_PI) % TWO_PI
      flipRefs.rotZ = ((targetRotZ % TWO_PI) + TWO_PI) % TWO_PI
      group.rotation.x = flipRefs.rotX
      group.rotation.z = flipRefs.rotZ
      flipRefs.isFlipping = false
      flipRefs.flipCount += 1
    }
  })

  return null
}
