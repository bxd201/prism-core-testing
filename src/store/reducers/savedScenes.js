// @flow
import {
  DELETE_SAVED_SCENE,
  LOADED_SAVED_SCENES_METADATA,
  SELECTED_SAVED_SCENE,
  SAVED_REGIONS_UNPICKLED,
  CACHED_SCENE_DATA,
  SAVING_MASKS,
  WAITING_TO_FETCH_SAVED_SCENE,
  DELETE_ANON_SAVED_SCENE,
  SAVED_SCENE_LOCAL,
  LOADING_SAVED_MASKS, ERROR_DOWNLOADING_SAVED_DATA, SHOW_SAVE_SCENE_MODAL, RESET_SAVE_STATE
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

  if (action.type === SAVED_SCENE_LOCAL) {
    let newState = [...state]
    const existingItem = state.find(item => item.id === action.payload.id)
    if (existingItem) {
      newState = state.filter(item => item.id !== existingItem.id)
      newState.push(action.payload)
    } else {
      newState.push(action.payload)
    }

    return newState
  }

  if (action.type === DELETE_ANON_SAVED_SCENE) {
    return state.filter(item => item.id !== action.payload)
  }

  return state
}

export const cachedSceneData = (state: string | null = null, action: {type: string, payload: string | null}) => {
  if (action.type === CACHED_SCENE_DATA) {
    return action.payload
  }

  if (action.type === SAVING_MASKS && !action.payload) {
    // Clear the cache when saving is complete
    return null
  }

  return state
}

export const sceneMetadata = (state: Object[] = [], action: {type: string, payload: boolean, data: Object}) => {
  if (action.type === SAVING_MASKS && !action.payload && action.data) {
    if (!state.find(item => item.scene === action.data.scene)) {
      return [...state, { ...action.data }]
    }

    return state
  }

  if (action.type === DELETE_ANON_SAVED_SCENE) {
    return state.filter(item => item.scene.indexOf(action.payload) === -1)
  }

  return state
}

// This flag tells the auth observer to fetch saved scenes from firebase once logged in
export const isWaitingToFetchSavedScenes = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === WAITING_TO_FETCH_SAVED_SCENE) {
    return action.payload
  }

  return state
}

export const isLoadingSavedScene = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === LOADING_SAVED_MASKS) {
    return action.payload
  }

  if (action.type === SAVED_REGIONS_UNPICKLED || action.type === ERROR_DOWNLOADING_SAVED_DATA) {
    return false
  }

  return state
}

export const showSaveSceneModal = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SHOW_SAVE_SCENE_MODAL) {
    return action.payload
  }

  if (action.type === RESET_SAVE_STATE) {
    return false
  }

  return state
}

export const saveSceneName = (state: string = '', action: any) => {
  if (action.type === SAVING_MASKS) {
    return action.sceneName || ''
  }

  if (action.type === RESET_SAVE_STATE) {
    return ''
  }

  return state
}
