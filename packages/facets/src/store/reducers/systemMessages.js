
// @flow

import { ADD_SYSTEM_MESSAGE, REMOVE_SYSTEM_MESSAGE } from '../actions/systemMessages'

type SystemMessage = {
  messageBody: string,
  messageType: string,
  id: string
}

export const systemMessages = (state = [], action: { type: string, payload: SystemMessage[], metadata: ?string }) => {
  if (action.type === ADD_SYSTEM_MESSAGE) {
    return [ ...state, ...action.payload ]
  }

  if (action.type === REMOVE_SYSTEM_MESSAGE) {
    return state.filter(item => action.metadata !== item.id)
  }

  return state
}
