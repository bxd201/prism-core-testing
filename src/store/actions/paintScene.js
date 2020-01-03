
// @flow
export const SAVED_SCENE_READY_FOR_PAINT = 'SAVED_SCENE_READY_FOR_PAINT'
export const setLayersForPaintScene = (bgImageUrl: string, layers: string[], palette: Object[], width: number, height: number) => {
  const payload = {
    type: SAVED_SCENE_READY_FOR_PAINT,
    payload: {
      bgImageUrl,
      layers,
      palette,
      width,
      height
    }
  }
  return payload
}

export const SAVED_SCENE_REMOVED = 'SAVED_SCENE_REMOVED'
export const clearSceneWorkspace = () => {
  return {
    type: SAVED_SCENE_REMOVED,
    payload: null
  }
}
