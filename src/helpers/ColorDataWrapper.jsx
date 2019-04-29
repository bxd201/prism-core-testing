// @flow
import React from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import CircleLoader from '../components/Loaders/CircleLoader/CircleLoader'
import { loadColors } from '../store/actions/loadColors'
import { varValues } from 'variables'
import WithConfigurationContext from '../contexts/ConfigurationContext/WithConfigurationContext'

import { type CategorizedColorGrid, type ColorMap } from '../shared/types/Colors'
import type { Configuration } from '../shared/types/Configuration'

type Props = {
  colors: CategorizedColorGrid,
  brights: CategorizedColorGrid,
  colorMap: ColorMap,
  loadColors: Function,
  family?: string,
  families?: string[],
  config: Configuration
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
        this.props.loadColors(this.props.config.brandId)
      }
    }

    render () {
      if (isEmpty(this.props.colors)) {
        return <CircleLoader color={varValues.colors.primary} />
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
      loadColors: (brandId) => {
        dispatch(loadColors(brandId))
      }
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithConfigurationContext(ColorData))
}

export default ColorDataWrapper
