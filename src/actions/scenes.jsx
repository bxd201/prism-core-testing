export const COLOR_SELECTED = 'COLOR_SELECTED'
export const selectColor = (colorObj) => {
  return {
    type: COLOR_SELECTED,
    payload: { color: colorObj }
  }
}

export const SELECT_SCENE = 'SELECT_SCENE'
export const selectScene = (scene) => {
  return {
    type: SELECT_SCENE,
    payload: { scene }
  }
}
