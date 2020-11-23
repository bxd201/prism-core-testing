// @flow
export const SET_NAVIGATION_INTENT = 'SET_NAVIGATION_INTENT'
export const setNavigationIntent = (urlFrag: string) => {
  return {
    type: SET_NAVIGATION_INTENT,
    payload: urlFrag
  }
}

// this will only clear the navigation intent.  Designed to be the action of a cancellation
export const CLEAR_NAVIGATION_INTENT = 'CLEAR_NAVIGATION_INTENT'
export const clearNavigationIntent = () => {
  return {
    type: SET_NAVIGATION_INTENT,
    payload: null
  }
}

// This method will clear the navigation intent and clear the scene polluted flag. Designed to be the action of a affirmation
export const CLEANUP_NAVIGATION_INTENT = 'CLEANUP_NAVIGATION_INTENT'
export const cleanupNavigationIntent = () => {
  return {
    type: CLEANUP_NAVIGATION_INTENT,
    navigationIntentPayload: null,
    scenePollutedPayload: '',
    allowNavigateToIntendedDestinationPayload: false
  }
}

// It might seem like this stuff is related to scenes, but it has more to do with how navigation occurs.
// This flag basically determines if navigation should occur with or without a warning about loosing saved work.
export const POLLUTED_ENUM = {
  POLLUTED_PAINT_SCENE: 'POLLUTED_PAINT_SCENE',
  POLLUTED_STOCK_SCENE: 'POLLUTED_STOCK_SCENE'
}

export const SCENE_POLLUTED = 'SCENE_POLLUTED'
export const setIsScenePolluted = (pollutedSceneType: string = '') => {
  return {
    type: SCENE_POLLUTED,
    payload: pollutedSceneType
  }
}

export const NAVIGATE_TO_INTENDED_DESTINATION = 'NAVIGATE_TO_INTENDED_DESTINATION'
// This method will trigger a url cached in redux to
export const navigateToIntendedDestination = () => {
  return {
    type: NAVIGATE_TO_INTENDED_DESTINATION,
    payload: true
  }
}
