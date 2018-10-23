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

export const ACTIVATE_LP_COLOR: string = 'ACTIVATE_LP_COLOR'
export const activate = (colorObj: Color) => {
  return {
    type: ACTIVATE_LP_COLOR,
    payload: { color: colorObj }
  }
}

export const ACTIVATE_LP_PREVIEW_COLOR: string = 'ACTIVATE_LP_PREVIEW_COLOR'
export const activatePreview = (colorObj: Color) => {
  return {
    type: ACTIVATE_LP_PREVIEW_COLOR,
    payload: { color: colorObj }
  }
}

export const REORDER_LP_COLORS: string = 'REORDER_LP_COLORS'
export const reorder = (colors: Array<Number>) => {
  return {
    type: REORDER_LP_COLORS,
    payload: { colorsByIndex: colors }
  }
}
