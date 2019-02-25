// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import memoizee from 'memoizee'

import { CLASS_NAMES } from './shared'

import { type Color } from '../../../../shared/types/Colors'
import { arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName } from '../../../../shared/helpers/ColorUtils'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  thisLink: string,
  focus?: boolean
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
    },
    title: fullColorName(color.brandKey, color.colorNumber, color.name)
  }
})

class ColorWallSwatchUI extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.getThisLink = this.getThisLink.bind(this)
  }

  render () {
    const { focus, color, thisLink } = this.props

    return (
      <div className={CLASS_NAMES.SWATCH}>
        <Link {...generateLinkProps(color, thisLink)}
          className={`${_classes} ${focus ? CLASS_NAMES.BASE_FOCUS : ''}`}
          tabIndex={-1} />
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
}

export default ColorWallSwatchUI
