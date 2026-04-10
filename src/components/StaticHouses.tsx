import { useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

import glassLeftUrl  from '../../house_models/static/static_glass/glass_house_left.glb?url'
import glassRightUrl from '../../house_models/static/static_glass/glass_house_right.glb?url'
import plasticUrl    from '../../house_models/static/static_plastic/plastic_houses.glb?url'

import texGlassLeftUrl  from '../../textures/static_houses/glass/projected_diff_left.jpg?url'
import texGlassRightUrl from '../../textures/static_houses/glass/projected_diff_right.jpg?url'
import texPlasticUrl    from '../../textures/static_houses/plastic/plastic_houses_diff.jpg?url'

useGLTF.preload(glassLeftUrl)
useGLTF.preload(glassRightUrl)
useGLTF.preload(plasticUrl)

function StaticMesh({ url, texUrl }: { url: string; texUrl: string }) {
  const { scene } = useGLTF(url)
  const texture   = useTexture(texUrl)

  const clonedScene = useMemo(() => {
    texture.flipY      = false
    texture.needsUpdate = true

    const mat   = new THREE.MeshBasicMaterial({ map: texture })
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.material = mat
    })
    return clone
  }, [scene, texture])

  return <primitive object={clonedScene} />
}

export function StaticHouses() {
  return (
    <>
      <StaticMesh url={glassLeftUrl}  texUrl={texGlassLeftUrl}  />
      <StaticMesh url={glassRightUrl} texUrl={texGlassRightUrl} />
      <StaticMesh url={plasticUrl}    texUrl={texPlasticUrl}    />
    </>
  )
}
