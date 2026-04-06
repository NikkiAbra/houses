import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { CameraSetup } from './CameraSetup'
import { StaticHouses } from './StaticHouses'
import { AnimatedHouse } from './AnimatedHouse'

import block06Url from '../../house_models/animated/block06.glb?url'
import block07Url from '../../house_models/animated/block07.glb?url'
import block08Url from '../../house_models/animated/block08.glb?url'
import hdrUrl from '../../light/autumn_field_puresky_1k.hdr?url'

useGLTF.preload(block06Url)
useGLTF.preload(block07Url)
useGLTF.preload(block08Url)

export function Scene() {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', background: '#f0ede8' }}
      gl={{ antialias: true, toneMappingExposure: 1.2 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#f0ede8']} />

      <Suspense fallback={null}>
        {/* Camera from Blender data */}
        <CameraSetup />

        {/* HDRI as lighting only, no background */}
        <Environment files={hdrUrl} background={false} />

        {/* Static part of the scene */}
        <StaticHouses />

        {/* Animated houses — blend shape hover interaction */}
        <AnimatedHouse url={block06Url} />
        <AnimatedHouse url={block07Url} />
        <AnimatedHouse url={block08Url} />
      </Suspense>
    </Canvas>
  )
}
