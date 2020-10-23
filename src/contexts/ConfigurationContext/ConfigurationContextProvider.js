// @flow
import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import toLower from 'lodash/toLower'

import { loadConfiguration } from '../../store/actions/configurations'

import CSSVariableApplicator from '../../helpers/CSSVariableApplicator'
import { varNames } from 'src/shared/withBuild/variableDefs'
import { getThemeColorsObj, themeColors, defaultThemeColors, extractThemeData } from 'src/shared/withBuild/themeColors'

import ConfigurationContext from './ConfigurationContext'

import { type Configuration, type EmbeddedConfiguration } from '../../shared/types/Configuration'
import * as GA from 'src/analytics/GoogleAnalytics'
import flattenDeep from 'lodash/flattenDeep'
import { tinycolor } from '@ctrl/tinycolor'

type ReduxStateProps = {
  fetchedConfig: Configuration
}

type ReduxDispatchProps = {
  loadConfiguration: Function
}

type Props = ReduxStateProps & ReduxDispatchProps & EmbeddedConfiguration & {
  children: any
}

type ThemeColorObj = {
  prop: string,
  color: string,
  contrast?: ThemeColorObj,
  trans?: ThemeColorObj
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
  const cssVariableApplicatorValues = useMemo(() => {
    let customProps = {}

    // theme
    if (theme) {
      // TODO: Little magic in here to map a few deprecated `theme` values over to their new names
      const newThemeVars: { [key: string]: ThemeColorObj } = getThemeColorsObj(themeColors, {
        ...defaultThemeColors,
        // TODO: remove this next chunk once API is returning correct V2 theme colors
        // PRISM-360 | begin deprecated theme color mapping
        secondary: theme.primary,
        dark: theme.nearBlack,
        light: theme.lightGrey,
        link: theme.primary,
        danger: theme.error,
        active: ((color) => {
          if (!color) return undefined
          const tc = tinycolor(color)
          return (tc.isDark() ? tc.tint(15) : tc.shade(15)).toHexString()
        })(theme.link || theme.primary),
        // TODO: end deprecated theme color mapping
        ...theme
      })

      const flat = flattenDeep(extractThemeData(newThemeVars)).reduce((accum, { prop, color }) => ({
        ...accum,
        [prop]: color
      }), {})

      customProps = {
        ...customProps,
        // new theme props
        ...flat,
        // deprecated props below
        [varNames.theme._colors.primary]: theme.primary,
        [varNames.theme._colors.secondary]: theme.secondary,
        [varNames.theme._colors.warning]: theme.warning,
        [varNames.theme._colors.success]: theme.success,
        [varNames.theme._colors.danger]: theme.danger,
        [varNames.theme._colors.grey]: theme.grey,
        [varNames.theme._colors.lightGrey]: theme.lightGrey,
        [varNames.theme._colors.nearBlack]: theme.nearBlack,
        [varNames.theme._colors.black]: theme.black,
        [varNames.theme._colors.white]: theme.white
      }
    }

    // typography
    if (typography) {
      customProps = {
        ...customProps,
        [varNames.typography.bodyFontFamily]: typography.bodyFontFamily,
        [varNames.typography.titleFontFamily]: typography.titleFontFamily
      }
    }

    return customProps
  }, [typography, theme])

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
