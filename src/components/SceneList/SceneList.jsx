import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import CSSVariableApplicator from '../../helpers/CSSVariableApplicator'

import { selectScene } from '../../actions/scenes'
import { ScriptVars, ScriptVarNames } from '../../shared/themes/ScriptVars'

class SceneList extends PureComponent {
  constructor (props) {
    super(props)

    this.selectScene = this.selectScene.bind(this)
  }

  render () {
    const variables = {
      [ ScriptVarNames.scenes.buttons.colors.default ]: ScriptVars.colors.warning,
      [ ScriptVarNames.scenes.buttons.colors.active ]: ScriptVars.colors.danger
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
