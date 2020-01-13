// @flow
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import './ColorVisualizer.scss'
import { RouteConsumer } from '../../../contexts/RouteContext/RouteContext'

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

export default (props: Props) => {
  const [lastActive, setLastActive] = useState(null)
  const [currActive, setActive] = useState(null)
  const location = useLocation()
  const { pathname } = location
  const dispatch = useDispatch()
  useEffect(() => { dispatch(toggleCompareColor(true)) }, [location])

  const setActiveHelper = (currActiveName) => {
    if (currActiveName !== currActive) {
      setLastActive(currActive)
      setActive(currActiveName)
    }
  }

  return (
    <>
      <nav className='cvw-navigation-wrapper'>
        <RouteConsumer>
          {(context) => (
            <>
              <ul className='cvw-navigation-wrapper__center' role='presentation' onClick={(e) => { context.navigate(true, true); setActiveHelper(e.target.getAttribute('name')) }}>
                <Link to='/active/colors' name='colors' className={`cvw-nav-btn ${isColors(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isColors(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'colors' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='colors'>Explore Colors</span>
                </Link>
                <Link to='/active/inspiration' name='inspiration' className={`cvw-nav-btn ${isInspiration(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isInspiration(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'inspiration' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='inspiration'>Get Inspired</span>
                </Link>
                <Link to='/active/scenes' name='scenes' className={`cvw-nav-btn ${isScene(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isScene(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'scenes' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='scenes'>Paint a Photo</span>
                </Link>
              </ul>
              <ul className='cvw-navigation-wrapper__right' role='presentation' onClick={(e) => { context.navigate(false, true); setActiveHelper(e.target.getAttribute('name')) }}>
                <Link to='/my-ideas' name='idea' className={`cvw-nav-btn ${isMyIdeas(pathname) ? 'cvw-nav-btn--active' : ''}`}>
                  <div className={`cvw__btn-overlay ${isMyIdeas(pathname) ? 'cvw__btn-overlay--active' : ''} ${lastActive === 'idea' ? 'cvw__btn-overlay--last--active' : ''}`} />
                  <span name='idea' className='cvw-navigation-wrapper__right__text'>My Ideas</span>
                </Link>
                <Link to='/help' name='help' className={`cvw-nav-btn ${isHelp(pathname) ? 'cvw-nav-btn--active' : ''}`}>
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
}
