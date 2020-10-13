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
  LOADING_SAVED_MASKS,
  ERROR_DOWNLOADING_SAVED_DATA,
  SHOW_SAVE_SCENE_MODAL,
  RESET_SAVE_STATE,
  UPDATE_ANON_SAVED_SCENE_NAME,
  SCENE_TYPE,
  SHOW_SAVED_CONFIRM_MODAL,
  SHOW_SAVED_CUSTOM_SUCCESS,
  SHOW_DELETE_CONFIRM,
  PURGE_METADATA
} from '../actions/persistScene'
import {
  DELETE_ANON_STOCK_SCENE,
  SAVE_ANON_STOCK_SCENE,
  SELECT_ANON_STOCK_SCENE, SELECT_SCENE_STATUS,
  UPDATE_STOCK_SAVED_SCENE_NAME
} from '../actions/stockScenes'
import {
  SAVE_LIVE_PALETTE,
  UPDATE_LIVE_PALETTE,
  DELETE_SAVED_LIVE_PALETTE,
  SELECTED_SAVED_LIVE_PALETTE
} from '../actions/saveLivePalette'
import { SCENE_TYPES } from '../../constants/globals'
import cloneDeep from 'lodash/cloneDeep'
import { PAINT_SCENE_SURFACE } from '../actions/scenes'
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

export const selectedSavedLivePaletteId = (state: string | null = null, action: { type: string, payload: string | null }) => {
  if (action.type === SELECTED_SAVED_LIVE_PALETTE) {
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
    }

    newState.push(action.payload)

    return newState
  }

  if (action.type === DELETE_ANON_SAVED_SCENE) {
    return state.filter(item => item.id !== action.payload)
  }

  if (action.type === UPDATE_ANON_SAVED_SCENE_NAME) {
    const sceneDataFromState = state.find(item => item.id === action.payload.id)
    if (sceneDataFromState) {
      const newState = state.filter(item => item.id !== action.payload.id)
      newState.push({ ...sceneDataFromState, name: action.payload.name, updated: Date.now() })
      return newState
    }

    return state
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

export const sceneMetadata = (state: Object[] = [], action: {type: string, payload: boolean, data: Object, anonSceneId?: string }) => {
  let newState = null
  if (action.type === SAVING_MASKS && !action.payload && action.data) {
    if (!state.find(item => item.scene === action.data.scene)) {
      return [...state, { ...action.data }]
    } else {
      newState = state.filter(item => item.scene !== action.data.scene)
      newState.push({ ...action.data })

      return newState
    }
  }

  if (action.type === DELETE_ANON_SAVED_SCENE) {
    return state.filter(item => item.sceneType !== SCENE_TYPE.anonCustom || item.scene.indexOf(action.payload) === -1)
  }

  if (action.type === SAVE_ANON_STOCK_SCENE && action.payload) {
    const dataCopy = cloneDeep(action.payload)
    if (state.find(item => item.type === SCENE_TYPES.anonStock && item.id === action.payload.id)) {
      newState = state.filter(item => item.id !== action.payload.id)
      newState.push(dataCopy)

      return newState
    } else {
      return [...state, dataCopy]
    }
  }

  if (action.type === DELETE_ANON_STOCK_SCENE) {
    newState = state.filter(item => item.id !== action.payload)
    return newState
  }

  if (action.type === UPDATE_STOCK_SAVED_SCENE_NAME) {
    const sceneDataFromState = state.find(item => item.id === action.payload.id)
    if (sceneDataFromState) {
      const newState = state.filter(item => item.id !== action.payload.id)
      newState.push({ ...sceneDataFromState, name: action.payload.name })
      return newState
    }
  }

  if (action.type === SAVED_REGIONS_UNPICKLED || action.type === PURGE_METADATA) {
    const idMap = action.payload.map(item => item.id)
    newState = state.map(item => {
      if (item.sceneType === SCENE_TYPE.anonStock) {
        return { ...item }
      }

      if (item.sceneType === SCENE_TYPE.livePalette) {
        return { ...item }
      }

      if (item.sceneType === SCENE_TYPE.anonCustom) {
        // If the storage location structure/ id generation is changed this will need to be
        let id = item.scene.match(/\/([0-9]+-)+/)

        if (id) {
          id = id[0].substr(1, id[0].length - 2)
          if (idMap.indexOf(id) > -1) {
            return { ...item }
          }
        }
      }
      return null
    }).filter(item => item)

    return newState
  }

  if (action.type === SAVE_LIVE_PALETTE) {
    const dataCopy = cloneDeep(action.payload)
    if (state.find(item => item.sceneType === SCENE_TYPE.livePalette && item.id === action.payload.id)) {
      newState = state.filter(item => item.id !== action.payload.id)
      newState.push(dataCopy)

      return newState
    } else {
      return [...state, dataCopy]
    }
  }

  if (action.type === UPDATE_LIVE_PALETTE) {
    const livePaletteData = state.find(item => item.sceneType === SCENE_TYPE.livePalette && item.id === action.payload.id)
    if (livePaletteData) {
      newState = state.filter(item => item.id !== action.payload.id)
      newState.push({ ...livePaletteData, name: action.payload.name })

      return newState
    }
  }

  if (action.type === DELETE_SAVED_LIVE_PALETTE) {
    newState = state.filter(item => item.id !== action.payload.id)
    return newState
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
  switch (action.type) {
    case SHOW_SAVE_SCENE_MODAL: return action.payload
    case RESET_SAVE_STATE: case SAVE_ANON_STOCK_SCENE: return false
    default: return state
  }
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

export const selectedStockSceneId = (state: string | null = null, action: { type: string, payload: string }) => {
  // @todo implement for no anon scenes -RS
  if (action.type === SELECT_ANON_STOCK_SCENE) {
    return action.payload
  }
  return state
}

export const selectedSceneStatus = (state: Object | null = null, action: { type: string, payload: Object }) => {
  if (action.type === SELECT_SCENE_STATUS) {
    return cloneDeep(action.payload)
  }

  if (action.type === PAINT_SCENE_SURFACE && state) {
    const newState = cloneDeep(state)

    newState.expectStockData.scene.surfaces.some(surface => {
      if (surface.id === action.payload.surfaceId) {
        surface.color = cloneDeep(action.payload.color)

        return true
      }
    })

    return newState
  }

  return state
}

export const showSavedConfirmModal = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SHOW_SAVED_CONFIRM_MODAL) {
    return action.payload
  }

  return state
}

export const showSavedCustomSceneSuccess = (state: boolean = false, action: { type: string, payload: boolean}) => {
  if (action.type === SAVED_SCENE_LOCAL) {
    return true
  }

  if (action.type === SHOW_SAVED_CUSTOM_SUCCESS) {
    return action.payload
  }

  return state
}

export const showDeleteConfirmModal = (state: boolean = false, action: { type: string, payload: boolean }) => {
  if (action.type === SHOW_DELETE_CONFIRM) {
    return action.payload
  }

  return state
}
