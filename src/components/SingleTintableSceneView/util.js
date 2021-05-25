// @flow
import type { MiniColor } from '../../shared/types/Scene'
import type { Color } from '../../shared/types/Colors'

export const isScenePolluted = (paintedSurfaces) => {
  return !!paintedSurfaces.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
}

export const copySurfaceColors = (surfaceColors: MiniColor[] | null) => {
  if (surfaceColors?.length) {
    return surfaceColors.map(color => {
      return color ? { ...color } : null
    })
  }

  return null
}

export const createMiniColorFromColor = (color: Color) => {
  const { brandKey, id, colorNumber, red, blue, green, hex, lab: { L, A, B } } = color
  return { brandKey, id, colorNumber, red, blue, green, L, A, B, hex }
}
