// @flow
import type { Node } from 'react'
import React, { useContext } from 'react'
import Prism, { ColorSwatch } from '@prism/toolkit'
import * as GA from 'src/analytics/GoogleAnalytics'
import { colorSwatchCommonProps } from 'src/components/ColorSwatchContent/ColorSwatchContent'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import useNavigatorArrows from 'src/hooks/useNavigatorArrows'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'
import { type Color } from 'src/shared/types/Colors.js.flow'
import ColorWallContext, { type ColorWallContextProps } from '../ColorWallContext'
import NavigatorArrow from './NavigatorArrow'
import './ColorChipLocator.scss'
import 'src/components/ColorSwatchContent/ColorSwatchContent.scss'

type ColorChipLocatorProps = { color?: Color }

const ColorChipLocator = ({ color = undefined }: ColorChipLocatorProps): Node => {
  const { brandId, brandKeyNumberSeparator }: ConfigurationContextType = useContext(ConfigurationContext)
  const { colorDetailPageRoot }: ColorWallContextProps = useContext(ColorWallContext)
  const { navigator } = useNavigatorArrows({ color, brandId })

  return (
    <Prism className='chip-locator'>
      <NavigatorArrow colors={navigator} direction={'top'} />
      <NavigatorArrow colors={navigator} direction={'right'} />
      <NavigatorArrow colors={navigator} direction={'bottom'} />
      <NavigatorArrow colors={navigator} direction={'left'} />
      <ColorSwatch
        {...colorSwatchCommonProps({ brandKeyNumberSeparator, color })}
        className='chip-locator__swatch'
        renderer={() => (
          <>
            <p className='chip-locator__name'>{color.name}</p>
            <p className='chip-locator__number'>
              {fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}
            </p>
            <p className='chip-locator__location'>Location</p>
            <p className='chip-locator__column'>Col: {color.column}</p>
            <p className='chip-locator__row'>Row: {color.row}</p>
            <button
              className={`chip-locator__button${color.isDark ? ' dark-color' : ''}`}
              onClick={() => {
                window.location.href = colorDetailPageRoot?.(color)
                GA.event(
                  {
                    category: 'Color Wall',
                    action: 'View Color Clicks',
                    label: `${color.name} - ${color.colorNumber}`
                  },
                  GA_TRACKER_NAME_BRAND[brandId]
                )
              }}
            >
              View Color
            </button>
          </>
        )}
        style={{ gridColumn: '2', gridRow: '2' }}
      />
    </Prism>
  )
}

export default ColorChipLocator
