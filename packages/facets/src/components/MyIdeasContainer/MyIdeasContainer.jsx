// @flow
import React, { useEffect, useRef,useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch,useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import at from 'lodash/at'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { ROUTES_ENUM } from 'src/components/Facets/ColorVisualizerWrapper/routeValueCollections'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
// eslint-disable-next-line no-unused-vars
import { selectSavedScene } from '../../store/actions/persistScene'
import AnonLogin from '../AnonLogin/AnonLogin'
import Login from '../Login/Login'
import MyIdeas from '../MyIdeas/MyIdeas'
import './MyIdeasContainer.scss'

type MyIdeasContainerProps = {
  config: Object
}

const MyIdeasContainer = (props: MyIdeasContainerProps) => {
  const dispatch = useDispatch()
  const selectedSceneId = useSelector(state => state.selectedSavedSceneId)
  const selectedStockSceneId = useSelector(state => state.selectedStockSceneId)
  const selectedSavedLivePaletteId = useSelector(state => state.selectedSavedLivePaletteId)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  // Record original selected scene value
  const [initialSceneId, setInitialSceneId] = useState(selectedSceneId)
  const { messages = {} } = useIntl()
  const wrapperRef = useRef()

  useEffect(() => {
    if ((selectedSceneId && initialSceneId !== selectedSceneId) || (selectedStockSceneId && initialSceneId !== selectedStockSceneId) || (selectedSavedLivePaletteId && initialSceneId !== selectedSavedLivePaletteId)) {
      setShouldRedirect(true)
    }
  })

  useEffect(() => {
    // Reset state related to pushing data to paintscene
    dispatch(selectSavedScene(null))
    setInitialSceneId(null)
  }, [])

  const isLoggedIn = useSelector(state => state.user)

  if (shouldRedirect) {
    return (
      <Redirect to={ROUTES_ENUM.MY_IDEAS_PREVIEW} />
    )
  }

  return (
    <CardMenu menuTitle={at(messages, 'MY_IDEAS.MY_IDEAS_HEADER')[0]}>
      {(setCardShowing, setCardTitle) => (
        <div ref={wrapperRef} className={'my-ideas-container__wrapper'}>
          {FIREBASE_AUTH_ENABLED && !isLoggedIn
            ? <AnonLogin />
            : isLoggedIn
              ? <MyIdeas brandId={props.config.brandId} setCardTitle={setCardTitle} />
              : <div className={'my-ideas-container__content'}>
                <div className={'my-ideas-container__description'}>
                  <FormattedMessage id='MY_IDEAS.MY_IDEAS_CONTENT' />
                </div>
                <div className={'my-ideas-container__buttons'}>
                  <button><FormattedMessage id='REGISTER' /></button>
                  <div><Login /></div>
                </div>
              </div>
          }
        </div>
      )}
    </CardMenu>
  )
}

export default WithConfigurationContext(MyIdeasContainer)
