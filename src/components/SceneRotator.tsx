import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MAX_ANGLE = 0.025
const DEADZONE  = 0.08
const LERP      = 0.02

interface Props {
  children: React.ReactNode
}

export function SceneRotator({ children }: Props) {
  const groupRef  = useRef<THREE.Group>(null)
  const targetY   = useRef(0)
  const currentY  = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const dz = DEADZONE
      let driven = 0
      if (nx > dz)       driven = (nx - dz) / (1 - dz)
      else if (nx < -dz) driven = (nx + dz) / (1 - dz)
      targetY.current = driven * MAX_ANGLE
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    currentY.current += (targetY.current - currentY.current) * LERP
    if (groupRef.current) {
      groupRef.current.rotation.y = currentY.current
    }
  })

  return <group ref={groupRef}>{children}</group>
}
