// @flow
import type { MiniColor } from '../../shared/types/Scene'

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
