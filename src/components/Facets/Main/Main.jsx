import React, { Component } from 'react'

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

export default Main
