import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GridPos } from './types'
import { MAX_SEGMENTS, CELL_SIZE } from '../utils/constants'
import { gridToWorldX, gridToWorldZ, lerp } from '../utils/math'
import { snakeRefs } from './snakeState'

const dummy   = new THREE.Object3D()
const _zAxis  = new THREE.Vector3(0, 0, 1)
const _yAxis  = new THREE.Vector3(0, 1, 0)
const _dir    = new THREE.Vector3()

// Заранее вычисленная «скрытая» матрица — не пересоздавать в useFrame
const _hiddenMatrix = (() => {
  const d = new THREE.Object3D()
  d.position.set(0, -100, 0)
  d.scale.set(0.001, 0.001, 0.001)
  d.updateMatrix()
  return d.matrix.clone()
})()

const HEAD_R = CELL_SIZE * 0.50
const SEG_W  = CELL_SIZE * 0.66
const SEG_H  = CELL_SIZE * 0.48
const TAIL_H = CELL_SIZE * 0.55

const NEON = '#00ffff'

// Зебра: два отдельных InstancedMesh — надёжнее, чем vertexColors+instanceColor
const LIGHT_COLOR = '#1a5a5a'   // светлее — заметный тил
const DARK_COLOR  = '#07161a'   // темнее — почти чёрный

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
    const t = snakeRefs.tickProgress
    mesh.position.set(
      interpX(snakeRefs.prevBody[0], head, t),
      HEAD_R,
      interpZ(snakeRefs.prevBody[0], head, t),
    )
  })

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[HEAD_R, 0]} />
      <meshStandardMaterial color={LIGHT_COLOR} emissive={NEON} emissiveIntensity={0.85} />
    </mesh>
  )
}

// 4-гранный конус — острый кончик хвоста; ориентирован в продолжение последнего звена
function SnakeTail() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const { body, prevBody, tickProgress: t } = snakeRefs
    const n = body.length - 1

    if (n < 1) { mesh.visible = false; return }
    mesh.visible = true

    const curr = body[n]
    const prev = body[n - 1]
    if (!curr) { mesh.visible = false; return }

    const cx = interpX(prevBody[n],     curr, t)
    const cz = interpZ(prevBody[n],     curr, t)
    const px = interpX(prevBody[n - 1], prev, t)
    const pz = interpZ(prevBody[n - 1], prev, t)

    const dx = cx - px
    const dz = cz - pz
    const len = Math.sqrt(dx * dx + dz * dz)

    if (len > 0.001) {
      _dir.set(dx / len, 0, dz / len)
      mesh.quaternion.setFromUnitVectors(_yAxis, _dir)
    }

    mesh.position.set(
      cx + _dir.x * TAIL_H / 2,
      SEG_H / 2,
      cz + _dir.z * TAIL_H / 2,
    )
  })

  return (
    <mesh ref={ref}>
      <coneGeometry args={[SEG_H / 2, TAIL_H, 4, 1]} />
      <meshStandardMaterial color={DARK_COLOR} emissive={NEON} emissiveIntensity={0.5} />
    </mesh>
  )
}

// Два отдельных InstancedMesh на каждый слой (links + joints):
// светлые чётные сегменты и тёмные нечётные — 100% надёжная зебра без instanceColor
function SnakeBodyLinks() {
  const linkLRef  = useRef<THREE.InstancedMesh>(null)
  const linkDRef  = useRef<THREE.InstancedMesh>(null)
  const jointLRef = useRef<THREE.InstancedMesh>(null)
  const jointDRef = useRef<THREE.InstancedMesh>(null)

  useFrame(() => {
    const lL = linkLRef.current;  const lD = linkDRef.current
    const jL = jointLRef.current; const jD = jointDRef.current
    if (!lL || !lD || !jL || !jD) return

    const { body: segs, prevBody, tickProgress: t } = snakeRefs

    // Звенья
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const a = segs[i]
      const b = segs[i + 1]

      if (a && b) {
        const ax = interpX(prevBody[i],     a, t)
        const az = interpZ(prevBody[i],     a, t)
        const bx = interpX(prevBody[i + 1], b, t)
        const bz = interpZ(prevBody[i + 1], b, t)

        const dx  = bx - ax
        const dz  = bz - az
        const len = Math.sqrt(dx * dx + dz * dz)

        dummy.position.set((ax + bx) / 2, SEG_H / 2, (az + bz) / 2)
        if (len > 0.001) {
          _dir.set(dx / len, 0, dz / len)
          dummy.quaternion.setFromUnitVectors(_zAxis, _dir)
        } else {
          dummy.quaternion.identity()
        }
        dummy.scale.set(SEG_W, SEG_H, len)
        dummy.updateMatrix()

        const [vis, hid] = i % 2 === 0 ? [lL, lD] : [lD, lL]
        vis.setMatrixAt(i, dummy.matrix)
        hid.setMatrixAt(i, _hiddenMatrix)
      } else {
        lL.setMatrixAt(i, _hiddenMatrix)
        lD.setMatrixAt(i, _hiddenMatrix)
      }
    }

    // Суставные сферы — закругляют изгибы; хвостовой (последний) скрыт — там конус
    const tailJointIdx = segs.length - 2  // i при котором seg = segs[segs.length-1]

    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const seg = segs[i + 1]

      if (seg && i !== tailJointIdx) {
        dummy.position.set(
          interpX(prevBody[i + 1], seg, t),
          SEG_H / 2,
          interpZ(prevBody[i + 1], seg, t),
        )
        dummy.quaternion.identity()
        dummy.scale.set(SEG_W * 0.97, SEG_H * 0.97, SEG_W * 0.97)
        dummy.updateMatrix()

        const [vis, hid] = i % 2 === 0 ? [jL, jD] : [jD, jL]
        vis.setMatrixAt(i, dummy.matrix)
        hid.setMatrixAt(i, _hiddenMatrix)
      } else {
        jL.setMatrixAt(i, _hiddenMatrix)
        jD.setMatrixAt(i, _hiddenMatrix)
      }
    }

    lL.instanceMatrix.needsUpdate  = true
    lD.instanceMatrix.needsUpdate  = true
    jL.instanceMatrix.needsUpdate  = true
    jD.instanceMatrix.needsUpdate  = true
  })

  return (
    <>
      <instancedMesh ref={linkLRef} args={[undefined, undefined, MAX_SEGMENTS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={LIGHT_COLOR} emissive={NEON} emissiveIntensity={0.85} />
      </instancedMesh>

      <instancedMesh ref={linkDRef} args={[undefined, undefined, MAX_SEGMENTS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={DARK_COLOR} emissive={NEON} emissiveIntensity={0.30} />
      </instancedMesh>

      <instancedMesh ref={jointLRef} args={[undefined, undefined, MAX_SEGMENTS]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={LIGHT_COLOR} emissive={NEON} emissiveIntensity={0.85} />
      </instancedMesh>

      <instancedMesh ref={jointDRef} args={[undefined, undefined, MAX_SEGMENTS]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={DARK_COLOR} emissive={NEON} emissiveIntensity={0.30} />
      </instancedMesh>
    </>
  )
}

export function Snake() {
  return (
    <>
      <SnakeHead />
      <SnakeTail />
      <SnakeBodyLinks />
    </>
  )
}
