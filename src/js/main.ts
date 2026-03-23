import { iosFixes } from '@utils/ios-fixes'
import { initCarousels } from '@modules/init-carousels'
import { initAnimations } from '@modules/init-animations'

document.addEventListener('DOMContentLoaded', () => {
  iosFixes()
  initAnimations()
  initCarousels()
})
