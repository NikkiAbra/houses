import { useState, useEffect } from 'react'

interface Props {
  visible: boolean   // false = начинаем fade-out
  duration?: number  // ms — должно совпадать с FadeOverlay duration
}

export function LoadingIcon({ visible, duration = 1200 }: Props) {
  const [mounted, setMounted] = useState(true)
  const [opacity, setOpacity] = useState(0)

  // Fade in сразу после маунта
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpacity(1))
    return () => cancelAnimationFrame(id)
  }, [])

  // Fade out когда visible становится false, затем размонтировать
  useEffect(() => {
    if (!visible) {
      setOpacity(0)
      const id = setTimeout(() => setMounted(false), duration)
      return () => clearTimeout(id)
    }
  }, [visible, duration])

  if (!mounted) return null

  return (
    <div
      style={{
        position:       'fixed',
        inset:           0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:          1000,       // поверх FadeOverlay
        pointerEvents:  'none',
        opacity,
        transition:     `opacity ${duration}ms ease`,
      }}
    >
      <img
        src="/favicon.svg"
        alt=""
        style={{
          width:            64,
          height:           64,
          animation:        'bounce 0.9s infinite',
        }}
      />
    </div>
  )
}
