// @flow
import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation, withRouter } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import './ColorVisualizer.scss'
import { RouteContext } from '../../../contexts/RouteContext/RouteContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { KEY_CODES } from 'src/constants/globals'
import { COLORS_ROUTE, INSPIRATION_ROUTE, SCENES_ROUTE, MY_IDEAS, HELP_PATH } from './ColorVisualizerWrapper'

export const isMyIdeas = (pathname) => {
  return /^\/my-ideas/.test(pathname)
}

export const isScene = (pathname) => {
  return (/^\/active\/scenes/.test(pathname) || /^\/paint-scene/.test(pathname) || /^\/paint-photo/.test(pathname))
}

export const isPaintPhoto = (pathname) => {
  return /^\/paint-photo/.test(pathname)
}

export const isColors = (pathname) => {
  return (/^\/active\/color-wall/.test(pathname) ||
    /^\/active\/colors/.test(pathname) ||
    /^\/color-collections/.test(pathname) ||
    /^\/match-photo/.test(pathname))
}

export const isInspiration = (pathname) => {
  return (/^\/active\/inspiration/.test(pathname) ||
    /^\/color-from-image/.test(pathname) ||
    /^\/expert-colors/.test(pathname) ||
    /^\/use-our-image/.test(pathname))
}

export const isHelp = (pathname) => {
  return /^\/help/.test(pathname)
}

export default withRouter((props: Props) => {
  const [lastActive, setLastActive] = useState(null)
  const [currActive, setActive] = useState(null)
  const location = useLocation()
  const { pathname } = location
  const dispatch = useDispatch()
  const exploreColorsLinkRef = React.useRef()
  const routeContext = useContext(RouteContext)
  useEffect(() => { dispatch(toggleCompareColor(true)) }, [location])
  useEffect(() => { window.onpopstate = (event) => { setLastActive('') } }, [])
  useEffect(() => { routeContext.getExploreColorsLinkRef(exploreColorsLinkRef) }, [])

  const setActiveHelper = (currActiveName) => {
    if (currActiveName !== currActive) {
      setLastActive(currActive)
      setActive(currActiveName)
    }
  }

  const linkKeyDownHandler = (e: SyntheticEvent, isContextNavigate: boolean, toLink: string) => {
    if (e.target.getAttribute('name') !== currActive) {
      routeContext.getExploreColorsLinkRef(exploreColorsLinkRef)
      if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) {
        e.preventDefault()
        routeContext.navigate(isContextNavigate, true)
        setActiveHelper(e.target.getAttribute('name'))
        props.history.push({
          pathname: toLink,
          state: {
            isKeyDownRoute: true
          }
        })
      } else if (!e.shiftKey && e.keyCode === KEY_CODES.KEY_CODE_TAB && toLink === HELP_PATH) {
        routeContext.setIsTabbedOutFromHelp()
      }
    }
  }

  const linkClickHandler = (linkName: string, isContextNavigate: boolean) => {
    if (linkName !== null) {
      if (linkName !== currActive) {
        routeContext.navigate(isContextNavigate, true)
        setActiveHelper(linkName)
      }
    }
  }

  return (
    <>
      <nav className='cvw-navigation-wrapper'>
        <ul className='cvw-navigation-wrapper__center' role='presentation' onClick={(e) => linkClickHandler(e.target.getAttribute('name'), true)}>
          <li>
            <Link ref={exploreColorsLinkRef} onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, true, COLORS_ROUTE)} to={`${COLORS_ROUTE}`} name='colors' className={`cvw-nav-btn ${isColors(pathname) ? 'cvw-nav-btn--active' : ''}`}>
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--square-xsmall ${isColors(pathname) ? 'cvw__btn-overlay__svg--active' : ''}`} icon={['fal', 'square-full']} size='xs' transform={{ rotate: 10 }} />
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--square-small ${isColors(pathname) ? 'cvw__btn-overlay__svg--active' : ''}`} icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--square ${isColors(pathname) ? 'cvw__btn-overlay__svg--active' : ''}`} icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--plus-circle`} icon={['fal', 'plus-circle']} size='xs' />
              <div className={`cvw__btn-overlay ${isColors(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'colors' ? 'cvw__btn-overlay--last--active' : ''}`} />
              <span name='colors'><FormattedMessage id='NAV_LINKS.EXPLORE_COLORS' /></span>
            </Link>
          </li>
          <li>
            <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, true, INSPIRATION_ROUTE)} to={`${INSPIRATION_ROUTE}`} name='inspiration' className={`cvw-nav-btn ${isInspiration(pathname) ? 'cvw-nav-btn--active' : ''}`}>
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg`} icon={['fal', 'lightbulb']} size='1x' />
              <div className={`cvw__btn-overlay ${isInspiration(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'inspiration' ? 'cvw__btn-overlay--last--active' : ''}`} />
              <span name='inspiration'><FormattedMessage id='NAV_LINKS.GET_INSPIRED' /></span>
            </Link>
          </li>
          <li>
            <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, true, SCENES_ROUTE)} to={`${SCENES_ROUTE}`} name='scenes' className={`cvw-nav-btn ${isScene(pathname) ? 'cvw-nav-btn--active' : ''}`}>
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg`} icon={['fal', 'square-full']} />
              <FontAwesomeIcon onClick={(e) => linkClickHandler(e.currentTarget.parentNode.getAttribute('name'), true)} className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--brush ${isScene(pathname) ? 'cvw__btn-overlay__svg--active' : ''}`} icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
              <div className={`cvw__btn-overlay ${isScene(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'scenes' ? 'cvw__btn-overlay--last--active' : ''}`} />
              <span name='scenes'><FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' /></span>
            </Link>
          </li>
        </ul>
        <ul className='cvw-navigation-wrapper__right' role='presentation' onClick={(e) => linkClickHandler(e.target.getAttribute('name'), false)}>
          <li>
            <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, false, MY_IDEAS)} to={`${MY_IDEAS}`} name='idea' className={`cvw-nav-btn ${isMyIdeas(pathname) ? 'cvw-nav-btn--active' : ''}`}>
              <div className={`cvw__btn-overlay ${isMyIdeas(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'idea' ? 'cvw__btn-overlay--last--active' : ''}`} />
              <span name='idea' className='cvw-navigation-wrapper__right__text'><FormattedMessage id='NAV_LINKS.MY_IDEAS' /></span>
            </Link>
          </li>
          <li>
            <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, false, HELP_PATH)} to={`${HELP_PATH}`} name='help' className={`cvw-nav-btn ${isHelp(pathname) ? 'cvw-nav-btn--active' : ''}`}>
              <div className={`cvw__btn-overlay ${isHelp(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'help' ? 'cvw__btn-overlay--last--active' : ''}`} />
              <span name='help' className='cvw-navigation-wrapper__right__text'><FormattedMessage id='NAV_LINKS.HELP' /></span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  )
})
