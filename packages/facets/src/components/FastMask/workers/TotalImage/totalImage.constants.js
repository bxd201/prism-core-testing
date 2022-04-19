// @flow
export const INDIVIDUAL_COMP_ACB_THRESHHOLD: number = 0.66
export const INDIVIDUAL_COMP_RELATIVE_BRIGHTNESS_THRESHHOLD: number = 0.33
export const TGT_BRIGHTNESS: number = 0.8
export const TGT_QUINTILE: number = 0.05
export const PIXEL_REDUCTION_FACTOR: number = 8
export const COMPLEX_OP_PIXEL_REDUCTION_FACTOR: number = 8
export const MASK_ALPHA_THRESHOLD: number = 50

// minimum allowed brightness value
export const LUMINANCE_THRESHOLD_MULTIPLIER: number = 0.8
export const IS_LIGHT_MIN_VALUE: number = 190
export const HUE_NORMALIZATION_STEP: number = 12
export const HUE_NORMALIZATION_STEP_DEG: number = 360 / HUE_NORMALIZATION_STEP

export const OUTLIER_PCT: number = 0.05 // 2.5% trimmed from both ends of our sorted data, 5% total
