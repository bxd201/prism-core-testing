// @flow
import { SCENE_TYPES } from '../../constants/globals'

export const SAVING_STOCK_SCENE = 'SAVING_STOCK_SCENE'
export const SAVE_ANON_STOCK_SCENE = 'SAVE_ANON_STOCK_SCENE'
export const SAVE_STOCK_SCENE = 'SAVE_STOCK_SCENE'

export const saveStockScene = (id: string, sceneData: object) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVING_STOCK_SCENE,
      payload: true
    })

    if (FIREBASE_AUTH_ENABLED) {
      dispatch(anonSaveStockScene(id, sceneData))
    } else {
      // @todo [IMPLEMENT] mysherwin save -RS
    }
  }
}

const anonSaveStockScene = (id: string, sceneData: Object) => {
  // eslint-disable-next-line no-debugger
  debugger
  const payload = {
    type: SAVE_ANON_STOCK_SCENE,
    payload: {
      id,
      scene: sceneData,
      type: SCENE_TYPES.anonStock
    }
  }

  return payload
}
