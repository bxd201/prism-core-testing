import React from 'react'

import ConfigurationContext from './ConfigurationContext'

function WithConfigurationContext (Component) {
  return (props) => (
    <ConfigurationContext.Consumer>
      { config => <Component {...props} config={config} /> }
    </ConfigurationContext.Consumer>
  )
}

export default WithConfigurationContext
