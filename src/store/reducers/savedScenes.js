// @flow
import { DELETE_SAVED_SCENE, LOADED_SAVED_SCENES_METADATA, SELECTED_SAVED_SCENE, SAVED_REGIONS_UNPICKLED } from '../actions/persistScene'
// @todo - test payload: [{ name: 'foo', id: 1 }, { name: 'bar', id: 2 }, { name: 'baz', id: 3 }, { name: 'bez', id: 42 }] -RS
export const legacySavedScenesMetadata = (state: Object[] = [], action: { type: string, payload: Object }) => {
  if (action.type === DELETE_SAVED_SCENE) {
    const newState = state.filter(scene => scene.id !== action.payload)

    return newState
  }

  if (action.type === LOADED_SAVED_SCENES_METADATA) {
    return action.payload
  }
  // @todo maybe I should place case here to clear this when regions are unpickled -RS
  return state
}

export const selectedSavedSceneId = (state: string | null = null, action: { type: string, payload: string | null }) => {
  if (action.type === SELECTED_SAVED_SCENE) {
    return action.payload
  }

  return state
}

export const scenesAndRegions = (state: Object[] = [], action: {type: string, payload: Object[] | null}) => {
  if (action.type === SAVED_REGIONS_UNPICKLED) {
    return action.payload
  }

  return state
}
