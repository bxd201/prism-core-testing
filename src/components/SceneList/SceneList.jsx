import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import CSSVariableApplicator from '../../helpers/CSSVariableApplicator'

import { selectScene } from '../../actions/scenes'
import { varValues, varNames } from 'variables'

class SceneList extends PureComponent {
  constructor (props) {
    super(props)

    this.selectScene = this.selectScene.bind(this)
  }

  render () {
    const variables = {
      [ varNames.scenes.buttons.colors.default ]: varValues.colors.warning,
      [ varNames.scenes.buttons.colors.active ]: varValues.colors.danger
    }

    return (
      <CSSVariableApplicator variables={variables}>
        <button className='scene-picker-btn' onClick={() => this.selectScene('room')}>Room</button>
        <button className='scene-picker-btn' onClick={() => this.selectScene('chair')}>Chair</button>
      </CSSVariableApplicator>
    )
  }

  selectScene (scene) {
    this.props.selectScene(scene)
  }
}

SceneList.propTypes = {
  selectScene: PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectScene: (scene) => {
      dispatch(selectScene(scene))
    }
  }
}

export default connect(null, mapDispatchToProps)(SceneList)
