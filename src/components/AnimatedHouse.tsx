import { useRef, useState, useEffect } from 'react'
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
    scene.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh &&
        obj.morphTargetInfluences &&
        obj.morphTargetInfluences.length > 0
      ) {
        obj.morphTargetInfluences[0] = THREE.MathUtils.lerp(
          obj.morphTargetInfluences[0] ?? 0,
          target,
          // smooth step — faster going in, same speed going out
          delta * 5
        )
      }
    })
  })

  return (
    <primitive
      object={scene}
      onPointerOver={onOver}
      onPointerOut={onOut}
    />
  )
}
