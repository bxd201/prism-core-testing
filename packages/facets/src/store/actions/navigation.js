// @flow
import { COLORWALL_MODAL_PRESENTERS } from '../../components/Facets/ColorVisualizerWrapper/routeValueCollections'
import type { MiniColor } from '../../shared/types/Scene'

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
    payload: ''
  }
}

// This method will clear the navigation intent and clear the scene polluted flag. Designed to be the action of a affirmation
export const CLEANUP_NAVIGATION_INTENT = 'CLEANUP_NAVIGATION_INTENT'
export const cleanupNavigationIntent = () => {
  return {
    type: CLEANUP_NAVIGATION_INTENT,
    navigationIntentPayload: '',
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

export const SET_SCENE_POLLUTED = 'SET_SCENE_POLLUTED'
export const setIsScenePolluted = (pollutedSceneType: string = '') => {
  return {
    type: SET_SCENE_POLLUTED,
    payload: pollutedSceneType
  }
}

// @todo look into deprecating this and all things triggered by it. 5/20/21 -RS
// me thinks it can be supeceded by imperatively pushing the nav intent and calling a func to clean up
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

export const CACHE_CAROUSEL = 'CACHE_CAROUSEL'
export const cacheCarousel = (carouselInfo: any) => {
  return {
    type: CACHE_CAROUSEL,
    payload: carouselInfo
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
  STOCK_SCENE: 'STOCK_SCENE',
  LIVE_PALETTE: 'LIVE_PALETTE',
  EMPTY_SCENE: 'EMPTY_SCENE'
}
export const SET_ACTIVE_SCENE_LABEL = 'SET_ACTIVE_SCENE_LABEL'
export const setActiveSceneLabel = (sceneType: string = '') => {
  return {
    type: SET_ACTIVE_SCENE_LABEL,
    payload: sceneType
  }
}

// this action tells a programmatic navigation where to go back to, should be set when navigation intent is set
export const SET_NAVIGATION_INTENT_WITH_RETURN = 'SET_NAVIGATION_INTENT_WITH_RETURN'
export const setNavigationIntentWithReturn = (shouldGoHere: string, shouldReturnHere: string) => {
  return {
    type: SET_NAVIGATION_INTENT_WITH_RETURN,
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
    navigationReturnIntentPayload: ''
  }
}

export const SET_IMAGE_ROTATE_BYPASS = 'SET_IMAGE_ROTATE_BYPASS'
export const setImageRotateBypass = (bypass: string) => {
  return {
    type: SET_IMAGE_ROTATE_BYPASS,
    payload: bypass
  }
}

// for semantics
export const clearImageRotateBypass = () => setImageRotateBypass('')

export const CACHE_STOCK_SCENE = 'CACHE_STOCK_SCENE'
export const cacheStockScene = (sceneUid: string, variantName: string, surfaceColors: MiniColor[]) => {
  return {
    type: CACHE_STOCK_SCENE,
    payload: {
      sceneUid,
      variantName,
      surfaceColors: surfaceColors.map(color => {
        return { ...color }
      })
    }
  }
}

export const SET_IS_COLOR_WALL_MODALLY_PRESENTED = 'SET_IS_COLOR_WALL_MODALLY_PRESENTED'
// It is a modal if there is a return path at time of mount, this tells the app if the users sees the color wall
export const setIsColorWallModallyPresented = (returnPath: string = '') => {
  const isModal = COLORWALL_MODAL_PRESENTERS.indexOf(returnPath) > -1
  return {
    type: SET_IS_COLOR_WALL_MODALLY_PRESENTED,
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

// This holds the value of a path a user wants to go to when a programmatic intent has already been declared, they need to resolve via a modal action
export const SET_DIRTY_NAVIGATION_INTENT = 'SET_DIRTY_NAVIGATION_INTENT'
export const setDirtyNavigationIntent = (urlFrag: string = '') => {
  return {
    type: SET_DIRTY_NAVIGATION_INTENT,
    payload: urlFrag
  }
}

// This action is used in situations where sequential programatic navigation.
export const SET_NAVIGATION_WITH_FORWARD = 'SET_NAVIGATION_WITH_FORWARD'
export const setNavigationIntentWithForward = (intentUrlFrag: string, forwardUrlFrag: string) => {
  return {
    type: SET_NAVIGATION_WITH_FORWARD,
    // this puts the return intent into the stage position
    navigationIntentPayload: intentUrlFrag,
    // this clears out the staged return intent
    navigationForwardIntentPayload: forwardUrlFrag
  }
}

export const CLEAR_FORWARD_AND_NAVIGATION_INTENT = 'CLEAR_FORWARD_AND_NAVIGATION_INTENT'
export const clearForwardAndNavigationIntent = () => {
  return {
    type: CLEAR_FORWARD_AND_NAVIGATION_INTENT,
    navigationIntentPayload: '',
    navigationForwardIntentPayload: ''

  }
}

export const SET_IS_MATCH_PHOTO_PRESENTED = 'SET_IS_MATCH_PHOTO_PRESENTED'
export const setIsMatchPhotoPresented = (isShown: boolean = false) => {
  return {
    type: SET_IS_MATCH_PHOTO_PRESENTED,
    payload: isShown
  }
}
