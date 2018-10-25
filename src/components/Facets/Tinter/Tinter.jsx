import React, { Component } from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import LivePalette from '../../LivePalette/LivePalette'
import SceneManager from '../../SceneManager/SceneManager'

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

export default DragDropContext(HTML5Backend)(Tinter)
