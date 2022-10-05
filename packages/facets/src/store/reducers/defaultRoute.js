// @flow
import { ROUTES_ENUM } from '../../components/Facets/ColorVisualizerWrapper/routeValueCollections'
import { SET_DEFAULT_ROUTE } from '../actions/defaultRoute'

const initialState = ROUTES_ENUM.ACTIVE

const defaultRoute = (state: string = initialState, action: { type: string, payload: string }): string => {
  if (action.type === SET_DEFAULT_ROUTE) {
    return action.payload
  }
  return state
}

export default defaultRoute
