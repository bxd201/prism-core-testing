// @flow
import React, { PureComponent } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { loadScenes } from '../../../actions/loadScenes'
import DeadSimpleScene from './DeadSimpleScene'

type Props = {
  scenes: any,
  loadScenes: Function,
  loadingScenes: boolean,
  activeColor: any // TODO: make color interface
}

class SceneBuilder extends PureComponent<Props> {
  componentDidMount () {
    this.props.loadScenes()
  }

  render () {
    const { scenes, loadingScenes, activeColor } = this.props
    let clickToPaintColor = void (0)

    if (activeColor && activeColor.hex) {
      clickToPaintColor = activeColor.hex
    }

    if (loadingScenes) {
      return 'Loading...'
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {scenes.map((scene, index) => (
          <DeadSimpleScene key={index}
            background={scene.image}
            clickToPaintColor={clickToPaintColor}
            initSurfaces={scene.surfaces.map(surface => ({
              id: surface.id,
              mask: surface.mask,
              hitArea: surface.hitArea,
              color: _.sample([ '#EDEAE0', '#FFFFFF', '#F0E0D0', '#ADA5A5', '#EEEEEE', '#666', '#333' ])
            }))}
          />
        ))}
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    scenes: state.scenes.scenes,
    numScenes: state.scenes.numScenes,
    loadingScenes: state.scenes.loadingScenes,
    activeColor: state.lp.activeColor
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadScenes: () => {
      dispatch(loadScenes())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SceneBuilder)
