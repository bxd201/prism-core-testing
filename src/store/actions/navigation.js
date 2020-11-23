// @flow
import { COLORWALL_MODAL_PRESENTERS } from '../../components/Facets/ColorVisualizerWrapper/routeValueCollections'

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
// This method will trigger a url cached in redux to navigate
export const navigateToIntendedDestination = () => {
  return {
    type: NAVIGATE_TO_INTENDED_DESTINATION,
    payload: true
  }
}

// Again, don't let the name fool you, this action is needed bc of navigation
export const CACHE_PAINT_SCENE = 'CACHE_PAINT_SCENE'
// @todo type this param -RS
export const cachePaintScene = (paintSceneData: any) => {
  return {
    type: CACHE_PAINT_SCENE,
    payload: paintSceneData
  }
}

export const CLEAR_PAINT_SCENE_CACHE = 'CLEAR_PAINT_SCENE_CACHE'
export const clearPaintSceneCache = () => {
  return {
    type: CLEAR_PAINT_SCENE_CACHE
  }
}

export const ACTIVE_SCENE_LABELS_ENUM = {
  PAINT_SCENE: 'PAINT_SCENE',
  STOCK_SCENE: 'STOCK_SCENE'
}
export const ACTIVE_SCENE_LABEL = 'ACTIVE_SCENE_LABEL'
export const setActiveSceneLabel = (sceneType: string = '') => {
  return {
    type: ACTIVE_SCENE_LABEL,
    payload: sceneType
  }
}

// this action tells a programmatic navigation where to go back to, should be set when navigation intent is set
export const NAVIGATION_INTENT_WITH_RETURN = 'NAVIGATION_INTENT_WITH_RETURN'
export const setNavigationIntentWithReturn = (shouldGoHere: string, shouldReturnHere: string) => {
  return {
    type: NAVIGATION_INTENT_WITH_RETURN,
    navigationIntentPayload: shouldGoHere,
    navigationReturnIntentPayload: shouldReturnHere
  }
}

// this will push the return path to the navigation intent
export const STAGE_NAVIGATION_RETURN_INTENT = 'STAGE_NAVIGATION_RETURN_INTENT'
export const stageNavigationReturnIntent = (urlFrag: string) => {
  return {
    type: STAGE_NAVIGATION_RETURN_INTENT,
    // this puts the return intent into the stage position
    navigationIntentPayload: urlFrag,
    // this clears out the staged return intent
    navigationReturnIntentPayload: null
  }
}

export const IMAGE_ROTATE_BYPASS = 'IMAGE_ROTATE_BYPASS'
export const setImageRotateBypass = (bypass: string) => {
  return {
    type: IMAGE_ROTATE_BYPASS,
    payload: bypass
  }
}

// for semantics
export const clearImageRotateBypass = () => setImageRotateBypass('')

// @todo This action DOES NOT currently cache, it is just a flag, it has this name bc ideally it would cache data in the near future -RS
export const CACHE_STOCK_SCENE = 'CACHE_STOCK_SCENE'
export const cacheStockScene = (stockSceneData: any) => {
  return {
    type: CACHE_STOCK_SCENE,
    payload: stockSceneData
  }
}

export const CLEAR_STOCK_SCENE_CACHE = 'CLEAR_STOCK_SCENE_CACHE'
export const clearStockSceneCache = () => {
  return {
    type: CLEAR_STOCK_SCENE_CACHE
  }
}

export const IS_COLOR_WALL_MODALLY_PRESENTED = 'IS_COLOR_WALL_MODALLY_PRESENTED'
// It is a modal if there is a return path at time of mount, this tells the app if the users sees the color wall
export const setIsColorWallModallyPresented = (returnPath: string) => {
  const isModal = COLORWALL_MODAL_PRESENTERS.indexOf(returnPath) > -1
  return {
    type: IS_COLOR_WALL_MODALLY_PRESENTED,
    payload: isModal
  }
}

export const SHOULD_SHOW_GLOBAL_DESTROY_WARNING = 'SHOULD_SHOW_GLOBAL_DESTROY_WARNING'
export const setShouldShowGlobalDestroyWarning = (shouldShow: boolean = false) => {
  return {
    type: SHOULD_SHOW_GLOBAL_DESTROY_WARNING,
    payload: shouldShow
  }
}
