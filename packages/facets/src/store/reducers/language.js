// @flow
import { SET_LANGUAGE } from '../actions/language'

type State = {
  current: string | typeof undefined
}

const initialState: State = {
  current: undefined
}

export const language = (state: Object = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, {
        current: action.payload
      })

    default:
      return state
  }
}
