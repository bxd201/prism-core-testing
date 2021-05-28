// @flow
import type { Scene, SceneStatus, SceneWorkspace } from '../../shared/types/Scene'

import {
  ADD_NEW_MASK,
  UPDATE_CURRENT_SCENE,
  TOGGLE_EDIT_MODE,
  EDIT_MASK,
  SET_USE_SMART_MASK, SET_SHOW_EDIT_CUSTOM_SCENE,
  SET_ACTIVE_SCENE_KEY
} from '../actions/scenes'
import { FlatScene, FlatVariant, SET_SELECTED_VARIANT_NAME, SCENES_DATA_FETCHED, SET_VARIANTS_COLLECTION, SET_VARIANTS_LOADING } from '../actions/loadScenes'
import { SHOW_COLOR_DETAILS_MODAL } from '../actions/loadColors'
import type { Color } from '../../shared/types/Colors'

type State = {
  sceneCollection: {
    [key: string]: Scene[]
  },
  sceneStatus: {
    [key: string]: SceneStatus[]
  },
  sceneStatusColorDetails: {
    [key: string]: SceneStatus[]
  },
  type: string | void,
  numScenes: number,
  loadingScenes: boolean,
  activeScenes: number[],
  activeScenesColorDetails: number[],
  isColorDetailsPage: boolean,
  selectedSceneVariantChanged: boolean,
  selectedScenePaletteLoaded: boolean,
  colorDetailsPageColorList: Object
}

export const initialState: State = {
  sceneCollection: {},
  sceneStatus: {},
  sceneStatusColorDetails: {},
  type: void (0),
  numScenes: 0,
  loadingScenes: true,
  activeScenes: [],
  activeScenesColorDetails: [],
  isColorDetailsPage: false,
  selectedSceneVariantChanged: false,
  selectedScenePaletteLoaded: false,
  colorDetailsPageColor: {}
}

export const SET_SELECTED_SCENE_UID = 'SET_SELECTED_SCENE_UID'

export const sceneWorkspaces = (state: SceneWorkspace[] = [], action: {type: string, payload: SceneWorkspace}) => {
  if (action.type === ADD_NEW_MASK) {
    const newSceneWorkspace = action.payload
    const filteredState = state.filter(workspace => {
      return workspace.surfaceId !== action.payload.surfaceId &&
         workspace.sceneId !== action.payload.sceneId
    })
    return [newSceneWorkspace, ...filteredState]
  }

  return state
}

export const currentSurfaceId = (state: number | null = null, action: {type: string, payload: Object}) => {
  // Only set via action triggered from within tintable scene, haven't found a better deterministic way to know user intent
  if (action.type === UPDATE_CURRENT_SCENE) {
    return action.payload.surfaceId
  }

  return state
}

export const currentActiveSceneId = (state: number | null = null, action: {type: string, payload: Object}) => {
  // Only set via action triggered from within tintable scene, haven't found a better deterministic way to know user intent
  if (action.type === UPDATE_CURRENT_SCENE) {
    return action.payload.sceneId
  }

  return state
}

export const isEditMode = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === TOGGLE_EDIT_MODE) {
    return action.payload
  }

  return state
}

export const currentWorkspace = (state: SceneWorkspace | null = null, action: { type: string, payload: SceneWorkspace}) => {
  if (action.type === EDIT_MASK) {
    return action.payload
  }

  return state
}

export const useSmartMask = (state: boolean = SMARTMASK_ENABLED, action: {type: string, payload: boolean}) => {
  if (action.type === SET_USE_SMART_MASK) {
    return action.payload
  }

  return state
}

export const showEditCustomScene = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SET_SHOW_EDIT_CUSTOM_SCENE) {
    return action.payload
  }

  return state
}

export const scenesCollection = (state: FlatScene[] | null = null, action: {type: string, scenesPayload: FlatScene[] | null}) => {
  if (action.type === SCENES_DATA_FETCHED) {
    return action.scenesPayload
  }

  return state
}

export const variantsCollection = (state: FlatVariant[] | null = null, action: { type: string, payload?: FlatVariant[] | null, variantsPayload?: FlatVariant[] | null }): FlatVariant[] | null => {
  if (action.type === SCENES_DATA_FETCHED) {
    return action.variantsPayload
  }

  if (action.type === SET_VARIANTS_COLLECTION) {
    return action.payload
  }

  return state
}

export const variantsLoading = (state: boolean = false, action: { type: string, payload: boolean }): boolean => {
  if (action.type === SET_VARIANTS_LOADING) {
    return action.payload
  }

  return state
}

export const selectedSceneUid = (state: string | null = null, action: {type: string, payload: string | null}) => {
  if (action.type === SET_SELECTED_SCENE_UID) {
    return action.payload
  }

  return state
}

export const selectedVariantName = (state: string = '', action: {type: string, payload: string}) => {
  if (action.type === SET_SELECTED_VARIANT_NAME) {
    return action.payload
  }
  return state
}

export const activeSceneKey = (state: string = '', action: { type: string, payload: string }) => {
  if (action.type === SET_ACTIVE_SCENE_KEY) {
    return action.payload
  }

  return state
}

export const globalColorDetailColor = (state: Color | null = null, action: { type: string, payload: Color | null }) => {
  if (action.type === SHOW_COLOR_DETAILS_MODAL) {
    return action.payload ?? null
  }

  return state
}
