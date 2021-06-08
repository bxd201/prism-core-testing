// @flow
import kebabCase from 'lodash/kebabCase'

export const getFilterId = (sceneId: string, surfaceId: string | number, suffix?: string) => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`)
}

export const getMaskId = (sceneId: string, surfaceId: string | number, suffix?: string) => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`)
}
