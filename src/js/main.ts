import { iosFixes } from '@utils/ios-fixes'
import { initAnimations } from '@modules/init-animations'
import { initHistorySections } from '@modules/init-history-sections'

document.addEventListener('DOMContentLoaded', () => {
  iosFixes()
  initAnimations()
  initHistorySections()
})
