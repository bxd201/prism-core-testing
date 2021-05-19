// @flow

import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl, FormattedMessage } from 'react-intl'
import { selectSavedScene, loadSavedScenes, SCENE_TYPE } from '../../store/actions/persistScene'
import { updateLivePalette, selectedSavedLivePalette } from '../../store/actions/saveLivePalette'
import SavedScene from './SavedScene'
import Carousel from '../Carousel/Carousel'
import './MyIdeas.scss'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import EditSavedScene from './EditSavedScene'
import { selectSavedAnonStockScene } from '../../store/actions/stockScenes'
import ColorPalette from '../MyIdeaPreview/ColorPalette'
import { getColorInstances } from '../LivePalette/livePaletteUtility'
import EditColorPalette from '../MyIdeaPreview/EditColorPalette'
import { createDeleteMyIdeasModal } from '../CVWModalManager/createModal'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'

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
  // eslint-disable-next-line no-unused-vars
  const [stockScenes, setStockScenes] = useState(null)
  const sceneMetadata = useSelector(state => state.sceneMetadata)
  const isLoadingSavedScenes = useSelector(state => state.isLoadingSavedScene)
  const colorMap = useSelector(state => state.colors.items.colorMap)
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const intl = useIntl()
  const [editEnabled, setEditEnabled] = useState(false)
  const [editedIndividualScene, setEditedIndividualScene] = useState(null)
  const [showBack, setShowBack] = useState(false)
  const [editedTintableIndividualScene, setEditedTintableIndividualScene] = useState(false)
  const wrapperRef = useRef(null)
  const [isReadyToRenderFlag, setIsReadyToRenderFlag] = useState(false)
  const [initPosition, setPosition] = useState(0)
  const [sceneCount, setSceneCount] = useState(0)
  // if set this means that the scenes and variants, including surfaces have loaded.
  const [selectedSceneUid, scenesCollection, variantsCollection] = useSelector(store => [store.selectedSceneUid, store.scenesCollection, store.variantsCollection])

  useEffect(() => {
    const excludeFromLoad = savedScenes?.map(item => item.id).filter(item => !!item) || []
    dispatch(loadSavedScenes(props.brandId, excludeFromLoad))
  }, [])

  useEffect(() => {
    if (isReadyToRender(sceneMetadata, savedScenes, selectedSceneUid, isLoadingSavedScenes)) {
      setIsReadyToRenderFlag(true)
    }
  }, [sceneMetadata, savedScenes, isLoadingSavedScenes, selectedSceneUid])

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

  const selectScene = (sceneId: number | string, isLivePaletteIdea: boolean = false) => {
    if (isLivePaletteIdea) {
      dispatch(selectedSavedLivePalette(sceneId))
    } else {
      dispatch(selectSavedScene(sceneId))
    }
  }

  const selectAnonStockScene = (sceneId: number | string) => {
    dispatch(selectSavedAnonStockScene(sceneId))
  }

  const showDeleteConfirm = (sceneId: string | number, isStockScene: boolean, isLivePaletteIdea?: boolean) => {
    dispatch(createDeleteMyIdeasModal(intl, 'EMPTY_SCENE', { isStockScene: isStockScene, isLivePaletteIdea: isLivePaletteIdea, sceneId: sceneId }))
  }

  const isReadyToRender = (sceneMetadata: Object[], customSceneData, stockScenesLoaded, isLoadingSavedScenes) => {
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
      if (stockScenesLoaded) {
        return true
      }
    }

    if (expectStockData && expectCustomData) {
      // handle both
      if (stockScenesLoaded && customSceneData && !isLoadingSavedScenes) {
        return customSceneData.length > 0
      }
    }

    // handle only loading saved palettes
    return expectLpData && !expectStockData && !expectCustomData
  }

  /**
   * @todo This approach will need to be rethought for use beyond anon persistence -RS
   * @param customSceneData - the data from the custom saved scenes
   * @param scenes - the loaded scenesCollection from redux
   * @param variants the loaded variantsCollections from redux
   * @param sceneMetadata - this is a list of ids and other related data used to order and commingle the custom and stock scenes
   * @param editIsEnabled
   * @returns {*[]}
   */
  const generateSavedScenes = (customSceneData: Object[], scenes: FlatScene[], variants: FlatVariant[], sceneMetadata: Object[], editIsEnabled: boolean) => {
    return <Carousel
      BaseComponent={SavedSceneWrapper}
      btnRefList={[]}
      setInitialPosition={setPosition}
      initPosition={initPosition}
      defaultItemsPerView={8}
      isInfinity={false}
      key='myideas'
      data={sceneMetadata}
      customSceneData={customSceneData}
      variants={variants}
      scenes={scenes}
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
          <div className={`${(editedIndividualScene) ? savedScenesWrapperHide : savedScenesWrapperShow}`}>{generateSavedScenes(savedScenes, scenesCollection, variantsCollection, sceneMetadata, editEnabled)}</div>
        </div>
      </div>
        : renderNoScenes(isLoadingSavedScenes)}
    </>
  )
}

const SavedSceneWrapper = (props: any) => {
  const { itemNumber, itemsPerView, totalItems, btnRefList, scenes, variants, data } = props
  btnRefList[itemNumber] = React.useRef()
  const variant = props.data.sceneType === SCENE_TYPE.anonStock
    ? variants.find(item => item.variantName === data.scene.variantName &&
      item.sceneType === data.scene.sceneDataType && item.sceneId === data.scene.sceneDataId) : null

  if (variant) {
    // handle stock scenes
    const stockSceneMetadata = data
    const scene = scenes.find(item => item.uid === variant.sceneUid)

    const sceneData = {
      variant,
      scene,
      sceneMetadata: stockSceneMetadata
    }

    return <SavedScene
      width={100}
      height={90}
      sceneId={stockSceneMetadata.id}
      sceneData={sceneData}
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
    const customScene = props.customSceneData.find(item => props.data.scene.indexOf(item.id) > -1)
    if (customScene) {
      return <SavedScene
        width={100}
        height={90}
        sceneData={customScene}
        editEnabled={props.editIsEnabled}
        key={customScene.id}
        sceneId={customScene.id}
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
