import React, { Component } from 'react'
import PropTypes from 'prop-types'

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

Tinter.propTypes = {
  sceneSet: PropTypes.string
}

export default withDragDropContext(Tinter)
