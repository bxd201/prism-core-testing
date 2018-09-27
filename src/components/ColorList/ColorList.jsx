import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import ColorDataWrapper from '../../helpers/ColorDataWrapper'
import ColorSwatch from '../ColorSwatch/ColorSwatch'

/**
 * TODO: Very temporary component that demonstrates a simple color list that makes up an example
 * overall visualizer.
 */
class ColorList extends PureComponent {
  render () {
    const colorListMarkup = this.props.colors['Red'].map(color => {
      return <ColorSwatch key={color.id} color={color} />
    })

    return (
      <div style={{ display: 'flex', overflow: 'scroll', width: '900px', height: '300px', flexWrap: 'wrap' }}>
        {colorListMarkup}
      </div>
    )
  }
}

ColorList.propTypes = {
  colors: PropTypes.object
}

export default ColorDataWrapper(ColorList)
