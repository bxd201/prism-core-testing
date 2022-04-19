// @flow
import kebabCase from 'lodash/kebabCase'

export const getFilterId = (sceneId: string, surfaceId: string | number, suffix?: string) => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`)
}

export const getMaskId = (sceneId: string, surfaceId: string | number, suffix?: string) => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`)
}

// This is a generic method that can map a color or color id (or anything else) to match the surfaces for a tintablescene
export const mapItemsToList = (item: any[], surfaces: any[]) => {
  return surfaces.map((surface, i) => {
    return i < item.length ? item[i] : null
  })
}
