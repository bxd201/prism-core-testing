// @flow
import React from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import { loadColors } from '../actions/loadColors'
import type { ColorSetPayload, ColorMap } from '../shared/types/Colors'

type Props = {
  colors: ColorSetPayload,
  brights: ColorSetPayload,
  colorMap: ColorMap,
  loadColors: Function,
  family?: string,
  families?: string[]
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
      colorMap: state.colors.colorMap,
      colors: state.colors.items.colors,
      brights: state.colors.items.brights,
      colorWallActive: state.colors.colorWallActive,
      family: state.colors.family,
      families: state.colors.families
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
