import React, { Component } from 'react'
import { Provider } from 'react-redux'

import store from '../store'

import TintableScene from './TintableScene/TintableScene'
import ColorList from './ColorList/ColorList'
import SceneList from './SceneList/SceneList'

class Prism extends Component {
  render () {
    return (
      <Provider store={store}>
        <React.Fragment>
          <SceneList />
          <TintableScene />
          <ColorList />
        </React.Fragment>
      </Provider>
    )
  }
}

export default Prism
