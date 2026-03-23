import type Swiper from 'swiper'

export {}

declare global {
  interface Window {
    ASSETS_PATH: string
    MSInputMethodContext?: any
  }

  interface HTMLElement {
    swiperApi?: Swiper
  }
}
