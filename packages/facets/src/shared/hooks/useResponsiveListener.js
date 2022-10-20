// @flow
import { useEffect } from 'react'

export type SizedImages = {
  md: string,
  lg: string
}

export type ScreenSizes = {
  LARGE: string,
  MEDIUM: string
}

export const SCREEN_SIZES = {
  LARGE: 'lg',
  MEDIUM: 'md'
}

export type BreakpointObj = {
  // px units used
  md: {
    minWidth: number, // used to set breakpoint size
    sceneWidth: number, // width of the image
    sceneHeight: number // height of the image
  }
}

export function getScreenSize(breakpoints: BreakpointObj, sizes: ScreenSizes) {
  return window.visualViewport.width < breakpoints.md.minWidth ? sizes.MEDIUM : sizes.LARGE
}

export default function useResponsiveListener(breakpoints: BreakpointObj, callback: (string) => undefined): undefined {
  const { MEDIUM, LARGE } = SCREEN_SIZES
  useEffect(() => {
    if (!breakpoints) {
      return
    }
    const mqHandler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        callback(MEDIUM)
      } else {
        callback(LARGE)
      }
    }

    const mql = window.matchMedia(`(max-width: ${breakpoints.md.minWidth}px)`)
    mql.addEventListener('change', mqHandler)

    return () => mql.removeEventListener('change', mqHandler)
  }, [])
}
