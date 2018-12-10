// @flow
import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import ColorInformation from '../../ColorInformation/ColorInformation'
import SceneManager from '../../SceneManager/SceneManager'

import './ColorDetail.scss'

// type State = {
//   sceneIsDisplayed: boolean,
//   sceneIsMaximized: boolean
// }

class ColorDetail extends PureComponent<Props> {
  state = {
    sceneIsDisplayed: true,
    sceneIsMaximized: false
  }

  constructor (props) {
    super(props)

    this.toggleSceneDisplay = this.toggleSceneDisplay.bind(this)
    this.toggleSceneMaximized = this.toggleSceneMaximized.bind(this)
  }

  toggleSceneDisplay () {
    this.setState({ sceneIsDisplayed: !this.state.sceneIsDisplayed })
  }

  toggleSceneMaximized () {
    this.setState({ sceneIsMaximized: !this.state.sceneIsMaximized })
  }

  render () {
    const activeColor = { hex: '#46271e' }
    const { sceneIsDisplayed, sceneIsMaximized } = this.state

    return (
      <Fragment>
        <div className='color-detail-view'>
          <div className={`color-detail__scene-wrapper ${sceneIsDisplayed ? ` color-detail__scene-wrapper--displayed` : ''}  ${sceneIsMaximized ? ` color-detail__scene-wrapper--maximized` : ''}`}>
            <SceneManager type='ROOM' activeColor={activeColor} />
          </div>
          <div className='color-detail__info-wrapper'>
            <ColorInformation activeColor={activeColor} sceneIsDisplayedHandler={() => this.toggleSceneDisplay()} sceneIsMaximizedHandler={() => this.toggleSceneMaximized()} />
          </div>
        </div>
      </Fragment>
    )
  }
}

const mapDispatchToProps: Function = (dispatch) => {
  return {
  }
}

export default connect(null, mapDispatchToProps)(ColorDetail)
