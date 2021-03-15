// @flow
import kebabCase from 'lodash/kebabCase'
import type { SceneWorkspace, Surface } from '../types/Scene'
import find from 'lodash/find'

export const getFilterId = (sceneId: string, surfaceId: string | number, suffix?: string) => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`)
}

export const getMaskId = (sceneId: string, surfaceId: string | number, suffix?: string) => {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`)
}

// @todo deprecate this, remove reference of sceneworkspace in favor of paintsceneworkspace -RS
export const getMaskImage = (surface: Surface, sceneWorkspaces: SceneWorkspace[]) => {
  if (sceneWorkspaces && sceneWorkspaces.length) {
    const workspaces = find(sceneWorkspaces, { surfaceId: surface.id })

    if (workspaces) {
      return workspaces.imageData
    }
  }

  // @todo deprecated approach -RS
  return surface.mask.path ? surface.mask.path : surface.surfaceBlobUrl
}
