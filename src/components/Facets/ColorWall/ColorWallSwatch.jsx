/* eslint-disable */
// @flow
import React, { PureComponent, Fragment } from 'react'

import { type Color } from '../../../shared/types/Colors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  color: Color,
  onEngage: Function,
  onAdd: Function,
  level?: number,
  offsetX?: number,
  offsetY?: number,
  active?: boolean
}

class ColorWallSwatch extends PureComponent<Props> {
  ref: any = null

  static getComputedValue (el: any, styleProp: string) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el.currentStyle) {
      return el.currentStyle[styleProp];
    }
  }

  constructor (props: Props) {
    super(props)

    this.handleAddClick = this.handleAddClick.bind(this)
    this.handleDetailClick = this.handleDetailClick.bind(this)
    this.handleSwatchClick = this.handleSwatchClick.bind(this)
  }

  getOuterClasses () {
    const { level, offsetX, offsetY, color, active } = this.props
    let classes = ['inner', 'color-swatch-inner']

    if (active) {
      classes.push('color-swatch-inner--active')
    }

    if (level) {
      classes.push('color-swatch-inner--bloom')
      classes.push('color-swatch-inner--lvl-' + level.toString().replace(/\./g, '-'))
    }

    if (offsetX) {
      let className = 'color-swatch-inner--offset-x-' + offsetX.toString().replace(/-/g, 'n')
      classes.push(className)

      if (!offsetY) {
        classes.push(className + '--primary')
      }
    }

    if (offsetY) {
      let className = 'color-swatch-inner--offset-y-' + offsetY.toString().replace(/-/g, 'n')
      classes.push(className)

      if (!offsetX) {
        classes.push(className + '--primary')
      }
    }

    if (!offsetX && !offsetY && level) {
      classes.push('color-swatch-inner--bloom-center')
    }

    if (color.isDark) {
      classes.push('color-swatch-inner--dark-color')
    }

    return classes.join(' ')
  }

  getOuterStyles () {
    let styleObj: {
      zIndex?: number
    } = {}

    if (this.ref) {
      styleObj.zIndex = ColorWallSwatch.getComputedValue(this.ref, 'z-index')
    }

    return styleObj
  }

  getInnerStyles () {
    const { color } = this.props

    let styleObj: {
      backgroundColor: string
    } = {
      backgroundColor: color.hex
    }

    return styleObj
  }

  render () {
    const { active, level, color } = this.props

    return (
      <React.Fragment>
        <li className='color-wall-swatches__swatch'>
          <div className={this.getOuterClasses()}
            ref={(el) => this.ref = el}
            style={this.getOuterStyles()}>
            {level === 3 && (
              <div className='color-swatch-inner__color-container' style={this.getInnerStyles()}>
                <div className='color-swatch-inner__content'>
                  <p>{`${color.brandKey ? color.brandKey + ' ' : ''} ${color.colorNumber}`}</p>
                  <p><strong>{color.name}</strong></p>
                  <button autoFocus onClick={this.handleAddClick} className='color-swatch-inner__content__add'><FontAwesomeIcon icon='plus' size='1x' /></button>
                  <button onClick={this.handleDetailClick} className='color-swatch-inner__content__details'><FontAwesomeIcon icon='info' size='1x' /></button>
                </div>
              </div>
            ) || (
              <button onClick={this.handleSwatchClick}
                className='color-swatch-inner__color-container'
                style={this.getInnerStyles()}
                />
            )}
          </div>
        </li>
      </React.Fragment>
    )
  }

  handleSwatchClick = function handleSwatchClick () {
    this.props.onEngage(this.props.color)
  }

  handleAddClick = function handleAddClick() {
    this.props.onAdd(this.props.color)
  }

  handleDetailClick = function handleDetailClick() {
    const { color } = this.props
    alert(`Color details for ${color.name}`)
  }
}

export default ColorWallSwatch
