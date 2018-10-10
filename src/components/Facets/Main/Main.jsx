import React, { Component } from 'react'

import SceneList from '../../SceneList/SceneList'
import TintableScene from '../../TintableScene/TintableScene'
import LivePalette from '../../LivePalette/LivePalette'
import ColorList from '../../ColorList/ColorList'

class Main extends Component {
  render () {
    return (
      <React.Fragment>
        <SceneList />
        <TintableScene />
        <LivePalette />
        <ColorList />
      </React.Fragment>
    )
  }
}

export default Main
