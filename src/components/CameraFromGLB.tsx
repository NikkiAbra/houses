import { useLayoutEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  url: string
}

export function CameraFromGLB({ url }: Props) {
  const gltf = useGLTF(url)
  const { camera } = useThree()

  useLayoutEffect(() => {
    const cameras = (gltf as unknown as { cameras: THREE.Camera[] }).cameras
    if (!cameras?.length) return

    const src = cameras[0]
    src.updateWorldMatrix(true, false)

    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    src.getWorldPosition(pos)
    src.getWorldQuaternion(quat)

    camera.position.copy(pos)
    camera.quaternion.copy(quat)

    if (src instanceof THREE.PerspectiveCamera) {
      const cam = camera as THREE.PerspectiveCamera
      cam.fov = src.fov
      cam.near = src.near
      cam.far = src.far
      cam.updateProjectionMatrix()
    }
  }, [gltf, camera])

  return null
}
