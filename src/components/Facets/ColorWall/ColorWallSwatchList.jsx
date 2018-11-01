// @flow
import React, { PureComponent } from 'react'

import ColorWallSwatch from './ColorWallSwatch'

type Props = {
  colors: Array<any>,
  active?: string
}

class ColorWallSwatchList extends PureComponent<Props> {
  render () {
    const { colors, active } = this.props

    return (
      <ul className='color-wall-swatches'>
        {colors.map(color => {
          return (
            <ColorWallSwatch
              key={color.id}
              color={color}
              active={(color.colorNumber === active)}
            />
          )
        })}
      </ul>
    )
  }
}

export default ColorWallSwatchList
