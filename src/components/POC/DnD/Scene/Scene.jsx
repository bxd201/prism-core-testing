// @flow
import React, { PureComponent } from 'react'
import _ from 'lodash'

import SceneSurface from './SceneSurface'

import './Scene.scss'

type Props = {
  initSurfaces: Array<{
    // NOTE: this will contain other scene surface data in the future, still unsure what that will look like
    currentColor?: string
  }>
}

type State = {
  surfaces: Array<{
    id: string,
    currentColor?: string
  }>
}

class Scene extends PureComponent<Props, State> {
  static defaultProps: Props = {
    initSurfaces: []
  }

  state: State = {
    surfaces: []
  }

  constructor (props: Props) {
    const { initSurfaces } = props

    super(props)

    // hydrate state.surfaces w/ initSurfaces data
    this.state.surfaces = _.clone(initSurfaces).map(surface => {
      return {
        id: _.uniqueId(),
        currentColor: surface.currentColor
      }
    })
  }

  handleDrop = (id: number, color: string) => {
    const { surfaces } = this.state
    const index = _.findIndex(surfaces, scene => {
      return scene.id === id
    })
    const newSurfaces = _.clone(surfaces)

    // replace item in collection with new, updated instance of obj to avoid mutation complications
    newSurfaces[ index ] = Object.assign({}, newSurfaces[ index ], { currentColor: color })

    if (index > -1) {
      this.setState({
        surfaces: newSurfaces
      })
    }
  }

  render () {
    const { surfaces } = this.state

    return (
      <div className='prism-scene'>
        { surfaces.map(scene => {
          const { id, currentColor } = scene

          return (
            <SceneSurface id={id} color={currentColor} key={id} onDrop={this.handleDrop} />
          )
        }) }
      </div>
    )
  }
}

export default Scene
