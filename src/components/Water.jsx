import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water2.js'
import { useThree } from '@react-three/fiber'

export default function WaterSurface() {
  const waterRef = useRef()
  const { scene } = useThree()

  useEffect(() => {
    // Water geometry (a large plane)
    const geometry = new THREE.PlaneGeometry(20, 20)

    // Load your normals (put them in public/textures/water/)
    const water = new Water(geometry, {
      scale: 4,
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x99ccff,
      flowDirection: new THREE.Vector2(1, 1),
      flowSpeed: 0.03,
      reflectivity: 0.3,

      normalMap0: new THREE.TextureLoader().load('/textures/water/Water_1_M_Normal.jpg'),
      normalMap1: new THREE.TextureLoader().load('/textures/water/Water_2_M_Normal.jpg'),
    })

    water.rotation.x = -Math.PI / 3
    water.rotation.z = Math.PI / 7
    water.position.y = 0

    scene.add(water)
    waterRef.current = water

    return () => {
      scene.remove(water)
    }
  }, [scene])

  return null
}
