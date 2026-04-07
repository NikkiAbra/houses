// Лёгкая шина событий для мобильного скролла.
// Использует window CustomEvent — не нужны контексты и пропсы.

export const SCROLL_DOWN = 'mobile:scroll-down'
export const SCROLL_UP   = 'mobile:scroll-up'

export const emitScrollDown = () => window.dispatchEvent(new CustomEvent(SCROLL_DOWN))
export const emitScrollUp   = () => window.dispatchEvent(new CustomEvent(SCROLL_UP))

export const onScrollDown = (fn: () => void) => {
  window.addEventListener(SCROLL_DOWN, fn)
  return () => window.removeEventListener(SCROLL_DOWN, fn)
}

export const onScrollUp = (fn: () => void) => {
  window.addEventListener(SCROLL_UP, fn)
  return () => window.removeEventListener(SCROLL_UP, fn)
}
