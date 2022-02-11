// @flow
import React, { type Element, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useRouteMatch, useHistory } from 'react-router-dom'
import { emitColor } from 'src/store/actions/loadColors'
import { add } from 'src/store/actions/live-palette'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorWallContext, { type ColorWallContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import InfoButton from 'src/components/InfoButton/InfoButton'
import { generateColorDetailsPageUrl, generateColorWallPageUrl, fullColorName, fullColorNumber, cleanColorNameForURL } from 'src/shared/helpers/ColorUtils'
import { numToAlphaString } from 'src/shared/helpers/StringUtils'
import { type Color, type ColorStatus } from 'src/shared/types/Colors.js.flow'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import { useIntl } from 'react-intl'
import at from 'lodash/at'
import kebabCase from 'lodash/kebabCase'
import noop from 'lodash/noop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import './ColorSwatch.scss'

type ContentProps = { msg: string, color: Color, style?: {}}
export const Content = ({ msg, color, style }: ContentProps) => {
  const dispatch = useDispatch()
  const { addButtonText, displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = useContext(ColorWallContext)
  const { brandKeyNumberSeparator, swatchShouldEmit }: ConfigurationContextType = useContext(ConfigurationContext)
  const { messages = {} } = useIntl()

  const colorIsInLivePalette: boolean = useSelector(store => store.lp.colors.some(({ colorNumber }) => colorNumber === color.colorNumber))
  const title = (addButtonText || at(messages, 'ADD_TO_PALETTE')[0] || '').replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator))

  if (msg) {
    return (<p className='color-swatch__content-message'>{msg}</p>)
  }
  return (
    <div className='color-swatch__button-group' style={style}>
      {displayAddButton &&
        (colorIsInLivePalette
          ? (<FontAwesomeIcon className='check-icon' icon={['fa', 'check-circle']} size='2x' />)
          : (
            <button
              title={(addButtonText || at(messages, 'ADD_TO_PALETTE')[0] || '').replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator))}
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
              title={(at(messages, 'VIEW_DETAILS_FOR')[0] || '').replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator))}
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

type ColorSwatchProps = {
  color: Color,
  contentRenderer?: ([Element<any>, Element<any>]) => Element<any>, // ([Texts, Btns]) => <></>
  level?: number,
  status?: ColorStatus,
  style?: {},
  showContents?: boolean,
  onFocus?: () => void,
  outline?: boolean,
  className?: string
}

const ColorSwatch = React.forwardRef<ColorSwatchProps, HTMLElement>(({ color, contentRenderer = (defaultContent) => <>{defaultContent}</>, level, showContents = (level === 0), status, style, onFocus, outline = true, className }: ColorSwatchProps, ref) => {
  const { url, params: { section, family } } = useRouteMatch()
  const history = useHistory()
  const isDisabled = at(status, 'status')[0] === 0
  const { chunkClickable, activeColorRouteBuilderRef }: ColorWallContextProps = useContext(ColorWallContext)
  const { brandId, brandKeyNumberSeparator, colorWall: { colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const { primeColorWall }: ColorsState = useSelector(state => state.colors)

  const baseClass = houseShaped ? 'color-swatch-house-shaped' : 'color-swatch'
  const colorNumOnBottomClass = houseShaped ? 'label' : 'chip-locator'
  const border = houseShaped && level === 0 ? { border: 'none' } : {}

  return (
    <>
      <button
        className={`${baseClass} ${baseClass}-${level === undefined ? 'flat' : numToAlphaString(level)}${chunkClickable && section === kebabCase(primeColorWall) ? ' color-swatch--no-outline' : ''}`}
        style={{ ...border, ...style, background: color.hex }}
        ref={ref}
        tabIndex={outline ? 0 : -1}
        onFocus={onFocus}
        onClick={chunkClickable && section === kebabCase(primeColorWall)
          ? noop
          : () => {
            GA.event({ category: 'Color Wall', action: 'Color Swatch Clicks', label: `${color.name} - ${color.colorNumber}` }, GA_TRACKER_NAME_BRAND[brandId])
            if (activeColorRouteBuilderRef && activeColorRouteBuilderRef.current) {
              activeColorRouteBuilderRef.current(color)
            } else {
              // TODO: refactor this to use context as well
              history.push(generateColorWallPageUrl(section, family, color.id, fullColorName(color.brandKey, color.colorNumber, color.name)) + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : ''))
            }
          }
        }
        aria-label={fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)}
      >
        {houseShaped && <div className={`${baseClass}--roof`} style={{ borderBottomColor: color.hex }} />}
        {isDisabled && <div className='color-swatch__flag' />}
      </button>
      {showContents && (<section
        tabIndex={-1}
        ref={ref}
        onFocus={onFocus}
        aria-label={fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)}
        className={`${baseClass}__content${color.isDark ? ' color-swatch__content--dark-color' : ''}${outline ? ` ${baseClass}__content--focus` : ''}${houseShaped && level === 0 ? ' color-swatch--no-outline' : ''}`}
        style={style}
      >
        {contentRenderer([
          colorNumOnBottom ? (
            <div key='0'>
              <p className={`${baseClass}__${colorNumOnBottomClass}__name`}>{color.name}</p>
              <p className={`${baseClass}__${colorNumOnBottomClass}__number`}>{fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}</p>
            </div>
          ) : (
            <div key='0'>
              <p className='color-swatch__content__number'>{fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}</p>
              <p className='color-swatch__content__name'>{color.name}</p>
            </div>
          ),
          <Content msg={at(status, 'message')[0]} color={color} key='1' />
        ])}
      </section>)}
    </>
  )
})

export default React.memo<ColorSwatchProps>(ColorSwatch)
