// @flow
import React, { useContext } from 'react'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'
import './ColorStripButton.scss'

type Props = {
  children?: React.Node,
  onClick?: (SyntheticEvent<HTMLButtonElement>) => void,
  onKeyDown?: (SyntheticEvent<HTMLButtonElement>) => void,
  colors?: { hex: string }[],
  bottomLabel?: string
}

/**
 * A Styled button with an optional color strip on the bottom and an optional label underneath it.
 * The button's main content is defined by it's children.
 */
export default React.forwardRef<Props, HTMLElement>(({ children, onClick, colors, bottomLabel, onKeyDown }: Props, ref) => {
  const { colorWall: { colorSwatch = {} } } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { houseShaped = false } = colorSwatch

  return (
    <div className='color-strip-button'>
      <div className='color-strip-button__wrapper' ref={ref} role='button' tabIndex='0' onClick={onClick} onKeyDown={onKeyDown}>
        {children}
        {colors && colors.length > 0 && !houseShaped && (
          <div className='color-strip-button__bottom-list' role='img'>
            {colors.map((color, key) => (
              <div
                key={key}
                style={{ backgroundColor: color.hex }}
                className={`color-strip-button__bottom-item color-strip-button__bottom-item--${colors.length > 2 ? 'thin' : 'thick'}-border`}
                data-testid='color-square'
              />
            ))}
          </div>
        )}
      </div>
      {bottomLabel && <div className={`color-strip-button__label${houseShaped ? '-house-shaped' : ''}`}>{bottomLabel}</div>}
    </div>
  )
})
