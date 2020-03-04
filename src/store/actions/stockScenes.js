// @flow
import { SCENE_TYPE } from './persistScene'

export const SAVING_STOCK_SCENE = 'SAVING_STOCK_SCENE'
export const SAVE_ANON_STOCK_SCENE = 'SAVE_ANON_STOCK_SCENE'
export const SAVE_STOCK_SCENE = 'SAVE_STOCK_SCENE'
export const SELECT_ANON_STOCK_SCENE = 'SELECT_ANON_STOCK_SCENE'

export const saveStockScene = (id: string, sceneName: string, sceneData: object, sceneType: string) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVING_STOCK_SCENE,
      payload: true
    })

    if (FIREBASE_AUTH_ENABLED) {
      dispatch(anonSaveStockScene(id, sceneName, sceneData, sceneType))
    } else {
      // @todo [IMPLEMENT] mysherwin save -RS
    }
  }
}

/**
 *
 * @param id - used to uniquely identify items specifically for updates
 * @param sceneData - this is used to determine if this is a type of stock or custom scene
 * @param sceneFetchType - This is used in in cases where scenes need to be loaded
 * @returns {{payload: {sceneType: string, id: string, sceneFetchType: string, scene: Object}, type: string}}
 */
const anonSaveStockScene = (id: string, sceneName: string, sceneData: Object, sceneFetchType: string) => {
  const payload = {
    type: SAVE_ANON_STOCK_SCENE,
    payload: {
      id,
      scene: sceneData,
      sceneFetchType,
      name: sceneName,
      sceneType: SCENE_TYPE.anonStock
    }
  }

  return payload
}

export const selectSavedAnonStockScene = (id: string) => {
  return {
    type: SELECT_ANON_STOCK_SCENE,
    payload: id
  }
}
