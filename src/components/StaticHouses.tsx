import { useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

import housesUrl from '../../house_models/static/houses_to_web.glb?url'
import texUrl    from '../../textures/static_houses/static_texture.jpg?url'

export function StaticHouses() {
  const { scene } = useGLTF(housesUrl)
  const texture   = useTexture(texUrl)

  const clonedScene = useMemo(() => {
    texture.flipY     = false
    texture.needsUpdate = true

    const mat = new THREE.MeshBasicMaterial({ map: texture })

    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = mat
      }
    })
    return clone
  }, [scene, texture])

  return <primitive object={clonedScene} />
}

useGLTF.preload(housesUrl)
