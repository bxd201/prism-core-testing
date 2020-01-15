// @flow

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { deleteSavedScene, selectSavedScene, loadSavedScenes } from '../../store/actions/persistScene'
import SavedScene from './SavedScene'

import './MyIdeas.scss'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'

const baseClassName = 'myideas-wrapper'
const buttonClassName = `${baseClassName}__button`
const sectionClassName = `${baseClassName}__section`
const sectionLeftClassName = `${sectionClassName}--left`

// @todo - Refactor to use selector and get from redux store
type MyIdeasProps = {
  brandId: string
}

const MyIdeas = (props: MyIdeasProps) => {
  const savedScenes = useSelector(state => state.scenesAndRegions)
  const isLoadingSavedScenes = useSelector(state => state.isLoadingSavedScene)
  const dispatch = useDispatch()
  const intl = useIntl()
  const [editEnabled, setEditEnabled] = useState(false)

  useEffect(() => {
    if (!savedScenes.length) {
      // Fetch saved scenes if none have been saved
      dispatch(loadSavedScenes(props.brandId))
    }
  }, [])

  const enableEdit = (e: SyntheticEvent) => {
    e.preventDefault()
    setEditEnabled(true)
  }

  const disableEdit = (e: SyntheticEvent) => {
    e.preventDefault()
    setEditEnabled(false)
  }
  // @todo - is this a string or number? -RS
  const deleteScene = (id: number) => {
    dispatch(deleteSavedScene(id))
  }
  // @todo - is this a string or number? -RS
  const selectScene = (sceneId: number) => {
    dispatch(selectSavedScene(sceneId))
  }

  const generateSavedScenes = (sceneData: Object[], editIsEnabled: boolean) => {
    return sceneData.map((scene, i) => {
      return <SavedScene
        width={180}
        height={90}
        sceneData={scene}
        editEnabled={editIsEnabled}
        key={scene.id}
        deleteScene={deleteScene}
        selectScene={selectScene} />
    })
  }

  const renderNoScenes = (isLoading: boolean) => {
    if (isLoading) {
      return (<div>
        <CircleLoader />
      </div>)
    } else {
      return (<div className={baseClassName}>
        <div className={sectionLeftClassName}>
          <h3>{intl.messages['MY_IDEAS.NO_IDEAS_TITLE']}</h3>
          <p>{intl.messages['MY_IDEAS.NO_IDEAS_DESC']}</p>
        </div>
      </div>)
    }
  }

  return (
    <>
      {savedScenes.length ? <div className={baseClassName}>
        <div className={sectionLeftClassName}>
          {editEnabled
            ? <button className={buttonClassName} onClick={disableEdit}>{intl.messages.DONE}</button>
            : <button className={buttonClassName} onClick={enableEdit}>{intl.messages.EDIT}</button>}
        </div>
        <div className={sectionClassName}>
          {generateSavedScenes(savedScenes, editEnabled)}
        </div>
      </div>
        : renderNoScenes(isLoadingSavedScenes)}
    </>
  )
}

export default MyIdeas
