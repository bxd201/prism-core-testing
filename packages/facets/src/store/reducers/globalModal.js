// @flow
import cloneDeep from 'lodash/cloneDeep'
import { DISPLAY_GLOBAL_MODAL, HIDE_GLOBAL_MODAL, SET_MODAL_INFO, SET_MODAL_THUMBNAIL_COLOR,UPDATE_PAINT_SCENE_PREVIEW } from '../actions/globalModal'

type State = {
  actions: Array
}

// eslint-disable-next-line no-unused-vars
const initialState: State = {
  actions: null,
  shouldDisplayModal: false,
  title: '',
  description: '',
  modalType: '',
  showLivePalette: false,
  layers: null
}

// @todo revisit this, i think we need to make modals rerender always.  Investigate the iuupdate paint scene preview... -RS
export const modalInfo = (state: Object | null = null, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case SET_MODAL_INFO:
      const {
        uid,
        actions,
        shouldDisplayModal,
        description,
        title,
        modalType,
        showLivePalette,
        allowInput,
        styleType,
        layers
      } = action.payload

      return {
        ...initialState,
        uid,
        actions,
        shouldDisplayModal,
        description,
        title,
        modalType,
        showLivePalette,
        allowInput,
        styleType,
        layers
      }
    case UPDATE_PAINT_SCENE_PREVIEW:
      const stateCopyForLayers = cloneDeep(state)
      stateCopyForLayers.layers = action.payload.layers
      return stateCopyForLayers
    case HIDE_GLOBAL_MODAL:
      return null
    case DISPLAY_GLOBAL_MODAL:
      const newState = cloneDeep(state)
      newState.shouldDisplayModal = action.payload.shouldDisplayModal
      return newState
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
