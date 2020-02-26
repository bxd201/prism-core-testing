// @flow

export const saveStockScene = (
  categoryId: number,
  isInterior: boolean,
  sceneDefName: string,
  sceneDefId: string,
  renderingBaseUrl: string,
  sceneId: string,
  sceneName: string,
  sceneColorPalette: Object,
  paintedSceneType: string) => {
  return (dispatch, getState) => {
    if (FIREBASE_AUTH_ENABLED) {
      anonSaveStockScene(categoryId,
        isInterior,
        sceneDefName,
        sceneDefId,
        renderingBaseUrl,
        sceneId,
        sceneName,
        sceneColorPalette,
        paintedSceneType)
    }
  }
  // @todo [IMPLEMENT] mysherwin save -RS
}

const anonSaveStockScene = (
  categoryId: number,
  isInterior: boolean,
  sceneDefName: string,
  sceneDefId: string,
  renderingBaseUrl: string,
  sceneId: string,
  sceneName: string,
  sceneColorPalette: Object,
  paintedSceneType: string) => {
  return {
    scene: {
      sceneDefinition: {
        categoryId,
        isInterior,
        name: sceneDefName,
        id: sceneDefId,
        renderingBaseUrl
      }
    },
    id: sceneId,
    name: sceneName,
    sceneColorPalette,
    paintedSceneType
  }
}
