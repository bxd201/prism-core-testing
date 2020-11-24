// @flow
import {
  CLEANUP_NAVIGATION_INTENT,
  CLEAR_NAVIGATION_INTENT,
  NAVIGATE_TO_INTENDED_DESTINATION,
  SCENE_POLLUTED,
  SET_NAVIGATION_INTENT
} from '../actions/navigation'

export const navigationIntent = (state: string = null, action: any) => {
  if (action.type === SET_NAVIGATION_INTENT || action.type === CLEAR_NAVIGATION_INTENT) {
    return action.payload
  }

  if (action.type === CLEANUP_NAVIGATION_INTENT) {
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
