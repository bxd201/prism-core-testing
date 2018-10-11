// @flow
import React from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import { loadColors } from '../actions/loadColors'
import type { ColorPayload } from '../shared/types/Colors'

type Props = {
  colors: ColorPayload,
  loadColors: Function
}

/**
 * HOC for ensuring color data is loaded before rendering the component
 * @param {component} WrappedComponent
 */
const ColorDataWrapper = (WrappedComponent: any) => {
  class ColorData extends React.Component<Props> {
    constructor (props) {
      super(props)

      if (isEmpty(this.props.colors)) {
        this.props.loadColors()
      }
    }

    render () {
      if (isEmpty(this.props.colors)) {
        return <p>Loading....</p>
      }

      return <WrappedComponent {...this.props} />
    }
  }

  const mapStateToProps = (state, props) => {
    return {
      colors: state.colors.items,
      family: state.colors.family
    }
  }

  const mapDispatchToProps = (dispatch: Function) => {
    return {
      loadColors: () => {
        dispatch(loadColors())
      }
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(ColorData)
}

export default ColorDataWrapper
