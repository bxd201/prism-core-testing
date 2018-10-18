// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { loadScenes } from '../../actions/loadScenes'
import TintableScene from './TintableScene'

import './SceneManager.scss'

type Props = {
  scenes: any,
  loadScenes: Function,
  loadingScenes: boolean,
  activeColor: any // TODO: make color interface
}

class SceneManager extends PureComponent<Props> {
  static baseClass = 'prism-scene-manager'

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
      <div className={SceneManager.baseClass}>
        {scenes.map((scene, index) => (
          <TintableScene key={index}
            background={scene.image}
            clickToPaintColor={clickToPaintColor}
            initSurfaces={scene.surfaces.map(surface => ({
              id: surface.id,
              mask: surface.mask,
              hitArea: surface.hitArea,
              color: void (0)
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

export default connect(mapStateToProps, mapDispatchToProps)(SceneManager)
