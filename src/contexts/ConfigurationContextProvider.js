// @flow
import React, { useState, useEffect } from 'react'
import axios from 'axios'

import { CONFIG_ENDPOINT } from 'constants/endpoints'

import CSSVariableApplicator from '../helpers/CSSVariableApplicator'

import ConfigurationContext from './ConfigurationContext'

type Props = {
  children: any,
  brand?: string
}

function ConfigurationContextProvider ({ children, brand }: Props) {
  const [configurations, setConfigurations] = useState({ loading: true })

  useEffect(() => {
    axios
      .get(`${CONFIG_ENDPOINT}/${brand.toLowerCase()}`) // TODO: remove this toLowecase() concat as well, maybe.
      .then(r => r.data)
      .then(config => {
        setConfigurations(config)
      })
      .catch(err => {
        console.log(`There was an error loading the configuration for ${brand}.`, err)
      })
  }, [])

  // TODO: if we want, we can render a loader here or something
  if (configurations.loading) {
    return null
  }

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

export default ConfigurationContextProvider
