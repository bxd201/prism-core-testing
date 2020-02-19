import React from 'react'

import LiveAnnouncerContext from './LiveAnnouncerContext'

function WithLiveAnnouncerContext (Component) {
  return (props) => (
    <LiveAnnouncerContext.Consumer>
      { lactx => <Component {...props} liveAnnouncerContext={lactx} /> }
    </LiveAnnouncerContext.Consumer>
  )
}

export default WithLiveAnnouncerContext
