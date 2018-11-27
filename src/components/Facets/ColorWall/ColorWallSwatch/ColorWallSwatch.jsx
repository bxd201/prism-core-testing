// @flow
import React, { PureComponent } from 'react'
import { once } from 'lodash'
import memoizee from 'memoizee'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { CLASS_NAMES } from './shared'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  onEngage?: Function,
  onAdd?: Function,
  level?: number,
  offsetX?: number,
  offsetY?: number,
  compensateX?: number,
  compensateY?: number,
  active?: boolean,
  topRow?: boolean,
  bottomRow?: boolean,
  leftCol?: boolean,
  rightCol?: boolean
}

class ColorWallSwatch extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.handleAddClick = this.handleAddClick.bind(this)
    this.handleDetailClick = this.handleDetailClick.bind(this)
    this.handleSwatchClick = this.handleSwatchClick.bind(this)
    this.handleSwatchKeyPress = this.handleSwatchKeyPress.bind(this)
  }

  render () {
    const { level, color, compensateX, compensateY } = this.props

    let props = {
      className: `${this.getBaseClasses()} ${this.getClasses()}`,
      style: ColorWallSwatch.getStyles(color.hex, compensateX, compensateY)
    }
    let contents = null

    if (level === 0) {
      contents = (
        <div className={CLASS_NAMES.CONTENT}>
          <p className={CLASS_NAMES.CONTENT_NUMBER}>{`${color.brandKey ? color.brandKey + ' ' : ''} ${color.colorNumber}`}</p>
          <p className={CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
          <button /* autoFocus */ onClick={this.handleAddClick} className={CLASS_NAMES.CONTENT_ADD}>
            <FontAwesomeIcon icon='plus' size='1x' />
          </button>
          <button onClick={this.handleDetailClick} className={CLASS_NAMES.CONTENT_DETAILS}>
            <FontAwesomeIcon icon='info' size='1x' />
          </button>
        </div>
      )
    } else {
      props = Object.assign({}, props, {
        onClick: this.handleSwatchClick,
        onKeyDown: this.handleSwatchKeyPress,
        role: 'button',
        tabIndex: 0,
        focusable: true
      })
    }

    return (
      <div className={CLASS_NAMES.SWATCH}>
        <div {...props}>
          {contents}
        </div>
      </div>
    )
  }

  static getStyles = memoizee(function getStyles (color: string, compensateX: number, compensateY: number): Object {
    let transform = ''

    // if (compensateX) {
    //   transform += `translateX(${compensateX * 33 / 2}%)`
    // }

    // if (compensateY) {
    //   transform += ` translateY(${compensateY * 33 / 2}%)`
    // }

    let styleObj: {
      [key: string]: string
    } = {
      background: color
    }

    if (transform) {
      styleObj.transform = transform
    }

    return styleObj
  })

  getBaseClasses = once(function getBaseClasses (): string {
    const { color, topRow, bottomRow, leftCol, rightCol } = this.props
    let classes = [
      CLASS_NAMES.BASE,
      CLASS_NAMES.BASE_DYNAMIC,
      `${topRow && leftCol
        ? CLASS_NAMES.BASE_POS_TL
        : topRow && rightCol
          ? CLASS_NAMES.BASE_POS_TR
          : bottomRow && rightCol
            ? CLASS_NAMES.BASE_POS_BR
            : bottomRow && leftCol
              ? CLASS_NAMES.BASE_POS_BL
              : topRow ? CLASS_NAMES.BASE_POS_T
                : leftCol ? CLASS_NAMES.BASE_POS_L
                  : rightCol ? CLASS_NAMES.BASE_POS_R
                    : bottomRow ? CLASS_NAMES.BASE_POS_B
                      : ''
      }`
    ]

    if (color.isDark) {
      classes.push(CLASS_NAMES.BASE_DARK)
    }

    return arrayToSpacedString(classes)
  })

  getClasses (): string {
    const { level, offsetX, offsetY, active, onEngage, compensateX, compensateY } = this.props
    const levelDefined = !isNaN(level)
    let classes = []

    if (active) {
      classes.push(CLASS_NAMES.BASE_ACTIVE)
    }

    if (onEngage) {
      classes.push(CLASS_NAMES.BASE_CLICKABLE)
    }

    if (levelDefined) {
      classes.push(CLASS_NAMES.BASE_BLOOM)
      // $FlowIgnore -- Flow doesn't understand that we can't get here unless level is a number
      classes.push(CLASS_NAMES.BASE_BLOOM_LVL_ + numToAlphaString(level))

      if (offsetX) {
        let className = CLASS_NAMES.BASE_OFFSET_X_ + numToAlphaString(offsetX)
        classes.push(className)

        if (offsetY === 0) {
          classes.push(className + '--primary')
        }
      }

      if (offsetY) {
        let className = CLASS_NAMES.BASE_OFFSET_Y_ + numToAlphaString(offsetY)
        classes.push(className)

        if (offsetX === 0) {
          classes.push(className + '--primary')
        }
      }

      if (!offsetX && !offsetY) {
        classes.push(CLASS_NAMES.BASE_BLOOM_CENTER)
      }

      if (compensateX) {
        classes.push(CLASS_NAMES.BASE_COMPENSATE_X_ + numToAlphaString(compensateX))
      }

      if (compensateY) {
        classes.push(CLASS_NAMES.BASE_COMPENSATE_Y_ + numToAlphaString(compensateY))
      }
    }

    return arrayToSpacedString(classes)
  }

  handleSwatchKeyPress = function handleSwatchKeyPress (e: KeyboardEvent) {
    const { onEngage, color } = this.props

    switch (e.keyCode) {
      case 13:
      case 32:
        if (onEngage) {
          onEngage(color)
        }
        e.preventDefault()
        break
    }
  }

  handleSwatchClick = function handleSwatchClick (e: MouseEvent) {
    const { onEngage, color } = this.props

    if (onEngage) {
      onEngage(color)
    }

    e.preventDefault()
  }

  handleAddClick = function handleAddClick () {
    const { onAdd, color } = this.props

    if (onAdd) {
      onAdd(color)
    }
  }

  handleDetailClick = function handleDetailClick () {
    const { color } = this.props
    alert(`Color details for ${color.name}`) // eslint-disable-line
  }
}

export default ColorWallSwatch
