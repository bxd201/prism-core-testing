import React, { Component } from 'react'

import LivePalette from '../../LivePalette/LivePalette'
import SceneManager from '../../SceneManager/SceneManager'
import { withDragDropContext } from '../../../helpers/WithDragDropContext'

class Tinter extends Component {
  render () {
    return (
      <React.Fragment>
        <SceneManager />
        <LivePalette />
      </React.Fragment>
    )
  }
}

export default withDragDropContext(Tinter)
