// @flow
import React, { PureComponent, Fragment } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'

import Swatch from './Swatch/Swatch'
import Scene from './Scene/Scene'

type Props = {}

type State = {
  scenes: Array<{
    surfaces: Array<{
      currentColor?: string
    }>
  }>,
  colors: Array<{
    name: string,
    hex: string
  }>
}

class DnD extends PureComponent<Props, State> {
  state: State = {
    scenes: [{
      surfaces: [
        {},
        {},
        {
          currentColor: '#933'
        }
      ]
    }, {
      surfaces: [
        {},
        {
          currentColor: '#000'
        },
        {}
      ]
    }, {
      surfaces: [
        {
          currentColor: '#9d1'
        },
        {},
        {}
      ]
    }],
    colors: [{
      name: 'red',
      hex: '#c33'
    }, {
      name: 'green',
      hex: '#3c3'
    }, {
      name: 'blue',
      hex: '#33c'
    }, {
      name: 'charcoal',
      hex: '#111'
    }, {
      name: 'titanium',
      hex: '#fafafa'
    }]
  }

  render () {
    return (
      <Fragment>
        <h1>Drag-and-Drop Tinting</h1>
        <h2>Scenes:</h2>
        { this.state.scenes.map((scene, i) => (
          <Scene key={i} initSurfaces={scene.surfaces} />
        ))}
        <h2>Swatches:</h2>
        { this.state.colors.map((color, i) => (
          <Swatch key={i} colorName={color.name} colorValue={color.hex} />
        ))}
      </Fragment>
    )
  }
}

export default DragDropContext(HTML5Backend)(DnD)
