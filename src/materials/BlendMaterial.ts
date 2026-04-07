import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  #include <morphtarget_pars_vertex>

  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 transformed = vec3(position);
    #include <morphtarget_vertex>

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexBase;
  uniform sampler2D uTexTarget;
  uniform float uMix;

  varying vec2 vUv;

  void main() {
    vec4 col1 = texture2D(uTexBase,   vUv);
    vec4 col2 = texture2D(uTexTarget, vUv);
    gl_FragColor = mix(col1, col2, uMix);
    #include <colorspace_fragment>
  }
`

export const BlendMaterial = shaderMaterial(
  {
    uTexBase:   new THREE.Texture(),
    uTexTarget: new THREE.Texture(),
    uMix:       0,
  },
  vertexShader,
  fragmentShader,
)

/** Convenience type for typed instances. */
export type BlendMaterialInstance = THREE.ShaderMaterial & {
  uTexBase:     THREE.Texture
  uTexTarget:   THREE.Texture
  uMix:         number
  morphTargets: boolean
}
