// @flow
import type { Color } from '../../shared/types/Colors.js.flow'

export const ADD_LP_COLOR: string = 'ADD_LP_COLOR'
export const add = (colorObj: Color) => {
  return {
    type: ADD_LP_COLOR,
    payload: { color: colorObj }
  }
}

export const TOGGLE_LP_COMPARE_COLOR: string = 'TOGGLE_LP_COMPARE_COLOR'
export const toggleCompareColor = (isClose: boolean = false) => {
  return {
    type: TOGGLE_LP_COMPARE_COLOR,
    payload: isClose
  }
}

export const CANCEL_ADD_COLOR: string = 'CANCEL_ADD_COLOR'
export const cancel = () => {
  return {
    type: CANCEL_ADD_COLOR
  }
}

export const EMPTY_LP_COLOR: string = 'EMPTY_LP_COLOR'
export const empty = () => {
  return {
    type: EMPTY_LP_COLOR
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

export const EDIT_LP_COMPARE_COLOR: string = 'EDIT_LP_COLOR'
export const editCompareColor = (colorId: Number) => {
  return {
    type: EDIT_LP_COMPARE_COLOR,
    payload: { colorId: colorId }
  }
}

export const REORDER_LP_COLORS: string = 'REORDER_LP_COLORS'
export const reorder = (colors: Array<Number>) => {
  return {
    type: REORDER_LP_COLORS,
    payload: { colorsByIndex: colors }
  }
}

export const REPLACE_LP_COLORS = 'REPLACE_LP_COLORS'
export const replaceLpColors = (colors: Object[]) => {
  return {
    type: REPLACE_LP_COLORS,
    payload: colors.map(color => {
      return { ...color }
    })
  }
}

export const MERGE_LP_COLORS = 'MERGE_LP_COLORS'
export const mergeLpColors = (colors: Object[]) => {
  return {
    type: MERGE_LP_COLORS,
    payload: colors.map(color => {
      return { ...color }
    })
  }
}
