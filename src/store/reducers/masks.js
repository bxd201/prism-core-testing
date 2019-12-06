// @flow

import { SAVING_MASKS, DONE_SAVING_MASKS } from '../actions/paintScene'

export const savingMasks = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === SAVING_MASKS || action.type === DONE_SAVING_MASKS) {
    return action.payload
  }

  return state
}
