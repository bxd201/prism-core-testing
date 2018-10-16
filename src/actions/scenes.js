// @flow
import type { Color } from '../shared/types/Colors'

export const COLOR_SELECTED: string = 'COLOR_SELECTED'
export const selectColor = (colorObj: Color) => {
  return {
    type: COLOR_SELECTED,
    payload: { color: colorObj }
  }
}

export const SELECT_SCENE: string = 'SELECT_SCENE'
// TODO: Create type for scene
export const selectScene = (scene: any) => {
  return {
    type: SELECT_SCENE,
    payload: { scene }
  }
}
