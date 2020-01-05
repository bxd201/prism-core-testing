// @flow
import React, { useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import kebabCase from 'lodash/kebabCase'
import at from 'lodash/at'
import { type Color } from '../../../../shared/types/Colors'
import { numToAlphaString, arrayToSpacedString } from '../../../../shared/helpers/StringUtils'
import { fullColorName, fullColorNumber } from '../../../../shared/helpers/ColorUtils'
import { CLASS_NAMES } from './shared'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import './ColorWallSwatch.scss'
import 'src/scss/convenience/visually-hidden.scss'
import OmniButton from './ColorWallSwatchButtons/OmniButton'
import { generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'
import { useIntl } from 'react-intl'

type Props = {
  active?: boolean,
  a11yState?: any,
  color: Color,
  compensateX?: number,
  compensateY?: number,
  tabIndex?: number,
  focus?: boolean,
  level?: number,
  onAdd?: Function,
  onClick?: Function,
  showContents?: boolean,
  thisLink?: string
}

const ColorWallSwatch = React.forwardRef<Props, any>((props: Props, ref: any) => {
  const { a11yState, onClick, onAdd, showContents, color, thisLink, focus, level, active, compensateX, compensateY, tabIndex = 0 } = props
  const { displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = React.useContext(ColorWallContext)
  const { messages = {} } = useIntl()
  const handleOnClick = useCallback((e) => {
    if (onClick) {
      onClick(e)
    }
  }, [onClick])

  const handleOnAdd = useCallback(() => {
    if (onAdd) {
      onAdd(color)
    }
  }, [color, onAdd])

  const fullName = useMemo(() => fullColorName(color.brandKey, color.colorNumber, color.name), [color])

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
        <span className='visually-hidden'>{fullName}</span>
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
            tabIndex={tabIndex}
          />
        ),
        refData: {
          onClick: onClick
        }
      }
    } else if (displayInfoButton) {
      const to = generateColorDetailsPageUrl(color)
      return {
        content: (
          <OmniButton
            to={to}
            icon={OmniButton.ICONS.INFO}
            className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_R}`}
            tabIndex={tabIndex}
          />
        ),
        refData: {
          internalLink: to
        }
      }
    } else if (displayDetailsLink) {
      const to = colorDetailPageRoot ? `${colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${kebabCase(color.name)}` : {
        pathname: generateColorDetailsPageUrl(color),
        state: a11yState
      }
      const title = (at(messages, 'VIEW_DETAILS_FOR')[0] || '').replace('{name}', fullName)
      return {
        content: (
          <OmniButton
            title={title}
            to={to}
            className={`${CLASS_NAMES.CONTENT_CTA} ${CLASS_NAMES.CONTENT_CTA_L} ${focus ? CLASS_NAMES.CONTENT_CTA_FOCUS : ''}`}
            tabIndex={tabIndex}
          >
            {at(messages, 'VIEW_DETAILS')[0]}
          </OmniButton>
        ),
        refData: {
          [colorDetailPageRoot ? 'externalLink' : 'internalLink']: to
        }
      }
    }

    return {}
  }, [color, onClick, tabIndex, thisLink, displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot, showContents, messages])

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
