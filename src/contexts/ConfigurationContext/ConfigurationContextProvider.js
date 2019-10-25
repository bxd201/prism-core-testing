// @flow
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import toLower from 'lodash/toLower'

import { loadConfiguration } from '../../store/actions/configurations'

import CSSVariableApplicator from '../../helpers/CSSVariableApplicator'
import { varNames } from 'variables'

import ConfigurationContext from './ConfigurationContext'

import type { Configuration } from '../../shared/types/Configuration'

type Props = {
  children: any,
  brand: string,
  pageRoot: string,
  loadConfiguration: Function,
  configurations: Configuration,
  colorDetailPageRoot: string
}

function ConfigurationContextProvider ({ children, brand, pageRoot, loadConfiguration, configurations, colorDetailPageRoot }: Props) {
  // checks the brand, if no brand is provided we'll give the user a default experience
  const userBrand = brand || 'sherwin'

  useEffect(() => {
    loadConfiguration(userBrand)
  }, [])

  // TODO: if we want, we can render a loader here or something
  // if (configurations.loadingConfiguration) {
  //   return null
  // }

  // construct the theme object with expliciteness
  const theme = {
    [varNames.theme.colors.primary]: configurations.theme.primary,
    [varNames.theme.colors.secondary]: configurations.theme.secondary,
    [varNames.theme.colors.warning]: configurations.theme.warning,
    [varNames.theme.colors.success]: configurations.theme.success,
    [varNames.theme.colors.danger]: configurations.theme.danger,
    [varNames.theme.colors.error]: configurations.theme.error,
    [varNames.theme.colors.grey]: configurations.theme.grey,
    [varNames.theme.colors.lightGrey]: configurations.theme.lightGrey,
    [varNames.theme.colors.nearBlack]: configurations.theme.nearBlack,
    [varNames.theme.colors.blackv]: configurations.theme.black,
    [varNames.theme.colors.white]: configurations.theme.white
  }

  // add brand to the configuration object
  // TODO: remove this when we have moved the data around in the database to be returned by the brandId
  const brandId = (toLower(userBrand) === 'sw-ca') ? 'sherwin' : toLower(userBrand)
  const config = {
    brandId,
    ...configurations
  }

  // TODO: should this be apart of the overall global config? is there a better way to get this data down to stuff?
  if (colorDetailPageRoot) {
    config.colorDetailPageRoot = colorDetailPageRoot
  }

  return (
    <ConfigurationContext.Provider value={config}>
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
