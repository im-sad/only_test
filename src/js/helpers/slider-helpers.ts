import Swiper from 'swiper'
import { addLeadingZero } from '@helpers/string-helpers'

const circleShortestPath = (currentDeg: number, baseTargetDeg: number): number => {
  return baseTargetDeg + 360 * Math.round((currentDeg - baseTargetDeg) / 360)
}

const parseYearText = (el: Element | null): number | null => {
  return el ? parseInt(el.textContent?.replace(/\s/g, ''), 10) : null
}

const setDotsPosition = (points: NodeListOf<HTMLElement>, deg: number = 0) => {
  const startRadius = (deg - 90) * (Math.PI / 180)

  points.forEach((point: HTMLElement, i: number) => {
    const angle = (2 * Math.PI * i) / points.length + startRadius

    point.style.left = `${50 + 50 * Math.cos(angle)}%`
    point.style.top  = `${50 + 50 * Math.sin(angle)}%`
  })
}

const setProgress = (swiper: Swiper): void => {
  if (!swiper?.el) return

  const parent = swiper.el.closest('.js-history-section')
  const progressEl = parent?.querySelector('[data-slider="progress"]')
  const current = swiper.activeIndex

  if (progressEl) {
    progressEl.textContent = (`${addLeadingZero(current + 1)}/${addLeadingZero(swiper.slides.length)}`)
  }
}

const setActiveDates = (swiper: Swiper): void => {
  if (!swiper?.el) return

  const section = swiper.el.closest('.js-history-section')
  const datesRoot = section?.querySelector<HTMLElement>('[data-slider="dates"]')

  if (!datesRoot) return

  const blocks = datesRoot.children
  const index = swiper.activeIndex

  if (index < 0 || index >= blocks.length) return

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].classList.toggle('is-active', i === index)
  }
}

export {
  circleShortestPath,
  parseYearText,
  setActiveDates,
  setDotsPosition,
  setProgress
}
