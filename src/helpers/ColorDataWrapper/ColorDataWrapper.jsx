// @flow
import React from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import at from 'lodash/at'

import HeroLoader from '../../components/Loaders/HeroLoader/HeroLoader'
import { loadColors } from '../../store/actions/loadColors'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'

import { type CategorizedColorGrid, type ColorMap } from '../../shared/types/Colors'
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

      if (isEmpty(this.props.colors)) {
        this.props.loadColors(this.props.config.brandId)
      }
    }

    render () {
      if (this.props.loading) {
        return <HeroLoader />
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
      families: state.colors.families,
      loading: !!at(state, 'colors.status.loading')[0],
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
