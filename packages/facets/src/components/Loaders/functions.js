// @flow
import tinycolor, { type tinycolor as TinyColor } from '@ctrl/tinycolor'
import sortBy from 'lodash/sortBy'
import memoizee from 'memoizee'
import {
  DEFAULT_COLORS,
  GENERATED_COLOR_BRIGHTNESS_STEP,
  GENERATED_COLOR_EDGE_PCT,
  NUM_COLORS,
  NUM_DARKS,
  NUM_LIGHTS
} from './constants'

export const isTooBright = memoizee((brightness: number): boolean => {
  const pct = brightness / 255
  return pct > (1 - GENERATED_COLOR_EDGE_PCT)
}, { primitive: true, length: 1 })
export const isTooDark = memoizee((brightness: number): boolean => {
  const pct = brightness / 255
  return pct < GENERATED_COLOR_EDGE_PCT
}, { primitive: true, length: 1 })
export const countDarks = (colors: TinyColor[]): number => {
  return colors.map(c => c.isDark()).filter(c => c).length
}
export const countLights = (colors: TinyColor[]): number => {
  return colors.length - countDarks(colors)
}

export const getColors = memoizee((color?: string, step: number = GENERATED_COLOR_BRIGHTNESS_STEP): string[] => {
  let colors = []

  if (color) {
    const tc = tinycolor(color)

    let tcs = [tc]

    while (countLights(tcs) < NUM_LIGHTS) {
      const thisTc = tcs[0].clone().brighten(step)

      if (isTooBright(thisTc.getBrightness())) {
        break
      }

      tcs.unshift(thisTc)
    }

    tcs.reverse()

    while (countDarks(tcs) < NUM_DARKS) {
      const thisTc = tcs[0].clone().brighten(-step)

      if (isTooDark(thisTc.getBrightness())) {
        break
      }

      tcs.unshift(thisTc)
    }

    tcs = sortBy(tcs, c => c.getBrightness())

    for (let i = tcs.length - NUM_COLORS; i >= 0; i--) {
      const cols = tcs.slice(i, i + NUM_COLORS)

      if (countDarks(cols) === NUM_DARKS) {
        colors = cols.map(c => c.toHexString())
        break
      }
    }
  }

  if (!colors.length) {
    colors = DEFAULT_COLORS
  }

  return colors
}, { primitive: true, length: 1 })
