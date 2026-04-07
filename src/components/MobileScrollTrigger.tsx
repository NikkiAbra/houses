import { useEffect, useRef } from 'react'
import { emitScrollDown, emitScrollUp } from '../utils/mobileScrollBus'

const MOBILE_BREAKPOINT = 768  // px
const SWIPE_THRESHOLD   = 30   // px — минимальный свайп для срабатывания

export function MobileScrollTrigger() {
  // Текущее состояние: false = rest, true = scrolled-down
  const isDown   = useRef(false)
  const startY   = useRef(0)

  useEffect(() => {
    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT

    const onTouchStart = (e: TouchEvent) => {
      if (!isMobile()) return
      startY.current = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isMobile()) return
      const deltaY = startY.current - e.touches[0].clientY  // + = свайп вниз

      if (deltaY > SWIPE_THRESHOLD && !isDown.current) {
        isDown.current = true
        emitScrollDown()
        startY.current = e.touches[0].clientY  // сброс, чтобы не дублировать
      } else if (deltaY < -SWIPE_THRESHOLD && isDown.current) {
        isDown.current = false
        emitScrollUp()
        startY.current = e.touches[0].clientY
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
    }
  }, [])

  return null
}
