import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Cloth({ width = 1, height = 2, segments = 20, image = 'left', ...props }) {
  const meshRef = useRef()

  // Geometry: a vertical waving flag / cloth
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments)
  const texture = useTexture(`/textures/cloth/${image}.jpg`)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pos = geometry.attributes.position

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)

      // smooth wind wave
      const wave = Math.sin(x * 3 + t * 2) * 0.05 + Math.sin(y * 2 + t * 1.5) * 0.05

      pos.setZ(i, wave)
    }
    pos.needsUpdate = true
    geometry.computeVertexNormals() // fixes ugly shadows
  })

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow {...props}>
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        metalness={0.0}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}
