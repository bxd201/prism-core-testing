// @flow
import type { Color } from '../shared/types/Colors'

export const ADD_LP_COLOR: string = 'ADD_LP_COLOR'
export const add = (colorObj: Color) => {
  return {
    type: ADD_LP_COLOR,
    payload: { color: colorObj }
  }
}

export const REMOVE_LP_COLOR: string = 'REMOVE_LP_COLOR'
export const remove = (colorId: Number) => {
  return {
    type: REMOVE_LP_COLOR,
    payload: { colorId: colorId }
  }
}
