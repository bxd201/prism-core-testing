// @flow
import { MAX_SCENE_HEIGHT, SET_INITIALIZING_FACET_ID } from '../actions/system'

export const maxSceneHeight = (state: number = 0, action: {type: string, payload: number}) => {
  if (action.type === MAX_SCENE_HEIGHT) {
    return action.payload
  }
  return state
}

export const initializingFacetId = (state: string | null = null, action: { type: string, payload: string | null}) => {
  if (action.type === SET_INITIALIZING_FACET_ID) {
    return action.payload
  }

  return state
}
