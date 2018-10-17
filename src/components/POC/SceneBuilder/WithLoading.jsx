// @flow
import React from 'react'

type Conditions = {
  isLoading: Boolean,
  whenLoading?: any,
  isEmpty?: Boolean,
  whenEmpty?: any,
  isError: Boolean,
  whenError?: any
  // isReady: Boolean
}

function WithLoading (Component: any, conditions: Conditions) {
  return class extends React.PureComponent<any> {
    render () {
      const { isLoading, whenLoading, isEmpty, whenEmpty, isError, whenError, isReady } = this.props
      if( typeof isLoading !== 'undefined' && isLoading && whenLoading ) {
        return whenLoading
      }

      if( typeof isError !== 'undefined' && isError && whenError ) {
        return whenError
      }

      if( typeof isEmpty !== 'undefined' && isEmpty && whenEmpty ) {
        return whenEmpty
      }

      // if( typeof isReady !== 'undefined' ) {
      //   if( isReady ) {
      //     return Component
      //   } else {
      //     // if isReady is defined but we are NOT ready (and also not loading, empty, or in error state)...
      //     // ... return nothing
      //     return
      //   }
      // }

      return <Component />
    }
  }
}

export default WithLoading
