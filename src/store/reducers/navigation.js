// @flow
import {
  ACTIVE_SCENE_LABEL,
  CACHE_PAINT_SCENE,
  CACHE_STOCK_SCENE,
  CLEANUP_NAVIGATION_INTENT,
  CLEAR_NAVIGATION_INTENT,
  CLEAR_PAINT_SCENE_CACHE,
  CLEAR_STOCK_SCENE_CACHE,
  IMAGE_ROTATE_BYPASS,
  IS_COLOR_WALL_MODALLY_PRESENTED,
  NAVIGATE_TO_INTENDED_DESTINATION,
  NAVIGATION_INTENT_WITH_RETURN,
  SCENE_POLLUTED,
  SET_NAVIGATION_INTENT,
  STAGE_NAVIGATION_RETURN_INTENT
} from '../actions/navigation'
import cloneDeep from 'lodash/cloneDeep'

export const navigationIntent = (state: string | void = null, action: any) => {
  if (action.type === SET_NAVIGATION_INTENT || action.type === CLEAR_NAVIGATION_INTENT) {
    return action.payload
  }

  if (action.type === STAGE_NAVIGATION_RETURN_INTENT) {
    return action.navigationIntentPayload
  }

  if (action.type === CLEANUP_NAVIGATION_INTENT) {
    return action.navigationIntentPayload
  }

  if (action.type === NAVIGATION_INTENT_WITH_RETURN) {
    return action.navigationIntentPayload
  }

  return state
}

export const scenePolluted = (state: string = '', action: any) => {
  if (action.type === SCENE_POLLUTED) {
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
    console.log('NEW STATE COPY:::', newState)
    return newState
  }

  if (action.type === CLEAR_PAINT_SCENE_CACHE) {
    return null
  }

  return state
}

// this is the path forward for managing active sceen, this flag will be used to mediate which scene type to display
export const activeSceneLabel = (state: string = '', action: { type: string, payload: string }) => {
  if (action.type === ACTIVE_SCENE_LABEL) {
    return action.payload
  }

  return state
}

export const navigationReturnIntent = (state: string | void = null, action: any) => {
  if (action.type === NAVIGATION_INTENT_WITH_RETURN) {
    return action.navigationReturnIntentPayload
  }

  if (action.type === STAGE_NAVIGATION_RETURN_INTENT) {
    return action.navigationReturnIntentPayload
  }

  return state
}

export const imageRotateBypass = (state: string = '', action: { type: string, payload: string }) => {
  if (action.type === IMAGE_ROTATE_BYPASS) {
    return action.payload
  }

  if (action.type === SET_NAVIGATION_INTENT) {
    return ''
  }

  return state
}

// @todo This will eventually be a cahce for now it is a boolean flag, when refactored default state should be null!!! -RS
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
  if (action.type === IS_COLOR_WALL_MODALLY_PRESENTED) {
    return action.payload
  }

  return state
}
