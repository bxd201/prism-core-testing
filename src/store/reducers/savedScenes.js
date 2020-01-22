// @flow
import {
  DELETE_SAVED_SCENE,
  LOADED_SAVED_SCENES_METADATA,
  SELECTED_SAVED_SCENE,
  SAVED_REGIONS_UNPICKLED,
  CACHE_SCENE_XML_DATA, SAVING_MASKS
} from '../actions/persistScene'
export const legacySavedScenesMetadata = (state: Object[] = [], action: { type: string, payload: Object }) => {
  if (action.type === DELETE_SAVED_SCENE) {
    const newState = state.filter(scene => scene.id !== action.payload)

    return newState
  }

  if (action.type === LOADED_SAVED_SCENES_METADATA) {
    return action.payload
  }

  return state
}

export const selectedSavedSceneId = (state: string | null = null, action: { type: string, payload: string | null }) => {
  if (action.type === SELECTED_SAVED_SCENE) {
    return action.payload
  }

  return state
}

export const scenesAndRegions = (state: Object[] = [], action: {type: string, payload: Object[] | null}) => {
  if (action.type === SAVED_REGIONS_UNPICKLED) {
    return action.payload
  }

  return state
}

export const cachedSceneXml = (state: string | null = null, action: {type: string, payload: string | null}) => {
  if (action.type === CACHE_SCENE_XML_DATA) {
    return action.payload
  }

  if (action.type === SAVING_MASKS && !action.payload) {
    // Clear the cache when saving is complete
    return null
  }

  return state
}

export const cloudSceneMetadata = (state: Object[] = [], action: {type: string, payload: boolean, data: Object}) => {
  if (action.type === SAVING_MASKS && !action.payload && action.data) {
    return [...state, { ...action.data }]
  }

  return state
}
