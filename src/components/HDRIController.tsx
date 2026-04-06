import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneSettings } from '../context/SceneContext'

/** Lives inside <Canvas>. Applies SceneContext values to Three.js scene/renderer. */
export function HDRIController() {
  const { scene, gl } = useThree()
  const { intensity, exposure, rotX, rotY, rotZ, bgColor } = useSceneSettings()

  useEffect(() => {
    (scene as any).environmentIntensity = intensity
  }, [scene, intensity])

  useEffect(() => {
    gl.toneMappingExposure = exposure
  }, [gl, exposure])

  useEffect(() => {
    const r = THREE.MathUtils.degToRad
    ;(scene as any).environmentRotation?.set(r(rotX), r(rotY), r(rotZ))
  }, [scene, rotX, rotY, rotZ])

  useEffect(() => {
    scene.background = new THREE.Color(bgColor)
  }, [scene, bgColor])

  return null
}
