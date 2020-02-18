// @flow
import axios from 'axios'

import { CONFIG_ENDPOINT } from 'constants/endpoints'
import { generateBrandedEndpoint } from 'src/shared/helpers/DataUtils'

export const REQUEST_CONFIGURATION: string = 'REQUEST_CONFIGURATION'
const requestConfiguration = () => {
  return {
    type: REQUEST_CONFIGURATION,
    payload: {
      loadingConfiguration: true
    }
  }
}

export const RECEIVE_CONFIGURATION: string = 'RECEIVE_CONFIGURATION'
const receiveConfiguration = (configurationData: Number) => {
  return {
    type: RECEIVE_CONFIGURATION,
    payload: {
      loadingConfiguration: false,
      configuration: configurationData
    }
  }
}

export const LOAD_ERROR: string = 'LOAD_ERROR'
const loadError = () => {
  return {
    type: LOAD_ERROR
  }
}

export const loadConfiguration = (brandId: string) => {
  return (dispatch: Function) => {
    dispatch(requestConfiguration())

    axios
      .get(generateBrandedEndpoint(CONFIG_ENDPOINT, brandId.toLowerCase())) // TODO: remove this toLowecase()
      .then(r => r.data)
      .then(config => {
        dispatch(receiveConfiguration(config))
      })
      .catch(err => {
        dispatch(loadError())
        console.error(`There was an error loading the configuration for ${brandId}.`, err)
      })
  }
}
