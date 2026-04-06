import { useRef, useState, useMemo } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Raw Blender F-Curve data ───────────────────────────────────────────────
// Shape key "Key 1", 24 fps
// KF0 → KF1 = hover-in  (value 0.9815 → 0.0,  ≈ 1.583 s)
// KF1 → KF2 = hover-out (value 0.0   → 0.9815, ≈ 1.750 s)
const FPS = 24
const KF = [
  {
    frame: 1,    value: 0.9815,
    hr: { x: 33.315, y: 0.9815 },   // handle_right
  },
  {
    frame: 39,   value: 0.0,
    hl: { x:  8.610, y: 0.0    },   // handle_left
    hr: { x: 73.251, y: 0.0    },
  },
  {
    frame: 81,   value: 0.9815,
    hl: { x: 46.866, y: 0.9815 },
  },
] as const

// Segment control points in [frame, value] space
const SEG = [
  // hover-in: KF0 → KF1
  {
    p0: [KF[0].frame, KF[0].value] as [number, number],
    p1: [KF[0].hr.x,  KF[0].hr.y]  as [number, number],
    p2: [KF[1].hl!.x, KF[1].hl!.y] as [number, number],
    p3: [KF[1].frame, KF[1].value] as [number, number],
  },
  // hover-out: KF1 → KF2
  {
    p0: [KF[1].frame, KF[1].value] as [number, number],
    p1: [KF[1].hr!.x, KF[1].hr!.y] as [number, number],
    p2: [KF[2].hl!.x, KF[2].hl!.y] as [number, number],
    p3: [KF[2].frame, KF[2].value] as [number, number],
  },
]

// ─── Bezier helpers ──────────────────────────────────────────────────────────

/** Evaluate 1-D cubic Bezier at parameter u. */
function bez(u: number, a: number, b: number, c: number, d: number): number {
  const t = 1 - u
  return t * t * t * a + 3 * t * t * u * b + 3 * t * u * u * c + u * u * u * d
}

/**
 * Given a Blender F-Curve segment and elapsed seconds since the segment
 * started, return the interpolated shape-key value.
 *
 * Algorithm:
 *   1. Convert elapsed time → absolute frame number.
 *   2. Binary-search for parameter u  (32 iterations ≈ 1e-9 frame precision).
 *   3. Evaluate B_y(u).
 */
function evalSeg(
  seg: (typeof SEG)[number],
  elapsedSec: number,
): number {
  const [p0, p1, p2, p3] = [seg.p0, seg.p1, seg.p2, seg.p3]
  const duration = (p3[0] - p0[0]) / FPS
  const t = Math.max(0, Math.min(elapsedSec, duration))
  const targetFrame = p0[0] + t * FPS

  // Binary search on u
  let lo = 0, hi = 1
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) * 0.5
    if (bez(mid, p0[0], p1[0], p2[0], p3[0]) < targetFrame) lo = mid
    else hi = mid
  }
  const u = (lo + hi) * 0.5
  return bez(u, p0[1], p1[1], p2[1], p3[1])
}

const HOVER_IN_DUR  = (SEG[0].p3[0] - SEG[0].p0[0]) / FPS  // ≈ 1.583 s
const HOVER_OUT_DUR = (SEG[1].p3[0] - SEG[1].p0[0]) / FPS  // ≈ 1.750 s

// ─── Component ───────────────────────────────────────────────────────────────

type State = 'rest' | 'hover-in' | 'at-mid' | 'hover-out'

interface Props { url: string }

export function AnimatedHouse({ url }: Props) {
  const { scene } = useGLTF(url)
  const [hovered, setHovered] = useState(false)

  const stateRef   = useRef<State>('rest')
  const elapsedRef = useRef(0)
  const insideRef  = useRef(false)   // cursor currently over mesh?

  useCursor(hovered)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetInfluences?.length) {
        obj.morphTargetInfluences[0] = KF[0].value  // resting state
      }
    })
    return clone
  }, [scene])

  // ── Apply a morph value to every mesh in the clone ──
  const setMorph = (v: number) => {
    clonedScene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetInfluences?.length) {
        obj.morphTargetInfluences[0] = v
      }
    })
  }

  // ── Pointer handlers ──
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
      // Cursor left while we were holding at keyframe 2 → play out
      stateRef.current = 'hover-out'
      elapsedRef.current = 0
    }
    // If still 'hover-in' → useFrame will start hover-out once mid is reached
  }

  // ── Per-frame update ──
  useFrame((_, delta) => {
    const state = stateRef.current
    if (state === 'rest' || state === 'at-mid') return

    elapsedRef.current += delta * (1 / 0.8) // +20% speed

    if (state === 'hover-in') {
      setMorph(evalSeg(SEG[0], elapsedRef.current))
      if (elapsedRef.current >= HOVER_IN_DUR) {
        setMorph(KF[1].value)                       // snap to frame 39
        if (insideRef.current) {
          stateRef.current = 'at-mid'               // wait for cursor leave
        } else {
          stateRef.current = 'hover-out'            // cursor already gone
          elapsedRef.current = 0
        }
      }
    } else if (state === 'hover-out') {
      setMorph(evalSeg(SEG[1], elapsedRef.current))
      if (elapsedRef.current >= HOVER_OUT_DUR) {
        setMorph(KF[2].value)                       // snap to frame 81
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
