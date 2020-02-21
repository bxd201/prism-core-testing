// @flow
import * as React from 'react'
import './ColorStripButton.scss'

const baseClass: string = 'color-strip-button'

type Props = {
  children?: React.Node,
  onClick?: (SyntheticEvent<HTMLButtonElement>) => void,
  colors?: { hex: string }[],
  bottomLabel?: string
}

/**
 * A Styled button with an optional color strip on the bottom and an optional label underneath it.
 * The button's main content is defined by it's children.
 */
export default ({ children, onClick, colors, bottomLabel }: Props) => (
  <div className={`${baseClass}`}>
    <div className={`${baseClass}__wrapper`} role='button' tabIndex='-1' onClick={onClick} onKeyDown={onClick}>
      {children}
      <div className={`${baseClass}__bottom-list`} role='img'>
        {colors && colors.map((color, key) =>
          <div
            key={key}
            style={{ backgroundColor: color.hex }}
            className={`${baseClass}__bottom-item ${baseClass}__bottom-item--${colors.length > 2 ? 'thin' : 'thick'}-border`}
            data-testid='color-square'
          />
        )}
      </div>
    </div>
    {bottomLabel && <div className={`${baseClass}__label`}>{bottomLabel}</div>}
  </div>
)
