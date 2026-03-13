import { useMemo } from 'react'
import * as THREE from 'three'
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, BOARD_HALF_T } from '../utils/constants'
import { gridToWorldX, gridToWorldZ } from '../utils/math'

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

// Светящаяся полоска на краю доски (замена стенам)
function EdgeStrip({ position, args }: {
  position: [number, number, number]
  args: [number, number, number]
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color="#003322"
        emissive={NEON_GREEN}
        emissiveIntensity={EDGE_GLOW}
      />
    </mesh>
  )
}

const STRIP_H = BOARD_HALF_T * 2 + 0.04  // чуть выше толщины доски
const STRIP_T = 0.10                      // толщина полоски

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
      <EdgeStrip position={[0,      0, -H / 2]} args={[W + STRIP_T, STRIP_H, STRIP_T]} />
      <EdgeStrip position={[0,      0,  H / 2]} args={[W + STRIP_T, STRIP_H, STRIP_T]} />
      <EdgeStrip position={[-W / 2, 0,      0]} args={[STRIP_T, STRIP_H, H + STRIP_T]} />
      <EdgeStrip position={[ W / 2, 0,      0]} args={[STRIP_T, STRIP_H, H + STRIP_T]} />
    </group>
  )
}
