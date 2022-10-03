import React from 'react'
import ColorWallContext from './ColorWallContext'

function withColorWallContext (Component) {
  return (props) => (
    <ColorWallContext.Consumer>
      { ctx => <Component {...props} colorWallContext={ctx} /> }
    </ColorWallContext.Consumer>
  )
}

export default withColorWallContext
