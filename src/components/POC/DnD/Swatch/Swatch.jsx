/* eslint-disable */
// @flow
import React, { PureComponent } from 'react'
import { DRAG_TYPES } from 'constants/globals'
import { DragSource } from 'react-dnd'
import tinycolor from '@ctrl/tinycolor'

import './Swatch.scss'

type Props = {
  colorName: string,
  colorValue: string,
  connectDragSource: Function,
  connectDragPreview: Function,
  isDragging: Boolean,
  children: any
}

const swatchSpec = {
  beginDrag(props) {
    return {
      colorValue: props.colorValue
    }
  }
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class Swatch extends PureComponent<Props> {
  static baseClass: string = 'prism-swatch'
  static getClassName (isDragging, isLight) {
    return [
      Swatch.baseClass,
      isDragging ? `${Swatch.baseClass}--dragging` : null,
      isLight ? `${Swatch.baseClass}--light` : `${Swatch.baseClass}--dark`
    ].join(' ')
  }

  render () {
    const { isDragging, colorValue, colorName, connectDragSource } = this.props
    const tc = tinycolor(colorValue)

    return connectDragSource && connectDragSource(
      <span style={{ background: colorValue }}
        className={Swatch.getClassName(isDragging, tc.isLight())}>
        <strong>{colorName}</strong> { colorValue }
      </span>
    )
  }
}

export default DragSource(DRAG_TYPES.SWATCH, swatchSpec, collect)(Swatch)
