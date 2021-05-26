// @flow
import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import MergeCanvas from '../MergeCanvas/MergeCanvas'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import {
  clearNavigationIntent,
  ACTIVE_SCENE_LABELS_ENUM,
  setDirtyNavigationIntent,
  setIsColorWallModallyPresented,
  setIsScenePolluted, setActiveSceneLabel, setIsMatchPhotoPresented
} from '../../store/actions/navigation'
import { saveStockScene, deleteStockScene } from '../../store/actions/stockScenes'
import {
  startSavingMasks,
  deleteSavedScene,
  SCENE_TYPE,
  setShouldShowPaintSceneSavedModal
} from '../../store/actions/persistScene'
import { saveLivePalette, deleteSavedLivePalette } from '../../store/actions/saveLivePalette'
import { hideGlobalModal } from '../../store/actions/globalModal'
import { replaceLpColors } from '../../store/actions/live-palette'
import { Modal } from './Modal'
import {
  SAVE_OPTION, HIDE_MODAL, HANDLE_NAVIGATION_INTENT_CONFIRM,
  HANDLE_NAVIGATION_INTENT_CANCEL, HANDLE_DIRTY_NAVIGATION_INTENT_CONFIRM,
  HANDLE_DIRTY_NAVIGATION_INTENT_CANCEL, HANDLE_SELECT_PALETTE_CONFIRM,
  HANDLE_DELETE_MY_PREVIEW_CONFIRM, MODAL_TYPE_ENUM
} from './constants.js'
import { getColorInstances } from '../LivePalette/livePaletteUtility'
import { createSavedNotificationModal } from './createModal'
import { useIntl } from 'react-intl'
import type { PreviewImageProps } from '../../shared/types/CVWTypes'
import { clearSceneWorkspace } from '../../store/actions/paintScene'
import { setActiveSceneKey } from '../../store/actions/scenes'

export const globalModalClassName = 'global-modal'
export const globalModalPreviewImageClassName = `${globalModalClassName}__preview-image`

export const PreviewImage = ({ modalInfo, lpColors, surfaceColors, scenes, selectedSceneUid, selectedVariantName }: PreviewImageProps) => {
  const scenesCollection = useSelector((store) => store.scenesCollection)
  const mergeCanvasRef = useRef(null)
  // get the layers for paint scene save
  const paintSceneLayers = useSelector(store => store.paintSceneLayersForSave) ?? []

  const getStockScenePreviewData = (showLivePalette) => {
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
      {scenes && selectedSceneUid && selectedVariantName && <div style={{ maxHeight: '66px' }}><SingleTintableSceneView surfaceColorsFromParents={surfaceColors} variantsCollection={scenes} scenesCollection={scenesCollection} selectedVariantName={selectedVariantName} selectedSceneUid={selectedSceneUid} allowVariantSwitch={false} interactive={false} /></div>}
      {showLivePalette && <div style={{ display: 'flex', marginTop: '1px' }}>{livePaletteColorsDiv}</div>}
    </>
  }

  const getPaintScenePreviewData = (showLivePalette, layers) => {
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
          layers={layers}
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
      {modalInfo?.modalType === MODAL_TYPE_ENUM.STOCK_SCENE && <div className={globalModalPreviewImageClassName}>{getStockScenePreviewData(modalInfo?.showLivePalette)}</div>}
      {modalInfo?.modalType === MODAL_TYPE_ENUM.PAINT_SCENE && <div className={globalModalPreviewImageClassName}>{getPaintScenePreviewData(modalInfo?.showLivePalette, paintSceneLayers)}</div>}
      {modalInfo?.modalType === MODAL_TYPE_ENUM.LIVE_PALETTE && <div className={globalModalPreviewImageClassName}>{getLivePalettePreviewData(modalInfo?.showLivePalette)}</div>}
    </>)
}

export const CVWModalManager = () => {
  const modalInfo = useSelector((store) => store.modalInfo)
  const lpColors = useSelector((store) => store.lp.colors)
  const dirtyNavIntent = useSelector(store => store.dirtyNavigationIntent)
  const storeScenes = useSelector((store) => store.variantsCollection)
  const selectedSceneUid = useSelector((store) => store.selectedSceneUid)
  const sceneCount = useSelector(state => state.sceneMetadata).length + 1
  const selectedVariantName = useSelector(state => state.selectedVariantName)
  const currentSceneData = selectedVariantName ? storeScenes?.find(item => item.sceneUid === selectedSceneUid && item.variantName === selectedVariantName) : storeScenes?.find(item => item.sceneUid === selectedSceneUid)
  const surfaceColors = useSelector(state => state.modalThumbnailColor)
  const selectedScenes = useSelector(store => {
    const { items: { colorMap } }: ColorMap = store.colors
    if (store.selectedSavedLivePaletteId) {
      const expectSavedLivePaletteData = store.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.livePalette && item.id === store.selectedSavedLivePaletteId)
      const livePalette = getColorInstances(null, expectSavedLivePaletteData.livePaletteColorsIdArray, colorMap)
      return { ...expectSavedLivePaletteData, livePalette, savedSceneType: SCENE_TYPE.livePalette }
    }
  })
  const intl = useIntl()
  const dispatch = useDispatch()
  const btnRefList = useRef([])
  const history = useHistory()
  btnRefList.current = []
  const { shouldDisplayModal, actions, styleType, title, description, allowInput } = modalInfo
  const [inputValue, setInputValue] = useState(`${intl.formatMessage({ id: 'SAVE_SCENE_MODAL.DEFAULT_DESCRIPTION' })} ${sceneCount}`)
  // The following function is needed for a particular use case where if a user clear the default name of the scene being saved,
  // and close the modal, this function will reset the state with the default name
  const navigationIntent = useSelector(store => store.navigationIntent)
  const resetInputValue = () => setInputValue(`${intl.formatMessage({ id: 'SAVE_SCENE_MODAL.DEFAULT_DESCRIPTION' })} ${sceneCount}`)

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
    dispatch(createSavedNotificationModal(intl))
  }

  const saveStockSceneFromModal = (e: SyntheticEvent, saveSceneName: string) => {
    const uniqId = createUniqueSceneId()
    e.preventDefault()
    e.stopPropagation()
    if (saveSceneName.trim() === '') {
      return false
    }
    if (currentSceneData) {
      let livePaletteColorsIdArray = []
      const saveSceneData = {}
      const { variantName, sceneType, sceneId } = currentSceneData
      saveSceneData.sceneDataId = sceneId
      saveSceneData.variantName = variantName
      saveSceneData.sceneDataType = sceneType
      saveSceneData.surfaceColors = surfaceColors
      lpColors && lpColors.map(color => {
        livePaletteColorsIdArray.push(color.id)
      })
      hideModal()
      dispatch(saveStockScene(uniqId, saveSceneName, saveSceneData, sceneType, livePaletteColorsIdArray))
      dispatch(createSavedNotificationModal(intl))
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
    // remove any paint scene workspaces, this will unmount a mounted paint scene and force it to re-render as it should.
    dispatch(clearSceneWorkspace())
    dispatch(setActiveSceneKey())
    // replace by push to history and clearing
    history.push(navigationIntent)
    dispatch(clearNavigationIntent())
    dispatch(setIsScenePolluted())
    dispatch(setIsMatchPhotoPresented())
    // Setting this tells the cvw to show the stock scenes so the bottom layer isn't empty on navigate
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE))
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
    // this cleans up the redux store that programmatically tells the modal to show
    dispatch(setShouldShowPaintSceneSavedModal())
    dispatch(hideGlobalModal())
  }

  const SCREENS_WITH_PREVIEW = [MODAL_TYPE_ENUM.STOCK_SCENE, MODAL_TYPE_ENUM.PAINT_SCENE, MODAL_TYPE_ENUM.LIVE_PALETTE]

  return (
    <>
      <Modal
        shouldDisplayModal={shouldDisplayModal}
        previewImage={modalInfo.modalType && SCREENS_WITH_PREVIEW.indexOf(modalInfo.modalType) > -1
          ? <PreviewImage
            modalInfo={modalInfo}
            lpColors={lpColors}
            surfaceColors={surfaceColors}
            scenes={storeScenes}
            selectedSceneUid={selectedSceneUid}
            selectedVariantName={selectedVariantName}
          /> : null}
        styleType={styleType}
        title={title}
        description={description}
        allowInput={allowInput}
        actions={actions}
        inputValue={inputValue}
        intl={intl}
        resetInputValue={resetInputValue}
        fn={createCallbackFromActionName}
        setInputValue={setInputValue}
      />
    </>
  )
}
