// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'

import { CLASS_NAMES } from './shared'

import { type Color } from '../../../../shared/types/Colors'
import { arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName } from '../../../../shared/helpers/ColorUtils'

import './ColorWallSwatch.scss'

type Props = {
  color: Color,
  thisLink: string,
  topRow?: boolean,
  bottomRow?: boolean,
  leftCol?: boolean,
  rightCol?: boolean
}

type State = {
  swatchProps: {
    [key: string]: any
  }
}

class ColorWallSwatchUI extends PureComponent<Props, State> {
  state: State = {
    swatchProps: {}
  }

  constructor (props: Props) {
    super(props)

    const { topRow, bottomRow, leftCol, rightCol, color, thisLink } = props

    this.state.swatchProps = {
      to: thisLink,
      className: arrayToSpacedString([
        CLASS_NAMES.BASE,
        CLASS_NAMES.BASE_CLICKABLE,
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
      ]),
      style: {
        background: color.hex
      },
      title: fullColorName(color.brandKey, color.colorNumber, color.name)
    }
  }

  render () {
    const { swatchProps } = this.state

    return (
      <div className={CLASS_NAMES.SWATCH}>
        <Link {...swatchProps} />
      </div>
    )
  }
}

export default ColorWallSwatchUI
