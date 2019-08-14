/* eslint-disable */
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import './PrismNav.scss'

export class PrismNav extends PureComponent {
  constructor(props) {
    super(props)
  }

  isScene(pathname) {
    return /^\/active\/?$/.test(pathname)
  }

  isColorWall(pathname) {
    return /^\/active\/color-wall/.test(pathname)
  }

  isSearch(pathname) {
    return /^\/search\/?$/.test(pathname)
  }

  isColorFromImage(pathname) {
    return /^\/color-from-image/.test(pathname)
  }

  isColorCollections(pathname) {
    return /^\/color-collections/.test(pathname)
  }

  isExpertColor(pathname) {
    return /^\/expert-colors/.test(pathname)
  }

  isMatchPhoto(pathname) {
    return /^\/match-photo/.test(pathname)
  }

  render() {
    const { history, location: { pathname }, match } = this.props

    return (
      <React.Fragment>
        <button onClick={() => { this.props.history.push('/active') }} className={`prism-nav-btn ${this.isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Scenes</button>
        <button onClick={() => { this.props.history.push('/active/color-wall') }} className={`prism-nav-btn ${this.isColorWall(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Wall</button>
        <button onClick={() => { this.props.history.push('/color-from-image') }} className={`prism-nav-btn ${this.isColorFromImage(pathname) ? 'prism-nav-btn--active' : ''}`}>Color From Image</button>
        <button onClick={() => { this.props.history.push('/color-collections') }} className={`prism-nav-btn ${this.isColorCollections(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Collections</button>
        <button onClick={() => { this.props.history.push('/expert-colors') }} className={`prism-nav-btn ${this.isExpertColor(pathname) ? 'prism-nav-btn--active' : ''}`}>Expert Colors</button>
        <button onClick={() => { this.props.history.push('/match-photo') }} className={`prism-nav-btn ${this.isMatchPhoto(pathname) ? 'prism-nav-btn--active' : ''}`}>Match Photo</button>
        <button onClick={() => { this.props.history.push('/search') }} className={`prism-nav-btn ${this.isSearch(pathname) ? 'prism-nav-btn--active' : ''}`}>Search</button>
      </React.Fragment>
    )
  }
}

export default withRouter(PrismNav)
