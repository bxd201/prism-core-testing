// @flow
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'

import { type ScenePayload, type SceneWorkspace } from '../../shared/types/Scene'
import { type Color } from '../../shared/types/Colors'
import MaskObj from '../masks/MaskObj'

import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'

import { SCENES_ENDPOINT } from 'constants/endpoints'

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

export const loadScenes = (type: string) => {
  return (dispatch: Function, getState: Function) => {
    const { sceneCollection, type: oldType } = getState().scenes
    const { current } = getState().language

    // const { brandId } = getState().configurations
    const SCENES_URL = generateBrandedEndpoint(SCENES_ENDPOINT, 'sherwin', { language: current })

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
export const toggleEditMode = (currentEditMode: boolean) => {
  return {
    type: TOGGLE_EDIT_MODE,
    payload: !currentEditMode
  }
}

export const EDIT_MASK = 'EDIT_MASK'
export const editMask = (sceneWorkspace: SceneWorkspace) => {
  return {
    type: EDIT_MASK,
    payload: sceneWorkspace
  }
}
