// @flow
import { SAVED_SCENE_READY_FOR_PAINT, SAVED_SCENE_REMOVED } from '../actions/paintScene'

export const paintSceneWorkspace = (state: Object | null = null, action: { type: string, payload: string | null }) => {
  if (action.type === SAVED_SCENE_READY_FOR_PAINT) {
    return { ...action.payload }
  }

  if (action.type === SAVED_SCENE_REMOVED) {
    return null
  }

  return state
}
