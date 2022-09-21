// @flow
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import type { ColorsStateItems } from '../shared/types/Actions'
import type { Color } from '../shared/types/Colors'

export type NavigatorColors = { top?: Color, right?: Color, bottom?: Color, left?: Color }

type UseNavigatorArrowsProps = {
  color: Color,
  brandId: string
}

type UseNavigatorArrowsObj = {
  navigator: NavigatorColors
}

const useNavigatorArrows = ({ color, brandId }: UseNavigatorArrowsProps): UseNavigatorArrowsObj => {
  const [navigator, setNavigator] = useState<NavigatorColors>({
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined
  })

  const { colorMap = {} }: ColorsStateItems = useSelector((state) => state.colors.items)

  const getArrowColor = (coord: string, direction: string) => {
    const colors: any = Object.values(colorMap)
    const colorGroup = colors.filter((c) => c.colorGroup[0] === color.colorGroup[0])
    const position = { top: -1, right: 1, bottom: 1, left: -1 }
    const letters = ['A', 'B', 'C'] // hgsw storeStripLocator letters

    return coord === 'x'
      ? colorGroup.filter(
          (c) =>
            c.row === color.row &&
            +c.column === +color.column + position[direction] &&
            c.storeStripLocator.slice(-1) === color.storeStripLocator.slice(-1)
        )[0]
      : colorGroup.filter(
          (c) =>
            c.column === color.column &&
            (brandId === 'hgsw' // managing chunk gap
              ? (c.row === color.row &&
                  letters.indexOf(c.storeStripLocator.slice(-1)) - position[direction] ===
                    letters.indexOf(color.storeStripLocator.slice(-1))) ||
                (+c.row === +color.row + position[direction] &&
                  color.storeStripLocator.slice(-1) === letters[direction === 'top' ? 0 : letters.length - 1] &&
                  c.storeStripLocator.slice(-1) === letters[direction === 'top' ? letters.length - 1 : 0])
              : +c.row === +color.row + position[direction])
        )[0]
  }

  useEffect(() => {
    setNavigator({
      top: getArrowColor('y', 'top'),
      right: getArrowColor('x', 'right'),
      bottom: getArrowColor('y', 'bottom'),
      left: getArrowColor('x', 'left')
    })
  }, [])

  return {
    navigator
  }
}

export default useNavigatorArrows
