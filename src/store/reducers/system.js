// @flow
import { MAX_SCENE_HEIGHT } from '../actions/system'

export const maxSceneHeight = (state: number = 0, action: {type: string, payload: number}) => {
  if (action.type === MAX_SCENE_HEIGHT) {
    return action.payload
  }

  return state
}
