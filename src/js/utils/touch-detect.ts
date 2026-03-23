const hasTouch = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  )
}

const touchDetect = () => {
  document.documentElement.classList.add(hasTouch() ? 'has-touch' : 'no-touch')
}

export { touchDetect, hasTouch }
