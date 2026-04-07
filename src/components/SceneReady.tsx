import { useEffect } from 'react'

interface Props {
  onReady: () => void
}

/**
 * Invisible sentinel placed inside <Suspense>.
 * Mounts only after all suspended children resolve → signals the scene is ready.
 */
export function SceneReady({ onReady }: Props) {
  useEffect(() => {
    onReady()
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
