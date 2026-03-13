import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { GameLoop } from '../engine/GameLoop'
import { CameraSystem } from '../systems/CameraSystem'
import { Snake } from '../entities/Snake'
import { Food } from '../entities/Food'
import { Arena } from '../entities/Arena'

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 12, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#00ffff" />
    </>
  )
}

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 20, 14], fov: 52 }}
      gl={{ antialias: true }}
      style={{ width: '100vw', height: '100vh', background: '#000000' }}
    >
      <Lights />
      <Arena />
      <Snake />
      <Food />
      <GameLoop />
      <CameraSystem />
      <EffectComposer>
        <Bloom threshold={0.05} strength={1.0} radius={0.8} />
      </EffectComposer>
    </Canvas>
  )
}
