// @flow
import axios from 'axios'

import { SW_SCENES } from '../constants/endpoints'
// import type { ColorPayload } from '../shared/types/Colors'

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

export const loadScenes = () => {
  return (dispatch: Function) => {
    dispatch(requestScenes())

    return axios.get(SW_SCENES)
      .then(r => r.data)
      .then(data => {
        dispatch(receiveScenes(data))
      })
  }
}
