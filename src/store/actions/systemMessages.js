// @flow

import uniqueId from 'lodash/uniqueId'

export const SYSTEM_MESSAGE_TYPES = {
  success: 'NORMAL',
  danger: 'ERROR',
  warning: 'WARNING',
  primary: 'NORMAL'
}

export const ADD_SYSTEM_MESSAGE = 'ADD_SYSTEM_MESSAGE'

export const addSystemMessage = (messageBody = '', messageType = SYSTEM_MESSAGE_TYPES.primary, errorKey: ?string) => {
  return {
    type: ADD_SYSTEM_MESSAGE,
    payload: [{
      messageBody,
      messageType,
      id: uniqueId(),
      errorKey
    }]
  }
}

export const REMOVE_SYSTEM_MESSAGE = 'REMOVE_SYSTEM_MESSAGE'
export const removeSystemMessage = (id: string) => {
  return {
    type: REMOVE_SYSTEM_MESSAGE,
    metadata: id
  }
}
