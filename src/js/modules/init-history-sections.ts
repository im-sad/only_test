import Swiper from 'swiper'
import gsap from 'gsap'
import { Navigation, Pagination, EffectCreative, FreeMode } from 'swiper/modules'
import { circleShortestPath,setActiveDates, setDotsPosition, setProgress, readPeriodFields } from '@helpers/slider-helpers'
import { COUNTER_DURATION, MEDIA_BREAKPOINTS } from '@data/vars'
import { HTMLElementOrNull } from '@data/types'

export const initHistorySections = () => {
  const historySections:  NodeListOf<HTMLElement> = document.querySelectorAll('.js-history-section')

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
          const { previousIndex, activeIndex, slides } = swiper

          setActiveDates(swiper)
          setActiveDot(swiper.activeIndex)
          setProgress(swiper)

          if (previousIndex < 0 || previousIndex === activeIndex) return

          tweenPeriod(
            slides[previousIndex] as HTMLElement,
            slides[activeIndex] as HTMLElement
          )
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
          [MEDIA_BREAKPOINTS.MD]: {
            spaceBetween: 80
          }
        }
      })
    })
  }

  function tweenPeriod(prevSlide: HTMLElement, currentSlide: HTMLElement) {
    const start = readPeriodFields(prevSlide)
    const end = readPeriodFields(currentSlide)

    if (!start || !end) return

    const state = { fromYear: start.from, toYear: start.to }
    gsap.killTweensOf(state)

    end.fromEl.textContent = String(start.from)
    end.toEl.textContent = String(start.to)

    gsap.to(state, {
      fromYear: end.from,
      toYear: end.to,
      duration: COUNTER_DURATION,
      ease: 'power2.out',
      onUpdate: () => {
        end.fromEl.textContent = String(Math.round(state.fromYear))
        end.toEl.textContent = String(Math.round(state.toYear))
      }
    })
  }
}
