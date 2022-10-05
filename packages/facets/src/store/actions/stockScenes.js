// @flow
import type { MiniColor } from '../../shared/types/Scene'
import { SCENE_TYPE } from './persistScene'

export const SAVING_STOCK_SCENE = 'SAVING_STOCK_SCENE'
export const SAVE_ANON_STOCK_SCENE = 'SAVE_ANON_STOCK_SCENE'
export const SAVE_STOCK_SCENE = 'SAVE_STOCK_SCENE'
export const SELECT_ANON_STOCK_SCENE = 'SELECT_ANON_STOCK_SCENE'
export const DELETE_ANON_STOCK_SCENE = 'DELETE_ANON_STOCK_SCENE'
export const DELETE_STOCK_SCENE = 'DELETE_STOCK_SCENE'
export const UPDATE_STOCK_SAVED_SCENE_NAME = 'UPDATE_STOCK_SAVED_SCENE_NAME'
export const HYDRATE_STOCK_SCENE_FROM_SAVE = 'HYDRATE_STOCK_SCENE_FROM_SAVE'

export const saveStockScene = (id: string, sceneName: string, sceneData: object, sceneType: string, livePaletteColorsIdArray: Array<string>) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVING_STOCK_SCENE,
      payload: true
    })

    if (FIREBASE_AUTH_ENABLED) {
      dispatch(anonSaveStockScene(id, sceneName, sceneData, sceneType, livePaletteColorsIdArray))
    } else {
      // @todo [IMPLEMENT] mysherwin save -RS
    }
  }
}

/**
 *
 * @param id - used to uniquely identify items specifically for updates
 * @param sceneName - the name of the saved scene
 * @param sceneData - this is used to determine if this is a type of stock or custom scene
 * @param sceneFetchType - This is used in in cases where scenes need to be loaded: room. object, etc
 * @param livePaletteColorsIdArray - An array of live palette colors to save
 * @returns {{payload: {sceneType: string, id: string, sceneFetchType: string, scene: Object}, type: string}}
 */
const anonSaveStockScene = (id: string, sceneName: string, sceneData: Object, sceneFetchType: string, livePaletteColorsIdArray: string[]) => {
  const payload = {
    type: SAVE_ANON_STOCK_SCENE,
    payload: {
      id,
      scene: sceneData,
      sceneFetchType,
      name: sceneName,
      sceneType: SCENE_TYPE.anonStock,
      livePaletteColorsIdArray: livePaletteColorsIdArray,
      updated: Date.now()
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

export const deleteStockScene = (sceneId: string) => {
  if (FIREBASE_AUTH_ENABLED) {
    return {
      type: DELETE_ANON_STOCK_SCENE,
      payload: sceneId
    }
  }

  return {
    type: DELETE_STOCK_SCENE,
    payload: sceneId
  }
}

export const updateSavedStockSceneName = (sceneId: number | string, updatedSceneName: string) => {
  return (dispatch, getState) => {
    if (FIREBASE_AUTH_ENABLED) {
      dispatch({
        type: UPDATE_STOCK_SAVED_SCENE_NAME,
        payload: {
          id: sceneId,
          name: updatedSceneName
        }
      })
    } else {
      // @todo - this should make an ajax call and resolve only if the server fulfills the request
      dispatch({
        type: UPDATE_STOCK_SAVED_SCENE_NAME,
        payload: {
          id: sceneId,
          name: updatedSceneName
        }
      })
    }
  }
}

export const hydrateStockSceneFromSavedData = (variantName: string | null = null, surfaceColors: MiniColor[] | null = null) => {
  return {
    type: HYDRATE_STOCK_SCENE_FROM_SAVE,
    payload: {
      surfaceColors,
      variantName
    }
  }
}
