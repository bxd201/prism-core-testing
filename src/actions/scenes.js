// @flow

export const SELECT_SCENE: string = 'SELECT_SCENE'
// TODO: Create type for scene
export const selectScene = (scene: any) => {
  return {
    type: SELECT_SCENE,
    payload: { scene }
  }
}
