// @flow
import React, { useContext } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useRouteMatch, useHistory } from 'react-router-dom'
import { emitColor } from 'src/store/actions/loadColors'
import { add } from 'src/store/actions/live-palette'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import { generateColorDetailsPageUrl, generateColorWallPageUrl, fullColorName, fullColorNumber } from 'src/shared/helpers/ColorUtils'
import { numToAlphaString } from 'src/shared/helpers/StringUtils'
import { type Color, type ColorStatus } from 'src/shared/types/Colors.js.flow'
import { useIntl } from 'react-intl'
import at from 'lodash/at'
import kebabCase from 'lodash/kebabCase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import './ColorSwatch.scss'

type ContentProps = { msg: string, color: Color }
const Content = ({ msg, color }: ContentProps) => {
  const dispatch = useDispatch()
  const { addButtonText, displayAddButton, displayAddButtonText, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = React.useContext(ColorWallContext)
  const { swatchShouldEmit } = useContext(ConfigurationContext)
  const { messages = {} } = useIntl()

  if (msg) {
    return (<p className='color-swatch__content__message'>{msg}</p>)
  } else if (displayAddButton) {
    const title = (addButtonText || at(messages, 'ADD_TO_PALETTE')[0] || '').replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name))
    return (
      <button className='OmniButton color-swatch__content__cta color-swatch__content__cta--l' title={title} onClick={() => dispatch(swatchShouldEmit ? emitColor(color) : add(color))}>
        <span className='OmniButton__icon'><FontAwesomeIcon icon={['fal', 'plus-circle']} size='2x' /></span>
        {displayAddButtonText && <span className='OmniButton__content'>{title}</span>}
      </button>
    )
  } else if (displayInfoButton) {
    return (
      <Link to={generateColorDetailsPageUrl(color)} title={at(messages, 'VIEW_DETAILS_FOR')[0] || ''} className='OmniButton color-swatch__content__cta color-swatch__content__cta--r'>
        <span className='OmniButton__icon'>
          <FontAwesomeIcon icon='info' size='1x' />,
        </span>
      </Link>
    )
  } else if (displayDetailsLink) {
    return (colorDetailPageRoot
      ? (
        <a
          href={`${colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${kebabCase(color.name)}`}
          title={at(messages, 'VIEW_DETAILS_FOR')[0] || ''}
          className='OmniButton color-swatch__content__cta color-swatch__content__cta--l'
        >
          {at(messages, 'VIEW_DETAILS')[0]}
        </a>
      )
      : (
        <Link
          to={generateColorDetailsPageUrl(color)}
          title={at(messages, 'VIEW_DETAILS_FOR')[0] || ''}
          className='OmniButton color-swatch__content__cta color-swatch__content__cta--l'
        >
          {at(messages, 'VIEW_DETAILS')[0]}
        </Link>
      )
    )
  } else { return null }
}

type ColorSwatchProps = { color: Color, level?: number, status?: ColorStatus, style?: {}, showContents?: boolean, onFocus?: () => void }
const ColorSwatch = React.forwardRef<ColorSwatchProps, HTMLElement>(({ color, level, status, style, showContents = (level === 0), onFocus }: ColorSwatchProps, ref) => {
  const { url, params: { section, family } } = useRouteMatch()
  const history = useHistory()
  const isDisabled = at(status, 'status')[0] === 0

  return (
    <>
      <button
        className={'color-swatch color-swatch-' + (level === undefined ? 'flat' : numToAlphaString(level))}
        style={{ ...style, background: color.hex }}
        ref={ref}
        onFocus={onFocus}
        onClick={() => history.push(generateColorWallPageUrl(section, family, color.id, fullColorName(color)) + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : ''))}
        aria-label={fullColorName(color)}
      >
        {isDisabled && <div className='color-swatch__flag' />}
      </button>
      {showContents && (<section
        tabIndex={-1}
        ref={ref}
        onFocus={onFocus}
        aria-label={fullColorName(color)}
        className={'color-swatch__content' + (color.isDark ? ' color-swatch__content--dark-color' : '')}
        style={style}
      >
        <p className='color-swatch__content__number'>{fullColorNumber(color.brandKey, color.colorNumber)}</p>
        <p className='color-swatch__content__name'>{color.name}</p>
        <Content msg={at(status, 'message')[0]} color={color} />
      </section>)}
    </>
  )
})

export default React.memo<ColorSwatchProps>(ColorSwatch)
