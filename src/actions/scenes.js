// @flow
import axios from 'axios'
import _ from 'lodash'

import type { ScenePayload } from '../shared/types/Scene'
import { SCENE_TYPES } from 'constants/globals'
import { SW_SCENES_AUTOMOTIVE, SW_SCENES_ROOMS } from 'constants/endpoints'

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

export const DEACTIVATE_SCENE = 'DEACTIVATE_SCENE'
export const deactivateScene = (id: string | number | Array<string | number>) => {
  return {
    type: DEACTIVATE_SCENE,
    payload: {
      id: id
    }
  }
}

export const loadScenes = (type: string) => {
  return (dispatch: Function, getState: Function) => {
    const { sceneCollection, type: oldType } = getState().scenes
    let scenes = !_.isEmpty(sceneCollection) && !_.isEmpty(sceneCollection[type]) && sceneCollection[type]
    let scenesEndpoint = void (0)

    if (scenes) {
      if (type !== oldType) {
        dispatch(activateOnlyScene(scenes[0].id))
      }

      dispatch(receiveScenes({
        count: scenes.length,
        scenes: scenes,
        type
      }))
      return
    }

    dispatch(requestScenes())

    switch (type) {
      case SCENE_TYPES.OBJECT:
        scenesEndpoint = SW_SCENES_AUTOMOTIVE
        break
      case SCENE_TYPES.ROOM:
        scenesEndpoint = SW_SCENES_ROOMS
        break
      default:
        scenesEndpoint = SW_SCENES_ROOMS
        break
    }

    if (!scenesEndpoint) {
      // TODO: create a scene loading ERROR method and handle appropriately -- for now it will just show no scenes

      console.error('No scene type defined. Unable to fetch scenes for unknown scene type.')

      dispatch(receiveScenes({
        scenes: [],
        count: 0,
        type: type
      }))

      return
    }

    return axios.get(scenesEndpoint)
      .then(r => r.data)
      .then(data => {
        if (data.scenes && data.scenes.length) {
          dispatch(activateOnlyScene(data.scenes[0].id))
        }

        dispatch(receiveScenes({
          scenes: data.scenes,
          count: data.count,
          type: type
        }))
      })
  }
}

export const paintSceneSurface = (sceneId: number, surfaceId: number, color: string) => {
  return (dispatch: Function, getState: Function) => {
    const { sceneCollection, type } = getState().scenes
    const scenes = sceneCollection[type]

    const sceneIndex = _.findIndex(scenes, scene => {
      return scene.id === sceneId
    })

    if (sceneIndex < 0) {
      return
    }

    const surfaceIndex = _.findIndex(scenes[sceneIndex].surfaces, surface => {
      return surface.id === surfaceId
    })

    if (surfaceIndex < 0) {
      return
    }

    const newScenes = _.clone(scenes).map(scene => _.clone(scene))

    // replace item in collection with new, updated instance of obj to avoid mutation complications
    newScenes[ sceneIndex ].surfaces[ surfaceIndex ] = Object.assign({}, newScenes[ sceneIndex ].surfaces[ surfaceIndex ], { color: color })

    dispatch(receiveScenes({
      scenes: newScenes,
      count: newScenes.length,
      type
    }))
  }
}
