// @flow
// import type { ColorPayload } from '../shared/types/Colors'

export const COLOR_SELECTED: string = 'COLOR_SELECTED'
export const selectColor = (colorObj: any) => {
  return {
    type: COLOR_SELECTED,
    payload: { color: colorObj }
  }
}
