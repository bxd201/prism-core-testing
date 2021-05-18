
import { setModalInfo } from '../../store/actions/globalModal'
import { HANDLE_NAVIGATION_INTENT_CONFIRM, HANDLE_NAVIGATION_INTENT_CANCEL, HANDLE_DIRTY_NAVIGATION_INTENT_CONFIRM, HANDLE_DELETE_MY_PREVIEW_CONFIRM,
  HANDLE_DIRTY_NAVIGATION_INTENT_CANCEL, HANDLE_SELECT_PALETTE_CONFIRM, HIDE_MODAL, DANGER, PRIMARY } from './constants.js'

export const createNavigationWarningModal = (intl, dispatch, modalType, isDirtyNavigation) => {
  const CONFIRM_CALLBACK = isDirtyNavigation ? HANDLE_DIRTY_NAVIGATION_INTENT_CONFIRM : HANDLE_NAVIGATION_INTENT_CONFIRM
  const CANCEL_CALLBACK = isDirtyNavigation ? HANDLE_DIRTY_NAVIGATION_INTENT_CANCEL : HANDLE_NAVIGATION_INTENT_CANCEL
  dispatch(setModalInfo({
    shouldDisplayModal: true,
    description: intl.formatMessage({ id: 'CVW.WARNING_REPLACEMENT' }),
    actions: [
      { text: intl.formatMessage({ id: 'YES' }), callback: CONFIRM_CALLBACK },
      { text: intl.formatMessage({ id: 'NO' }), callback: CANCEL_CALLBACK }
    ],
    allowInput: false,
    modalType: modalType,
    styleType: DANGER
  }))
}

// deprecate and push logic into save option to encapsulate. We need slightly different logic.
// for paintscene this should trigger a signal to publish the layers and flow into show modal,
// @todo refactor to only include needed data: button messages, savetype and modal type.  This object can be constructed in the component -RS
export const createSaveSceneModal = (intl, dispatch, modalType, saveType) => {
  dispatch(setModalInfo({
    shouldDisplayModal: true,
    actions: [
      { text: intl.formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.SAVE' }), callback: saveType },
      { text: intl.formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.CANCEL' }), callback: HIDE_MODAL }
    ],
    allowInput: true,
    layers: [],
    showLivePalette: true,
    modalType: modalType,
    styleType: PRIMARY
  }))
}

export const createConfirmSavedModal = (intl, dispatch, saveType) => {
  dispatch(setModalInfo({
    shouldDisplayModal: true,
    actions: [
      { text: intl.formatMessage({ id: 'SCENE_MANAGER.OK' }), callback: HIDE_MODAL }
    ],
    description: intl.formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.LP_SAVED' }),
    allowInput: false,
    layers: [],
    showLivePalette: false,
    styleType: PRIMARY
  }))
}

export const createModalForEmptyLivePalette = (intl, dispatch, modalType, isScenePage) => {
  const description = isScenePage ? intl.formatMessage({ id: 'SAVE_SCENE_MODAL.UNABLE_TO_SAVE_WARNING' }) : intl.formatMessage({ id: 'SAVE_LIVE_PALETTE_MODAL.UNABLE_TO_SAVE_WARNING' })
  dispatch(setModalInfo({
    shouldDisplayModal: true,
    actions: [
      { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: HIDE_MODAL }
    ],
    description: description,
    allowInput: false,
    layers: [],
    showLivePalette: false,
    modalType: modalType,
    styleType: PRIMARY
  }))
}

export const createSelectPaletteModal = (intl, dispatch, modalType) => {
  dispatch(setModalInfo({
    shouldDisplayModal: true,
    title: intl.formatMessage({ id: 'PAINT_SCENE.SELECT_PALETTE_TITLE' }),
    actions: [{ text: intl.formatMessage({ id: 'PAINT_SCENE.OK' }), callback: HANDLE_SELECT_PALETTE_CONFIRM },
      { text: intl.formatMessage({ id: 'PAINT_SCENE.CANCEL' }), callback: HIDE_MODAL }
    ],
    description: intl.formatMessage({ id: 'PAINT_SCENE.SELECT_PALETTE_DESC' }),
    allowInput: false,
    layers: [],
    showLivePalette: false,
    modalType: modalType,
    styleType: PRIMARY
  }))
}

export const createDeleteMyIdeasModal = (intl, dispatch, modalType, params) => {
  dispatch(setModalInfo({
    shouldDisplayModal: true,
    description: intl.formatMessage({ id: 'MY_IDEAS.DELETE_CONFIRM' }),
    actions: [
      { text: intl.formatMessage({ id: 'MY_IDEAS.YES' }), callback: HANDLE_DELETE_MY_PREVIEW_CONFIRM, params: params },
      { text: intl.formatMessage({ id: 'MY_IDEAS.NO' }), callback: HIDE_MODAL }
    ],
    allowInput: false,
    modalType: modalType,
    styleType: DANGER
  }))
}
