// @flow
// the 5 colors used by loaders in their default state; taken from SW CVW circa 2019
export const DEFAULT_COLORS = [
  '#00b9e4',
  '#69be28',
  '#ffb612',
  '#e17000',
  '#b71234'
]
// how many colors there are (this is sort of magic, so don't touch it)
export const NUM_COLORS = DEFAULT_COLORS.length
// how many generated colors are allowed to be dark
export const NUM_DARKS = Math.floor(NUM_COLORS / 2)
// how many generated colors should be light
export const NUM_LIGHTS = NUM_COLORS - NUM_DARKS
// default brightness step between generated colors
export const GENERATED_COLOR_BRIGHTNESS_STEP = 10
// % of brightness spectrum edges considered to be too dark or too light
export const GENERATED_COLOR_EDGE_PCT = 0.1
