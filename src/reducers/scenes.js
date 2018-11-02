// @flow
import _ from 'lodash'

import {
  RECEIVE_SCENES,
  REQUEST_SCENES,
  ACTIVATE_ONLY_SCENE,
  ACTIVATE_SCENE,
  DEACTIVATE_SCENE
} from '../actions/scenes'

export const initialState: Object = {
  sceneCollection: {},
  type: void (0),
  scene: void (0),
  numScenes: 0,
  loadingScenes: true,
  activeScenes: []
}

export const scenes = (state: Object = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case RECEIVE_SCENES:
      let _sceneCollection = Object.assign({}, state.sceneCollection, {
        [action.payload.type]: action.payload.scenes
      })

      return Object.assign({}, state, {
        sceneCollection: _sceneCollection,
        type: action.payload.type,
        numScenes: action.payload.numScenes,
        loadingScenes: action.payload.loadingScenes
      })

    case REQUEST_SCENES:
      return Object.assign({}, state, {
        loadingScenes: action.payload.loadingScenes
      })

    case ACTIVATE_ONLY_SCENE:
      return Object.assign({}, state, {
        // replace active scenes with a single scene ID
        activeScenes: [action.payload.id]
      })

    case ACTIVATE_SCENE:
      return Object.assign({}, state, {
        // combines activeScenes[] with one or more additional scene IDs, removes dupes, removes null/undefined
        activeScenes: _.uniq(_.concat(state.activeScenes, action.payload.id))
          .filter(val => (!_.isNull(val) && !_.isUndefined(val)))
      })

    case DEACTIVATE_SCENE:
      return Object.assign({}, state, {
        // removes one or more scene IDs from activeScenes[], removes dupes, removes null/undefined
        activeScenes: _.uniq(_.without.apply(null, _.concat([state.activeScenes], action.payload.id)))
          .filter(val => (!_.isNull(val) && !_.isUndefined(val)))
      })

    default:
      return state
  }
}
