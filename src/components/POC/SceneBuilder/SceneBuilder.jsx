// @flow
/* eslint-disable */
import React, { PureComponent, Fragment } from 'react'
import _ from 'lodash'
import SceneDataWrapper from '../../../helpers/SceneDataWrapper'
import DeadSimpleScene from './DeadSimpleScene';

type Props = {
  scenes: any,
  numScenes: any,
  loadScenes: Function,
  loadingScenes: boolean
}

type State = {}

class SceneBuilder extends PureComponent<Props, State> {
  state: State = {}

  componentDidMount () {
    this.props.loadScenes()
  }

  render () {
    const { scenes, numScenes, loadingScenes } = this.props

    if( loadingScenes ) {
      return 'Loading...'
    }

    return (
      <Fragment>
        {scenes.map((scene, index) => (
          <DeadSimpleScene key={index} background={scene.image} surfaces={scene.surfaces.map(surface => ({
            id: surface.id,
            mask: surface.shape,
            hitArea: surface.path,
            color: _.sample([ '#EDEAE0', '#FFFFFF', '#F0E0D0', '#ADA5A5', '#EEEEEE', '#666', '#333' ])
          }))} />
        ))}
      </Fragment>
    )
  }
}

export default SceneDataWrapper(SceneBuilder)
