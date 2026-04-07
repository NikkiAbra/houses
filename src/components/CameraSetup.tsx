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
// Forward dolly: fraction of distance to move closer (0.2 = 20% larger)
const DOLLY_DESKTOP = 0.20
const DOLLY_MOBILE  = 0.40

// Horizontal centering: units along camera-right to shift (+ = scene moves left)
const CENTER_DESKTOP = 0.3
const CENTER_MOBILE  = 0.0   // re-center for portrait layout

// Desktop reference: the FOV the design was made for at 16:9
const FOV_DESKTOP    = 7.7232   // vertical degrees
const ASPECT_REF     = 16 / 9   // reference aspect ratio

// Mobile breakpoint (portrait or narrow screen)
const MOBILE_BREAKPOINT = 768   // px

// ── Helpers ───────────────────────────────────────────────────────────────────
const deg = (d: number) => d * (Math.PI / 180)
const rad = (r: number) => r * (180 / Math.PI)

/**
 * Given a vertical FOV and reference aspect, compute horizontal FOV (radians).
 * Then derive the vertical FOV needed for the current aspect to preserve
 * the same horizontal coverage.
 */
function adaptFov(vertFovDeg: number, refAspect: number, currentAspect: number): number {
  const hFov = 2 * Math.atan(Math.tan(deg(vertFovDeg) / 2) * refAspect)
  return rad(2 * Math.atan(Math.tan(hFov / 2) / currentAspect))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CameraSetup() {
  const { camera } = useThree()

  // Set position and rotation once — these never change
  useLayoutEffect(() => {
    const base = new THREE.Vector3(60.036579, -0.446705, 48.072189)

    const right   = new THREE.Vector3( 0.6284,  0.0000, -0.7779)
    const forward = new THREE.Vector3(-0.7752,  0.0820, -0.6263)

    const dist = base.length()
    base.addScaledVector(forward, dist * DOLLY_DESKTOP)
    base.addScaledVector(right, CENTER_DESKTOP)

    camera.position.copy(base)

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

  // Update FOV (and centering) on resize
  useEffect(() => {
    const update = () => {
      const cam    = camera as THREE.PerspectiveCamera
      const w      = window.innerWidth
      const h      = window.innerHeight
      const aspect = w / h
      const mobile = w < MOBILE_BREAKPOINT

      // Adjust centering for mobile
      const base = new THREE.Vector3(60.036579, -0.446705, 48.072189)
      const right   = new THREE.Vector3( 0.6284,  0.0000, -0.7779)
      const forward = new THREE.Vector3(-0.7752,  0.0820, -0.6263)
      const currentDolly = mobile ? DOLLY_MOBILE : DOLLY_DESKTOP
        base.addScaledVector(forward, base.length() * currentDolly)
base.addScaledVector(right, mobile ? CENTER_MOBILE : CENTER_DESKTOP)
      camera.position.copy(base)

      // Adapt FOV to preserve horizontal scene coverage
      cam.fov = adaptFov(FOV_DESKTOP, ASPECT_REF, aspect)
      cam.updateProjectionMatrix()
    }

    update()  // run once on mount
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [camera])

  return null
}
