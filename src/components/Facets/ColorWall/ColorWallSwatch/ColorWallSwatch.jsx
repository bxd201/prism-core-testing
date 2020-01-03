// @flow
import React, { useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import kebabCase from 'lodash/kebabCase'
import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName, fullColorNumber } from '../../../../shared/helpers/ColorUtils'
import { CLASS_NAMES } from './shared'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import './ColorWallSwatch.scss'
import 'src/scss/convenience/visually-hidden.scss'
import OmniButton from './ColorWallSwatchButtons/OmniButton'
import { generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'
import { FormattedMessage } from 'react-intl'

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

const ColorWallSwatch = React.forwardRef<Props, any>((props: Props, ref: any) => {
  const { onAdd, onClick, showContents, color, thisLink, focus, level, active, compensateX, compensateY } = props
  const { displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = React.useContext(ColorWallContext)
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

  const classes = useMemo(() => {
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

    return arrayToSpacedString(classes)
  }, [color, active, thisLink, level, compensateX, compensateY, focus])

  const { content, refData } = useMemo<any, Object | void>(() => {
    if (!showContents) {
      const inner = (
        <span className='visually-hidden'>{fullColorName(color.brandKey, color.colorNumber, color.name)}</span>
      )

      if (thisLink) {
        return {
          content: (
            <Link to={thisLink} className={CLASS_NAMES.ENGAGE_LINK} onClick={handleOnClick} tabIndex={-1}>
              {inner}
            </Link>
          ),
          refData: {
            internalLink: thisLink,
            onClick: onClick
          }
        }
      } else {
        return {
          content: inner
        }
      }
    }

    if (displayAddButton) {
      return {
        content: (
          <OmniButton
            icon={OmniButton.ICONS.ADD}
            onClick={handleOnAdd}
            className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L}`}
            tabIndex={-1}
          />
        ),
        refData: {
          onClick: onClick
        }
      }
    } else if (displayInfoButton) {
      const link = generateColorDetailsPageUrl(color)
      return {
        content: (
          <OmniButton
            link={link}
            icon={OmniButton.ICONS.INFO}
            className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_R}`}
            tabIndex={-1}
          />
        ),
        refData: {
          internalLink: link
        }
      }
    } else if (displayDetailsLink) {
      const link = colorDetailPageRoot ? `${colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${kebabCase(color.name)}` : generateColorDetailsPageUrl(color)
      return {
        content: (
          <OmniButton
            link={link}
            className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L} ${focus ? CLASS_NAMES.CONTENT_CTA_FOCUS : ''}`}
            tabIndex={-1}>
            <FormattedMessage id='VIEW_DETAILS' />
          </OmniButton>
        ),
        refData: {
          [colorDetailPageRoot ? 'externalLink' : 'internalLink']: link
        }
      }
    }

    return {}
  }, [color, onClick, thisLink, handleOnAdd, displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot, showContents])

  useEffect(() => {
    if (ref) {
      ref.current = refData
    }
  }, [refData, ref])

  return (
    <div className={CLASS_NAMES.SWATCH}>
      <div className={classes} style={{ background: color.hex }}>
        {showContents ? (
          <section className={CLASS_NAMES.CONTENT}>
            <p className={CLASS_NAMES.CONTENT_NUMBER}>{fullColorNumber(color.brandKey, color.colorNumber)}</p>
            <p className={CLASS_NAMES.CONTENT_NAME}>{color.name}</p>
            {content}
          </section>
        ) : (
          content
        )}
      </div>
    </div>
  )
})

export default ColorWallSwatch
