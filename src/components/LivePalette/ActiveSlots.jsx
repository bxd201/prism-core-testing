// @flow
import { cloneElement, type Node, type Element } from 'react'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import ActiveSlot from './ActiveSlot'
import SimpleActiveSlot from './SimpleActiveSlot'
import type { Color } from '../../shared/types/Colors.js.flow'

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

  return colors.map((color: Color, index: number): ?Node => {
    const isActive: boolean = activeColor.id && activeColor.id === color.id
    if (color && index < LP_MAX_COLORS_ALLOWED) {
      return cloneElement(children, { ...props, index, key: color.id, color, active: isActive })
    }
  })
}

export default ActiveSlots
