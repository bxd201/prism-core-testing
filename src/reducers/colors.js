// @flow
import { REQUEST_COLORS, RECEIVE_COLORS, FILTER_BY_FAMILY, MAKE_ACTIVE_COLOR, RESET_ACTIVE_COLOR } from '../actions/loadColors'
import { REQUEST_SEARCH_RESULTS, RECEIVE_SEARCH_RESULTS } from '../actions/loadSearchResults'
import { convertToColorMap, isColorFamily } from '../shared/helpers/ColorDataUtils'
import type { ReduxAction, ColorsState } from '../shared/types/Actions'

export const initialState: ColorsState = {
  status: {
    loading: true
  },
  items: {},
  searchResults: [],
  defaultFamily: void (0),
  family: void (0),
  families: void (0),
  colorWallActive: void (0)
}

export const colors = (state: ColorsState = initialState, action: ReduxAction) => {
  switch (action.type) {
    case RESET_ACTIVE_COLOR:
      return Object.assign({}, state, {
        colorWallActive: initialState.colorWallActive
      })

    case MAKE_ACTIVE_COLOR:
      return Object.assign({}, state, {
        colorWallActive: action.payload.color
      })

    case REQUEST_COLORS:
      return Object.assign({}, state, {
        status: action.payload
      })

    case RECEIVE_COLORS:
      let newState = Object.assign({}, state, {
        items: {
          colors: action.payload.colors,
          brights: action.payload.brights,
          colorMap: Object.assign({}, convertToColorMap(action.payload.colors), convertToColorMap(action.payload.brights))
        },
        defaultFamily: action.payload.defaultFamily,
        families: action.payload.families,
        status: {
          loading: action.payload.loading
        }
      })

      // if family has already been set on state, verify that it exists in our new set of available families...
      if (state.family && newState.families && isColorFamily(state.family, newState.families)) {
        // if it does, then do nothing! this means we have already set a valid family prior to receiving families
        // and we do not need to update the value further
      } else {
        // otherwise set our family to the default family
        newState.family = action.payload.defaultFamily
      }

      return newState

    case FILTER_BY_FAMILY:
      if (state.family !== action.payload.family) {
        return Object.assign({}, state, {
          family: action.payload.family,
          colorWallActive: initialState.colorWallActive
        })
      }
      break

    case REQUEST_SEARCH_RESULTS:
      return Object.assign({}, state, {
        status: action.payload.status
      })

    case RECEIVE_SEARCH_RESULTS:
      return ({
        ...state,
        searchResults: action.payload.results,
        status: {
          ...state.status,
          loading: action.payload.loading
        }
      })
  }

  return state
}
