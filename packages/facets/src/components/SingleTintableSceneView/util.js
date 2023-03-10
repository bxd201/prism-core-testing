// @flow
import type { Color } from '../../shared/types/Colors'
import type { MiniColor } from '../../shared/types/Scene'

export const isScenePolluted = (paintedSurfaces) => {
  return !!paintedSurfaces.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
}

export const copySurfaceColors = (surfaceColors: MiniColor[] | null) => {
  if (surfaceColors?.length) {
    return surfaceColors.map((color) => {
      return color ? { ...color } : null
    })
  }

  return null
}

export const createMiniColorFromColor = (color: Color) => {
  if (!color) {
    return null
  }
  const {
    brandKey,
    id,
    colorNumber,
    red,
    blue,
    green,
    hex,
    lab: { L, A, B },
    isExterior
  } = color
  return { brandKey, id, colorNumber, red, blue, green, L, A, B, hex, isExterior }
}
