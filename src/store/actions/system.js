// @flow
export const MAX_SCENE_HEIGHT = 'MAX_SCENE_HEIGHT'
export const setMaxSceneHeight = (height: number) => {
  return {
    type: MAX_SCENE_HEIGHT,
    payload: height
  }
}
