import { useLayoutEffect, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Blender camera data:
//   Location : X=60.036579  Y=-48.072189  Z=-0.446705
//   Rotation : X=94.690102  Y=0.000083   Z=51.076773  (Euler XYZ, degrees)
//   FOV vert : 7.7232°  |  Clip 0.1–2000
//
// Coordinate conversion  Blender (Z-up) → Three.js (Y-up):
//   position  : (Bx, By, Bz) → (Bx,  Bz, −By)
//   rotation  : R_three = Rx(−90°) · R_blender
//               where R_blender = Rz(51.08°) · Ry(0°) · Rx(94.69°)
//
// Resulting rotation matrix (computed analytically):
//   col0 (right)   =  ( 0.6284,  0.0000, −0.7779)
//   col1 (up)      =  ( 0.0638,  0.9966,  0.0515)
//   col2 (−forward)=  ( 0.7752, −0.0820,  0.6263)

// ── Tuning constants ──────────────────────────────────────────────────────────
const DOLLY_DESKTOP  = 0.10
const DOLLY_MOBILE   = 0.40

const CENTER_DESKTOP = 0.3
const CENTER_MOBILE  = 0.0

const FOV_DESKTOP    = 7.7232  // vertical degrees, reference for 16:9
const ASPECT_REF     = 16 / 9

const MOBILE_BREAKPOINT = 768  // px

// ── Helpers ───────────────────────────────────────────────────────────────────
const deg = (d: number) => d * (Math.PI / 180)
const rad = (r: number) => r * (180 / Math.PI)

function adaptFov(vertFovDeg: number, refAspect: number, currentAspect: number): number {
  const hFov = 2 * Math.atan(Math.tan(deg(vertFovDeg) / 2) * refAspect)
  return rad(2 * Math.atan(Math.tan(hFov / 2) / currentAspect))
}

function computePosition(mobile: boolean): THREE.Vector3 {
  const base    = new THREE.Vector3(60.036579, -0.446705, 48.072189)
  const right   = new THREE.Vector3( 0.6284,  0.0000, -0.7779)
  const forward = new THREE.Vector3(-0.7752,  0.0820, -0.6263)
  base.addScaledVector(forward, base.length() * (mobile ? DOLLY_MOBILE : DOLLY_DESKTOP))
  base.addScaledVector(right, mobile ? CENTER_MOBILE : CENTER_DESKTOP)
  return base
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CameraSetup() {
  const { camera } = useThree()

  // Rotation and clip planes — set once, never change
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    // prettier-ignore
    m.set(
       0.6284,  0.0638,  0.7752, 0,
       0.0000,  0.9966, -0.0820, 0,
      -0.7779,  0.0515,  0.6263, 0,
       0,       0,       0,      1
    )
    camera.quaternion.setFromRotationMatrix(m)

    const cam = camera as THREE.PerspectiveCamera
    cam.near = 0.1
    cam.far  = 2000
  }, [camera])

  // Position + FOV — update on every resize
  useEffect(() => {
    const update = () => {
      const cam    = camera as THREE.PerspectiveCamera
      const w      = window.innerWidth
      const h      = window.innerHeight
      const mobile = w < MOBILE_BREAKPOINT

      camera.position.copy(computePosition(mobile))
      cam.fov = adaptFov(FOV_DESKTOP, ASPECT_REF, w / h)
      cam.updateProjectionMatrix()
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [camera])

  return null
}
