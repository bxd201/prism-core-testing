import React, { Component } from 'react'

import LivePalette from '../../LivePalette/LivePalette'
import SceneManager from '../../SceneManager/SceneManager'
import { withDragDropContext } from '../../../helpers/WithDragDropContext'

class Tinter extends Component {
  render () {
    const { sceneSet } = this.props

    return (
      <React.Fragment>
        <SceneManager type={sceneSet} />
        <LivePalette />
      </React.Fragment>
    )
  }
}

export default withDragDropContext(Tinter)
