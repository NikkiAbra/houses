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
      const current = obj.morphTargetInfluences[0]
      const dist = Math.abs(target - current) // Дистанция от 1 до 0

      // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
      // Умножаем дистанцию на Пи (чтобы получить полукруг синусоиды от 0 до Пи).
      // sin(0) = 0 (Конец пути)
      // sin(Пи/2) = 1 (Середина пути - максимальный разгон)
      // sin(Пи) = 0 (Начало пути)
      const speedFactor = Math.sin(dist * Math.PI)
      
      // 1 — это минимальная скорость старта и финиша (чтобы анимация не зависла)
      // 15 — это сила рывка (ускорения) в середине. 
      const speed = 0.1 + speedFactor * 5

      obj.morphTargetInfluences[0] = THREE.MathUtils.lerp(
        current,
        target,
        Math.min(delta * speed, 1)
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
