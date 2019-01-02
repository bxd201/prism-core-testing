// @flow
import React, { PureComponent } from 'react'
import { once } from 'lodash'
import memoizee from 'memoizee'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName, fullColorNumber } from '../../../../shared/helpers/ColorUtils'
import { CLASS_NAMES } from './shared'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  history: any, // from withRouter HOC
  showContents?: boolean,
  onEngage?: Function,
  onAdd?: Function,
  level?: number,
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
    const { showContents, color, onAdd } = this.props

    let props = {
      className: `${this.getBaseClasses()} ${this.getClasses()}`,
      style: ColorWallSwatch.getStyles(color.hex)
    }
    let contents = null

    if (showContents) {
      contents = (
        <div className={CLASS_NAMES.CONTENT}>
          <p className={CLASS_NAMES.CONTENT_NUMBER}>{`${fullColorNumber(color.brandKey, color.colorNumber)}`}</p>
          <p className={CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
          { onAdd
            ? <button /* autoFocus */ onClick={this.handleAddClick} className={CLASS_NAMES.CONTENT_ADD}>
              <FontAwesomeIcon icon='plus' size='1x' />
            </button>
            : null
          }
          <button onClick={this.handleDetailClick} className={CLASS_NAMES.CONTENT_DETAILS}>
            <FontAwesomeIcon icon='info' size='1x' />
          </button>
        </div>
      )
    } else {
      props = Object.assign({}, props, {
        title: fullColorName(color.brandKey, color.colorNumber, color.name),
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

  static getStyles = memoizee(function getStyles (color: string): Object {
    let styleObj: {
      [key: string]: string
    } = {
      background: color
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
    const { level, active, onEngage, compensateX, compensateY } = this.props
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

    this.props.history.push(`/active/color-wall/color/${color.id}`)
  }
}

export default withRouter(ColorWallSwatch)
