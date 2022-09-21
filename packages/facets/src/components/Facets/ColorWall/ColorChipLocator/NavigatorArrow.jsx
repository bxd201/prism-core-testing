// @flow
import type { Node } from 'react'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { NavigatorColors } from 'src/hooks/useNavigatorArrows'

type NavigatorArrowProps = { colors: NavigatorColors, direction: string }

const NavigatorArrow = ({ colors, direction }: NavigatorArrowProps): Node => {
  const history = useHistory()
  const arrowColor = colors[direction]
  const arrow = { top: 'up', right: 'right', bottom: 'down', left: 'left' }
  const arrowAria = { top: 'color above', right: 'next color', bottom: 'color below', left: 'previous color' }

  return (
    <button
      className={`chip-locator__${direction}-navigator`}
      aria-label={arrowAria[direction]}
      disabled={!arrowColor}
      onClick={() => {
        history.push(`/color-locator/${arrowColor.brandKey.toLowerCase()}-${arrowColor.colorNumber}`)
      }}
      style={{ backgroundColor: arrowColor ? `${arrowColor.hex}` : 'none' }}
    >
      <FontAwesomeIcon
        style={{ color: arrowColor ? (arrowColor.isDark ? 'white' : 'black') : 'lightgray', display: 'inline' }}
        icon={['fas', `caret-${arrow[direction]}`]}
        size='2x'
      />
    </button>
  )
}

export default NavigatorArrow
