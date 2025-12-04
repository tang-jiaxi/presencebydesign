import { useEffect, useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

export default function LiBai(props) {
  const model = useLoader(FBXLoader, '/libai.fbx')

  const talk = useLoader(FBXLoader, '/motions/libai_talk.fbx')
  const read = useLoader(FBXLoader, '/motions/libai_read.fbx')
  const sleep = useLoader(FBXLoader, '/motions/libai_sleep.fbx')

  const mixer = useRef(null)
  const actions = useRef([])
  const current = useRef(0)

  const texLoader = new THREE.TextureLoader()
  const baseColor1 = texLoader.load('/textures/libai/00000001256D60B8.png')
  const normal1 = texLoader.load('/textures/libai/00000001178612F8.png')
  const roughness = texLoader.load('/textures/libai/00000001256CDFF8.png')
  const ao = texLoader.load('/textures/libai/00000001256CCDB8.png')
  const opacity = texLoader.load('/textures/libai/00000001256D0F38.png')
  const equipMap = texLoader.load('/textures/libai/no_equipment.png')
  const equipNormal = texLoader.load('/textures/libai/equip_normal.png')
  const bodyMap = texLoader.load('/textures/libai/body.png')
  const bodyNormal = texLoader.load('/textures/libai/body_normal.png')
  // baseColor1.colorSpace = THREE.SRGBColorSpace
  // normal1.colorSpace = THREE.NoColorSpace
  // roughness.colorSpace = THREE.NoColorSpace
  // ao.colorSpace = THREE.NoColorSpace

  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return

      const name = child.name

      if (name === 'r602065_palefire_equip') {
        child.material = new THREE.MeshStandardMaterial({
          map: equipMap,
          transparent: true,
          depthWrite: false,
          normalMap: equipNormal,
        })
        child.material.map.colorSpace = THREE.SRGBColorSpace
      } else {
        child.material = new THREE.MeshStandardMaterial({
          map: bodyMap,
          normalMap: bodyNormal,
        })
        child.material.map.colorSpace = THREE.SRGBColorSpace
      }
      child.material.needsUpdate = true
    })
    mixer.current = new THREE.AnimationMixer(model)

    const clips = [talk.animations[1], read.animations[1], sleep.animations[1]]
    const TRANSITION = 2.0

    actions.current = clips.map((clip) => mixer.current.clipAction(clip, model))
    actions.current.forEach((a) => (a.timeScale = 0.5))
    actions.current[0].reset().fadeIn(TRANSITION).play()

    const interval = setInterval(() => {
      const prev = current.current
      const next = (prev + 1) % actions.current.length

      actions.current[prev].fadeOut(TRANSITION)
      actions.current[next].reset().fadeIn(TRANSITION).play()

      current.current = next
    }, 6000)

    return () => clearInterval(interval)
  }, [model])

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta)
  })

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} {...props}>
      <primitive object={model} />
    </group>
  )
}
