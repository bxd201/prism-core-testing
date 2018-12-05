// @flow
import React, { PureComponent } from 'react'

type Props = {
  color: Object
}

class ColorViewer extends PureComponent<Props> {
  render () {
    const { color } = this.props

    return (
      <React.Fragment>
        <strong>Color Viewer Color</strong>
        <hr />
        {JSON.stringify(color)}
        <hr />
      </React.Fragment>
    )
  }
}

export default ColorViewer
