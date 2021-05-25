// @flow
import {
  SET_ACTIVE_SCENE_LABEL,
  CACHE_PAINT_SCENE,
  CACHE_STOCK_SCENE,
  CACHE_CAROUSEL,
  CLEANUP_NAVIGATION_INTENT,
  CLEAR_NAVIGATION_INTENT,
  CLEAR_PAINT_SCENE_CACHE,
  CLEAR_STOCK_SCENE_CACHE,
  SET_DIRTY_NAVIGATION_INTENT,
  SET_IMAGE_ROTATE_BYPASS,
  SET_IS_COLOR_WALL_MODALLY_PRESENTED,
  NAVIGATE_TO_INTENDED_DESTINATION,
  SET_NAVIGATION_INTENT_WITH_RETURN,
  SET_SCENE_POLLUTED,
  SET_NAVIGATION_INTENT,
  SHOULD_SHOW_GLOBAL_DESTROY_WARNING,
  STAGE_NAVIGATION_RETURN_INTENT,
  SET_NAVIGATION_WITH_FORWARD,
  CLEAR_FORWARD_AND_NAVIGATION_INTENT,
  SET_IS_MATCH_PHOTO_PRESENTED
} from '../actions/navigation'
import cloneDeep from 'lodash/cloneDeep'

export const navigationIntent = (state: string = '', action: any) => {
  if (action.type === SET_NAVIGATION_INTENT || action.type === CLEAR_NAVIGATION_INTENT) {
    return action.payload
  }

  if (action.type === STAGE_NAVIGATION_RETURN_INTENT) {
    return action.navigationIntentPayload
  }

  if (action.type === CLEANUP_NAVIGATION_INTENT) {
    return action.navigationIntentPayload
  }

  if (action.type === SET_NAVIGATION_INTENT_WITH_RETURN) {
    return action.navigationIntentPayload
  }

  if (action.type === SET_NAVIGATION_WITH_FORWARD) {
    return action.navigationIntentPayload
  }

  if (action.type === CLEAR_FORWARD_AND_NAVIGATION_INTENT) {
    return action.navigationIntentPayload
  }

  return state
}

export const carouselCache = (state: Array = [0, 'tab0'], action: any) => {
  if (action.type === CACHE_CAROUSEL) {
    return action.payload
  }

  return state
}

export const scenePolluted = (state: string = '', action: any) => {
  if (action.type === SET_SCENE_POLLUTED) {
    return action.payload
  }

  if (action.type === CLEANUP_NAVIGATION_INTENT) {
    return action.scenePollutedPayload
  }

  return state
}

export const allowNavigateToIntendedDestination = (state: boolean = false, action: any) => {
  if (action.type === NAVIGATE_TO_INTENDED_DESTINATION) {
    return action.payload
  }

  if (action.type === CLEANUP_NAVIGATION_INTENT) {
    return action.allowNavigateToIntendedDestinationPayload
  }

  return state
}

export const paintSceneCache = (state: any = null, action: { type: string, payload: any | void }) => {
  if (action.type === CACHE_PAINT_SCENE) {
    const newState = cloneDeep(action.payload)
    return newState
  }

  if (action.type === CLEAR_PAINT_SCENE_CACHE) {
    return null
  }

  return state
}

// this is the path forward for managing active scene, this flag will be used to mediate which scene type to display
export const activeSceneLabel = (state: string = '', action: { type: string, payload: string }) => {
  if (action.type === SET_ACTIVE_SCENE_LABEL) {
    return action.payload
  }

  return state
}

export const navigationReturnIntent = (state: string | void = null, action: any) => {
  if (action.type === SET_NAVIGATION_INTENT_WITH_RETURN || action.type === STAGE_NAVIGATION_RETURN_INTENT) {
    return action.navigationReturnIntentPayload
  }

  return state
}

export const imageRotateBypass = (state: string = '', action: { type: string, payload: string }) => {
  if (action.type === SET_IMAGE_ROTATE_BYPASS) {
    return action.payload
  }

  return state
}

// @todo This will eventually be a cache for now it is a boolean flag, when refactored default state should be null!!! -RS
export const stockSceneCache = (state: any = false, action: { type: string, payload: any }) => {
  if (action.type === CACHE_STOCK_SCENE) {
    return action.payload
  }

  if (action.type === CLEAR_STOCK_SCENE_CACHE) {
    // @todo make null when refactored for actual cache!!!! -RS
    return false
  }

  return state
}

export const isColorwallModallyPresented = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SET_IS_COLOR_WALL_MODALLY_PRESENTED) {
    return action.payload
  }

  return state
}

export const shouldShowGlobalDestroyWarning = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SHOULD_SHOW_GLOBAL_DESTROY_WARNING) {
    return action.payload
  }

  return state
}

export const dirtyNavigationIntent = (state: string = '', action: { type: string, payload: string}) => {
  if (action.type === SET_DIRTY_NAVIGATION_INTENT) {
    return action.payload
  }

  return state
}

export const forwardIntent = (state: string = '', action: any) => {
  if (action.type === SET_NAVIGATION_WITH_FORWARD) {
    return action.navigationForwardIntentPayload
  }

  if (action.type === CLEAR_FORWARD_AND_NAVIGATION_INTENT) {
    return action.navigationForwardIntentPayload
  }

  return state
}

export const isMatchPhotoPresented = (state: boolean = false, action: {type: string, payload: boolean }) => {
  if (action.type === SET_IS_MATCH_PHOTO_PRESENTED) {
    return action.payload
  }

  return state
}
