import kebabCase from 'lodash/kebabCase'
import uniqueId from 'lodash/uniqueId'
import { Color, MiniColor } from '../types'

export const getFilterId = (sceneId: string, surfaceId: string | number, suffix?: string): string => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`)
}

export const getMaskId = (sceneId: string, surfaceId: string | number, suffix?: string): string => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`)
}

export const ERROR_NOT_STRING = 'Input must be a string'

export function getBeforeHash(input: string): string {
  if (typeof input !== 'string') throw new TypeError(ERROR_NOT_STRING)

  if (input.includes('#')) {
    return input.split('#')[0]
  }

  return input
}

function createTimestamp(): string {
  const now = new Date()
  return [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  ].join('-')
}

export function createUniqueSceneId(): string {
  return `${createTimestamp()}-${uniqueId()}`
}

export function createMiniColorFromColor(color: Color): MiniColor {
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
    lab: { L, A, B }
  } = color
  return { brandKey, id, colorNumber, red, blue, green, L, A, B, hex }
}
