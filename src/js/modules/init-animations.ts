import { isIPhone12OrOlder } from '@utils/ios-checker'

export const initAnimations = () => {
  if (isIPhone12OrOlder()) {
    document.documentElement.classList.add('no-animations')
    return
  }

  document.documentElement.classList.add('is-ready')
}
