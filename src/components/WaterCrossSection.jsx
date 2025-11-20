// WaterFrontWavy.jsx
import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshWobbleMaterial } from '@react-three/drei'

export default function WaterCrossSection({
  width = 20,
  height = 1,
  z = 0,
  speed = 1,
  amplitude = 0.07,
  color = '#3A7F8E',
}) {
  return (
    <mesh position={[0, -1.675, 3.5]} rotation={[Math.PI / 4, 0, 0]}>
      <boxGeometry args={[4, 1, 2]} />
      <MeshWobbleMaterial
        factor={0.1} // how strong the waves are
        speed={0.9} // how fast
        color="#4a808b" // underwater color
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}
