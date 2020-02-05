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
import './MyIdeasContainer.scss'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import { FormattedMessage, useIntl } from 'react-intl'
import at from 'lodash/at'

type MyIdeasContainerProps = {
  config: Object,
  setHeader: Function
}

const MyIdeasContainer = (props: MyIdeasContainerProps) => {
  const dispatch = useDispatch()
  const selectedSceneId = useSelector(state => state.selectedSavedSceneId)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  // Record original selected scene value
  const [initialSceneId, setInitialSceneId] = useState(selectedSceneId)
  const { messages = {} } = useIntl()

  useEffect(() => {
    if (selectedSceneId && initialSceneId !== selectedSceneId) {
      setShouldRedirect(true)
    }
    props.setHeader(at(messages, 'MY_IDEAS.MY_IDEAS_HEADER')[0])
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
    <div className={`my-ideas-container__wrapper`}>
      {isLoggedIn ? <MyIdeas brandId={props.config.brandId} />
        : (<div className={`my-ideas-container__content`}>
          <div className={`my-ideas-container__description`}>
            <FormattedMessage id='MY_IDEAS.MY_IDEAS_CONTENT' />
          </div>
          <div className={`my-ideas-container__buttons`}>
            <button><FormattedMessage id='REGISTER' /></button>
            <div><Login /></div>
          </div>
        </div>)
      }
    </div>
  )
}

export default WithConfigurationContext(CollectionsHeaderWrapper(MyIdeasContainer))
