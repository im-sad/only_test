import Swiper from 'swiper'
import { Navigation, Pagination, EffectCreative, FreeMode } from 'swiper/modules'
import { circleShortestPath, parseYearText, setActiveDates, setDotsPosition, setProgress } from '@helpers/slider-helpers'
import gsap from 'gsap'

type HTMLElementOrNull = HTMLElement | null
export const initCarousels = () => {
  const historySections:  NodeListOf<HTMLElement> = document.querySelectorAll('.js-history-section:not(.is-init)')

  historySections.forEach((section) => {
    const periodBlock: HTMLElement | null = section.querySelector('[data-slider="period"]')
    const circleBlock: HTMLElement | null = section.querySelector('[data-slider="circle"]')
    const datesBlock: HTMLElement | null = section.querySelector('[data-slider="dates"]')

    initPeriod(periodBlock, circleBlock)
    initDates(datesBlock)
  })

  // Inits
  function initPeriod(period: HTMLElement | null, circle: HTMLElement | null) {
    if (!period || !circle) return

    const circleDots: NodeListOf<HTMLElement> = circle.querySelectorAll('[data-slider="dot"]')
    const dotCount = circleDots.length
    let circleRotationDeg = 0

    const setActiveDot = (index: number) => {
      const baseTargetDeg = (-360 * index) / dotCount
      const angleDeg = circleShortestPath(circleRotationDeg, baseTargetDeg)

      circleRotationDeg = angleDeg
      circle.style.setProperty('--angel', `${angleDeg}deg`)

      circleDots.forEach((dot: HTMLElement) => dot.classList.remove('is-active'))
      circleDots[index].classList.add('is-active')
    }

    const periodSwiper = new Swiper(period, {
      modules: [Navigation, Pagination, EffectCreative],
      allowTouchMove: false,
      effect: 'creative',
      grabCursor: false,
      slidesPerView: 1,
      navigation: {
        prevEl: period.closest('.js-history-section')?.querySelector('[data-swiper-prev="period"]') as HTMLElementOrNull,
        nextEl: period.closest('.js-history-section')?.querySelector('[data-swiper-next="period"]') as HTMLElementOrNull,
        disabledClass: 'is-disabled'
      },
      pagination: {
        el: period.closest('.js-history-section')?.querySelector('.swiper-pagination') as HTMLElementOrNull,
        bulletActiveClass: 'is-active',
        clickable: true,
        renderBullet: (index: number, className: string) =>
        `<button type="button" class="dot-pagintation ${className}" aria-label="Переключить на ${index + 1}">
          ${index + 1}
        </button>`
      },
      creativeEffect: {
        prev: {
          opacity: 0
        },
        next: {
          opacity: 0
        }
      },
      on: {
        init: (swiper: Swiper) => {
          setActiveDates(swiper)
          setDotsPosition(circleDots, 30)
          setProgress(swiper)
        },
        slideChange: (swiper: Swiper) => {
          setActiveDates(swiper)
          setActiveDot(swiper.activeIndex)
          setProgress(swiper)

          const counterState = { fromYear: 0, toYear: 0 }
          const prevIndex = swiper.previousIndex
          const activeIndex = swiper.activeIndex
          if (prevIndex < 0 || prevIndex === activeIndex) return

          const prevSlide = swiper.slides[prevIndex] as HTMLElement
          const currentSlide = swiper.slides[activeIndex] as HTMLElement
          const fromEl = currentSlide.querySelector('[data-slider="from"]')
          const toEl = currentSlide.querySelector('[data-slider="to"]')
          const prevFromEl = prevSlide.querySelector('[data-slider="from"]')
          const prevToEl = prevSlide.querySelector('[data-slider="to"]')

          const endFrom = parseYearText(fromEl)
          const endTo = parseYearText(toEl)
          const startFrom = parseYearText(prevFromEl)
          const startTo = parseYearText(prevToEl)

          if (
            endFrom === null ||
            endTo === null ||
            startFrom === null ||
            startTo === null ||
            !fromEl ||
            !toEl
          ) {
            return
          }

          gsap.killTweensOf(counterState)
          counterState.fromYear = startFrom
          counterState.toYear = startTo
          fromEl.textContent = String(startFrom)
          toEl.textContent = String(startTo)

          gsap.to(counterState, {
            fromYear: endFrom,
            toYear: endTo,
            duration: 0.85,
            ease: 'power2.out',
            onUpdate: () => {
              fromEl.textContent = String(Math.round(counterState.fromYear))
              toEl.textContent = String(Math.round(counterState.toYear))
            }
          })
        }
      }
    })

    circleDots.forEach((dot: HTMLElement, index: number) => {
      dot.addEventListener('click', () => periodSwiper.slideTo(index))
    })
  }

  function initDates(block: HTMLElement | null) {
    if (!block) return

    const datesSliders: NodeListOf<HTMLElement> = block.querySelectorAll('[data-timeline]')

    datesSliders.forEach((slider: HTMLElement) => {
      new Swiper(slider, {
        modules: [Navigation, FreeMode],
        allowTouchMove: true,
        grabCursor: true,
        slidesPerView: 'auto',
        freeMode: true,
        spaceBetween: 25,
        navigation: {
          prevEl: slider.parentElement?.querySelector('[data-swiper-prev="timeline"]') as HTMLElementOrNull,
          nextEl: slider.parentElement?.querySelector('[data-swiper-next="timeline"]') as HTMLElementOrNull,
          disabledClass: 'is-disabled'
        },
        observer: true,
        observeParents: true,
        breakpoints: {
          768: {
            spaceBetween: 80
          }
        }
      })
    })
  }
}
