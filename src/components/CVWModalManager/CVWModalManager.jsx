// @flow
import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import MergeCanvas from '../MergeCanvas/MergeCanvas'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import { clearNavigationIntent, navigateToIntendedDestination,
  ACTIVE_SCENE_LABELS_ENUM, setDirtyNavigationIntent,
  setIsColorWallModallyPresented,
  setIsScenePolluted } from '../../store/actions/navigation'
import { saveStockScene, deleteStockScene } from '../../store/actions/stockScenes'
import { startSavingMasks, deleteSavedScene, SCENE_TYPE } from '../../store/actions/persistScene'
import { saveLivePalette, deleteSavedLivePalette } from '../../store/actions/saveLivePalette'
import { hideGlobalModal } from '../../store/actions/globalModal'
import { replaceLpColors } from '../../store/actions/live-palette'
import { Modal } from './Modal'
import { SAVE_OPTION, HIDE_MODAL, HANDLE_NAVIGATION_INTENT_CONFIRM,
  HANDLE_NAVIGATION_INTENT_CANCEL, HANDLE_DIRTY_NAVIGATION_INTENT_CONFIRM,
  HANDLE_DIRTY_NAVIGATION_INTENT_CANCEL, HANDLE_SELECT_PALETTE_CONFIRM,
  HANDLE_DELETE_MY_PREVIEW_CONFIRM } from './constants.js'
import { getColorInstances } from '../LivePalette/livePaletteUtility'
import { createConfirmSavedModal } from './createModal'
import { useIntl } from 'react-intl'

export const globalModalClassName = 'global-modal'
export const globalModalPreviewImageClassName = `${globalModalClassName}__preview-image`

export const PreviewImage = () => {
  const modalInfo = useSelector((store) => store.modalInfo)
  const selectedSceneUid = useSelector((store) => store.selectedSceneUid)
  const surfaceColors = useSelector(state => state.modalThumbnailColor)
  const lpColors = useSelector((store) => store.lp.colors)
  const scenes = useSelector((store) => store.variantsCollection)
  const mergeCanvasRef = useRef(null)

  const getStockScenePreviewData = (showLivePalette) => {
    const currentSceneData = scenes?.find(item => item.sceneUid === selectedSceneUid)
    const livePaletteColorsDiv = lpColors.filter(color => !!color).map((color, i) => {
      const { red, green, blue } = color
      return (
        <div
          key={i}
          style={{ backgroundColor: `rgb(${red},${green},${blue})`, flexGrow: '1', borderLeft: (i > 0) ? '1px solid #ffffff' : 'none' }}>
          &nbsp;
        </div>
      )
    })

    return <>
      {currentSceneData && <div style={{ maxHeight: '66px' }}><SingleTintableSceneView surfaceColorsFromParents={surfaceColors} selectedSceneUID={selectedSceneUid} allowVariantSwitch={false} interactive={false} /></div>}
      {showLivePalette && <div style={{ display: 'flex', marginTop: '1px' }}>{livePaletteColorsDiv}</div>}
    </>
  }

  const getPaintScenePreviewData = (showLivePalette) => {
    const livePaletteColorsDiv = lpColors.filter(color => !!color).map((color, i) => {
      const { red, green, blue } = color
      return (
        <div
          key={i}
          style={{ backgroundColor: `rgb(${red},${green},${blue})`, flexGrow: '1', borderLeft: (i > 0) ? '1px solid #ffffff' : 'none' }}>
          &nbsp;
        </div>
      )
    })

    return <>
      <div style={{ height: '64px' }}>
        <MergeCanvas
          ref={mergeCanvasRef}
          layers={modalInfo?.layers}
          width={110}
          height={64}
          colorOpacity={0.8}
        />
      </div>
      {showLivePalette && <div style={{ display: 'flex', marginTop: '1px' }}>{livePaletteColorsDiv}</div>}
    </>
  }

  const getLivePalettePreviewData = () => {
    const livePaletteColorsDiv = lpColors.filter(color => !!color).map((color, i) => {
      const { red, green, blue } = color
      return (
        <div
          key={i}
          style={{ backgroundColor: `rgb(${red},${green},${blue})`, flexGrow: '1', borderLeft: (i > 0) ? '1px solid #ffffff' : 'none' }}>
          &nbsp;
        </div>
      )
    })

    return <>
      <div style={{ display: 'flex', marginTop: '1px', height: '84px' }}>{livePaletteColorsDiv}</div>
    </>
  }

  return (
    <>
      {modalInfo?.modalType === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE && <div className={globalModalPreviewImageClassName}>{getStockScenePreviewData(modalInfo?.showLivePalette)}</div>}
      {modalInfo?.modalType === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE && <div className={globalModalPreviewImageClassName}>{getPaintScenePreviewData(modalInfo?.showLivePalette)}</div>}
      {modalInfo?.modalType === ACTIVE_SCENE_LABELS_ENUM.LIVE_PALETTE && <div className={globalModalPreviewImageClassName}>{getLivePalettePreviewData(modalInfo?.showLivePalette)}</div>}
    </>)
}

export const CVWModalManager = () => {
  const modalInfo = useSelector((store) => store.modalInfo)
  const storeScenes = useSelector((store) => store.scenes)
  const lpColors = useSelector((store) => store.lp.colors)
  const dirtyNavIntent = useSelector(store => store.dirtyNavigationIntent)
  const selectedScenes = useSelector(store => {
    const { items: { colorMap } }: ColorMap = store.colors
    if (store.selectedSavedLivePaletteId) {
      const expectSavedLivePaletteData = store.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.livePalette && item.id === store.selectedSavedLivePaletteId)
      const livePalette = getColorInstances(null, expectSavedLivePaletteData.livePaletteColorsIdArray, colorMap)
      return { ...expectSavedLivePaletteData, livePalette, savedSceneType: SCENE_TYPE.livePalette }
    }
  })
  const sceneStatus = storeScenes.sceneStatus[storeScenes.type]
  const intl = useIntl()
  const dispatch = useDispatch()
  const btnRefList = useRef([])
  const history = useHistory()
  btnRefList.current = []
  const { shouldDisplayModal, actions, styleType, title, description, allowInput } = modalInfo
  const [inputValue, setInputValue] = useState('')

  const createCallbackFromActionName = (callbackName) => {
    switch (callbackName) {
      case SAVE_OPTION.SAVE_STOCK_SCENE:
        if (modalInfo?.allowInput) {
          return (e: SyntheticEvent) => saveStockSceneFromModal(e, inputValue)
        }
      case SAVE_OPTION.SAVE_PAINT_SCENE: {
        if (modalInfo?.allowInput) {
          return (e: SyntheticEvent) => savePaintSceneFromModal(e, inputValue)
        }
      }
      case SAVE_OPTION.SAVE_LIVE_PALETTE: {
        if (modalInfo?.allowInput) {
          return (e: SyntheticEvent) => saveLivePaletteColorsFromModal(e, inputValue)
        }
      }
      case HANDLE_NAVIGATION_INTENT_CONFIRM: {
        return (e) => handleNavigationIntentConfirm(e)
      }
      case HANDLE_NAVIGATION_INTENT_CANCEL: {
        return (e) => handleNavigationIntentCancel(e)
      }
      case HANDLE_DIRTY_NAVIGATION_INTENT_CONFIRM: {
        return (e) => handleDirtyNavigationIntentConfirm(e)
      }
      case HANDLE_DIRTY_NAVIGATION_INTENT_CANCEL: {
        return (e) => handleDirtyNavigationIntentCancel(e)
      }
      case HANDLE_SELECT_PALETTE_CONFIRM: {
        return (e) => handleSelectPaletteConfrim(e)
      }
      case HANDLE_DELETE_MY_PREVIEW_CONFIRM: {
        return (e) => handleDeleteMyPreviewConfrim(e)
      }
      case HIDE_MODAL: {
        return () => hideModal()
      }
      default:
        return () => {}
    }
  }

  const saveLivePaletteColorsFromModal = (e: SyntheticEvent, inputValue: string) => {
    let livePaletteColorsIdArray = []
    lpColors && lpColors.map(color => {
      livePaletteColorsIdArray.push(color.id)
    })
    hideModal()
    dispatch(saveLivePalette(createUniqueSceneId(), inputValue, livePaletteColorsIdArray))
    createConfirmSavedModal(intl, dispatch)
  }

  const saveStockSceneFromModal = (e: SyntheticEvent, saveSceneName: string) => {
    const uniqId = createUniqueSceneId()
    e.preventDefault()
    e.stopPropagation()
    if (saveSceneName.trim() === '') {
      return false
    }
    if (sceneStatus && storeScenes?.activeScenes) {
      // @todo should I throw an error if no active scene or is this over kill? -RS
      const currentSceneData = sceneStatus.find(item => item.id === storeScenes.activeScenes[0])
      let livePaletteColorsIdArray = []
      lpColors && lpColors.map(color => {
        livePaletteColorsIdArray.push(color.id)
      })
      hideModal()
      dispatch(saveStockScene(uniqId, saveSceneName, currentSceneData, storeScenes.type, livePaletteColorsIdArray))
      createConfirmSavedModal(intl, dispatch)
    }
  }

  const savePaintSceneFromModal = (e: SyntheticEvent, sceneName: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (sceneName.trim() === '') {
      return false
    }
    hideModal()
    dispatch(startSavingMasks(sceneName))
    createConfirmSavedModal(intl, dispatch)
  }

  const handleDirtyNavigationIntentConfirm = (e: SyntheticEvent) => {
    e.stopPropagation()
    history.push(dirtyNavIntent)
    hideModal()
    // clean up the one set by the nav click when one was already set
    dispatch(setDirtyNavigationIntent())
    // clean up the original, this should be the value set from the return path
    dispatch(clearNavigationIntent())
    // Allow add color button to respond again
    dispatch(setIsColorWallModallyPresented(false))
    dispatch(setIsScenePolluted())
  }

  const handleDirtyNavigationIntentCancel = (e: SyntheticEvent) => {
    e.stopPropagation()
    hideModal()
    dispatch(setDirtyNavigationIntent())
  }

  const handleNavigationIntentConfirm = (e: SyntheticEvent) => {
    e.stopPropagation()
    hideModal()
    dispatch(navigateToIntendedDestination())
  }

  const handleNavigationIntentCancel = (e: SyntheticEvent) => {
    e.stopPropagation()
    hideModal()
    dispatch(clearNavigationIntent())
  }

  const handleSelectPaletteConfrim = (e: SyntheticEvent) => {
    dispatch(replaceLpColors(selectedScenes.livePalette))
    hideModal()
  }

  const handleDeleteMyPreviewConfrim = (e: SyntheticEvent) => {
    const { isLivePaletteIdea, isStockScene, sceneId } = actions[0].params
    if (isLivePaletteIdea) {
      dispatch(deleteSavedLivePalette(sceneId))
    } else if (isStockScene) {
      dispatch(deleteStockScene(sceneId))
    } else {
      dispatch(deleteSavedScene(sceneId))
    }
    hideModal()
  }

  const hideModal = () => {
    dispatch(hideGlobalModal())
  }

  return (
    <React.Fragment>
      <Modal
        shouldDisplayModal={shouldDisplayModal}
        previewImage={modalInfo?.modalType !== ACTIVE_SCENE_LABELS_ENUM.EMPTY_SCENE ? <PreviewImage /> : null}
        styleType={styleType}
        title={title}
        description={description}
        allowInput={allowInput}
        actions={actions}
        fn={createCallbackFromActionName}
        setInputValue={setInputValue}
      />
    </React.Fragment>
  )
}
