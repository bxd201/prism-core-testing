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
import { selectSavedAnonStockScene } from '../../store/actions/stockScenes'

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
  const [stockScenesLoaded, setStockScenesLoaded] = useState(false)
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
    if (sceneData || !sceneFetchTypes.length) {
      setStockScenesLoaded(true)
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

  const deleteStockScene = (id: number | string) => {
    dispatch(deleteSavedScene(id))
  }

  const selectScene = (sceneId: number | string) => {
    dispatch(selectSavedScene(sceneId))
  }

  const selectAnonStockScene = (sceneId: number | string) => {
    dispatch(selectSavedAnonStockScene(sceneId))
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
    const _customScenes = sceneData.map((scene, i) => {
      return <SavedScene
        width={180}
        height={90}
        sceneData={scene}
        sceneId={scene.id}
        editEnabled={editIsEnabled}
        key={scene.id}
        deleteScene={deleteScene}
        selectScene={selectScene}
        editIndividualScene={editIndividualScene} />
    })

    const stockScenes = sceneMetadata
      .filter(item => item.sceneType === SCENE_TYPE.anonStock)
      .map(item => {
        const baseSceneData = stockSceneData.sceneCollection[item.sceneFetchType]
        const sceneDatum = baseSceneData.find(scene => item.scene.id === scene.id)
        // @todo - implement -RS
        const scene = {
          scene: sceneDatum,
          sceneMetadata: item
        }

        return <SavedScene
          sceneData={scene}
          sceneId={item.id}
          editEnabled={editIsEnabled}
          deleteScene={deleteStockScene}
          selectScene={selectAnonStockScene}
          key={item.id}
          width={180}
          height={90}
          useTintableScene />
      })
    // @todo set order -RS
    return [...customScenes, ...stockScenes]
  const generateSavedScenes = (sceneData: Object[], editIsEnabled: boolean) => {
    return <Carousel
      BaseComponent={SavedSceneWrapper}
      defaultItemsPerView={8}
      isInfinity={false}
      key='myideas'
      data={sceneData}
      editIsEnabled={editIsEnabled}
      deleteScene={deleteScene}
      selectScene={selectScene}
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

  const editIndividualScene = (scene: Object) => {
    setEditedIndividualScene(scene)
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
      {(savedScenes.length && stockScenesLoaded) ? <div className={baseClassName}>
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
          {editedIndividualScene && <EditSavedScene showMyIdeas={showMyIdeas} sceneData={editedIndividualScene} width={296} height={204} selectScene={selectScene} />}
          <div className={`${(editedIndividualScene) ? savedScenesWrapperHide : savedScenesWrapperShow}`}>{generateSavedScenes(savedScenes, stockScenes, sceneMetadata, editEnabled)}</div>
        </div>
      </div>
        : renderNoScenes(isLoadingSavedScenes)}
    </>
  )
}

const SavedSceneWrapper = (props: any) => {
  return <SavedScene
    width={100}
    height={90}
    sceneData={props.data}
    editEnabled={props.editIsEnabled}
    key={props.data.id}
    deleteScene={props.deleteScene}
    selectScene={props.selectScene}
    editIndividualScene={props.editIndividualScene} />
}

export default MyIdeas
