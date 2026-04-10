import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  colorBottom: string   // цвет низа
  colorTop:    string   // цвет верха
  stop:        number   // 0–1, до какой высоты держится нижний цвет
}

export function GradientBackground({ colorBottom, colorTop, stop }: Props) {
  const { scene } = useThree()
  const texRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width  = 2
    canvas.height = 512

    const ctx  = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, canvas.height, 0, 0)  // снизу вверх
    grad.addColorStop(0,    colorBottom)
    grad.addColorStop(stop, colorBottom)
    grad.addColorStop(1,    colorTop)

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tex = new THREE.CanvasTexture(canvas)
    texRef.current = tex
    scene.background = tex

    return () => {
      tex.dispose()
      scene.background = null
    }
  }, [scene, colorBottom, colorTop, stop])

  return null
}
