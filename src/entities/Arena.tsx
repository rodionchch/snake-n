import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE } from '../utils/constants'

const W = GRID_WIDTH * CELL_SIZE
const H = GRID_HEIGHT * CELL_SIZE
const WALL_H = 1.2
const WALL_T = 0.4

// Неоновая палитра
const NEON_CYAN = '#00ffff'
const NEON_MAGENTA = '#ff00cc'
const NEON_YELLOW = '#ffff00'

export function Arena() {
  return (
    <group>
      {/* Чёрный пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Неоновая сетка квадратиков */}
      <gridHelper
        args={[W, GRID_WIDTH, NEON_CYAN, NEON_CYAN]}
        position={[0, 0.01, 0]}
      />

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
        [-W / 2 - WALL_T / 2, H / 2 + WALL_T / 2],
        [W / 2 + WALL_T / 2, H / 2 + WALL_T / 2],
        [-W / 2 - WALL_T / 2, -H / 2 - WALL_T / 2],
        [W / 2 + WALL_T / 2, -H / 2 - WALL_T / 2],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, WALL_H / 2, z]}>
          <boxGeometry args={[WALL_T, WALL_H, WALL_T]} />
          <meshStandardMaterial color="#222200" emissive={NEON_YELLOW} emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  )
}
