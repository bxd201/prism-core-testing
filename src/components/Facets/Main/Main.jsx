import React, { Component } from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

// import SceneList from '../../SceneList/SceneList'
// import TintableScene from '../../TintableScene/TintableScene'
// import LivePalette from '../../LivePalette/LivePalette'
// import ColorList from '../../ColorList/ColorList'
import SceneBuilder from '../../POC/SceneBuilder/SceneBuilder'

class Main extends Component {
  render () {
    return (
      <React.Fragment>
        {/* <SceneList />
        <TintableScene /> */}
        <SceneBuilder />
        {/* <LivePalette />
        <ColorList /> */}
      </React.Fragment>
    )
  }
}

export default DragDropContext(HTML5Backend)(Main)
