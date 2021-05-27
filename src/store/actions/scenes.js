// @flow
import { type SceneWorkspace } from '../../shared/types/Scene'
import { type Color } from '../../shared/types/Colors.js.flow'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
export const SET_USE_SMART_MASK = 'SET_USE_SMART_MASK'

export const REQUEST_SCENES = 'REQUEST_SCENES'
// @todo deprecate with scene tinter modularization -rs
export const ACTIVATE_ONLY_SCENE = 'ACTIVATE_ONLY_SCENE'
export const activateOnlyScene = (id: string | number) => {
  return {
    type: ACTIVATE_ONLY_SCENE,
    payload: {
      id: id
    }
  }
}

export const RESET_SCENES_VARIANT = 'RESET_SCENES_VARIANT'
export const resetScenesVariant = () => ({ type: RESET_SCENES_VARIANT })

export const DEACTIVATE_SCENE = 'DEACTIVATE_SCENE'
export const deactivateScene = (id: string | number | Array<string | number>) => {
  return {
    type: DEACTIVATE_SCENE,
    payload: {
      id: id
    }
  }
}

export const PAINT_SCENE_SURFACE = 'PAINT_SCENE_SURFACE'
export const paintSceneSurface = (sceneId: number, surfaceId: number, color: Color) => {
  return {
    type: PAINT_SCENE_SURFACE,
    payload: {
      sceneId,
      surfaceId,
      color
    }
  }
}

export const PAINT_SCENE_MAIN_SURFACE = 'PAINT_SCENE_MAIN_SURFACE'
export const paintSceneMainSurfaces = (sceneId: number, color: Color) => {
  return {
    type: PAINT_SCENE_MAIN_SURFACE,
    payload: {
      id: sceneId,
      color
    }
  }
}

export const PAINT_ALL_MAIN_SURFACES = 'PAINT_ALL_MAIN_SURFACES'
export const paintAllMainSurfaces = (color: Color) => {
  return {
    type: PAINT_ALL_MAIN_SURFACES,
    payload: {
      color
    }
  }
}

export const PAINT_ALL_SCENE_SURFACES = 'PAINT_ALL_SCENE_SURFACES'
export const paintAllSceneSurfaces = (color: Color) => {
  return {
    type: PAINT_ALL_SCENE_SURFACES,
    payload: {
      color
    }
  }
}

export const UPDATE_MASK = 'UPDATE_MASK'
export const updateMask = (mask: MaskObj, data: Blob) => {
  return {
    type: UPDATE_MASK,
    payload: {
      mask,
      data
    }
  }
}

export const ADD_NEW_MASK = 'ADD_NEW_MASK'
export const addNewMask = (sceneId: number, surfaceId: number, variant: string, imageData: string) => {
  // Workspace is an array of images to be passed to a tintable scene
  return {
    type: ADD_NEW_MASK,
    payload: {
      sceneId,
      surfaceId,
      variant,
      imageData
    }
  }
}

export const UPDATE_CURRENT_SCENE = 'UPDATE_CURRENT_SCENE'
export const updateCurrentSceneInfo = (sceneId: number, surfaceId: number) => {
  return {
    action: UPDATE_CURRENT_SCENE,
    payload: {
      sceneId,
      surfaceId
    }
  }
}

export const TOGGLE_EDIT_MODE = 'TOGGLE_EDIT_MODE'
export const toggleEditMode = (currentEditMode: boolean) => ({ type: TOGGLE_EDIT_MODE, payload: !currentEditMode })

export const EDIT_MASK = 'EDIT_MASK'
export const editMask = (sceneWorkspace: SceneWorkspace) => ({ type: EDIT_MASK, payload: sceneWorkspace })

export const TOGGLE_COLOR_DETAILS_PAGE = 'TOGGLE_COLOR_DETAILS_PAGE'
export const toggleColorDetailsPage = () => ({ type: TOGGLE_COLOR_DETAILS_PAGE })

export const SET_SELECTED_SCENE_VARIANT_CHANGED = 'SET_SELECTED_SCENE_VARIANT_CHANGED'
export const setSelectedSceneVariantChanged = () => ({ type: SET_SELECTED_SCENE_VARIANT_CHANGED })

export const UNSET_SELECTED_SCENE_VARIANT_CHANGED = 'UNSET_SELECTED_SCENE_VARIANT_CHANGED'
export const unsetSelectedSceneVariantChanged = () => ({ type: UNSET_SELECTED_SCENE_VARIANT_CHANGED })

export const SET_SELECTED_SCENE_PALETTE_LOADED = 'SET_SELECTED_SCENE_PALETTE_LOADED'
export const setSelectedScenePaletteLoaded = () => ({ type: SET_SELECTED_SCENE_PALETTE_LOADED })

export const UNSET_SELECTED_SCENE_PALETTE_LOADED = 'UNSET_SELECTED_SCENE_PALETTE_LOADED'
export const unsetSelectedScenePaletteLoaded = () => ({ type: UNSET_SELECTED_SCENE_PALETTE_LOADED })

export const SET_WARNING_MODAL_IMG_PREVIEW = 'SET_WARNING_MODAL_IMG_PREVIEW '
export const setWarningModalImgPreview = (miniImg) => ({ type: SET_WARNING_MODAL_IMG_PREVIEW, payload: miniImg })

export const SHOW_WARNING_MODAL = 'SHOW_WARNING_MODAL'
export const showWarningModal = () => ({ type: SHOW_WARNING_MODAL, payload: true })

export const HIDE_WARNING_MODAL = 'HIDE_WARNING_MODAL'
export const hideWarningModal = () => ({ type: HIDE_WARNING_MODAL })

// @todo use this action to init which flavor of upload should be used -RS
export const setUseSmartMask = (shouldUse: boolean = false) => {
  return {
    type: SET_USE_SMART_MASK,
    payload: shouldUse
  }
}

export const SET_SHOW_EDIT_CUSTOM_SCENE = 'SET_SHOW_EDIT_CUSTOM_SCENE'
export const setShowEditCustomScene = (shouldShow: boolean) => {
  return {
    type: SET_SHOW_EDIT_CUSTOM_SCENE,
    payload: shouldShow
  }
}

// only call on things resolved by a user input
export const SET_ACTIVE_SCENE_KEY = 'SET_ACTIVE_SCENE_KEY'
export const setActiveSceneKey = () => {
  return {
    type: SET_ACTIVE_SCENE_KEY,
    payload: createUniqueSceneId()
  }
}
