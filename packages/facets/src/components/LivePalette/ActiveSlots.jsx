// @flow
import { cloneElement, type Node, type Element, useContext, useEffect } from 'react'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import ActiveSlot from './ActiveSlot'
import SimpleActiveSlot from './SimpleActiveSlot'
import type { Color } from '../../shared/types/Colors.js.flow'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorName } from 'src/shared/helpers/ColorUtils'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

type Props = {
  colors: Array<Color>,
  activeColor: Color,
  children: Element<ActiveSlot | SimpleActiveSlot>
}

/**
 * Container that populates all activeSlot colors.
 * ActiveSlots actions and styles are defined on their children.
 */
const ActiveSlots = (props: Props): Node => {
  const { colors, activeColor, children } = props
  const { brandId, brandKeyNumberSeparator } = useContext<ConfigurationContextType>(ConfigurationContext)

  useEffect(() => {
    colors.length > 0 && GA.event({
      category: 'My Color Palette',
      action: 'Color Selection',
      label: colors.map(color => fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)).join(', ')
    }, GA_TRACKER_NAME_BRAND[brandId])
  }, [colors])

  return colors.map((color: Color, index: number): ?Node => {
    const isActive: boolean = activeColor.id && activeColor.id === color.id
    if (color && index < LP_MAX_COLORS_ALLOWED) {
      return cloneElement(children, { ...props, index, key: color.id, color, active: isActive })
    }
  })
}

export default ActiveSlots
