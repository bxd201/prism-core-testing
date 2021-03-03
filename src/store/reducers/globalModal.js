// @flow
import { SET_MODAL_INFO, UPDATE_PAINT_SCENE_PREVIEW, HIDE_GLOBAL_MODAL, DISPLAY_GLOBAL_MODAL, SET_MODAL_THUMBNAIL_COLOR } from '../actions/globalModal'

type State = {
  actions: Array
}

const initialState: State = {
  actions: [],
  shouldDisplayModal: false,
  title: '',
  description: '',
  modalType: '',
  showLivePalette: false,
  layers: []
}

export const modalInfo = (state: Object = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case SET_MODAL_INFO:
      return Object.assign({}, state, {
        actions: action.payload?.actions,
        shouldDisplayModal: action.payload?.shouldDisplayModal,
        description: action.payload.description,
        title: action.payload?.title,
        modalType: action.payload?.modalType ? action.payload?.modalType : state.modalType,
        showLivePalette: action.payload?.showLivePalette,
        allowInput: action.payload?.allowInput,
        styleType: action.payload?.styleType
      })
    case UPDATE_PAINT_SCENE_PREVIEW:
      return Object.assign({}, state, {
        layers: action.payload?.layers
      })
    case HIDE_GLOBAL_MODAL:
      return Object.assign({}, state, {
        shouldDisplayModal: false
      })
    case DISPLAY_GLOBAL_MODAL:
      return Object.assign({}, state, {
        shouldDisplayModal: true
      })
    default:
      return state
  }
}

export const modalThumbnailColor = (state: any = null, action: {type: string, payload: any}) => {
  if (action.type === SET_MODAL_THUMBNAIL_COLOR) {
    return [...action.payload]
  }
  return state
}
