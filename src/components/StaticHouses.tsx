import { useGLTF } from '@react-three/drei'
import housesUrl from '../../house_models/static/houses_to_web.glb?url'

export function StaticHouses() {
  const { scene } = useGLTF(housesUrl)
  return <primitive object={scene} />
}

useGLTF.preload(housesUrl)
