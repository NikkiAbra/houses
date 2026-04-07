import { useState, useEffect } from 'react'

interface Props {
  visible: boolean      // true = opaque, false = fade out
  color?: string
  duration?: number     // ms
}

export function FadeOverlay({
  visible,
  color    = '#f0ede8',
  duration = 1200,
}: Props) {
  // keep in DOM until fade finishes, then unmount
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    if (!visible) {
      const id = setTimeout(() => setMounted(false), duration)
      return () => clearTimeout(id)
    }
  }, [visible, duration])

  if (!mounted) return null

  return (
    <div
      style={{
        position:   'fixed',
        inset:       0,
        background:  color,
        opacity:     visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        pointerEvents: 'none',
        zIndex:      999,
      }}
    />
  )
}
