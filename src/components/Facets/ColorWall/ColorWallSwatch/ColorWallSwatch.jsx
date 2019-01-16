// @flow
import React, { PureComponent } from 'react'
import { once } from 'lodash'
import memoizee from 'memoizee'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName, fullColorNumber } from '../../../../shared/helpers/ColorUtils'
import { ConfigurationContextConsumer } from '../../../../contexts/ConfigurationContext'
import { CLASS_NAMES } from './shared'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  thisLink?: string,
  detailsLink?: string,
  showContents?: boolean,
  onAdd?: Function,
  level?: number,
  compensateX?: number,
  compensateY?: number,
  active?: boolean
}

class ColorWallSwatch extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.handleAddClick = this.handleAddClick.bind(this)
  }

  render () {
    const { showContents, color, onAdd, thisLink, detailsLink } = this.props

    let props = {
      className: `${this.getBaseClasses()} ${this.getClasses()}`,
      style: ColorWallSwatch.getStyles(color.hex),
      key: color.id
    }
    let contents = null

    const temporaryViewDetailStyles = {
      position: 'absolute',
      bottom: '1em',
      left: '.75em',
      color: (color.isDark) ? 'white' : 'black',
      textDecoration: 'none'
    }

    if (showContents) {
      contents = (
        <ConfigurationContextConsumer>
          {config => (
            <div {...props}>
              <div className={CLASS_NAMES.CONTENT}>
                <p className={CLASS_NAMES.CONTENT_NUMBER}>{`${fullColorNumber(color.brandKey, color.colorNumber)}`}</p>
                <p className={CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
                {(onAdd && config.ColorWall.displayAddButton) && (
                  <button /* autoFocus */ onClick={this.handleAddClick} className={CLASS_NAMES.CONTENT_ADD}>
                    <FontAwesomeIcon icon='plus' size='1x' />
                  </button>
                )}

                {config.ColorWall.displayViewDetails && detailsLink && (
                  <Link to={detailsLink} style={temporaryViewDetailStyles}>View Details</Link>
                )}

                {config.ColorWall.displayAddButton && (
                  <button type='button' onClick={onAdd} className={CLASS_NAMES.CONTENT_DETAILS}>
                    <FontAwesomeIcon icon='info' size='1x' />
                  </button>
                )}
              </div>
            </div>
          )}
        </ConfigurationContextConsumer>
      )
    } else if (thisLink) {
      contents = (
        <div {...props}>
          <Link to={thisLink} title={fullColorName(color.brandKey, color.colorNumber, color.name)} className={CLASS_NAMES.ENGAGE_LINK} />
        </div>
      )
    } else {
      contents = (
        <div title={fullColorName(color.brandKey, color.colorNumber, color.name)} {...props} />
      )
    }

    return (
      <div className={CLASS_NAMES.SWATCH}>
        {contents}
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
  }, { primitive: true, length: 1 })

  getBaseClasses = once(function getBaseClasses (): string {
    const { color } = this.props
    let classes = [
      CLASS_NAMES.BASE,
      CLASS_NAMES.BASE_DYNAMIC
    ]

    if (color.isDark) {
      classes.push(CLASS_NAMES.BASE_DARK)
    }

    return arrayToSpacedString(classes)
  })

  getClasses (): string {
    const { level, active, thisLink, compensateX, compensateY } = this.props
    const levelDefined = !isNaN(level)
    let classes = []

    if (active) {
      classes.push(CLASS_NAMES.BASE_ACTIVE)
    }

    // if we have a link to this swatch's active URL...
    if (thisLink) {
      // ... assume it's a clickable swatch
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

  handleAddClick = function handleAddClick () {
    const { onAdd, color } = this.props

    if (onAdd) {
      onAdd(color)
    }
  }
}

export default ColorWallSwatch
