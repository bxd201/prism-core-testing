// @flow
import React, { useEffect, useState } from 'react'
import { Link, useLocation, withRouter } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import './ColorVisualizer.scss'
import { RouteConsumer } from '../../../contexts/RouteContext/RouteContext'

const KEY_CODE_TAB = 9
const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

export const isMyIdeas = (pathname) => {
  return /^\/my-ideas/.test(pathname)
}

export const isScene = (pathname) => {
  return (/^\/active\/scenes/.test(pathname) || /^\/paint-scene/.test(pathname))
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
    /^\/expert-colors/.test(pathname))
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
  const helpLinkRef = React.useRef()
  useEffect(() => { dispatch(toggleCompareColor(true)) }, [location])

  const setActiveHelper = (currActiveName) => {
    if (currActiveName !== currActive) {
      setLastActive(currActive)
      setActive(currActiveName)
    }
  }

  const linkKeyDownHandler = (e, context, isContextNavigate, toLink) => {
    context.getHelpLinkRef(helpLinkRef)
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      e.preventDefault()
      context.navigate(isContextNavigate, true)
      setActiveHelper(e.target.getAttribute('name'))
      props.history.push({
        pathname: toLink,
        state: {
          isKeyDownRoute: true
        }
      })
    } else if (!e.shiftKey && e.keyCode === KEY_CODE_TAB && toLink === '/help') {
      context.setIsTabbedOutFromHelp()
    }
  }

  return (
    <>
      <nav className='cvw-navigation-wrapper'>
        <RouteConsumer>
          {(context) => (
            <>
              <ul className='cvw-navigation-wrapper__center' role='presentation' onClick={(e) => { context.navigate(true, true); setActiveHelper(e.target.getAttribute('name')) }}>
                <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, context, true, '/active/colors')} to='/active/colors' name='colors' className={`cvw-nav-btn ${isColors(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isColors(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'colors' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='colors'>Explore Colors</span>
                </Link>
                <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, context, true, '/active/inspiration')} to='/active/inspiration' name='inspiration' className={`cvw-nav-btn ${isInspiration(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isInspiration(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'inspiration' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='inspiration'>Get Inspired</span>
                </Link>
                <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, context, true, '/active/scenes')} to='/active/scenes' name='scenes' className={`cvw-nav-btn ${isScene(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isScene(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'scenes' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='scenes'>Paint a Photo</span>
                </Link>
              </ul>
              <ul className='cvw-navigation-wrapper__right' role='presentation' onClick={(e) => { context.navigate(false, true); setActiveHelper(e.target.getAttribute('name')) }}>
                <Link onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, context, false, '/my-ideas')} to='/my-ideas' name='idea' className={`cvw-nav-btn ${isMyIdeas(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isMyIdeas(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'idea' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='idea' className='cvw-navigation-wrapper__right__text'>My Ideas</span>
                </Link>
                <Link ref={helpLinkRef} onMouseDown={(e) => e.preventDefault()} onKeyDown={(e) => linkKeyDownHandler(e, context, false, '/help')} to='/help' name='help' className={`cvw-nav-btn ${isHelp(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isHelp(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'help' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='help' className='cvw-navigation-wrapper__right__text'>Help</span>
                </Link>
              </ul>
            </>
          )}
        </RouteConsumer>
      </nav>
    </>
  )
})
