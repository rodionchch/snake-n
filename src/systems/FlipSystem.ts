import { useFrame } from '@react-three/fiber'
import { flipRefs, flipGroupRef } from '../entities/flipState'
import { lerp } from '../utils/math'

const FLIP_DURATION = 0.65  // секунды на один переворот

// Кубический ease-in-out: медленно → быстро → медленно
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
      flipRefs.rotX       = targetRotX
      flipRefs.rotZ       = targetRotZ
      flipRefs.isFlipping = false
      flipRefs.flipCount += 1   // счётчик завершённых переворотов
    }
  })

  return null
}
