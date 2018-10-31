// @flow
import axios from 'axios'
import _ from 'lodash'

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
const receiveScenes = (sceneResponse: any) => {
  return {
    type: RECEIVE_SCENES,
    payload: {
      loadingScenes: false,
      scenes: sceneResponse.scenes,
      numScenes: sceneResponse.count
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
    const { scenes } = getState().scenes
    let scenesEndpoint = void (0)

    if (!_.isEmpty(scenes)) {
      dispatch(receiveScenes({
        count: scenes.length,
        scenes
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
    }

    if (!scenesEndpoint) {
      // TODO: create a scene loading ERROR method and handle appropriately -- for now it will just show no scenes

      console.error('No scene type defined. Unable to fetch scenes for unknown scene type.')

      dispatch(receiveScenes({
        scenes: [],
        count: 0
      }))
      return
    }

    return axios.get(scenesEndpoint)
      .then(r => r.data)
      .then(data => {
        dispatch(receiveScenes(data))
      })
  }
}

export const paintSceneSurface = (sceneId: number, surfaceId: number, color: string) => {
  return (dispatch: Function, getState: Function) => {
    const { scenes } = getState().scenes

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
      count: newScenes.length
    }))
  }
}
