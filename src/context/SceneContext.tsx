import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface SceneSettings {
  intensity:  number   // scene.environmentIntensity
  exposure:   number   // gl.toneMappingExposure
  rotX:       number   // degrees
  rotY:       number
  rotZ:       number
  bgColor:    string   // hex
}

interface SceneCtx extends SceneSettings {
  set: (patch: Partial<SceneSettings>) => void
}

export const DEFAULTS: SceneSettings = {
  intensity: 1,
  exposure:  1.2,
  rotX:      0,
  rotY:      0,
  rotZ:      0,
  bgColor:   '#f0ede8',
}

const Ctx = createContext<SceneCtx>({ ...DEFAULTS, set: () => {} })

export function SceneProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<SceneSettings>(DEFAULTS)
  const set = (patch: Partial<SceneSettings>) =>
    setS(prev => ({ ...prev, ...patch }))
  return <Ctx.Provider value={{ ...s, set }}>{children}</Ctx.Provider>
}

export const useSceneSettings = () => useContext(Ctx)
