import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const animationStagger = () => {
  const staggerTriggers: NodeListOf<HTMLElement> = document.querySelectorAll('[data-stagger-trigger]')

  if (staggerTriggers.length) {
    gsap.registerPlugin(ScrollTrigger)
  }

  staggerTriggers.forEach(el => {
    const staggerElements = el.querySelectorAll('[data-stagger]')
    const staggerDelay = el.dataset.staggerDelay ? parseFloat(el.dataset.staggerDelay) : 0.2
    const staggerY = el.dataset.staggerY ? parseInt(el.dataset.staggerY, 10) : 20

    if (!staggerElements.length) {
      return
    }

    gsap.set(staggerElements, { opacity: 0, y: staggerY })

    gsap.to(staggerElements, {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      stagger: staggerDelay,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true
      },
      onComplete: () => {
        el.classList.add('is-completed')
      }
    })
  })
}
