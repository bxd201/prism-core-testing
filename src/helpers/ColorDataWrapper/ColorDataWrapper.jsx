// @flow
import React from 'react'
import { connect } from 'react-redux'
import at from 'lodash/at'

import { loadColors } from '../../store/actions/loadColors'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'

import { type CategorizedColorGrid, type ColorMap } from '../../shared/types/Colors.js.flow'
import { type Configuration } from '../../shared/types/Configuration'

import './ColorDataWrapper.scss'

export type ColorDataWrapperProps = {
  colors: CategorizedColorGrid,
  brights: CategorizedColorGrid,
  colorMap: ColorMap,
  loadColors: Function,
  family?: string,
  families?: string[],
  loading: boolean,
  requestComplete: boolean,
  activeRequest: boolean,
  error: boolean,
  config: Configuration
}

/**
 * HOC for ensuring color data is loaded before rendering the component
 * @param {component} WrappedComponent
 */
const ColorDataWrapper = (WrappedComponent: any) => {
  class ColorData extends React.Component<ColorDataWrapperProps> {
    constructor (props: ColorDataWrapperProps) {
      super(props)

      const { colors, config, loadColors, activeRequest, requestComplete } = props

      if (typeof colors === 'undefined' && !activeRequest && !requestComplete) {
        loadColors(config.brandId)
      }
    }

    render () {
      const {
        loading,
        requestComplete,
        activeRequest,
        ...other
      } = this.props

      return <WrappedComponent {...other} loading={loading} />
    }
  }

  const mapStateToProps = (state, props) => {
    return {
      colorMap: state.colors.colorMap,
      colors: state.colors.items.colors,
      brights: state.colors.items.brights,
      colorWallActive: state.colors.colorWallActive,
      family: state.colors.family,
      families: state.colors.families,
      loading: !!at(state, 'colors.status.loading')[0],
      requestComplete: !!at(state, 'colors.status.requestComplete')[0],
      activeRequest: !!at(state, 'colors.status.activeRequest')[0],
      error: !!at(state, 'colors.status.error')[0]
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
