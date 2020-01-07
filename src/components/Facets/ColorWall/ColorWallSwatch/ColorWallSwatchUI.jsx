// @flow
import React, { useMemo, forwardRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CLASS_NAMES } from './shared'
import { type Color } from '../../../../shared/types/Colors'
import { arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName } from '../../../../shared/helpers/ColorUtils'

import './ColorWallSwatch.scss'
import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  color: Color,
  focus?: boolean,
  onClick?: Function,
  tabIndex?: number,
  thisLink: string
}

const _classes = arrayToSpacedString([
  CLASS_NAMES.BASE,
  CLASS_NAMES.BASE_CLICKABLE
])

const ColorWallSwatchUI = forwardRef<Props, Object>((props: Props, ref: Object) => {
  const { focus, color, thisLink, onClick, tabIndex = 0 } = props

  useEffect(() => {
    ref.current = {
      link: thisLink,
      onClick: onClick
    }
  }, [thisLink, onClick])

  const handleClick = useMemo(() => (e: any) => {
    if (typeof onClick === 'function') {
      onClick(e)
    }
  }, [onClick])

  const linkProps = useMemo(() => ({
    to: thisLink,
    style: {
      background: color.hex
    }
  }), [thisLink, color])

  const linkClasses = useMemo(() => `${_classes} ${focus ? CLASS_NAMES.BASE_FOCUS : ''}`, [focus])
  const colorName = useMemo(() => fullColorName(color.brandKey, color.colorNumber, color.name), [color])

  return (
    <div className={CLASS_NAMES.SWATCH}>
      <Link {...linkProps}
        className={linkClasses}
        onClick={handleClick}
        tabIndex={tabIndex}>
        <span className='visually-hidden'>
          {colorName}
        </span>
      </Link>
    </div>
  )
})

export default ColorWallSwatchUI
