import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { CameraSetup } from './CameraSetup'
import { StaticHouses } from './StaticHouses'
import { AnimatedHouseBlend } from './AnimatedHouseBlend'
import { SceneRotator } from './SceneRotator'

import block06Url from '../../house_models/animated/block06.glb?url'
import block07Url from '../../house_models/animated/block07.glb?url'
import block08Url from '../../house_models/animated/block08.glb?url'
import hdrUrl     from '../../light/autumn_field_puresky_1k.hdr?url'

import tex06White   from '../../textures/house_06/06_white.jpg?url'
import tex06Windows from '../../textures/house_06/06_windows.jpg?url'
import tex07White   from '../../textures/house_07/07_white.jpg?url'
import tex07Windows from '../../textures/house_07/07_windows.jpg?url'
import tex08White   from '../../textures/house_08/white_08.jpg?url'
import tex08Windows from '../../textures/house_08/windows_08.jpg?url'

useGLTF.preload(block06Url)
useGLTF.preload(block07Url)
useGLTF.preload(block08Url)

export function Scene() {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#f0ede8']} />
        <Environment files={hdrUrl} background={false} />
        <CameraSetup />
        <SceneRotator>
          <StaticHouses />

          <AnimatedHouseBlend
            url={block06Url}
            meshName="house_06"
            texBaseUrl={tex06White}
            texTargetUrl={tex06Windows}
          />

          <AnimatedHouseBlend
            url={block07Url}
            meshName="house_07"
            texBaseUrl={tex07White}
            texTargetUrl={tex07Windows}
          />

          <AnimatedHouseBlend
            url={block08Url}
            meshName="house_08"
            texBaseUrl={tex08White}
            texTargetUrl={tex08Windows}
          />
        </SceneRotator>
      </Suspense>
    </Canvas>
  )
}
