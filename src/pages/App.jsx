import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Pavilion from '@/components/models/Pavilion'
import WaterSurface from '@/components/Water'
import WaterCrossSection from '@/components/WaterCrossSection'
import '../index.css'
import WaterLantern from '../components/models/WaterLantern'

function App() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-blue-100">
      {/* <div className="mx-auto h-screen w-[calc(100vh*82/144)] border-black bg-none"></div> */}
      <Canvas
        className="overflow-hidden"
        camera={{
          fov: 45,
          near: 0.1,
          far: 50,
          position: [0, 0, 6],
          // rotation: [-0.5, 0, 0],
        }}
      >
        <directionalLight position={[0, 0, 6]} intensity={1} />
        <ambientLight intensity={0.2} color="#ffffff" />
        <Pavilion scale={0.007} position={[0, 1, 0]} />
        <WaterLantern position={[0, 0, 0]} rotation={[Math.PI / 10, Math.PI / 15, 0]} />
        <WaterSurface position={[0, 1, 0]} />
        <WaterCrossSection />
        <mesh position={[0, -4, 0]} rotation={[-Math.PI / 3, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#4a808b" roughness={1} />
        </mesh>
      </Canvas>
    </main>
  )
}

export default App
