/* eslint-disable */
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import './PrismNav.scss'

export class PrismNav extends PureComponent {
  constructor (props) {
    super(props)
  }

  isScene (pathname) {
    return /^\/active\/?$/.test(pathname)
  }

  isColorWall (pathname) {
    return /^\/active\/color-wall/.test(pathname)
  }

  isFastMask (pathname) {
    return /^\/fast-mask\/?$/.test(pathname)
  }

  render () {
    const { history, location: { pathname }, match } = this.props

    return (
      <React.Fragment>
        <button onClick={() => {this.props.history.push('/active')}} className={`prism-nav-btn ${this.isScene(pathname) ? 'prism-nav-btn--active' : ''}`}>Scenes</button>
        <button onClick={() => {this.props.history.push('/active/color-wall')}} className={`prism-nav-btn ${this.isColorWall(pathname) ? 'prism-nav-btn--active' : ''}`}>Color Wall</button>
        <button onClick={() => {this.props.history.push('/fast-mask')}} className={`prism-nav-btn ${this.isFastMask(pathname) ? 'prism-nav-btn--active' : ''}`}>Fast Mask</button>
      </React.Fragment>
    )
  }
}

export default withRouter(PrismNav)
