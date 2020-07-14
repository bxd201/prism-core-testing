// @flow

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './LandingPage.scss'
import { useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { faSquareFull, faPlusCircle } from '@fortawesome/pro-light-svg-icons'

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
          <span className='fa-layers fa-fw cvw-nav-btn-icon'>
            <FontAwesomeIcon icon={faSquareFull} size='xs' transform={{ rotate: 10 }} />
            <FontAwesomeIcon icon={faSquareFull} size='sm' transform={{ rotate: 0 }} />
            <FontAwesomeIcon icon={faSquareFull} size='1x' transform={{ rotate: 350 }} />
            <FontAwesomeIcon icon={faPlusCircle} size='xs' />
          </span>
          <FormattedMessage id='EXPLORE_COLOR' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/inspiration')}>
          <FontAwesomeIcon className='cvw-nav-btn-icon' icon={['fal', 'lightbulb']} size='1x' />
          <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/scenes')}>
          <span className='fa-layers fa-fw cvw-nav-btn-icon'>
            <FontAwesomeIcon icon={faSquareFull} />
            <FontAwesomeIcon icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
          </span>
          <FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' />
        </button>
      </div>
    </div>
  )
}

export default LandingPage
