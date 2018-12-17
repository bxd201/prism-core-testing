// @flow
import axios from 'axios'
import _ from 'lodash'

import type { ScenePayload } from '../shared/types/Scene'
import type { Color } from '../shared/types/Colors'
import { SW_SCENES_ENDPOINT } from 'constants/endpoints'

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
    // let scenesEndpoint = void (0)

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

    return axios.get(SW_SCENES_ENDPOINT)
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

export const paintSceneSurface = (sceneId: number, surfaceId: number, color: Color) => {
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
    newScenes[ sceneIndex ].surfaces[ surfaceIndex ] = Object.assign({}, newScenes[ sceneIndex ].surfaces[ surfaceIndex ], {
      color: color
    })

    dispatch(receiveScenes({
      scenes: newScenes,
      count: newScenes.length,
      type
    }))
  }
}
