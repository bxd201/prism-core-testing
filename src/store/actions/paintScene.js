
// @flow
import uniqueId from 'lodash/uniqueId'

export const WORKSPACE_TYPES = {
  smartMask: 'smartmask',
  savedScene: 'savedscene',
  generic: 'generic'
}

export const SAVED_SCENE_READY_FOR_PAINT = 'SAVED_SCENE_READY_FOR_PAINT'
export const setLayersForPaintScene = (bgImageUrl: string, layers: ImageData[], palette: Object[], width: number, height: number) => {
  const payload = {
    type: SAVED_SCENE_READY_FOR_PAINT,
    payload: createPaintSceneWorkspace(bgImageUrl, layers, palette, width, height, WORKSPACE_TYPES.savedScene)
  }
  return payload
}

export const SAVED_SCENE_REMOVED = 'SAVED_SCENE_REMOVED'
export const clearSceneWorkspace = () => {
  return {
    type: SAVED_SCENE_REMOVED,
    payload: null
  }
}

export type PaintSceneWorkspace = {
  bgImageUrl: string,
  layers: ImageData[],
  palette: Object[],
  width: number,
  height: number,
  workspaceType: string,
  uid: string,
  sceneName: string,
  surfaces: string[]
}

export const createPaintSceneWorkspace = (
  backgroundImageUrl: string,
  surfacesImageData: ImageData[],
  colors: Object[], width: number, height: number, workspaceType: string = WORKSPACE_TYPES.generic, sceneName?: string = '', surfaces?: string[] = []): PaintSceneWorkspace => {
  return {
    bgImageUrl: backgroundImageUrl,
    layers: surfacesImageData,
    palette: colors,
    width,
    height,
    workspaceType: workspaceType,
    uid: uniqueId('workspace_'),
    // added for tintable scene
    sceneName,
    // urls from nanonets
    surfaces
  }
}
