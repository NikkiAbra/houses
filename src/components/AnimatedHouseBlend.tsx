import { useRef, useState, useMemo } from 'react'
import { useGLTF, useCursor, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { BlendMaterial } from '../materials/BlendMaterial'
import type { BlendMaterialInstance } from '../materials/BlendMaterial'

// ─── Raw Blender F-Curve data ─────────────────────────────────────────────────
const FPS = 24
const KF = [
  {
    frame: 1,    value: 0.9815,
    hr: { x: 33.315, y: 0.9815 },
  },
  {
    frame: 39,   value: 0.0,
    hl: { x:  8.610, y: 0.0    },
    hr: { x: 73.251, y: 0.0    },
  },
  {
    frame: 81,   value: 0.9815,
    hl: { x: 46.866, y: 0.9815 },
  },
] as const

const SEG = [
  {
    p0: [KF[0].frame, KF[0].value] as [number, number],
    p1: [KF[0].hr.x,  KF[0].hr.y]  as [number, number],
    p2: [KF[1].hl!.x, KF[1].hl!.y] as [number, number],
    p3: [KF[1].frame, KF[1].value] as [number, number],
  },
  {
    p0: [KF[1].frame, KF[1].value] as [number, number],
    p1: [KF[1].hr!.x, KF[1].hr!.y] as [number, number],
    p2: [KF[2].hl!.x, KF[2].hl!.y] as [number, number],
    p3: [KF[2].frame, KF[2].value] as [number, number],
  },
]

function bez(u: number, a: number, b: number, c: number, d: number): number {
  const t = 1 - u
  return t * t * t * a + 3 * t * t * u * b + 3 * t * u * u * c + u * u * u * d
}

function evalSeg(seg: (typeof SEG)[number], elapsedSec: number): number {
  const [p0, p1, p2, p3] = [seg.p0, seg.p1, seg.p2, seg.p3]
  const duration = (p3[0] - p0[0]) / FPS
  const t = Math.max(0, Math.min(elapsedSec, duration))
  const targetFrame = p0[0] + t * FPS

  let lo = 0, hi = 1
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) * 0.5
    if (bez(mid, p0[0], p1[0], p2[0], p3[0]) < targetFrame) lo = mid
    else hi = mid
  }
  return bez((lo + hi) * 0.5, p0[1], p1[1], p2[1], p3[1])
}

const HOVER_IN_DUR  = (SEG[0].p3[0] - SEG[0].p0[0]) / FPS
const HOVER_OUT_DUR = (SEG[1].p3[0] - SEG[1].p0[0]) / FPS

// ─── Component ────────────────────────────────────────────────────────────────

type State = 'rest' | 'hover-in' | 'at-mid' | 'hover-out'

interface Props {
  url:          string   // GLB path
  meshName:     string   // name of the mesh to receive the blend material
  texBaseUrl:   string   // texture at rest  (white / baked-off)
  texTargetUrl: string   // texture at hover (baked-on)
}

export function AnimatedHouseBlend({ url, meshName, texBaseUrl, texTargetUrl }: Props) {
  const { scene } = useGLTF(url)
  const [texBase, texTarget] = useTexture([texBaseUrl, texTargetUrl])

  const [hovered, setHovered] = useState(false)
  const stateRef   = useRef<State>('rest')
  const elapsedRef = useRef(0)
  const insideRef  = useRef(false)

  useCursor(hovered)

  const { clonedScene, blendMat } = useMemo(() => {
    // GLTF uses OpenGL UV convention — no Y-flip
    texBase.flipY   = false; texBase.needsUpdate   = true
    texTarget.flipY = false; texTarget.needsUpdate = true

    const mat = new BlendMaterial() as BlendMaterialInstance
    mat.uTexBase    = texBase
    mat.uTexTarget  = texTarget
    mat.uMix        = 0
    mat.morphTargets = true

    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetInfluences?.length) {
        obj.morphTargetInfluences[0] = KF[0].value   // resting state

        if (obj.name === meshName) {
          obj.material = mat
        }
      }
    })

    return { clonedScene: clone, blendMat: mat }
  }, [scene, texBase, texTarget, meshName])

  // morph 0.9815 = rest  → uMix = 0 (base / white)
  // morph 0.0    = hover → uMix = 1 (target / windows)
  const setMorph = (v: number) => {
    clonedScene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetInfluences?.length) {
        obj.morphTargetInfluences[0] = v
      }
    })
    blendMat.uMix = 1 - v / KF[0].value
  }

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    insideRef.current = true
    setHovered(true)
    if (stateRef.current === 'rest') {
      stateRef.current = 'hover-in'
      elapsedRef.current = 0
    }
  }

  const onOut = () => {
    insideRef.current = false
    setHovered(false)
    if (stateRef.current === 'at-mid') {
      stateRef.current = 'hover-out'
      elapsedRef.current = 0
    }
  }

  useFrame((_, delta) => {
    const state = stateRef.current
    if (state === 'rest' || state === 'at-mid') return

    elapsedRef.current += delta * (1 / 0.8)  // +20% speed

    if (state === 'hover-in') {
      setMorph(evalSeg(SEG[0], elapsedRef.current))
      if (elapsedRef.current >= HOVER_IN_DUR) {
        setMorph(KF[1].value)
        if (insideRef.current) {
          stateRef.current = 'at-mid'
        } else {
          stateRef.current = 'hover-out'
          elapsedRef.current = 0
        }
      }
    } else if (state === 'hover-out') {
      setMorph(evalSeg(SEG[1], elapsedRef.current))
      if (elapsedRef.current >= HOVER_OUT_DUR) {
        setMorph(KF[2].value)
        stateRef.current = 'rest'
        elapsedRef.current = 0
      }
    }
  })

  return (
    <primitive
      object={clonedScene}
      onPointerOver={onOver}
      onPointerOut={onOut}
    />
  )
}
