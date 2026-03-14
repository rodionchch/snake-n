import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { GameLoop } from '../engine/GameLoop'
import { CameraSystem } from '../systems/CameraSystem'
import { FlipSystem } from '../systems/FlipSystem'
import { Snake } from '../entities/Snake'
import { Food } from '../entities/Food'
import { Arena } from '../entities/Arena'
import { Obstacles } from '../entities/Obstacles'
import { flipGroupRef } from '../entities/flipState'

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 12, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#00ffff" />
    </>
  )
}

// Компонент-мост: подключает R3F group ref к мутабельному flipGroupRef
function FlipGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    flipGroupRef.current = ref.current
    return () => { flipGroupRef.current = null }
  }, [])

  return <group ref={ref}>{children}</group>
}

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 20, 14], fov: 52 }}
      gl={{ antialias: true }}
      style={{ width: '100vw', height: '100vh', background: '#000000' }}
    >
      <Lights />

      {/* Вся сцена внутри FlipGroup — переворачивается как единое целое */}
      <FlipGroup>
        <Arena />
        <Obstacles />
        <Snake />
        <Food />
      </FlipGroup>

      {/* Системы вне группы — они сами читают flipGroupRef для мировых координат */}
      <GameLoop />
      <FlipSystem />
      <CameraSystem />

      <EffectComposer>
        <Bloom threshold={0.4} strength={0.9} radius={0.4} />
      </EffectComposer>
    </Canvas>
  )
}
