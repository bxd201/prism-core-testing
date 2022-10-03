// @flow

import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { ROUTES_ENUM } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
import './LandingPage.scss'

const LandingPage = () => {
  const { cvw = {} } = useContext(ConfigurationContext)
  const history = useHistory()

  const redirect = (url) => {
    window.localStorage.setItem('landingPageShownSession', 1)
    history.push(url)
  }

  return (
    <div className='cvw-landing-page-wrapper' style={cvw?.introBg ? { backgroundImage: `url('${cvw.introBg}')` } : null}>
      {cvw?.introLogo ? <div className='cvw-landing-page-wrapper__image' style={{ backgroundImage: `url('${cvw.introLogo}')` }} /> : null}
      <button className='cvw-landing-page-wrapper__painting-btn' onClick={() => redirect('/active')}>
        <FormattedMessage id='START_PAINTING_NOW' />
        <FontAwesomeIcon icon={['fa', 'chevron-right']} style={{ marginLeft: '1em' }} />
      </button>
      <div className='cvw-landing-page-wrapper__intro-divider'>
        <div className='cvw-landing-page-wrapper__intro-divider__line' />
        <FormattedMessage id='OR' />
        <div className='cvw-landing-page-wrapper__intro-divider__line' />
      </div>
      <div className='cvw-landing-page-wrapper__intro-button-container'>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' >
          <span className='fa-layers fa-fw' style={{ marginRight: '1em' }}>
            <FontAwesomeIcon style={{ backgroundColor: 'white', marginRight: '-3px' }} icon={['fal', 'square-full']} size='xs' transform={{ rotate: 10 }} />
            <FontAwesomeIcon style={{ backgroundColor: 'white', marginRight: '-1px' }} icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
            <FontAwesomeIcon style={{ backgroundColor: 'white' }} icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
            <FontAwesomeIcon style={{ backgroundColor: 'white' }} icon={['fal', 'plus-circle']} size='xs' />
          </span>
          <FormattedMessage id='EXPLORE_COLOR' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect(ROUTES_ENUM.INSPIRATION)}>
          <FontAwesomeIcon style={{ marginRight: '1em' }} icon={['fal', 'lightbulb']} size='1x' />
          <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />
        </button>
        <button className='cvw-landing-page-wrapper__intro-button-container__intro-buttons' onClick={() => redirect(ROUTES_ENUM.SCENES)}>
          <span className='fa-layers fa-fw' style={{ marginRight: '1em' }}>
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
