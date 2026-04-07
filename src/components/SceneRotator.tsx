import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Max rotation in radians (±4°)
const MAX_ANGLE = 0.025

// Lerp speed — smaller = smoother/slower
const LERP = 0.02

// Deadzone: mouse must leave this fraction of screen width from center
// before the scene starts reacting (0.08 = 8% on each side)
const DEADZONE = 0.08

interface Props {
  children: React.ReactNode
}

export function SceneRotator({ children }: Props) {
  const groupRef   = useRef<THREE.Group>(null)
  const targetYRef = useRef(0)   // desired rotation
  const currentY   = useRef(0)   // smoothed rotation

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // normalise to [-1, 1] from left to right
      const nx = (e.clientX / window.innerWidth) * 2 - 1

      // apply deadzone: remap [-1,-dz]∪[dz,1] → [-1,1], freeze inside
      const dz = DEADZONE
      let driven = 0
      if (nx > dz)       driven = (nx - dz) / (1 - dz)
      else if (nx < -dz) driven = (nx + dz) / (1 - dz)

      targetYRef.current = driven * MAX_ANGLE
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    currentY.current += (targetYRef.current - currentY.current) * LERP
    if (groupRef.current) {
      groupRef.current.rotation.y = currentY.current
    }
  })

  return <group ref={groupRef}>{children}</group>
}
