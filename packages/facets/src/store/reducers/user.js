// @flow
import { USER_LOADED } from '../actions/user'

export const user = (state: Object | null = null, action: {type: string, payload: Object}) => {
  if (action.type === USER_LOADED) {
    return action.payload
  }

  return state
}
