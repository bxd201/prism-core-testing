/* eslint-disable */
// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import ColorWallSwatch from './ColorWallSwatch'
import { add } from '../../../actions/live-palette'
import { type Color } from '../../../shared/types/Colors'

type ColorProps = {
  color: Color,
  level?: number
}

type Props = {
  colors: Array<Color>, // eslint-disable-line react/no-unused-prop-types
  addToLivePalette: Function,
  active?: string // eslint-disable-line react/no-unused-prop-types
}

type ColorReference = {
  id: number,
  level?: number,
  offsetX?: number,
  offsetY?: number
}
type ColorMap = ColorReference[]

type State = {
  colorHash: {
    [ key: number ]: Color
  },
  levelHash: {
    [ key: number ]: ColorReference
  },
  componentHash: {
    // $FlowIgnore
    [ key: number ]: React.ComponentElement
  },
  colorMap: ColorMap,
  originalColorMap: ColorMap
}

class ColorWallSwatchList extends PureComponent<Props, State> {
  state: State = {
    colorHash: {},
    levelHash: {},
    componentHash: {},
    colorMap: [],
    originalColorMap: []
  }

  constructor (props: Props) {
    super(props)

    const { colors } = props

    this.activateColor = this.activateColor.bind(this)
    this.addColor = this.addColor.bind(this)

    let colorMap: ColorMap = [];
    let colorHash: Object = {};
    let componentHash: Object = {};

    colors.forEach((color: Color) => {
      colorHash[color.id] = color
      componentHash[color.id] = ColorWallSwatchList.getColorWallSwatch(color.id, this.activateColor, this.addColor, color)

      colorMap.push({
        id: color.id
      })
    })

    this.state.colorHash = colorHash
    this.state.componentHash = componentHash
    this.state.colorMap = this.state.originalColorMap = colorMap
  }

  static getAreaOfEffect (x: number, y: number, r: number, angle: number): {
    x: number,
    y: number,
    distance: number
  } {
    const endX = Math.round(x + r * Math.cos(angle))
    const endY = Math.round(y + r * Math.sin(angle))
    const xes = endX - x
    const yes = endY - y
    const distance = Math.sqrt((xes * xes) + (yes * yes))

    return {
      x: endX,
      y: endY,
      distance: distance
    }
  }

  static getColorWallSwatch (key: number, onEngage: Function, onAdd:Function, color: Color, level?: number, offsetX?: number, offsetY?: number) {
    return <ColorWallSwatch key={key} onEngage={onEngage} onAdd={onAdd} color={color} level={level} offsetX={offsetX} offsetY={offsetY} />
  }

  static getColorCoords (id: number, chunkedColors: ColorMap[]) {
    return _.map(chunkedColors, (colorRow: ColorMap, x: number) => {
      const y = _.findIndex(colorRow, (colorProps: ColorReference) => {
        return colorProps.id === id
      })

      if (y >= 0) {
        return [x, y]
      }

      return void (0)
    }).filter(val => !!val).reduce((total, current) => {
      return current || total
    })
  }

  addColor = function addColor (newColor: Color) {
    const { addToLivePalette } = this.props

    addToLivePalette(newColor)
  }

  activateColor = function activateColor (newColor: Color) {
    const activeSwatchId = newColor.id
    const { colorHash, componentHash, levelHash, originalColorMap } = this.state

    if (activeSwatchId) {
      let chunkedColors = _.chunk(originalColorMap, 56)
      const coords: number[] | void = ColorWallSwatchList.getColorCoords(activeSwatchId, chunkedColors)

      if (!coords || !coords.length) {
        return
      }
      // TODO: Refactor this whole thing; it's gross and bad
      // reference: https://stackoverflow.com/questions/24390773/how-do-i-make-a-radial-gradient-of-values-in-a-2d-array
      const centerX = coords[0]
      const centerY = coords[1]
      const angleRange = [22.5, 11.25]
      let radius = 2
      const maxRadius = radius + 1

      chunkedColors[centerX][centerY] = Object.assign({}, chunkedColors[centerX][centerY], {
        level: maxRadius,
        offsetX: 0,
        offsetY: 0
      })

      const drawCircle = (r) => {
        let angle = 0
        while (angle < 360) {
          const position = ColorWallSwatchList.getAreaOfEffect(centerX, centerY, r, angle)
          if (chunkedColors[position.x] && chunkedColors[position.x][position.y]) {
            let amt = maxRadius - r

            if (Math.round(position.distance) === position.distance) {
              amt += 0.5
            }

            const curLevel = chunkedColors[position.x][position.y].level

            if (!curLevel || curLevel < amt) {
              chunkedColors[position.x][position.y] = Object.assign({}, chunkedColors[position.x][position.y], {
                level: amt,
                offsetX: position.x - centerX,
                offsetY: position.y - centerY
              })
            }
          }

          angle += (angleRange[radius - 1] || 1)
        }
      }

      while (radius > 0) {
        drawCircle(radius)
        radius--
      }

      const _colorMap = _.flatten(chunkedColors)
      const _levelHash = Object.assign({}, levelHash)
      const _componentHash = Object.assign({}, componentHash)

      _colorMap.forEach((colorRef: ColorReference) => {
        const oldLevel = levelHash[colorRef.id]
        const color = colorHash[colorRef.id]

        // this swatch has previously been active in a different position; reset it to the new position
        const needsUpdated: boolean = !!(oldLevel && (oldLevel.offsetX !== colorRef.offsetX || oldLevel.offsetY !== colorRef.offsetY))
        // this is a swatch which has NOT been active and needs to become active
        const needsNew: boolean = !!(colorRef.offsetX || colorRef.offsetY || colorRef.level)

        if (needsUpdated || needsNew) {
          _componentHash[colorRef.id] = ColorWallSwatchList.getColorWallSwatch(colorRef.id, this.activateColor, this.addColor, color, colorRef.level, colorRef.offsetX, colorRef.offsetY)
          _levelHash[colorRef.id] = Object.assign({}, colorRef)
        }
      })

      this.setState({
        colorMap: _colorMap,
        componentHash: _componentHash,
        levelHash: _levelHash
      })
    }
  }

  render () {
    const { componentHash, colorMap } = this.state

    return (
      <ul className='color-wall-swatches'>
        {colorMap.map((colorRef: ColorReference) => {
          return componentHash[colorRef.id]
        })}
      </ul>
    )
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(ColorWallSwatchList)
