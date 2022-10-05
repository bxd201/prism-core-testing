// @flow
import { DEFAULT_CONFIGURATION } from 'constants/configurations'
import { LOAD_ERROR,RECEIVE_CONFIGURATION, REQUEST_CONFIGURATION } from '../actions/configurations'

export const configurations = (state: any = DEFAULT_CONFIGURATION, action: any) => {
  switch (action.type) {
    case RECEIVE_CONFIGURATION:
      return {
        ...state,
        ...action.payload.configuration,
        loadingConfiguration: action.payload.loadingConfiguration
      }

    case LOAD_ERROR: {
      return {
        ...state,
        loadingConfiguration: false,
        error: action.payload || true
      }
    }

    case REQUEST_CONFIGURATION:
      return {
        ...state,
        loadingConfiguration: action.payload.loadingConfiguration
      }

    default:
      return state
  }
}
