// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import memoizee from 'memoizee'

import { CLASS_NAMES } from './shared'

import { type Color } from '../../../../shared/types/Colors'
import { arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName } from '../../../../shared/helpers/ColorUtils'

import './ColorWallSwatch.scss'
import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  color: Color,
  thisLink: string,
  focus?: boolean,
  onClick?: Function
}

const _classes = arrayToSpacedString([
  CLASS_NAMES.BASE,
  CLASS_NAMES.BASE_CLICKABLE
])

const generateLinkProps = memoizee(function generateLinkProps (color: Color, link: string): Object {
  return {
    to: link,
    style: {
      background: color.hex
    }
  }
})

class ColorWallSwatchUI extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.getThisLink = this.getThisLink.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  render () {
    const { focus, color, thisLink } = this.props

    return (
      <div className={CLASS_NAMES.SWATCH}>
        <Link {...generateLinkProps(color, thisLink)}
          className={`${_classes} ${focus ? CLASS_NAMES.BASE_FOCUS : ''}`}
          onClick={this.handleClick}
          tabIndex={-1}>
          <span className='visually-hidden'>
            {fullColorName(color.brandKey, color.colorNumber, color.name)}
          </span>
        </Link>
      </div>
    )
  }

  getThisLink = function getThisLink (): string | void {
    const { thisLink } = this.props

    if (thisLink) {
      return thisLink
    }

    return void (0)
  }

  handleClick = function handleClick (e: any) {
    const { onClick } = this.props

    if (typeof onClick === 'function') {
      onClick(e)
    }
  }
}

export default ColorWallSwatchUI
