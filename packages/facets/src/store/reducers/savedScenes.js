// @flow
import cloneDeep from 'lodash/cloneDeep'
import { copySurfaceColors } from '../../components/SingleTintableSceneView/util'
import { SCENE_TYPES } from '../../constants/globals'
import type { MiniColor } from '../../shared/types/Scene'
import { SET_PAINT_SCENE_SAVE_DATA, TRIGGER_PAINT_SCENE_LAYER_PUBLISH } from '../actions/paintScene'
import {
ANON_SCENE_TYPES,
  CACHED_SCENE_DATA,
  DELETE_ANON_SAVED_SCENE,
  DELETE_SAVED_SCENE,
  ERROR_DOWNLOADING_SAVED_DATA,
  LOADED_SAVED_SCENES_METADATA,
  LOADING_SAVED_MASKS,
  PURGE_METADATA,   RESET_SAVE_STATE,
  SAVED_REGIONS_UNPICKLED,
  SAVED_SCENE_LOCAL,
  SAVING_MASKS,
  SCENE_TYPE,
  SELECTED_SAVED_SCENE,
SET_SHOULD_SHOW_PAINT_SCENE_SAVED_MODAL,   SHOW_DELETE_CONFIRM,
  SHOW_SAVE_SCENE_MODAL,
  SHOW_SAVED_CONFIRM_MODAL,
  SHOW_SAVED_CUSTOM_SUCCESS,
  UPDATE_ANON_SAVED_SCENE_NAME,
  WAITING_TO_FETCH_SAVED_SCENE} from '../actions/persistScene'
import {
  DELETE_SAVED_LIVE_PALETTE,
  SAVE_LIVE_PALETTE,
  SELECTED_SAVED_LIVE_PALETTE,
  UPDATE_LIVE_PALETTE} from '../actions/saveLivePalette'
import {
  DELETE_ANON_STOCK_SCENE,
HYDRATE_STOCK_SCENE_FROM_SAVE,
  SAVE_ANON_STOCK_SCENE,
  SELECT_ANON_STOCK_SCENE,   UPDATE_STOCK_SAVED_SCENE_NAME
} from '../actions/stockScenes'
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
    return state.map(item => cloneDeep(item))
  }

  if (action.type === DELETE_ANON_SAVED_SCENE) {
    return state.filter(item => item.id !== action.payload).map(item => cloneDeep(item))
  }

  if (action.type === UPDATE_ANON_SAVED_SCENE_NAME) {
    return state.map(item => {
      const itemCopy = cloneDeep(item)
      if (item.id === action.payload.id) {
        itemCopy.name = action.payload.name
        itemCopy.updated = Date.now()
      }

      return itemCopy
    })
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
    return state.filter(item => ANON_SCENE_TYPES.indexOf(item.sceneType) === -1 || item.scene.indexOf(action.payload) === -1)
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
    newState = state.map(item => {
      const itemCopy = cloneDeep(item)
      if (item.id === action.payload.id) {
        itemCopy.name = action.payload.name
      }

      return itemCopy
    })

    return newState
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

      if (ANON_SCENE_TYPES.indexOf(item.sceneType) > -1) {
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
    const stateCopy = cloneDeep(state)
    stateCopy.push(dataCopy)

    return stateCopy
  }

  if (action.type === UPDATE_LIVE_PALETTE) {
    return state.map(item => {
      const itemCopy = cloneDeep(item)
      if (item.id === action.payload.id) {
        itemCopy.name = action.payload.name
      }

      return itemCopy
    })
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

export const colorsForSurfacesFromSavedScene = (state: MiniColor[] | null = null, action: { type: string, payload: { surfaceColors: MiniColor[] | null }}) => {
  if (action.type === HYDRATE_STOCK_SCENE_FROM_SAVE) {
    return copySurfaceColors(action.payload.surfaceColors)
  }

  return state
}

export const variantStockSceneNameFromSave = (state: string | null = null, action: { type: string, payload: { variantName: string | null }}) => {
  if (action.type === HYDRATE_STOCK_SCENE_FROM_SAVE) {
    return action.payload.variantName
  }

  return state
}

export const paintSceneLayersForSave = (state: string[] | null = null, action: {type: string, payload: string[]}) => {
  if (action.type === SET_PAINT_SCENE_SAVE_DATA) {
    return action.payload
  }

  return state
}

export const shouldTriggerPaintScenePublishLayers = (state: boolean = false, action: { type: string, payload: boolean}) => {
  if (action.type === TRIGGER_PAINT_SCENE_LAYER_PUBLISH) {
    return action.payload
  }

  return state
}

export const shouldShowPaintSceneSavedModal = (state: boolean = false, action: {type: string, payload: boolean, data: any | void}) => {
  if (action.type === SAVING_MASKS && !action.payload && action.data) {
    return true
  }

  if (action.type === SET_SHOULD_SHOW_PAINT_SCENE_SAVED_MODAL) {
    return action.payload
  }

  return state
}
