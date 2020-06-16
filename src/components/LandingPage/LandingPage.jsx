// @flow

import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useIntl, FormattedMessage } from 'react-intl'
import './LandingPage.scss'
import { Link } from 'react-router-dom'
import { COLORS_ROUTE, INSPIRATION_ROUTE, SCENES_ROUTE } from '../Facets/ColorVisualizerWrapper/ColorVisualizerWrapper'
import { KEY_CODES } from 'src/constants/globals'
const cvwLandingPage = 'cvw-landing-page-wrapper'

type LandingPageProps = {
    handlePageShow: Function
}

export const landingPageShownSession = { key: 'landingPageShownSession', value: 1 }

export const setLandingPageShownLocalStorage = () => {
  window.localStorage.setItem(landingPageShownSession.key, landingPageShownSession.value)
}
export const getLandingPageShownLocalStorage = () => {
  return window.localStorage.getItem(landingPageShownSession.key)
}

const LandingPage = (props: LandingPageProps) => {
  const [showLandingPage, setDisplayPage] = useState(true)
  const intl = useIntl()
  const onKeyDown = (e) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_ENTER) {
      props.handlePageShow()
      setDisplayPage(false)
    }
  }
  const handleRedirect = (e) => {
    props.handlePageShow()
    setDisplayPage(false)
  }
  setLandingPageShownLocalStorage()
  return (
    showLandingPage &&
    <div className={`${cvwLandingPage}`}>
      <div className={`${cvwLandingPage}__image`} />
      <div tabIndex='0' role='button' onKeyDown={onKeyDown} className={`${cvwLandingPage}__painting-btn`} onClick={handleRedirect}>
        <FormattedMessage id='LANDING_PAGES.PAINTING_BUTTON' />
        {<button tabIndex='-1' aria-label={intl.formatMessage({ id: 'LANDING_PAGES.PAINTING_BUTTON' })}>
          <FontAwesomeIcon icon={['fa', 'chevron-right']} />
        </button>}
      </div>
      <div className={`${cvwLandingPage}__intro-divider`}>
        <div className={`${cvwLandingPage}__intro-divider__line`} />
        <span>{intl.formatMessage({ id: 'LANDING_PAGES.OR' })}</span>
        <div className={`${cvwLandingPage}__intro-divider__line`} />
      </div>
      <div className={`${cvwLandingPage}__intro-button-container`}>
        <Link aria-label={intl.formatMessage({ id: 'LANDING_PAGES.EXPLORE_COLOR' })} tabIndex='0' onKeyDown={onKeyDown} className={`${cvwLandingPage}__intro-button-container__intro-buttons`} to={`${COLORS_ROUTE}`} onClick={handleRedirect}>
          <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--square-small`} icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
          <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--square`} icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
          <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--plus-circle`} style={{ marginLeft: '-30px' }}icon={['fal', 'plus-circle']} size='xs' />
          <FormattedMessage id='LANDING_PAGES.EXPLORE_COLOR' />
        </Link>

        <Link aria-label={intl.formatMessage({ id: 'LANDING_PAGES.GET_INSPIRED' })} tabIndex='0' onKeyDown={onKeyDown} className={`${cvwLandingPage}__intro-button-container__intro-buttons`} to={`${INSPIRATION_ROUTE}`} onClick={handleRedirect}>
          <FontAwesomeIcon className={`cvw__btn-overlay__svg`} icon={['fal', 'lightbulb']} size='1x' />
          <FormattedMessage id='LANDING_PAGES.GET_INSPIRED' />
        </Link>

        <Link aria-label={intl.formatMessage({ id: 'LANDING_PAGES.PAINT_A_PHOTO' })} tabIndex='0' onKeyDown={onKeyDown} className={`${cvwLandingPage}__intro-button-container__intro-buttons`} to={`${SCENES_ROUTE}`} onClick={handleRedirect}>
          <FontAwesomeIcon className={`cvw__btn-overlay__svg`} icon={['fal', 'square-full']} />
          <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--brush`} icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
          <FormattedMessage id='LANDING_PAGES.PAINT_A_PHOTO' />
        </Link>
      </div>
    </div>
  )
}

export default LandingPage
