// @flow
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName, fullColorNumber } from '../../../../shared/helpers/ColorUtils'
import { CLASS_NAMES } from './shared'
import AddButton from './ColorWallSwatchButtons/AddButton'
import DetailsLink from './ColorWallSwatchButtons/DetailsLink'
import InfoButton from './ColorWallSwatchButtons/InfoButton'
import './ColorWallSwatch.scss'
import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  color: Color,
  focus?: boolean,
  thisLink?: string,
  showContents?: boolean,
  onAdd?: Function,
  onClick?: Function,
  level?: number,
  compensateX?: number,
  compensateY?: number,
  active?: boolean
}

const ColorWallSwatch = (props: Props) => {
  const { onAdd, onClick, showContents, color, thisLink, focus, level, active, compensateX, compensateY } = props
  const handleOnAdd = useMemo(() => {
    return () => {
      if (onAdd) {
        onAdd(color)
      }
    }
  }, [color, onAdd])

  const handleOnClick = useMemo(() => {
    return (e) => {
      if (onClick) {
        onClick(e)
      }
    }
  }, [onClick])

  let classes = [ CLASS_NAMES.BASE, CLASS_NAMES.BASE_DYNAMIC ]
  if (color.isDark) { classes.push(CLASS_NAMES.BASE_DARK) }
  if (active) { classes.push(CLASS_NAMES.BASE_ACTIVE) }
  // if we have a link to this swatch's active URL assume it's a clickable swatch
  if (thisLink) { classes.push(CLASS_NAMES.BASE_CLICKABLE) }
  if (!isNaN(level)) {
    classes.push(CLASS_NAMES.BASE_BLOOM)
    classes.push(CLASS_NAMES.BASE_BLOOM_LVL_ + numToAlphaString(level))
    if (compensateX) { classes.push(CLASS_NAMES.BASE_COMPENSATE_X_ + numToAlphaString(compensateX)) }
    if (compensateY) { classes.push(CLASS_NAMES.BASE_COMPENSATE_Y_ + numToAlphaString(compensateY)) }
  }
  if (focus) { classes.push(CLASS_NAMES.BASE_FOCUS) }

  classes = arrayToSpacedString(classes)

  return (
    <div className={CLASS_NAMES.SWATCH}>
      <div className={classes} style={{ background: color.hex }}>
        {showContents
          ? <section className={CLASS_NAMES.CONTENT}>
            <p className={CLASS_NAMES.CONTENT_NUMBER}>{fullColorNumber(color.brandKey, color.colorNumber)}</p>
            <p className={CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
            <InfoButton
              color={color}
              className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_R}`}
              tabIndex={-1}
            />
            <AddButton
              onClick={handleOnAdd}
              className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L}`}
              tabIndex={-1}
            />
            <DetailsLink
              color={color}
              className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L} ${focus ? CLASS_NAMES.CONTENT_CTA_FOCUS : ''}`}
              tabIndex={-1}
            />
          </section>
          : thisLink
            ? <Link to={thisLink} className={CLASS_NAMES.ENGAGE_LINK} onClick={handleOnClick} tabIndex={-1}>
              <span className='visually-hidden'>{fullColorName(color.brandKey, color.colorNumber, color.name)}</span>
            </Link>
            : <span className='visually-hidden'>{fullColorName(color.brandKey, color.colorNumber, color.name)}</span>
        }
      </div>
    </div>
  )
}

export default ColorWallSwatch
