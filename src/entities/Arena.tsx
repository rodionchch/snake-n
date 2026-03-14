import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, BOARD_HALF_T } from '../utils/constants'
import { gridToWorldX, gridToWorldZ } from '../utils/math'
import { flipRefs } from './flipState'

const W         = GRID_WIDTH  * CELL_SIZE
const H         = GRID_HEIGHT * CELL_SIZE
const TILE_SIZE = CELL_SIZE * 0.84   // зазор 0.16 → чёрные линии сетки

const NEON_GREEN = '#00ff88'
const EDGE_GLOW  = 0.9

// Один меш — 400 плиток, вершинные цвета запечены в BufferGeometry
function FloorTiles({ yOffset }: { yOffset: number }) {
  const geometry = useMemo(() => {
    const hs    = TILE_SIZE / 2
    const count = GRID_WIDTH * GRID_HEIGHT
    const positions = new Float32Array(count * 6 * 3)
    const colors    = new Float32Array(count * 6 * 3)
    const col = new THREE.Color()
    let pi = 0
    let ci = 0

    for (let z = 0; z < GRID_HEIGHT; z++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cx = gridToWorldX(x)
        const cz = gridToWorldZ(z)

        // Диагональный градиент по HSL
        const t = (x / (GRID_WIDTH - 1) + z / (GRID_HEIGHT - 1)) / 2
        col.setHSL(t, 0.70, 0.22)
        const { r, g, b } = col

        const quad = [
          cx - hs, yOffset, cz - hs,
          cx + hs, yOffset, cz - hs,
          cx + hs, yOffset, cz + hs,
          cx - hs, yOffset, cz - hs,
          cx + hs, yOffset, cz + hs,
          cx - hs, yOffset, cz + hs,
        ]
        for (let v = 0; v < 6; v++) {
          positions[pi++] = quad[v * 3]
          positions[pi++] = quad[v * 3 + 1]
          positions[pi++] = quad[v * 3 + 2]
          colors[ci++] = r
          colors[ci++] = g
          colors[ci++] = b
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3))
    return geo
  }, [yOffset])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} />
    </mesh>
  )
}

const STRIP_H = BOARD_HALF_T * 2 + 0.04  // чуть выше толщины доски
const STRIP_T = 0.10                      // толщина полоски

const STRIP_DEFS: { position: [number, number, number]; args: [number, number, number] }[] = [
  { position: [0,      0, -H / 2], args: [W + STRIP_T, STRIP_H, STRIP_T] },
  { position: [0,      0,  H / 2], args: [W + STRIP_T, STRIP_H, STRIP_T] },
  { position: [-W / 2, 0,      0], args: [STRIP_T, STRIP_H, H + STRIP_T] },
  { position: [ W / 2, 0,      0], args: [STRIP_T, STRIP_H, H + STRIP_T] },
]

// Все 4 края — один компонент с useFrame для пульса во время флипа
function EdgeStrips() {
  const r0 = useRef<THREE.MeshStandardMaterial>(null)
  const r1 = useRef<THREE.MeshStandardMaterial>(null)
  const r2 = useRef<THREE.MeshStandardMaterial>(null)
  const r3 = useRef<THREE.MeshStandardMaterial>(null)
  const matRefs = [r0, r1, r2, r3]

  useFrame(() => {
    // Bell-curve: максимум в середине переворота (progress=0.5)
    const pulse = flipRefs.isFlipping
      ? EDGE_GLOW + 3.5 * Math.sin(flipRefs.flipProgress * Math.PI)
      : EDGE_GLOW
    for (const r of matRefs) {
      if (r.current) r.current.emissiveIntensity = pulse
    }
  })

  return (
    <>
      {STRIP_DEFS.map((s, i) => (
        <mesh key={i} position={s.position}>
          <boxGeometry args={s.args} />
          <meshStandardMaterial
            ref={matRefs[i]}
            color="#003322"
            emissive={NEON_GREEN}
            emissiveIntensity={EDGE_GLOW}
          />
        </mesh>
      ))}
    </>
  )
}

export function Arena() {
  const topY = BOARD_HALF_T + 0.005

  return (
    <group>
      {/* Сама доска — тонкая коробка, видна при перевороте как ребро */}
      <mesh>
        <boxGeometry args={[W, BOARD_HALF_T * 2, H]} />
        <meshStandardMaterial color="#02020a" />
      </mesh>

      {/* Тайлы игровой поверхности */}
      <FloorTiles yOffset={topY} />

      {/* Светящиеся края — обозначают границу, куда можно «упасть» */}
      <EdgeStrips />
    </group>
  )
}
