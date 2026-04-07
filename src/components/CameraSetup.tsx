import { useLayoutEffect } from 'react'
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
const DOLLY = 0.20
// Horizontal centering: units along camera-right to shift (+ = scene moves left)
const CENTER = 0.3

export function CameraSetup() {
  const { camera } = useThree()

  useLayoutEffect(() => {
    // Base Blender position (converted to Three.js coords)
    const base = new THREE.Vector3(60.036579, -0.446705, 48.072189)

    // Camera axes from rotation matrix columns:
    //   right   = col0 = ( 0.6284,  0.0000, −0.7779)
    //   forward = −col2 = (−0.7752,  0.0820, −0.6263)
    const right   = new THREE.Vector3( 0.6284,  0.0000, -0.7779)
    const forward = new THREE.Vector3(-0.7752,  0.0820, -0.6263)

    // Dolly: move forward by DOLLY fraction of current distance
    const dist = base.length()                          // distance to scene origin
    base.addScaledVector(forward, dist * DOLLY)

    // Centering: shift along camera right
    base.addScaledVector(right, CENTER)

    camera.position.copy(base)

    // Rotation — set from the analytically derived matrix
    const m = new THREE.Matrix4()
    // prettier-ignore
    m.set(
       0.6284,  0.0638,  0.7752, 0,
       0.0000,  0.9966, -0.0820, 0,
      -0.7779,  0.0515,  0.6263, 0,
       0,       0,       0,      1
    )
    camera.quaternion.setFromRotationMatrix(m)

    // FOV & clip planes
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = 7.7232
    cam.near = 0.1
    cam.far = 2000
    cam.updateProjectionMatrix()
  }, [camera])

  return null
}
