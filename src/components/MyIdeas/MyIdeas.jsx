// @flow

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { deleteSavedScene, selectSavedScene, loadSavedScenes, SCENE_TYPE } from '../../store/actions/persistScene'
import SavedScene from './SavedScene'
import useSceneData from '../../shared/hooks/useSceneData'
import Carousel from '../Carousel/Carousel'
import './MyIdeas.scss'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import EditSavedScene from './EditSavedScene'
import { deleteStockScene, selectSavedAnonStockScene } from '../../store/actions/stockScenes'

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

type MyIdeasProps = {
  brandId: string,
  setCardTitle: Function
}

const MyIdeas = (props: MyIdeasProps) => {
  const savedScenes = useSelector(state => state.scenesAndRegions)
  const [stockScenes, setStockScenes] = useState(null)
  const sceneMetadata = useSelector(state => state.sceneMetadata)
  const isLoadingSavedScenes = useSelector(state => state.isLoadingSavedScene)
  const dispatch = useDispatch()
  const intl = useIntl()
  const [editEnabled, setEditEnabled] = useState(false)
  const [editedIndividualScene, setEditedIndividualScene] = useState(null)
  const [showBack, setShowBack] = useState(false)
  const _sceneFetchTypes = new Set(sceneMetadata.filter(item => item.sceneFetchType).map(item => item.sceneFetchType))
  const sceneFetchTypes = Array.from(_sceneFetchTypes)
  const sceneData = useSceneData(sceneFetchTypes)
  const [editedTintableIndividualScene, setEditedTintableIndividualScene] = useState(false)

  useEffect(() => {
    if (!savedScenes.length) {
      // Fetch saved scenes if none have been saved
      dispatch(loadSavedScenes(props.brandId))
    }
  }, [])

  useEffect(() => {
    if (!stockScenes) {
      setStockScenes(sceneData)
    }
  }, [sceneData])

  const enableEdit = (e: SyntheticEvent) => {
    e.preventDefault()
    setEditEnabled(true)
  }

  const disableEdit = (e: SyntheticEvent) => {
    e.preventDefault()
    setEditEnabled(false)
  }

  const deleteScene = (id: number | string) => {
    dispatch(deleteSavedScene(id))
  }

  const deleteAnonStockScene = (id: number | string) => {
    dispatch(deleteStockScene(id))
  }

  const selectScene = (sceneId: number | string) => {
    dispatch(selectSavedScene(sceneId))
  }

  const selectAnonStockScene = (sceneId: number | string) => {
    dispatch(selectSavedAnonStockScene(sceneId))
  }

  const isReadyToRender = (sceneMetadata: Object[], customSceneData, stockSceneData) => {
    const expectCustomData = !!sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonCustom)
    const expectStockData = !!sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonStock)

    if (expectCustomData && !expectStockData) {
      // handle only custom data
      if (customSceneData && (customSceneData && customSceneData.length)) {
        return true
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
      if (stockSceneData && (customSceneData && customSceneData.length)) {
        return true
      }
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
      defaultItemsPerView={8}
      isInfinity={false}
      key='myideas'
      baseSceneData={baseSceneData}
      data={sceneMetadata}
      editIsEnabled={editIsEnabled}
      deleteScene={deleteScene}
      selectScene={selectScene}
      deleteAnonStockScene={deleteAnonStockScene}
      selectAnonStockScene={selectAnonStockScene}
      editIndividualScene={editIndividualScene}
    />
  }

  const renderNoScenes = (isLoading: boolean) => {
    if (isLoading) {
      return (<div>
        <CircleLoader />
      </div>)
    } else {
      return (<div className={baseClassName}>
        <div className={sectionNoIdeasMessage}>
          <h3>{intl.messages['MY_IDEAS.NO_IDEAS_TITLE']}</h3>
          <p>{intl.messages['MY_IDEAS.NO_IDEAS_DESC']}</p>
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
    props.setCardTitle(intl.messages.RENAME_SAVED_IDEA)
  }

  const showMyIdeas = () => {
    setShowBack(false)
    setEditedIndividualScene(null)
    setEditEnabled(true)
    props.setCardTitle(intl.messages['MY_IDEAS.MY_IDEAS_HEADER'])
  }

  return (
    <>
      {isReadyToRender(sceneMetadata, savedScenes, stockScenes) ? <div className={baseClassName}>
        <div className={sectionLeftClassName}>
          {showBack
            ? <button className={`${buttonClassName} ${buttonBack}`} onClick={showMyIdeas} onMouseDown={mouseDownHandler}>
              <FontAwesomeIcon size='lg' className={`${buttonSvg}`} icon={['fa', 'angle-left']} /><span className={`${backText}`}>{intl.messages.BACK}</span></button>
            : editEnabled
              ? <button className={buttonClassName} onClick={disableEdit} onMouseDown={mouseDownHandler}>{intl.messages.DONE}</button>
              : <button className={buttonClassName} onClick={enableEdit} onMouseDown={mouseDownHandler}>
                <FontAwesomeIcon className={`${buttonSvg}`} icon={['fal', 'edit']} />
                {intl.messages.EDIT}
              </button>}
        </div>
        <div className={sectionClassName}>
          {editedIndividualScene &&
            <EditSavedScene
              showMyIdeas={showMyIdeas}
              sceneData={(editedTintableIndividualScene) ? { scene: editedIndividualScene.scene, sceneMetadata: editedIndividualScene.sceneMetadata } : editedIndividualScene}
              width={296}
              height={196}
              selectScene={editedTintableIndividualScene ? selectAnonStockScene : selectScene}
              editedTintableIndividualScene={editedTintableIndividualScene}
            />
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

  if (props.data.sceneType === SCENE_TYPE.anonStock) {
    // handle stock scenes
    const stockSceneMetadata = props.data
    const sceneType = props.baseSceneData.stockScenes.sceneCollection[stockSceneMetadata.sceneFetchType]

    const sceneDatum = sceneType.find(item => item.id === stockSceneMetadata.scene.id)
    // @todo - implement -RS
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
      deleteScene={props.deleteAnonStockScene}
      selectScene={props.selectAnonStockScene}
      editIndividualScene={props.editIndividualScene}
      useTintableScene />
  }
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
      editIndividualScene={props.editIndividualScene} />
  }

  return null
}

export default MyIdeas
