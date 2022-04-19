// @flow
import type { Color } from '../../shared/types/Colors.js.flow'
import { SCENE_TYPE } from './persistScene'
export const SAVE_LIVE_PALETTE: string = 'SAVE_LIVE_PALETTE'
export const saveLivePalette = (id: string, name: string, livePaletteColorsIdArray: Array<Color>) => {
  return {
    type: SAVE_LIVE_PALETTE,
    payload: {
      id,
      name,
      livePaletteColorsIdArray,
      sceneType: SCENE_TYPE.livePalette,
      updated: Date.now()
    }
  }
}

export const UPDATE_LIVE_PALETTE: string = 'UPDATE_LIVE_PALETTE'
export const updateLivePalette = (id: string, name: string) => {
  return {
    type: UPDATE_LIVE_PALETTE,
    payload: {
      id,
      name,
      updated: Date.now()
    }
  }
}

export const DELETE_SAVED_LIVE_PALETTE: string = 'DELETE_SAVED_LIVE_PALETTE'
export const deleteSavedLivePalette = (id: string) => {
  return {
    type: DELETE_SAVED_LIVE_PALETTE,
    payload: {
      id
    }
  }
}

export const SELECTED_SAVED_LIVE_PALETTE: string = 'SELECTED_SAVED_LIVE_PALETTE'
export const selectedSavedLivePalette = (id: string) => {
  return {
    type: SELECTED_SAVED_LIVE_PALETTE,
    payload: id
  }
}
