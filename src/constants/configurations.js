import { varValues } from 'variables'

// live palette max colors allowed to be added
export const LP_MAX_COLORS_ALLOWED = 8
export const MIN_COMPARE_COLORS_ALLOWED = 2
// default configuration object if no configuration is loaded or if the network is slow
export const DEFAULT_CONFIGURATION = {
  ga_dimension_id: 'defaultPrismWebsite',
  colorWall: {
    bloomRadius: 2
  },
  theme: {
    black: varValues.colors.black,
    danger: varValues.colors.danger,
    error: varValues.colors.error,
    grey: varValues.colors.grey,
    lightGrey: varValues.colors.lightGrey,
    nearBlack: varValues.colors.nearBlack,
    primary: varValues.colors.primary,
    secondary: varValues.colors.secondary,
    success: varValues.colors.success,
    warning: varValues.colors.warning,
    white: varValues.colors.white
  },
  searchQueryParameterName: 'q'
}
