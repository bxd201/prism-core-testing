// @flow
import axios from 'axios'
import _ from 'lodash'

import { SW_SCENES } from '../constants/endpoints'

export const SELECT_SCENE: string = 'SELECT_SCENE'
// TODO: Create type for scene
export const selectScene = (scene: any) => {
  return {
    type: SELECT_SCENE,
    payload: { scene }
  }
}

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
export const activateScene = (id: string | number) => {
  return {
    type: ACTIVATE_SCENE,
    payload: {
      id: id
    }
  }
}

export const DEACTIVATE_SCENE = 'DEACTIVATE_SCENE'
export const deactivateScene = (id: string | number) => {
  return {
    type: DEACTIVATE_SCENE,
    payload: {
      id: id
    }
  }
}

export const loadScenes = () => {
  return (dispatch: Function, getState: Function) => {
    const { scenes } = getState().scenes

    if (!_.isEmpty(scenes)) {
      dispatch(receiveScenes({
        count: scenes.length,
        scenes
      }))
      return
    }

    dispatch(requestScenes())

    return axios.get(SW_SCENES)
      .then(r => r.data)
      .then(data => {
        dispatch(receiveScenes(data))

        // this assumes we always want to activate our first scene,
        // but maybe this should be left up to the component displaying scenes?
        // that might make more sense, keep the opinions out of actions
        // if (data.scenes && data.scenes.length) {
        //   dispatch(activateScene(data.scenes[0].id))
        // }
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
