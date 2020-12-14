// @flow
export const MAX_SCENE_HEIGHT = 'MAX_SCENE_HEIGHT'
export const setMaxSceneHeight = (height: number) => {
  return {
    type: MAX_SCENE_HEIGHT,
    payload: height
  }
}

export const SET_TOOLTIPS_POSITION = 'SET_TOOLTIPS_POSITION'
export const setTooltipsPosition = (tipsPosition: number) => {
  const payload = {
    type: SET_TOOLTIPS_POSITION,
    payload: tipsPosition
  }
  return payload
}
