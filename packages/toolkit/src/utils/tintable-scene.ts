import kebabCase from 'lodash/kebabCase'

export const getFilterId = (sceneId: string, surfaceId: string | number, suffix?: string): string => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`)
}

export const getMaskId = (sceneId: string, surfaceId: string | number, suffix?: string): string => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`)
}

export const ERROR_NOT_STRING = 'Input must be a string'

export function getBeforeHash (input: string): string {
  if (typeof input !== 'string') throw new TypeError(ERROR_NOT_STRING)

  if (input.includes('#')) {
    return input.split('#')[0]
  }

  return input
}
