// @flow
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import toLower from 'lodash/toLower'

import { loadConfiguration } from '../../store/actions/configurations'

import CSSVariableApplicator from '../../helpers/CSSVariableApplicator'
import { varNames } from 'variables'

import ConfigurationContext from './ConfigurationContext'

import { type Configuration, type EmbeddedConfiguration } from '../../shared/types/Configuration'

type ReduxStateProps = {
  fetchedConfig: Configuration
}

type ReduxDispatchProps = {
  loadConfiguration: Function
}

type Props = ReduxStateProps & ReduxDispatchProps & EmbeddedConfiguration & {
  children: any
}

function ConfigurationContextProvider (props: Props) {
  const {
    brand,
    children,
    fetchedConfig,
    loadConfiguration,
    ...otherEmbeddedConfig
    // colorDetailPageRoot
  } = props

  // checks the brand, if no brand is provided we'll give the user a default experience
  const userBrand = brand || 'sherwin'

  useEffect(() => {
    loadConfiguration(userBrand)
  }, [])

  // TODO: if we want, we can render a loader here or something
  // if (fetchedConfig.loadingConfiguration) {
  //   return null
  // }

  // construct the theme object with expliciteness
  const theme = {
    [varNames.theme.colors.primary]: fetchedConfig.theme.primary,
    [varNames.theme.colors.secondary]: fetchedConfig.theme.secondary,
    [varNames.theme.colors.warning]: fetchedConfig.theme.warning,
    [varNames.theme.colors.success]: fetchedConfig.theme.success,
    [varNames.theme.colors.danger]: fetchedConfig.theme.danger,
    [varNames.theme.colors.error]: fetchedConfig.theme.error,
    [varNames.theme.colors.grey]: fetchedConfig.theme.grey,
    [varNames.theme.colors.lightGrey]: fetchedConfig.theme.lightGrey,
    [varNames.theme.colors.nearBlack]: fetchedConfig.theme.nearBlack,
    [varNames.theme.colors.blackv]: fetchedConfig.theme.black,
    [varNames.theme.colors.white]: fetchedConfig.theme.white
  }

  // add brand to the configuration object
  // TODO: remove this when we have moved the data around in the database to be returned by the brandId
  const brandId = (toLower(userBrand) === 'sw-ca') ? 'sherwin' : toLower(userBrand)
  const config = {
    brandId,
    ...otherEmbeddedConfig,
    ...fetchedConfig
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
    fetchedConfig: configurations
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadConfiguration: (brandId) => {
      dispatch(loadConfiguration(brandId))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo<Props>(ConfigurationContextProvider))
