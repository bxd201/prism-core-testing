// @flow
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import './PrismNav.scss'

const isScene = (pathname) => {
  return /^\/active\/?$/.test(pathname)
}

const isColorWall = (pathname) => {
  return /^\/active\/color-wall/.test(pathname)
}

const isColorFromImage = (pathname) => {
  return /^\/color-from-image/.test(pathname)
}

const isColorCollections = (pathname) => {
  return /^\/color-collections/.test(pathname)
}

const isExpertColor = (pathname) => {
  return /^\/expert-colors/.test(pathname)
}

const isMatchPhoto = (pathname) => {
  return /^\/match-photo/.test(pathname)
}

const isPaintScene = (pathname) => {
  return /^\/paint-scene/.test(pathname)
}

const isFastMask = (pathname) => {
  return /^\/fast-mask/.test(pathname)
}

export default () => {
  const location = useLocation()
  const { pathname } = location
  const dispatch = useDispatch()

  useEffect(() => { dispatch(toggleCompareColor(true)) }, [location])

  return (
    <>
      <Link to='/active' className={`prism-nav-btn ${isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Scenes</Link>
      <Link to='/active/color-wall/section/sherwin-williams-colors' className={`prism-nav-btn ${isColorWall(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Wall</Link>
      <Link to='/color-from-image' className={`prism-nav-btn ${isColorFromImage(pathname) ? 'prism-nav-btn--active' : ''}`}>Color From Image</Link>
      <Link to='/color-collections' className={`prism-nav-btn ${isColorCollections(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Collections</Link>
      <Link to='/expert-colors' className={`prism-nav-btn ${isExpertColor(pathname) ? 'prism-nav-btn--active' : ''}`}>Expert Colors</Link>
      <Link to='/match-photo' className={`prism-nav-btn ${isMatchPhoto(pathname) ? 'prism-nav-btn--active' : ''}`}>Match Photo</Link>
      <Link to='/paint-scene' className={`prism-nav-btn ${isPaintScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Paint a Scene</Link>
      <Link to='/fast-mask' className={`prism-nav-btn ${isFastMask(pathname) ? 'prism-nav-btn--active' : ''}`}>Fast Mask</Link>
    </>
  )
}
