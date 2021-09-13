import React, { useState } from 'react'
import uniqueId from 'lodash/uniqueId'

function withUniqueId (WrappedComponent) {
  return (props) => {
    const [uid] = useState(uniqueId('__uniqueId__'))
    return <WrappedComponent {...props} uid={uid} />
  }
}

export default withUniqueId
