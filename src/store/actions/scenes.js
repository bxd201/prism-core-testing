// @flow
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'

import { type ScenePayload, type SceneWorkspace } from '../../shared/types/Scene'
import { type Color } from '../../shared/types/Colors.js.flow'
import MaskObj from '../masks/MaskObj'

import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'

import { SCENES_ENDPOINT } from 'constants/endpoints'
export const SET_USE_SMART_MASK = 'SET_USE_SMART_MASK'

export const REQUEST_SCENES = 'REQUEST_SCENES'
const requestScenes = () => {
  return {
    type: REQUEST_SCENES,
    payload: { loadingScenes: true }
  }
}

export const RECEIVE_SCENES = 'RECEIVE_SCENES'
const receiveScenes = (sceneResponse: ScenePayload) => {
  return {
    type: RECEIVE_SCENES,
    payload: {
      loadingScenes: false,
      scenes: sceneResponse.scenes || [],
      numScenes: sceneResponse.count || 0,
      type: sceneResponse.type
    }
  }
}

export const ACTIVATE_ONLY_SCENE = 'ACTIVATE_ONLY_SCENE'
export const activateOnlyScene = (id: string | number) => {
  return {
    type: ACTIVATE_ONLY_SCENE,
    payload: {
      id: id
    }
  }
}

export const ACTIVATE_SCENE = 'ACTIVATE_SCENE'
export const activateScene = (id: string | number | Array<string | number>) => {
  return {
    type: ACTIVATE_SCENE,
    payload: {
      id: id
    }
  }
}

export const ACTIVATE_COLOR_DETAILS_SCENE = 'ACTIVATE_COLOR_DETAILS_SCENE'
export const activateColorDetailsScene = (id: string | number | Array<string | number>) => {
  return {
    type: ACTIVATE_COLOR_DETAILS_SCENE,
    payload: {
      id
    }
  }
}

export const CHANGE_SCENE_VARIANT = 'CHANGE_SCENE_VARIANT'
export const changeSceneVariant = (sceneId: number, variant: string) => {
  return {
    type: CHANGE_SCENE_VARIANT,
    payload: {
      id: sceneId,
      variant
    }
  }
}

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

export const UNPAINT_SCENE_SURFACES = 'UNPAINT_SCENE_SURFACES'
export const unpaintSceneSurfaces = (sceneId: number) => {
  return {
    type: UNPAINT_SCENE_SURFACES,
    payload: {
      sceneId
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

export const loadScenes = (type: string, brandId: string, options?: {}) => {
  return (dispatch: Function, getState: Function) => {
    const { sceneCollection, type: oldType } = getState().scenes

    const SCENES_URL = generateBrandedEndpoint(SCENES_ENDPOINT, brandId, options)

    let scenes = !isEmpty(sceneCollection) && !isEmpty(sceneCollection[type]) && sceneCollection[type]

    // if we already have scene data...
    if (scenes) {
      // ... and if our type has changed...
      if (type !== oldType) {
        // ... then dispatch an update for our received scenes
        dispatch(receiveScenes({
          count: scenes.length,
          scenes: scenes,
          type
        }))

        // ... then activate the first scene of this new set of scene data
        dispatch(activateOnlyScene(scenes[0].id))
      }

      // ... otherwise just get out of here; we already have all the scene data we need
      return
    }

    dispatch(requestScenes())

    return axios.get(SCENES_URL)
      .then(r => r.data)
      .then(data => {
        if (!data[type]) {
          // TODO: create a scene loading ERROR method and handle appropriately -- for now it will just show no scenes

          console.error('No scene type defined. Unable to fetch scenes for unknown scene type.')

          dispatch(receiveScenes({
            scenes: [],
            count: 0,
            type: type
          }))

          return
        }

        if (data[type].scenes && data[type].scenes.length) {
          dispatch(activateOnlyScene(data[type].scenes[0].id))
        }

        dispatch(receiveScenes({
          scenes: data[type].scenes,
          count: data[type].count,
          type: type
        }))
      })
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
