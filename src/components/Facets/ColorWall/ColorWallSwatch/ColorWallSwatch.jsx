// @flow
import React, { PureComponent } from 'react'
import once from 'lodash/once'
import memoizee from 'memoizee'
import { Link } from 'react-router-dom'

import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName, fullColorNumber } from '../../../../shared/helpers/ColorUtils'
import { CLASS_NAMES } from './shared'

import ColorWallContext from '../ColorWallContext'

import AddButton from './ColorWallSwatchButtons/AddButton'
import DetailsLink from './ColorWallSwatchButtons/DetailsLink'
import InfoButton from './ColorWallSwatchButtons/InfoButton'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  focus?: boolean,
  thisLink?: string,
  detailsLink?: string,
  showContents?: boolean,
  onAdd?: Function,
  onClick?: Function,
  level?: number,
  compensateX?: number,
  compensateY?: number,
  active?: boolean
}

class ColorWallSwatch extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.handleAddClick = this.handleAddClick.bind(this)
    this.performClickAction = this.performClickAction.bind(this)
    this.getThisLink = this.getThisLink.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  render () {
    const { showContents, color, onAdd, thisLink, detailsLink, focus } = this.props

    let containerProps = {
      className: `${this.getBaseClasses()} ${this.getClasses()}`,
      style: ColorWallSwatch.getStyles(color.hex)
    }

    let contents = null

    if (showContents) {
      contents = (
        <section className={CLASS_NAMES.CONTENT}>
          <p className={CLASS_NAMES.CONTENT_NUMBER}>{`${fullColorNumber(color.brandKey, color.colorNumber)}`}</p>
          <p className={CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
          <ColorWallContext.Consumer>
            {config => (
              <React.Fragment>
                {/* Stateless components to handle whether to display the add, details, and info buttons */}
                <InfoButton
                  config={config}
                  detailsLink={detailsLink}
                  className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_R}`}
                  tabIndex={-1}
                />
                <AddButton
                  config={config}
                  onAdd={(onAdd)}
                  onClick={this.handleAddClick}
                  className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L}`}
                  tabIndex={-1}
                />
                <DetailsLink
                  color={color}
                  config={config}
                  detailsLink={detailsLink}
                  className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L} ${focus ? CLASS_NAMES.CONTENT_CTA_FOCUS : ''}`}
                  tabIndex={-1}
                />
              </React.Fragment>
            )}
          </ColorWallContext.Consumer>
        </section>
      )
    } else if (thisLink) {
      contents = (
        <Link to={thisLink}
          className={CLASS_NAMES.ENGAGE_LINK}
          onClick={this.handleClick}
          tabIndex={-1}>
          <span className='visually-hidden'>
            {fullColorName(color.brandKey, color.colorNumber, color.name)}
          </span>
        </Link>
      )
    } else {
      // if not showing contents or does not have thisLink, augment container's props to contain color title
      contents = (
        <span className='visually-hidden'>
          {fullColorName(color.brandKey, color.colorNumber, color.name)}
        </span>
      )
    }

    return (
      <div className={CLASS_NAMES.SWATCH}>
        <div {...containerProps}>
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
    const { level, active, thisLink, compensateX, compensateY, focus } = this.props
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
      classes.push(CLASS_NAMES.BASE_BLOOM_LVL_ + numToAlphaString(level))

      if (compensateX) {
        classes.push(CLASS_NAMES.BASE_COMPENSATE_X_ + numToAlphaString(compensateX))
      }

      if (compensateY) {
        classes.push(CLASS_NAMES.BASE_COMPENSATE_Y_ + numToAlphaString(compensateY))
      }
    }

    if (focus) {
      classes.push(CLASS_NAMES.BASE_FOCUS)
    }

    return arrayToSpacedString(classes)
  }

  performClickAction = function performClickAction (): void {
    console.warn('ATTEMPTING TO PERFORM CLICK ACTION IN ColorWallSwatch, BUT NO ACTION IS DEFINED')
    // TODO: Implement multi-element focus control and an externally-triggerable click action.
    // This is for instances when more than just the details link is present on this swatch
  }

  getThisLink = function getThisLink (): string | void {
    const { thisLink, detailsLink, showContents } = this.props

    if (showContents && detailsLink) {
      return detailsLink
    } else if (thisLink) {
      return thisLink
    }

    return void (0)
  }

  handleAddClick = function handleAddClick () {
    const { onAdd, color } = this.props

    if (typeof onAdd === 'function') {
      onAdd(color)
    }
  }

  handleClick = function handleClick (e: any) {
    const { onClick } = this.props

    if (typeof onClick === 'function') {
      onClick(e)
    }
  }
}

export default ColorWallSwatch
