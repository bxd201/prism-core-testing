// @flow

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './LandingPage.scss'
import { useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

const LandingPage = () => {
  const history = useHistory()

  const redirect = (url) => {
    window.localStorage.setItem('landingPageShownSession', 1)
    history.push(url)
  }

  return (
    <div className='cvw-landing-page-wrapper'>
      <div className='cvw-landing-page-wrapper__image' />
      <button className='cvw-landing-page-wrapper__painting-btn' onClick={() => redirect('/active')}>
        <FormattedMessage id='START_PAINTING_NOW' />
        <FontAwesomeIcon icon={['fa', 'chevron-right']} />
      </button>
      <div className='cvw-landing-page-wrapper__intro-divider'>
        <div className='cvw-landing-page-wrapper__intro-divider__line' />
        <FormattedMessage id='OR' />
        <div className='cvw-landing-page-wrapper__intro-divider__line' />
      </div>
      <div className='cvw-landing-page-wrapper__intro-button-container'>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/colors')}>
          <FontAwesomeIcon className='cvw__btn-overlay__svg cvw__btn-overlay__svg--square-small' icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
          <FontAwesomeIcon className='cvw__btn-overlay__svg cvw__btn-overlay__svg--square' icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
          <FontAwesomeIcon className='cvw__btn-overlay__svg cvw__btn-overlay__svg--plus-circle' style={{ marginLeft: '-30px' }}icon={['fal', 'plus-circle']} size='xs' />
          <FormattedMessage id='EXPLORE_COLOR' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/inspiration')}>
          <FontAwesomeIcon className='cvw__btn-overlay__svg' icon={['fal', 'lightbulb']} size='1x' />
          <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/scenes')}>
          <FontAwesomeIcon className='cvw__btn-overlay__svg' icon={['fal', 'square-full']} />
          <FontAwesomeIcon className='cvw__btn-overlay__svg cvw__btn-overlay__svg--brush' icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
          <FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' />
        </button>
      </div>
    </div>
  )
}

export default LandingPage
