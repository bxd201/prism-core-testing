// @flow
import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import { loadConfiguration } from '../store/actions/configurations'

import CSSVariableApplicator from '../helpers/CSSVariableApplicator'

import ConfigurationContext from './ConfigurationContext'

import type { Configuration } from '../shared/types/Configuration'

type Props = {
  children: any,
  brand?: string,
  loadConfiguration: Function,
  configurations: Configuration
}

function ConfigurationContextProvider ({ children, brand, loadConfiguration, configurations }: Props) {
  useEffect(() => {
    loadConfiguration(brand)
  }, [])

  // TODO: if we want, we can render a loader here or something
  // if (configurations.loadingConfiguration) {
  //   return null
  // }

  // construct the theme object with expliciteness
  const theme = {
    'prism-color-primary': configurations.theme.primary,
    'prism-color-secondary': configurations.theme.secondary,
    'prism-color-warning': configurations.theme.warning,
    'prism-color-success': configurations.theme.success,
    'prism-color-danger': configurations.theme.danger,
    'prism-color-error': configurations.theme.error,
    'prism-color-grey': configurations.theme.grey,
    'prism-color-lightGrey': configurations.theme.lightGrey,
    'prism-color-nearBlack': configurations.theme.nearBlack,
    'prism-color-black': configurations.theme.black,
    'prism-color-white': configurations.theme.white
  }

  return (
    <ConfigurationContext.Provider value={configurations}>
      <CSSVariableApplicator variables={theme}>
        {children}
      </CSSVariableApplicator>
    </ConfigurationContext.Provider>
  )
}

const mapStateToProps = (state, props) => {
  const { configurations } = state

  return {
    configurations
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadConfiguration: (brandId) => {
      dispatch(loadConfiguration(brandId))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationContextProvider)
