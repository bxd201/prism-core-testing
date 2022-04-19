// @flow
import { SAVED_SCENE_READY_FOR_PAINT, SAVED_SCENE_REMOVED, SAVE_INIT_WORKSPACE } from '../actions/paintScene'
import type { PaintSceneWorkspace } from '../actions/paintScene'

export const paintSceneWorkspace = (state: Object | null = null, action: { type: string, payload: PaintSceneWorkspace | null }) => {
  if (action.type === SAVED_SCENE_READY_FOR_PAINT) {
    return { ...state, ...action.payload }
  }

  // Remove is scene deleted
  if (action.type === SAVED_SCENE_REMOVED) {
    return null
  }

  if (action.type === SAVE_INIT_WORKSPACE) {
    return { ...state, originWorkspace: action.payload }
  }

  return state
}
