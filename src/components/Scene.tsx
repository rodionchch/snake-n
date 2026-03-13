import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function Scene({ children }: { children?: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 60 }}
      style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />

      {children}

      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.8} />
      </EffectComposer>

      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  )
}
