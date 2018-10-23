// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import { loadScenes, paintSceneSurface } from '../../actions/loadScenes'
import TintableScene from './TintableScene'

import './SceneManager.scss'

type Props = {
  scenes: Array<any>,
  loadScenes: Function,
  paintSceneSurface: Function,
  loadingScenes: boolean,
  activeColor: string | void,
  previewColor: string | void
}

type State = {
  currentSceneIndex: number
}

class SceneManager extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager'

  state = {
    currentSceneIndex: 0
  }

  constructor (props) {
    super(props)

    this.handleColorUpdate = this.handleColorUpdate.bind(this)
  }

  handleColorUpdate = function handleColorUpdate (sceneId, surfaceId, color) {
    this.props.paintSceneSurface(sceneId, surfaceId, color)
  }

  componentDidMount () {
    this.props.loadScenes()
  }

  render () {
    const { scenes, loadingScenes, activeColor, previewColor } = this.props
    const { currentSceneIndex } = this.state

    if (loadingScenes) {
      return 'Loading...'
    }

    return (
      <div className={SceneManager.baseClass}>
        {/* POC scene-switching buttons to demonstrate performance */}
        {scenes.map((scene, index) => (
          <button key={scene.id}
            onClick={() => { this.setState({ currentSceneIndex: index }) }}
            className={`${SceneManager.baseClass}__btn ${index === currentSceneIndex ? `${SceneManager.baseClass}__btn--active` : ''}`}
            type='button'>

            <TintableScene
              sceneId={scene.id}
              interactive={false}
              background={scene.thumb}
              clickToPaintColor={activeColor}
              surfaces={scene.surfaces.map(surface => ({
                id: surface.id,
                mask: surface.mask,
                hitArea: surface.hitArea,
                color: surface.color || void (0)
              }))}
            />
          </button>
        ))}

        {scenes.map((scene, index) => (
          <TintableScene key={scene.id}
            sceneId={scene.id}
            render={currentSceneIndex === index}
            background={scene.image}
            clickToPaintColor={activeColor}
            onUpdateColor={this.handleColorUpdate}
            previewColor={previewColor}
            surfaces={scene.surfaces.map(surface => ({
              id: surface.id,
              mask: surface.mask,
              hitArea: surface.hitArea,
              color: surface.color || void (0)
            }))}
          />
        ))}
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  let activeColor = void (0)
  let previewColor = void (0)

  if (state.lp.activeColor && state.lp.activeColor.hex) {
    activeColor = state.lp.activeColor.hex
  }

  if (state.lp.activePreviewColor && state.lp.activePreviewColor.hex) {
    previewColor = state.lp.activePreviewColor.hex
  }

  return {
    scenes: state.scenes.scenes,
    numScenes: state.scenes.numScenes,
    loadingScenes: state.scenes.loadingScenes,
    activeColor: activeColor,
    previewColor: previewColor
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadScenes: () => {
      dispatch(loadScenes())
    },
    paintSceneSurface: (sceneId, surfaceId, color) => {
      dispatch(paintSceneSurface(sceneId, surfaceId, color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SceneManager)
