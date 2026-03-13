import { useMemo } from 'react'
import * as THREE from 'three'
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE } from '../utils/constants'
import { gridToWorldX, gridToWorldZ } from '../utils/math'

const W = GRID_WIDTH  * CELL_SIZE
const H = GRID_HEIGHT * CELL_SIZE
const WALL_H    = 1.2
const WALL_T    = 0.4
const TILE_SIZE = CELL_SIZE * 0.84  // зазор 0.16 → чёрные линии сетки

const NEON_MAGENTA = '#ff00cc'
const NEON_YELLOW  = '#ffff00'

// Один меш — 400 плиток, вершинные цвета запечены в BufferGeometry
function FloorTiles() {
  const geometry = useMemo(() => {
    const hs    = TILE_SIZE / 2
    const Y     = 0.005  // чуть выше пола
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

        // Диагональный градиент по HSL: красный → жёлтый → зелёный → циан → синий → маджента
        const t = (x / (GRID_WIDTH - 1) + z / (GRID_HEIGHT - 1)) / 2
        col.setHSL(t, 0.70, 0.22)
        const { r, g, b } = col

        // Два треугольника = горизонтальный квадрат на плоскости Y
        const quad = [
          cx - hs, Y, cz - hs,
          cx + hs, Y, cz - hs,
          cx + hs, Y, cz + hs,
          cx - hs, Y, cz - hs,
          cx + hs, Y, cz + hs,
          cx - hs, Y, cz + hs,
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
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  )
}

export function Arena() {
  return (
    <group>
      {/* Чёрный пол — просвечивает в зазорах между плитками */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      <FloorTiles />

      {/* Стены — неоновый маджента */}
      <mesh position={[0, WALL_H / 2, -H / 2 - WALL_T / 2]}>
        <boxGeometry args={[W + WALL_T * 2, WALL_H, WALL_T]} />
        <meshStandardMaterial color="#220033" emissive={NEON_MAGENTA} emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, WALL_H / 2, H / 2 + WALL_T / 2]}>
        <boxGeometry args={[W + WALL_T * 2, WALL_H, WALL_T]} />
        <meshStandardMaterial color="#220033" emissive={NEON_MAGENTA} emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[-W / 2 - WALL_T / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, H]} />
        <meshStandardMaterial color="#220033" emissive={NEON_MAGENTA} emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[W / 2 + WALL_T / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, H]} />
        <meshStandardMaterial color="#220033" emissive={NEON_MAGENTA} emissiveIntensity={0.5} />
      </mesh>

      {/* Угловые столбики — неоновый жёлтый */}
      {([
        [-W / 2 - WALL_T / 2,  H / 2 + WALL_T / 2],
        [ W / 2 + WALL_T / 2,  H / 2 + WALL_T / 2],
        [-W / 2 - WALL_T / 2, -H / 2 - WALL_T / 2],
        [ W / 2 + WALL_T / 2, -H / 2 - WALL_T / 2],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, WALL_H / 2, z]}>
          <boxGeometry args={[WALL_T, WALL_H, WALL_T]} />
          <meshStandardMaterial color="#222200" emissive={NEON_YELLOW} emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  )
}
