// @flow

import { SAVING_MASKS } from '../actions/persistScene'

export const savingMasks = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SAVING_MASKS) {
    return action.payload
  }

  return state
}
