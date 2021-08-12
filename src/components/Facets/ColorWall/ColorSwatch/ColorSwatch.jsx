// @flow
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useRouteMatch, useHistory } from 'react-router-dom'
import { emitColor } from 'src/store/actions/loadColors'
import { add } from 'src/store/actions/live-palette'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import InfoButton from 'src/components/InfoButton/InfoButton'
import { generateColorDetailsPageUrl, generateColorWallPageUrl, fullColorName, fullColorNumber, cleanColorNameForURL } from 'src/shared/helpers/ColorUtils'
import { numToAlphaString } from 'src/shared/helpers/StringUtils'
import { type Color, type ColorStatus } from 'src/shared/types/Colors.js.flow'
import { useIntl } from 'react-intl'
import at from 'lodash/at'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import './ColorSwatch.scss'

type ContentProps = { msg: string, color: Color }
export const Content = ({ msg, color }: ContentProps) => {
  const dispatch = useDispatch()
  const { addButtonText, displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = useContext(ColorWallContext)
  const { swatchShouldEmit } = useContext(ConfigurationContext)
  const { messages = {} } = useIntl()

  const colorIsInLivePalette: boolean = useSelector(store => store.lp.colors.some(({ colorNumber }) => colorNumber === color.colorNumber))
  const title = (addButtonText || at(messages, 'ADD_TO_PALETTE')[0] || '').replace('{name}', fullColorName(color))

  if (msg) {
    return (<p className='color-swatch__content-message'>{msg}</p>)
  }
  return (
    <div className='color-swatch__button-group'>
      {displayAddButton &&
        (colorIsInLivePalette
          ? (<FontAwesomeIcon className='check-icon' icon={['fa', 'check-circle']} size='2x' />)
          : (
            <button
              title={(addButtonText || at(messages, 'ADD_TO_PALETTE')[0] || '').replace('{name}', fullColorName(color))}
              onClick={() => dispatch(swatchShouldEmit ? emitColor(color) : add(color))}
            >
              <FontAwesomeIcon className='add-icon' icon={['fal', 'plus-circle']} size='2x' />
              {addButtonText && <span className='OmniButton__content'>{title}</span>}
            </button>
          )
        )
      }
      {displayInfoButton && <InfoButton color={color} />}
      {displayDetailsLink && (
        colorDetailPageRoot
          ? (
            <a
              href={`${colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${cleanColorNameForURL(color.name)}`}
              title={(at(messages, 'VIEW_DETAILS_FOR')[0] || '').replace('{name}', fullColorName(color))}
              className='OmniButton color-swatch__content__cta color-swatch__content__cta--l'
            >
              {at(messages, 'VIEW_DETAILS')[0]}
            </a>
          )
          : (
            <Link
              to={generateColorDetailsPageUrl(color)}
              title={(at(messages, 'VIEW_DETAILS_FOR')[0] || '').replace('{name}', fullColorName(color))}
              className='OmniButton color-swatch__content__cta color-swatch__content__cta--l'
            >
              {at(messages, 'VIEW_DETAILS')[0]}
            </Link>
          )
      )}
    </div>
  )
}

type ColorSwatchProps = { color: Color, level?: number, status?: ColorStatus, style?: {}, showContents?: boolean, onFocus?: () => void, outline: boolean }
const ColorSwatch = React.forwardRef<ColorSwatchProps, HTMLElement>(({ color, level, status, style, showContents = (level === 0), onFocus, outline = true }: ColorSwatchProps, ref) => {
  const { url, params: { section, family } } = useRouteMatch()
  const history = useHistory()
  const isDisabled = at(status, 'status')[0] === 0

  return (
    <>
      <button
        className={'color-swatch color-swatch-' + (level === undefined ? 'flat' : numToAlphaString(level))}
        style={{ ...style, background: color.hex }}
        ref={ref}
        tabIndex={outline ? 0 : -1}
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
        className={`color-swatch__content ${color.isDark ? ' color-swatch__content--dark-color' : ''}${outline ? ' color-swatch__content--focus' : ''}`}
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
