
// @flow
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'

export const WORKSPACE_TYPES = {
  smartMask: 'smartmask',
  savedScene: 'savedscene',
  generic: 'generic'
}

export const SAVED_SCENE_READY_FOR_PAINT = 'SAVED_SCENE_READY_FOR_PAINT'
export const setLayersForPaintScene = (bgImageUrl: string, layers: ImageData[], palette: Object[], width: number, height: number, type: string, selectIndex: number = 0, sceneName: string = '', surfaces: string[] = []) => {
  const payload = {
    type: SAVED_SCENE_READY_FOR_PAINT,
    payload: createPaintSceneWorkspace(bgImageUrl, layers, palette, width, height, type, selectIndex, sceneName, surfaces)
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
  surfaces: string[],
  selectIndex: number
}

export const createPaintSceneWorkspace = (
  backgroundImageUrl: string,
  surfacesImageData: ImageData[],
  colors: Object[], width: number, height: number, workspaceType: string = WORKSPACE_TYPES.generic, selectIndex: number = 0, sceneName: string = '', surfaces: string[] = []): PaintSceneWorkspace => {
  return {
    bgImageUrl: backgroundImageUrl,
    layers: surfacesImageData,
    palette: colors,
    width,
    height,
    workspaceType: workspaceType,
    uid: createUniqueSceneId(),
    // added for tintable scene
    sceneName,
    // urls from nanonets
    surfaces,
    selectIndex: selectIndex
  }
}

export const SAVE_INIT_WORKSPACE = 'SAVE_INIT_WORKSPACE'
export const setInitialWorkspace = (workspace: Object = {}) => {
  const payload = {
    type: SAVE_INIT_WORKSPACE,
    payload: workspace
  }
  return payload
}

// this stores the paint scene data so that the modal manager can access it to call the save function that persists it in firebase
export const SET_PAINT_SCENE_SAVE_DATA = 'SET_PAINT_SCENE_SAVE_DATA'
export const setPaintSceneSaveData = (layers: string[] | null = null) => {
  return {
    type: SET_PAINT_SCENE_SAVE_DATA,
    payload: layers
  }
}

// This is used to tell the paint scene component to shoot its state to redux.
export const TRIGGER_PAINT_SCENE_LAYER_PUBLISH = 'TRIGGER_PAINT_SCENE_LAYER_PUBLISH'
export const triggerPaintSceneLayerPublish = (shouldTrigger: boolean = false) => {
  return {
    type: TRIGGER_PAINT_SCENE_LAYER_PUBLISH,
    payload: shouldTrigger
  }
}
