// @flow
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'

export const TOGGLE_COLOR_DETAILS_PAGE = 'TOGGLE_COLOR_DETAILS_PAGE'
export const toggleColorDetailsPage = () => ({ type: TOGGLE_COLOR_DETAILS_PAGE })

export const UNSET_SELECTED_SCENE_PALETTE_LOADED = 'UNSET_SELECTED_SCENE_PALETTE_LOADED'
export const unsetSelectedScenePaletteLoaded = () => ({ type: UNSET_SELECTED_SCENE_PALETTE_LOADED })

export const SET_WARNING_MODAL_IMG_PREVIEW = 'SET_WARNING_MODAL_IMG_PREVIEW '
export const setWarningModalImgPreview = (miniImg) => ({ type: SET_WARNING_MODAL_IMG_PREVIEW, payload: miniImg })

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
