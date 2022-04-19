// @flow
import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { type ColorsStateItems } from 'src/shared/types/Actions.js.flow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ColorWallContext, { type ColorWallContextProps } from '../ColorWallContext'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorSwatch from '../ColorSwatch/ColorSwatch'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import './ColorChipLocator.scss'

type ColorChipLocatorProps = { color?: Color }
type NavigatorColors = { top?: Color, right?: Color, bottom?: Color, left?: Color }

const ColorChipLocator = ({ color = undefined }: ColorChipLocatorProps) => {
  const history = useHistory()
  const { brandId, brandKeyNumberSeparator }: ConfigurationContextType = useContext(ConfigurationContext)
  const { colorDetailPageRoot }: ColorWallContextProps = useContext(ColorWallContext)
  const { colorMap = {} }: ColorsStateItems = useSelector(state => state.colors.items)
  const [navigator, setNavigator] = useState<NavigatorColors>({ top: undefined, right: undefined, bottom: undefined, left: undefined })

  const getArrowColor = (coord: string, direction: string) => {
    const colors: any = Object.values(colorMap)
    const colorGroup = colors.filter(c => c.colorGroup[0] === color.colorGroup[0])
    const position = { top: -1, right: 1, bottom: 1, left: -1 }
    const letters = ['A', 'B', 'C'] // hgsw storeStripLocator letters

    return coord === 'x' ? (
      colorGroup.filter(c => c.row === color.row && +c.column === +color.column + position[direction] && c.storeStripLocator.slice(-1) === color.storeStripLocator.slice(-1))[0]
    ) : (
      colorGroup.filter(c => c.column === color.column && (
        brandId === 'hgsw' // managing chunk gap
          ? (c.row === color.row && letters.indexOf(c.storeStripLocator.slice(-1)) - position[direction] === letters.indexOf(color.storeStripLocator.slice(-1))) ||
            (+c.row === +color.row + position[direction] && color.storeStripLocator.slice(-1) === letters[direction === 'top' ? 0 : letters.length - 1] && c.storeStripLocator.slice(-1) === letters[direction === 'top' ? letters.length - 1 : 0])
          : +c.row === +color.row + position[direction])
      )[0]
    )
  }

  useEffect(() => {
    setNavigator({
      top: getArrowColor('y', 'top'),
      right: getArrowColor('x', 'right'),
      bottom: getArrowColor('y', 'bottom'),
      left: getArrowColor('x', 'left')
    })
  }, [])

  type NavigatorArrowProps = { colors: NavigatorColors, direction: string }

  const NavigatorArrow = ({ colors, direction }: NavigatorArrowProps) => {
    const arrowColor = colors[direction]
    const arrow = { top: 'up', right: 'right', bottom: 'down', left: 'left' }

    return (
      <button className={`chip-locator__${direction}-navigator`}
        disabled={!arrowColor}
        onClick={() => { history.push(`/color-locator/${arrowColor.brandKey.toLowerCase()}-${arrowColor.colorNumber}`) }}
        style={{ backgroundColor: arrowColor ? `${arrowColor.hex}` : 'none' }}
      >
        <FontAwesomeIcon style={{ color: arrowColor ? arrowColor.isDark ? 'white' : 'black' : 'lightgray' }} icon={['fas', `caret-${arrow[direction]}`]} size='2x' />
      </button>
    )
  }

  return (
    <div className='chip-locator'>
      <NavigatorArrow colors={navigator} direction={'top'} />
      <NavigatorArrow colors={navigator} direction={'right'} />
      <NavigatorArrow colors={navigator} direction={'bottom'} />
      <NavigatorArrow colors={navigator} direction={'left'} />
      <ColorSwatch style={{ gridColumn: '2', gridRow: '2', padding: '1.3rem' }}
        color={color}
        contentRenderer={() => (
          <>
            <p className='chip-locator__name'>{color.name}</p>
            <p className='chip-locator__number'>{fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}</p>
            <p className='chip-locator__location'>Location</p>
            <p className='chip-locator__column'>Col: {color.column}</p>
            <p className='chip-locator__row'>Row: {color.row}</p>
            <button
              className={`chip-locator__button${color.isDark ? ' dark-color' : ''}`}
              onClick={() => {
                window.location.href = colorDetailPageRoot?.(color)
                GA.event({ category: 'Color Wall', action: 'View Color Clicks', label: `${color.name} - ${color.colorNumber}` }, GA_TRACKER_NAME_BRAND[brandId])
              }}
            >
              View Color
            </button>
          </>
        )}
        outline={false}
        showContents
      />
    </div>
  )
}

export default ColorChipLocator
