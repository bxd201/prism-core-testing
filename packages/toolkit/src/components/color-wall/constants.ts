export const MAX_SWATCH_SIZE = 50
export const BASE_SWATCH_SIZE = 15
export const OUTER_SPACING = 20
export const MIN_SCROLLER_HEIGHT = 200
export const MAX_SCROLLER_HEIGHT = MIN_SCROLLER_HEIGHT * 3

export const MIN_BASE_SIZE = 14
export const MAX_BASE_SIZE = 45
export const ZOOMED_BASE_SIZE = 50
export const ACTIVE_SWATCH_SIZE = 150
const BLOOMED_SWATCH_MIN_SIZE = 70
export const BLOOMED_SWATCH_SIZES = new Array(4).fill(null).map((v, i, arr) => {
  return BLOOMED_SWATCH_MIN_SIZE + ((ACTIVE_SWATCH_SIZE - BLOOMED_SWATCH_MIN_SIZE) / arr.length) * (arr.length - 1 - i)
})

export const SWATCH_WIDTH_WRAP_THRESHOLD = 20 // will prefer wrapped view if unwrapped view target swatch size falls below threshold value

export const TITLE_SIZE_RATIOS = {
  1: 0.4, // l1 should be styled regular weight
  2: 0.4, // l2 should be styled bold weight
  3: 0.5 // l3 should be styled bold weight, and is larger than l1 and l2
}

export const TITLE_SIZE_MIN = 12
export const TITLE_SIZE_MAX = 16
