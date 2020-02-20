// @flow
import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import toLower from 'lodash/toLower'

import { loadConfiguration } from '../../store/actions/configurations'

import CSSVariableApplicator from '../../helpers/CSSVariableApplicator'
import { varNames } from 'src/shared/variableDefs'

import ConfigurationContext from './ConfigurationContext'

import { type Configuration, type EmbeddedConfiguration } from '../../shared/types/Configuration'
import * as GA from 'src/analytics/GoogleAnalytics'

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
    fetchedConfig: {
      error,
      theme = {},
      typography = {},
      ...otherFetchedConfig
    },
    loadConfiguration,
    ...otherEmbeddedConfig
    // colorDetailPageRoot
  } = props

  // checks the brand, if no brand is provided we'll give the user a default experience
  const userBrand = brand || 'sherwin'

  useEffect(() => {
    loadConfiguration(userBrand)
  }, [])

  useEffect(() => {
    if (error) {
      throw new Error(error)
    }
  }, [ error ])

  // TODO: extract this into an appropriate location, perhaps an initial bootstrapping step tied into rdx or ctx -@cody.richmond
  useEffect(() => {
    if (otherFetchedConfig.ga_domain_id) {
      GA.set({ dimension1: otherFetchedConfig.ga_domain_id })
    }
  }, [otherFetchedConfig.ga_domain_id])

  // TODO: if we want, we can render a loader here or something
  // if (fetchedConfig.loadingConfiguration) {
  //   return null
  // }

  // construct the theme object with expliciteness
  const cssVariableApplicatorValues = useMemo(() => ({
    // theme
    [varNames.theme.colors.primary]: theme.primary,
    [varNames.theme.colors.secondary]: theme.secondary,
    [varNames.theme.colors.warning]: theme.warning,
    [varNames.theme.colors.success]: theme.success,
    [varNames.theme.colors.danger]: theme.danger,
    [varNames.theme.colors.error]: theme.error,
    [varNames.theme.colors.grey]: theme.grey,
    [varNames.theme.colors.lightGrey]: theme.lightGrey,
    [varNames.theme.colors.nearBlack]: theme.nearBlack,
    [varNames.theme.colors.black]: theme.black,
    [varNames.theme.colors.white]: theme.white,
    // typography
    [varNames.typography.bodyFontFamily]: typography.bodyFontFamily,
    [varNames.typography.titleFontFamily]: typography.titleFontFamily
  }), [typography, theme])

  // add brand to the configuration object
  // TODO: remove this when we have moved the data around in the database to be returned by the brandId
  const brandId = useMemo(() => (toLower(userBrand) === 'sw-ca') ? 'sherwin' : toLower(userBrand), [userBrand])
  const config = useMemo(() => ({
    brandId,
    ...otherEmbeddedConfig,
    ...otherFetchedConfig
  }), [brandId, otherEmbeddedConfig, otherFetchedConfig])

  return (
    <ConfigurationContext.Provider value={config}>
      <CSSVariableApplicator variables={cssVariableApplicatorValues}>
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
