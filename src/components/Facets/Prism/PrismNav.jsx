// @flow
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import './PrismNav.scss'

const isScene = (pathname) => {
  return /^\/active\/?$/.test(pathname)
}

type Props = {
  navigate: Function
}

const isMyIdeas = (pathname) => {
  return /^\/my-ideas/.test(pathname)
}

export default (props: Props) => {
  const location = useLocation()
  const { pathname } = location
  const dispatch = useDispatch()
  useEffect(() => { dispatch(toggleCompareColor(true)) }, [location])

  return (
    <>
      <div role='presentation' onClick={() => props.navigate(true)}>
        <Link to='/active/colors' className={`prism-nav-btn ${isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Explore Colors</Link>
        <Link to='/active/inspiration' className={`prism-nav-btn ${isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Get Inspired</Link>
        <Link to='/active/scenes' className={`prism-nav-btn ${isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Paint a Photo</Link>
      </div>
      <Link to='/my-ideas' onClick={() => props.navigate(false)} className={`prism-nav-btn ${isMyIdeas(pathname) ? 'prism-nav-btn--active' : ''}`}>My Ideas</Link>
    </>
  )
}
