import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { selectScene } from '../../actions/scenes'

const Button = styled.button`
  width: 150px;
  height: 50px;
  background-color: lightgray;
  margin-right: 1em;
`

class SceneList extends PureComponent {
  constructor (props) {
    super(props)

    this.selectScene = this.selectScene.bind(this)
  }

  render () {
    return (
      <React.Fragment>
        <Button onClick={() => this.selectScene('room')}>Room</Button>
        <Button onClick={() => this.selectScene('chair')}>Chair</Button>
      </React.Fragment>
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
