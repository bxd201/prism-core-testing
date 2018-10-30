// @flow
import _ from 'lodash'

import {
  SELECT_SCENE,
  RECEIVE_SCENES,
  REQUEST_SCENES,
  ACTIVATE_SCENE,
  DEACTIVATE_SCENE
} from '../actions/scenes'

export const initialState: Object = {
  scenes: [],
  scene: void (0),
  numScenes: 0,
  loadingScenes: true,
  activeScenes: []
}

export const scenes = (state: Object = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case SELECT_SCENE:
      return Object.assign({}, state, {
        scene: action.payload.scene
      })

    case RECEIVE_SCENES:
      return Object.assign({}, state, {
        scenes: action.payload.scenes,
        numScenes: action.payload.numScenes,
        loadingScenes: action.payload.loadingScenes
      })

    case REQUEST_SCENES:
      return Object.assign({}, state, {
        loadingScenes: action.payload.loadingScenes
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
