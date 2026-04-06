import { useRef, useState, useMemo } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  url: string
}

export function AnimatedHouse({ url }: Props) {
  const { scene } = useGLTF(url)
  const [hovered, setHovered] = useState(false)
  const hoveredRef = useRef(false)

  useCursor(hovered)

  // Clone so each instance owns its own Three.js object tree (avoids
  // StrictMode / GLTF-cache "already attached" errors) and set the
  // default resting state (morph = 1) immediately before first render.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh &&
        obj.morphTargetInfluences &&
        obj.morphTargetInfluences.length > 0
      ) {
        obj.morphTargetInfluences[0] = 1
      }
    })
    return clone
  }, [scene])

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hoveredRef.current = true
    setHovered(true)
  }

  const onOut = () => {
    hoveredRef.current = false
    setHovered(false)
  }

  useFrame((_, delta) => {
    const target = hoveredRef.current ? 0 : 1
    clonedScene.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh &&
        obj.morphTargetInfluences &&
        obj.morphTargetInfluences.length > 0
      ) {
        obj.morphTargetInfluences[0] = THREE.MathUtils.lerp(
          obj.morphTargetInfluences[0],
          target,
          delta * 5
        )
      }
    })
  })

  return (
    <primitive
      object={clonedScene}
      onPointerOver={onOver}
      onPointerOut={onOut}
    />
  )
}
