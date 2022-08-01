// @flow
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { add } from 'src/store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ColorWallPropsContext } from 'src/components/Facets/ColorWall/ColorWallV3/ColorWallPropsContext'
import InfoButton from '../InfoButton/InfoButton'
import at from 'lodash/at'
import startCase from 'lodash/startCase'
import { useIntl } from 'react-intl'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorName, fullColorNumber } from 'src/shared/helpers/ColorUtils'
import type { Color } from '../../shared/types/Colors.js.flow'
import './ColorSwatchContent.scss'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND, HASH_CATEGORIES } from 'src/constants/globals'

type Props = { brandKeyNumberSeparator: string, color: Color }

export const colorSwatchCommonProps = ({ brandKeyNumberSeparator, color }: Props) => (
  {
    active: true,
    'aria-label': fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator),
    color,
    renderer: () => <ColorSwatchContent color={color} />
  }
)

const ColorSwatchContent = ({ className, color }: { className?: string, color: Color }) => {
  const dispatch = useDispatch()
  const livePaletteColors = useSelector(store => store.lp.colors)
  const { brandId, brandKeyNumberSeparator, colorWall: { colorSwatch = {} } } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const ctx = useContext(ColorWallPropsContext)
  const { swatchContentRefs } = ctx
  const { messages = {} } = useIntl()
  const colorIsInLivePalette = livePaletteColors.some(({ colorNumber }) => colorNumber === color.colorNumber)
  const baseClass = houseShaped ? 'swatch-content--house-shaped' : 'swatch-content'

  return (
    <div className={className}>
      <div className={`${baseClass}__btns`}>
        <div className='swatch-content__button-group'>
          {colorIsInLivePalette
            ? <FontAwesomeIcon className='check-icon' icon={['fa', 'check-circle']} size='2x' />
            : (
              <button
                onClick={() => {
                  dispatch(add(color))
                  GA.event({
                    category: startCase(window.location.hash.split('/').filter(hash => HASH_CATEGORIES.indexOf(hash) >= 0)),
                    action: 'Color Swatch Add',
                    label: fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)
                  }, GA_TRACKER_NAME_BRAND[brandId])
                }}
                ref={el => swatchContentRefs.current.push(el)}
                title={at(messages, 'ADD_TO_PALETTE')[0].replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator))}
              >
                <FontAwesomeIcon className='add-icon' icon={['fal', 'plus-circle']} size='2x' />
              </button>
              )
          }
          <InfoButton
            ref={el => swatchContentRefs.current.push(el)}
            color={color}
          />
        </div>
      </div>
      <div className={`${baseClass}__label swatch-content${colorNumOnBottom ? '__name-number' : '__number-name'}`}>
        <p className={`${baseClass}__label--number`}>{fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}</p>
        <p className={`${baseClass}__label--name`}>{color.name}</p>
      </div>
    </div>
  )
}

export default ColorSwatchContent
