// @flow

import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './LandingPage.scss'
import { useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'

const LandingPage = () => {
  const { cvw = {} } = useContext(ConfigurationContext)
  const history = useHistory()

  const redirect = (url) => {
    window.localStorage.setItem('landingPageShownSession', 1)
    history.push(url)
  }

  return (
    <div className='cvw-landing-page-wrapper' style={{ 'backgroundImage': `url('${cvw.introBg}')` }}>
      {cvw.introLogo ? <div className='cvw-landing-page-wrapper__image' style={{ 'backgroundImage': `url('${cvw.introLogo}')` }} /> : null}
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
            <FontAwesomeIcon icon={['fal', 'square-full']} size='xs' transform={{ rotate: 10 }} />
            <FontAwesomeIcon icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
            <FontAwesomeIcon icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
            <FontAwesomeIcon icon={['fal', 'plus-circle']} size='xs' />
          </span>
          <FormattedMessage id='EXPLORE_COLOR' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/inspiration')}>
          <FontAwesomeIcon className='cvw-nav-btn-icon' icon={['fal', 'lightbulb']} size='1x' />
          <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect('/active/scenes')}>
          <span className='fa-layers fa-fw cvw-nav-btn-icon'>
            <FontAwesomeIcon icon={['fal', 'square-full']} />
            <FontAwesomeIcon icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
          </span>
          <FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' />
        </button>
      </div>
    </div>
  )
}

export default LandingPage
