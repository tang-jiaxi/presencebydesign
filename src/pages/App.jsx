import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Pavilion_brokendown from '@/components/models/Pavilion_brokendown'
import WaterSurface from '@/components/Water'
import '../index.css'
import WaterLantern from '../components/models/WaterLantern'
import { supabase } from '@/lib/supabase/client'
import { OrbitControls, Environment, useTexture, Clouds, Cloud } from '@react-three/drei'
import { Physics, RigidBody, useRapier } from '@react-three/rapier'
import { wrap } from '@/utils/wrap'
import { rand } from '@/utils/random'
import * as THREE from 'three'
import Libai from '@/components/models/LiBai'
import Table from '@/components/models/Table'
import Cloth from '@/components/Cloth'

export default function App() {
  const controlsRef = useRef()
  const [lanterns, setLanterns] = useState([])
  const INITIAL_CAMERA = {
    position: [0, 0.5, 6],
    target: [0, 0, 0],
    fov: 35,
    near: 0.1,
    far: 50,
    rotation: [0, 0, 0],
  }

  useEffect(() => {
    async function loadImages() {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      if (!error) setLanterns(data)
    }
    loadImages()

    const channel = supabase
      .channel('images-insert-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'images' }, (payload) => {
        const newImage = payload.new
        // setLanterns((prev) => [...prev, newImage])
        setLanterns((prev) => {
          const updated = [newImage, ...prev]
          return updated.slice(0, 10)
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function GlobalLanternControls() {
    const { world } = useRapier()

    let counter = 0
    useFrame((state) => {
      counter++
      if (counter % 4 !== 0) return

      const t = state.clock.elapsedTime
      world.forEachRigidBody((body) => {
        if (!body.userData?.lantern) return

        // body.applyImpulse(
        //   {
        //     x: Math.sin(t * 0.4) * 0.00001,
        //     y: Math.cos(t) * 0.000095,
        //     z: Math.sin(t * 0.7) * 0.00001,
        //   },
        //   true
        // )
        const pos = body.translation()
        const floatAmount = 0.015 + Math.sin(t * rand(0.5, 0.75)) * 0.05

        const drift = 0.2
        const v = body.linvel()
        body.setLinvel({ x: drift, y: v.y, z: v.z }, true)

        wrap(body, -5, 5)
      })
    })

    return null
  }

  useEffect(() => {
    if (controlsRef.current) {
      const [x, y, z] = INITIAL_CAMERA.position
      controls.object.position.set(x, y, z)
      const [tx, ty, tz] = INITIAL_CAMERA.target
      controls.target.set(tx, ty, tz)
      const [rx, ry, rz] = INITIAL_CAMERA.rotation
      controls.object.rotation.set(rx, ry, rz)
      controlsRef.current.update()
    }
  }, [])

  function Background() {
    const texture = useTexture('/hdr/cropped.jpg')
    return (
      <>
        <mesh position={[-0.01, 0, -10]} scale={[6, 10, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} depthWrite={false} toneMapped={false} />
        </mesh>
      </>
    )
  }

  function BianE() {
    const texture = useTexture('/textures/biane/sign.png')
    return (
      <>
        <mesh position={[0, 1.291, -1.25]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial map={texture} depthWrite={false} toneMapped={false} />
        </mesh>
      </>
    )
  }

  function MovingCloudBand() {
    const cloudRef = useRef()

    const speed = useRef(rand(0.05, 0.1))

    useFrame((_, delta) => {
      if (!cloudRef.current) return
      cloudRef.current.position.x += speed.current * delta
      if (cloudRef.current.position.x < -5) {
        cloudRef.current.position.x = 5
      }
    })

    return (
      <group ref={cloudRef} position={[0, -1.5, -20]} scale={[1, 0.5, 1]}>
        <Cloud opacity={0.55} width={10} depth={1} color="#b2b8c8" />
      </group>
    )
  }

  function Spinner() {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-16 bg-amber-50">
        <div className="h-40 w-40 animate-spin rounded-full border-20 border-gray-800 border-b-gray-400"></div>
        <p className="font-[palatino-linotype] text-4xl font-bold text-[#db452c]">
          Releasing your lanterns...
        </p>
      </div>
    )
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      {/* <div className="mx-auto h-screen w-[calc(100vh*82/144)] border-black bg-none"></div> */}
      <Canvas
        className="overflow-hidden"
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
        camera={{
          fov: INITIAL_CAMERA.fov,
          near: INITIAL_CAMERA.near,
          far: INITIAL_CAMERA.far,
          position: INITIAL_CAMERA.position,
          rotation: INITIAL_CAMERA.rotation,
        }}
      >
        {' '}
        <Suspense fallback={<Spinner />}>
          {/* <Environment files="/hdr/citrus_orchard_road_puresky_4k.exr" background={false} /> */}
          <Background />
          <Clouds material={THREE.MeshBasicMaterial}>
            <MovingCloudBand />
          </Clouds>
          <Physics gravity={[0, 0, 0]}>
            <OrbitControls ref={controlsRef} enablePan={false} />
            <directionalLight position={[0, 0, 6]} intensity={2} />
            <ambientLight intensity={1} color="#ffffff" />

            <Pavilion_brokendown position={[0, 0, -2]} scale={0.02} />
            <Libai position={[-0.02, 0, -2]} scale={0.5} animation="talk" />
            <Table position={[0, 0, -2]} scale={[0.45, 0.56, 0.4]} />
            <Cloth position={[-0.76, 0.95, -1.18]} scale={[0.2, 0.5, 0.5]} image="left" />
            <Cloth position={[0.77, 0.95, -1.2]} scale={[0.2, 0.5, 0.5]} image="right" />
            <BianE />

            {lanterns?.map((img, i) => {
              const isNewest = i === 0
              const spawnX = isNewest ? -0.1 : rand(-2, 1)
              const spawnZ = isNewest ? 1.8 : rand(1.2, 2)

              return (
                <WaterLantern
                  key={img.id}
                  image={img.image_url}
                  position={[spawnX, 0.0178, spawnZ]}
                />
              )
            })}
            <GlobalLanternControls />
            <WaterSurface position={[0, 1, 0]} distortionScale={5} />
            {/* <WaterCrossSection /> */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#4a808b" roughness={1} metalness={0} />
            </mesh>
            <RigidBody type="fixed">
              <mesh position={[0, -1, 0]}>
                <boxGeometry args={[100, 1, 100]} />
                <meshStandardMaterial color="#333" transparent opacity={0} />
              </mesh>
            </RigidBody>
          </Physics>
        </Suspense>
      </Canvas>
    </main>
  )
}
