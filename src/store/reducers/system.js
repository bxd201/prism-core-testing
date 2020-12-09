// @flow
import { MAX_SCENE_HEIGHT, SET_TOOLTIPS_POSITION } from '../actions/system'

export const maxSceneHeight = (state: number = 0, action: {type: string, payload: number}) => {
  if (action.type === MAX_SCENE_HEIGHT) {
    return action.payload
  }
  return state
}

export const toolTipsPosition = (state: number = 0, action: {type: string, payload: number}) => {
  if (action.type === SET_TOOLTIPS_POSITION) {
    return action.payload
  }
  return state
}
