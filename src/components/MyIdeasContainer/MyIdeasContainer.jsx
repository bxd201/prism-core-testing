// @flow
import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import MyIdeas from '../MyIdeas/MyIdeas'
import Login from '../Login/Login'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
import { MY_IDEAS_PREVIEW } from '../Facets/Prism/Prism'
import { clearSceneWorkspace } from '../../store/actions/paintScene'
// eslint-disable-next-line no-unused-vars
import { selectSavedScene } from '../../store/actions/persistScene'

type MyIdeasContainerProps = {
  config: Object
}

const MyIdeasContainer = (props: MyIdeasContainerProps) => {
  const dispatch = useDispatch()
  const selectedSceneId = useSelector(state => state.selectedSavedSceneId)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  // Record original selected scene value
  const [initialSceneId, setInitialSceneId] = useState(selectedSceneId)

  useEffect(() => {
    if (selectedSceneId && initialSceneId !== selectedSceneId) {
      setShouldRedirect(true)
    }
  })

  useEffect(() => {
    // Reset state related to pushing data to paintscene
    dispatch(selectSavedScene(null))
    setInitialSceneId(null)
    dispatch(clearSceneWorkspace())
  }, [])

  const isLoggedIn = useSelector(state => state.user)

  if (shouldRedirect) {
    return (
      <Redirect to={MY_IDEAS_PREVIEW} />
    )
  }

  return (
    <div>
      {isLoggedIn ? <MyIdeas brandId={props.config.brandId} /> : <Login />}
    </div>
  )
}

export default WithConfigurationContext(MyIdeasContainer)
