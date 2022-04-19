// @flow
export const SET_MODAL_INFO = 'SET_MODAL_INFO'
export const setModalInfo = (info: object) => {
  return {
    type: SET_MODAL_INFO,
    payload: info
  }
}

export const UPDATE_PAINT_SCENE_PREVIEW = 'UPDATE_PAINT_SCENE_PREVIEW'
export const updatePaintScenePreview = (payload) => {
  return {
    type: UPDATE_PAINT_SCENE_PREVIEW,
    payload: payload
  }
}

export const DISPLAY_GLOBAL_MODAL = 'DISPLAY_GLOBAL_MODAL'
export const displayGlobalModal = () => {
  return {
    type: DISPLAY_GLOBAL_MODAL
  }
}

export const HIDE_GLOBAL_MODAL = 'DISPLAY_GLOBAL_MODAL'
export const hideGlobalModal = () => {
  return {
    type: HIDE_GLOBAL_MODAL
  }
}

export const SET_MODAL_THUMBNAIL_COLOR = 'SET_MODAL_THUMBNAIL_COLOR'
export const setModalThumbnailColor = (color) => {
  return {
    type: SET_MODAL_THUMBNAIL_COLOR,
    payload: color
  }
}
