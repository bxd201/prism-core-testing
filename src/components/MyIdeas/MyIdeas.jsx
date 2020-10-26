// @flow

import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl, FormattedMessage } from 'react-intl'
import { deleteSavedScene, selectSavedScene, loadSavedScenes, showDeleteConfirmModal, SCENE_TYPE } from '../../store/actions/persistScene'
import { deleteSavedLivePalette, updateLivePalette, selectedSavedLivePalette } from '../../store/actions/saveLivePalette'
import SavedScene from './SavedScene'
import useSceneData from '../../shared/hooks/useSceneData'
import Carousel from '../Carousel/Carousel'
import './MyIdeas.scss'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import EditSavedScene from './EditSavedScene'
import { deleteStockScene, selectSavedAnonStockScene } from '../../store/actions/stockScenes'
import DynamicModal, { DYNAMIC_MODAL_STYLE } from '../DynamicModal/DynamicModal'
import ColorPalette from '../MyIdeaPreview/ColorPalette'
import { getColorInstances } from '../LivePalette/livePaletteUtility'
import EditColorPalette from '../MyIdeaPreview/EditColorPalette'

const baseClassName = 'myideas-wrapper'
const buttonClassName = `${baseClassName}__button`
const buttonBack = `${baseClassName}__button-back`
const backText = `${baseClassName}__back-text`
const buttonSvg = `${buttonClassName}__button-svg`
const sectionClassName = `${baseClassName}__section`
const savedScenesWrapper = `${baseClassName}__saved-scenes-wrapper`
const savedScenesWrapperShow = `${savedScenesWrapper}--show`
const savedScenesWrapperHide = `${savedScenesWrapper}--hide`
const sectionLeftClassName = `${sectionClassName}--left`
const sectionNoIdeasMessage = `${sectionClassName}__no-ideas-message`
const loaderClassName = `${baseClassName}__waiting`

type MyIdeasProps = {
  brandId: string,
  setCardTitle: Function
}

const MyIdeas = (props: MyIdeasProps) => {
  const savedScenes = useSelector(state => state.scenesAndRegions)
  const [stockScenes, setStockScenes] = useState(null)
  const sceneMetadata = useSelector(state => state.sceneMetadata)
  const isLoadingSavedScenes = useSelector(state => state.isLoadingSavedScene)
  const colorMap = useSelector(state => state.colors.items.colorMap)
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const [editEnabled, setEditEnabled] = useState(false)
  const [editedIndividualScene, setEditedIndividualScene] = useState(null)
  const [showBack, setShowBack] = useState(false)
  const _sceneFetchTypes = new Set(sceneMetadata.filter(item => item.sceneFetchType).map(item => item.sceneFetchType))
  const sceneFetchTypes = Array.from(_sceneFetchTypes)
  const sceneData = useSceneData(sceneFetchTypes)
  const [editedTintableIndividualScene, setEditedTintableIndividualScene] = useState(false)
  const showDeleteConfirmModalFlag = useSelector(state => state.showDeleteConfirmModal)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const wrapperRef = useRef(null)
  const [isReadyToRenderFlag, setIsReadyToRenderFlag] = useState(false)
  const [initPosition, setPosition] = useState(0)
  const [sceneCount, setSceneCount] = useState(0)

  useEffect(() => {
    const excludeFromLoad = savedScenes?.map(item => item.id).filter(item => !!item) || []
    dispatch(loadSavedScenes(props.brandId, excludeFromLoad))
  }, [])

  useEffect(() => {
    if (!stockScenes) {
      setStockScenes(sceneData)
    }
  }, [sceneData])

  useEffect(() => {
    if (isReadyToRender(sceneMetadata, savedScenes, stockScenes, isLoadingSavedScenes)) {
      setIsReadyToRenderFlag(true)
    }
  }, [sceneMetadata, savedScenes, stockScenes, isLoadingSavedScenes])

  useEffect(() => {
    setSceneCount(sceneMetadata.length)
  }, [sceneMetadata])

  const enableEdit = (e: SyntheticEvent) => {
    e.preventDefault()
    setEditEnabled(true)
  }

  const disableEdit = (e: SyntheticEvent) => {
    e.preventDefault()
    setEditEnabled(false)
  }

  const deleteScene = (id: number | string) => {
    if (deleteCandidate) {
      if (deleteCandidate.isLivePaletteIdea) {
        deleteLivePaletteIdea(deleteCandidate.id)
      } else if (deleteCandidate.isStockScene) {
        dispatch(deleteStockScene(deleteCandidate.id))
      } else {
        dispatch(deleteSavedScene(deleteCandidate.id))
      }
    }
    dispatch(showDeleteConfirmModal(false))
  }

  const selectScene = (sceneId: number | string, isLivePaletteIdea: boolean = false) => {
    if (isLivePaletteIdea) {
      dispatch(selectedSavedLivePalette(sceneId))
    } else {
      dispatch(selectSavedScene(sceneId))
    }
  }

  const deleteLivePaletteIdea = (id: number | string) => {
    dispatch(deleteSavedLivePalette(id))
  }

  const selectAnonStockScene = (sceneId: number | string) => {
    dispatch(selectSavedAnonStockScene(sceneId))
  }

  const closeDeleteSceneConfirm = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dispatch(showDeleteConfirmModal(false))
  }

  const showDeleteConfirm = (sceneId: string | number, isStockScene: boolean, isLivePaletteIdea?: boolean) => {
    setDeleteCandidate({
      id: sceneId,
      isStockScene,
      isLivePaletteIdea
    })

    dispatch(showDeleteConfirmModal(true))
  }

  const isReadyToRender = (sceneMetadata: Object[], customSceneData, stockSceneData, isLoadingSavedScenes) => {
    const expectCustomData = !!sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonCustom)
    const expectStockData = !!sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonStock)
    const expectLpData = !!sceneMetadata.find(item => item.sceneType === SCENE_TYPE.livePalette)

    if (expectCustomData && !expectStockData) {
      // handle only custom data
      if (customSceneData && !isLoadingSavedScenes) {
        return customSceneData.length > 0
      }
    }

    if (expectStockData && !expectCustomData) {
      // handle only stock data
      if (stockSceneData) {
        return true
      }
    }

    if (expectStockData && expectCustomData) {
      // handle both
      if (stockSceneData && customSceneData && !isLoadingSavedScenes) {
        return customSceneData.length > 0
      }
    }

    if (expectLpData) {
      return true
    }

    return false
  }

  /**
   * @todo This approach will need to be rethought for use beyond anon persistence -RS
   * @param sceneData - the data from the custom saved scenes
   * @param stockSceneData - the data from saved stock scenes
   * @param sceneMetadata - this is a list of ids and other related data used to order and commingle the custom and stock scenes
   * @param editIsEnabled
   * @returns {*[]}
   */
  const generateSavedScenes = (sceneData: Object[], stockSceneData: any, sceneMetadata: Object[], editIsEnabled: boolean) => {
    const baseSceneData = {
      stockScenes: stockSceneData,
      customScenes: sceneData
    }
    return <Carousel
      BaseComponent={SavedSceneWrapper}
      btnRefList={[]}
      setInitialPosition={setPosition}
      initPosition={initPosition}
      defaultItemsPerView={8}
      isInfinity={false}
      key='myideas'
      baseSceneData={baseSceneData}
      data={sceneMetadata}
      editIsEnabled={editIsEnabled}
      deleteScene={showDeleteConfirm}
      selectScene={selectScene}
      selectAnonStockScene={selectAnonStockScene}
      editIndividualScene={editIndividualScene}
      colorMap={colorMap}
    />
  }

  const renderNoScenes = (isLoading: boolean) => {
    if (isLoading) {
      return (<div className={loaderClassName}>
        <CircleLoader />
      </div>)
    } else {
      return (<div className={baseClassName}>
        <div className={sectionNoIdeasMessage}>
          <h3><FormattedMessage id='MY_IDEAS.NO_IDEAS_TITLE' /></h3>
          <p><FormattedMessage id='MY_IDEAS.NO_IDEAS_DESC' /></p>
        </div>
      </div>)
    }
  }

  const mouseDownHandler = (e: SyntheticEvent) => {
    e.preventDefault()
  }

  const editIndividualScene = (scene: Object, useTintableScene: boolean) => {
    setEditedIndividualScene(scene)
    setEditedTintableIndividualScene(useTintableScene)
    setShowBack(true)
    props.setCardTitle(formatMessage({ id: 'RENAME_SAVED_IDEA' }))
  }

  const showMyIdeas = () => {
    setShowBack(false)
    setEditedIndividualScene(null)
    setEditEnabled(true)
    const headerText = formatMessage({ id: 'MY_IDEAS.MY_IDEAS_HEADER' })
    props.setCardTitle(headerText)
  }

  const saveEditedLivePaletteName = (inputText: string) => {
    dispatch(updateLivePalette(editedIndividualScene.savedLivePaletteId, inputText))
    showMyIdeas()
  }

  return (
    <>
      {isReadyToRenderFlag && sceneCount ? <div className={baseClassName} ref={wrapperRef}>
        { showDeleteConfirmModalFlag
          ? (
            <DynamicModal
              modalStyle={DYNAMIC_MODAL_STYLE.danger}
              actions={[
                { text: formatMessage({ id: 'MY_IDEAS.YES' }), callback: deleteScene },
                { text: formatMessage({ id: 'MY_IDEAS.NO' }), callback: closeDeleteSceneConfirm }
              ]}
              description={formatMessage({ id: 'MY_IDEAS.DELETE_CONFIRM' })}
            />
          )
          : null
        }
        <div className={sectionLeftClassName}>
          {showBack
            ? <button className={`${buttonClassName} ${buttonBack}`} onClick={showMyIdeas} onMouseDown={mouseDownHandler}>
              <FontAwesomeIcon size='lg' className={`${buttonSvg}`} icon={['fa', 'angle-left']} /><span className={`${backText}`}><FormattedMessage id='BACK' /></span></button>
            : editEnabled
              ? <button aria-label={formatMessage({ id: 'MY_IDEAS.ARIA_LABEL_DONE' })} className={buttonClassName} onClick={disableEdit} onMouseDown={mouseDownHandler}><FormattedMessage id='DONE' /></button>
              : <button aria-label={formatMessage({ id: 'MY_IDEAS.ARIA_LABEL_EDIT' })} className={buttonClassName} onClick={enableEdit} onMouseDown={mouseDownHandler}>
                <FontAwesomeIcon className={`${buttonSvg}`} icon={['fal', 'edit']} />
                <FormattedMessage id='EDIT' />
              </button>}
        </div>
        <div className={sectionClassName}>
          {editedIndividualScene && editedIndividualScene.sceneType !== SCENE_TYPE.livePalette &&
            <EditSavedScene
              showMyIdeas={showMyIdeas}
              sceneData={(editedTintableIndividualScene) ? { scene: editedIndividualScene.scene, sceneMetadata: editedIndividualScene.sceneMetadata } : editedIndividualScene}
              width={296}
              height={196}
              selectScene={editedTintableIndividualScene ? selectAnonStockScene : selectScene}
              editedTintableIndividualScene={editedTintableIndividualScene}
            />
          }
          {
            editedIndividualScene && editedIndividualScene.sceneType && editedIndividualScene.sceneType === SCENE_TYPE.livePalette &&
            <EditColorPalette defaultInput={editedIndividualScene.savedLivePaletteName} saveName={saveEditedLivePaletteName}>
              {() => (
                <ColorPalette
                  palette={editedIndividualScene.palette}
                  savedLivePaletteName={editedIndividualScene.savedLivePaletteName}
                  savedLivePaletteId={editedIndividualScene.savedLivePaletteId}
                  selectLivePaletteIdea={selectScene}
                  isMyIdeaLivePalette
                  isEditName
                />
              )}
            </EditColorPalette>
          }
          <div className={`${(editedIndividualScene) ? savedScenesWrapperHide : savedScenesWrapperShow}`}>{generateSavedScenes(savedScenes, stockScenes, sceneMetadata, editEnabled)}</div>
        </div>
      </div>
        : renderNoScenes(isLoadingSavedScenes)}
    </>
  )
}

const SavedSceneWrapper = (props: any) => {
  let scene = null
  const { itemNumber, itemsPerView, totalItems, btnRefList } = props
  btnRefList[itemNumber] = React.useRef()
  if (props.data.sceneType === SCENE_TYPE.anonStock && props.baseSceneData.stockScenes) {
    // handle stock scenes
    const stockSceneMetadata = props.data
    const sceneType = props.baseSceneData.stockScenes.sceneCollection[stockSceneMetadata.sceneFetchType]

    const sceneDatum = sceneType.find(item => item.id === stockSceneMetadata.scene.id)

    scene = {
      scene: sceneDatum,
      sceneMetadata: stockSceneMetadata
    }

    return <SavedScene
      width={100}
      height={90}
      sceneId={stockSceneMetadata.id}
      sceneData={scene}
      editEnabled={props.editIsEnabled}
      key={stockSceneMetadata.id}
      deleteScene={props.deleteScene}
      selectScene={props.selectAnonStockScene}
      editIndividualScene={props.editIndividualScene}
      useTintableScene
      itemNumber={itemNumber}
      itemsPerView={itemsPerView}
      totalItems={totalItems}
      ref={btnRefList[itemNumber]} />
  } else if (props.data.sceneType === SCENE_TYPE.anonCustom) {
    // Handle custom scenes
    scene = props.baseSceneData.customScenes.find(item => props.data.scene.indexOf(item.id) > -1)
    if (scene) {
      return <SavedScene
        width={100}
        height={90}
        sceneData={scene}
        editEnabled={props.editIsEnabled}
        key={scene.id}
        sceneId={scene.id}
        deleteScene={props.deleteScene}
        selectScene={props.selectScene}
        editIndividualScene={props.editIndividualScene}
        itemNumber={itemNumber}
        itemsPerView={itemsPerView}
        totalItems={totalItems}
        ref={btnRefList[itemNumber]} />
    }
  } else {
    const palette = getColorInstances(null, props.data.livePaletteColorsIdArray, props.colorMap)
    return <ColorPalette
      palette={palette}
      savedLivePaletteName={props.data.name}
      savedLivePaletteId={props.data.id}
      editEnabled={props.editIsEnabled}
      selectLivePaletteIdea={props.selectScene}
      deleteLivePaletteIdea={props.deleteScene}
      editLivePaletteIdea={props.editIndividualScene}
      isMyIdeaLivePalette
    />
  }

  return null
}

export default MyIdeas
