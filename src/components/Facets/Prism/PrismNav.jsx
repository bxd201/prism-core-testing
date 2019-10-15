// @flow
import React, { PureComponent } from 'react'
import { withRouter, type RouterHistory } from 'react-router-dom'
import { connect } from 'react-redux'
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

type Props = {
  history: RouterHistory,
  location: Location,
  toggleCompareColor: Function
}

export class PrismNav extends PureComponent<Props> {
  componentDidUpdate (prevProps: Props) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged()
    }
  }

  onRouteChanged () {
    this.props.toggleCompareColor(true)
  }

  render () {
    const { history, location: { pathname } } = this.props

    return (
      <React.Fragment>
        <button onClick={() => { history.push('/active') }} className={`prism-nav-btn ${isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Scenes</button>
        <button onClick={() => { history.push('/active/color-wall') }} className={`prism-nav-btn ${isColorWall(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Wall</button>
        <button onClick={() => { history.push('/color-from-image') }} className={`prism-nav-btn ${isColorFromImage(pathname) ? 'prism-nav-btn--active' : ''}`}>Color From Image</button>
        <button onClick={() => { history.push('/color-collections') }} className={`prism-nav-btn ${isColorCollections(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Collections</button>
        <button onClick={() => { history.push('/expert-colors') }} className={`prism-nav-btn ${isExpertColor(pathname) ? 'prism-nav-btn--active' : ''}`}>Expert Colors</button>
        <button onClick={() => { history.push('/match-photo') }} className={`prism-nav-btn ${isMatchPhoto(pathname) ? 'prism-nav-btn--active' : ''}`}>Match Photo</button>
        <button onClick={() => { history.push('/paint-scene') }} className={`prism-nav-btn ${isPaintScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Paint a Scene</button>
        <button onClick={() => { history.push('/fast-mask') }} className={`prism-nav-btn ${isFastMask(pathname) ? 'prism-nav-btn--active' : ''}`}>Fast Mask</button>
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    toggleCompareColor: (isClose) => {
      dispatch(toggleCompareColor(isClose))
    }
  }
}

export default connect(null, mapDispatchToProps)(withRouter(PrismNav))
