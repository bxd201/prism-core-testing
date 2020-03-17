// @flow
import { MODAL_HEIGHT, REFRESH_MODAL_HEIGHT } from '../actions/modal'

export const modalHeight = (state: number = 0, action: { type: string, payload: number }) => {
  if (action.type === MODAL_HEIGHT) {
    return action.payload
  }

  return state
}

export const refreshModalHeight = (state: boolean = false, action: { type: string, payload: boolean }) => {
  if (action.type === REFRESH_MODAL_HEIGHT) {
    return action.payload
  }

  return state
}
