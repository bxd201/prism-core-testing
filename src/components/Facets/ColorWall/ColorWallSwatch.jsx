/* eslint-disable */
// @flow
import React, { PureComponent, Fragment } from 'react'
import _ from 'lodash'

import { type Color } from '../../../shared/types/Colors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  onEngage: Function,
  onAdd: Function,
  level?: number,
  offsetX?: number,
  offsetY?: number,
  active?: boolean
}

class ColorWallSwatch extends PureComponent<Props, State> {
  static CLASS_NAMES = {
    BASE: 'color-swatch-inner',
    BASE_ACTIVE: 'color-swatch-inner--active',
    BASE_BLOOM: 'color-swatch-inner--bloom',
    BASE_BLOOM_CENTER: 'color-swatch-inner--bloom-center',
    BASE_BLOOM_LVL_: 'color-swatch-inner--bloom-lvl-',
    BASE_OFFSET_X_: 'color-swatch-inner--offset-x-',
    BASE_OFFSET_Y_: 'color-swatch-inner--offset-y-',
    BASE_DARK: 'color-swatch-inner--dark-color',
    CONTENT: 'color-swatch-inner__content',
    CONTENT_NUMBER: 'color-swatch-inner__content__number',
    CONTENT_NAME: 'color-swatch-inner__content__name',
    CONTENT_ADD: 'color-swatch-inner__content__add',
    CONTENT_DETAILS: 'color-swatch-inner__content__details',
    SWATCH: 'color-wall-swatches__swatch'
  }

  constructor (props: Props) {
    super(props)

    this.handleAddClick = this.handleAddClick.bind(this)
    this.handleDetailClick = this.handleDetailClick.bind(this)
    this.handleSwatchClick = this.handleSwatchClick.bind(this)
  }

  render () {
    const { level } = this.props

    return (
      <Fragment>
        <li className={ColorWallSwatch.CLASS_NAMES.SWATCH}>
          {level === 0 ? (
            this.getSwatchDetails()
          ) : (
            this.getSwatchFacade()
          )}
        </li>
      </Fragment>
    )
  }

  static numToString = _.memoize(function numToString (num: number) {
    return num.toString().replace(/-/g, 'n').replace(/\./g, '-')
  })

  getClasses () {
    const { level, offsetX, offsetY, color, active } = this.props
    const levelDefined = !isNaN(level)
    let classes = [ColorWallSwatch.CLASS_NAMES.BASE]

    if (active) {
      classes.push(ColorWallSwatch.CLASS_NAMES.BASE_ACTIVE)
    }

    if (levelDefined) {
      classes.push(ColorWallSwatch.CLASS_NAMES.BASE_BLOOM)
      // $FlowIgnore -- Flow doesn't understand that we can't get here unless level is a number
      classes.push(ColorWallSwatch.CLASS_NAMES.BASE_BLOOM_LVL_ + ColorWallSwatch.numToString(level))
    }

    if (offsetX) {
      let className = ColorWallSwatch.CLASS_NAMES.BASE_OFFSET_X_ + ColorWallSwatch.numToString(offsetX)
      classes.push(className)

      if (offsetY === 0) {
        classes.push(className + '--primary')
      }
    }

    if (offsetY) {
      let className = ColorWallSwatch.CLASS_NAMES.BASE_OFFSET_Y_ + ColorWallSwatch.numToString(offsetY)
      classes.push(className)

      if (offsetX === 0) {
        classes.push(className + '--primary')
      }
    }

    if (!offsetX && !offsetY && levelDefined) {
      classes.push(ColorWallSwatch.CLASS_NAMES.BASE_BLOOM_CENTER)
    }

    if (color.isDark) {
      classes.push(ColorWallSwatch.CLASS_NAMES.BASE_DARK)
    }

    return classes.join(' ')
  }

  getStyles () {
    const { color } = this.props

    let styleObj: {
      background: string
    } = {
      background: color.hex
    }

    return styleObj
  }

  getSwatchDetails = function getSwatchDetails () {
    const { color } = this.props

    return (
      <div className={this.getClasses()} style={this.getStyles()}>
        <div className={ColorWallSwatch.CLASS_NAMES.CONTENT}>
          <p className={ColorWallSwatch.CLASS_NAMES.CONTENT_NUMBER}>{`${color.brandKey ? color.brandKey + ' ' : ''} ${color.colorNumber}`}</p>
          <p className={ColorWallSwatch.CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
          <button autoFocus onClick={this.handleAddClick} className={ColorWallSwatch.CLASS_NAMES.CONTENT_ADD}>
            <FontAwesomeIcon icon='plus' size='1x' />
          </button>
          <button onClick={this.handleDetailClick} className={ColorWallSwatch.CLASS_NAMES.CONTENT_DETAILS}>
            <FontAwesomeIcon icon='info' size='1x' />
          </button>
        </div>
      </div>
    )
  }

  getSwatchFacade = function getSwatchFacade () {
    return (
      <button onClick={this.handleSwatchClick} className={this.getClasses()} style={this.getStyles()} />
    )
  }

  handleSwatchClick = function handleSwatchClick () {
    this.props.onEngage(this.props.color)
  }

  handleAddClick = function handleAddClick () {
    this.props.onAdd(this.props.color)
  }

  handleDetailClick = function handleDetailClick () {
    const { color } = this.props
    alert(`Color details for ${color.name}`) // eslint-disable-line
  }
}

export default ColorWallSwatch
