// @flow
import React from 'react'
import { withRouter, type RouterHistory } from 'react-router-dom'

import './PrismNav.scss'

const isScene = function (pathname) {
  return /^\/active\/?$/.test(pathname)
}

const isColorWall = function (pathname) {
  return /^\/active\/color-wall/.test(pathname)
}

const isFastMask = function (pathname) {
  return /^\/fast-mask\/?$/.test(pathname)
}

type Props = {
  location: Location,
  history: RouterHistory,
  match: {
    params: Object
  }
}

export const PrismNav = React.memo<Props>((props: Props) => {
  const { history, location: { pathname } } = props

  return (
    <React.Fragment>
      <button onClick={() => { history.push('/active') }} className={`prism-nav-btn ${isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Scenes</button>
      <button onClick={() => { history.push('/active/color-wall') }} className={`prism-nav-btn ${isColorWall(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Wall</button>
      <button onClick={() => { history.push('/fast-mask') }} className={`prism-nav-btn ${isFastMask(pathname) ? 'prism-nav-btn--active' : ''}`}>Fast Mask</button>
    </React.Fragment>
  )
})

export default withRouter(PrismNav)
