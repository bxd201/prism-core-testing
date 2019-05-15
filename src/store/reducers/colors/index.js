// @flow
import { REQUEST_COLORS, RECEIVE_COLORS, FILTER_BY_FAMILY, MAKE_ACTIVE_COLOR, RESET_ACTIVE_COLOR, FILTER_BY_SECTION, REMOVE_COLOR_FILTERS, MAKE_ACTIVE_COLOR_BY_ID, LOAD_ERROR } from '../../actions/loadColors'
import { REQUEST_SEARCH_RESULTS, RECEIVE_SEARCH_RESULTS, CLEAR_SEARCH } from '../../actions/loadSearchResults'

import { type ReduxAction, type ColorsState } from '../../../shared/types/Actions'
import { initialState, doReceiveColors, doFilterByFamily, doFilterBySection, doMakeActiveColor, doMakeActiveColorById, getErrorState } from './colorReducerMethods'

export const colors = (state: ColorsState = initialState, action: ReduxAction) => {
  switch (action.type) {
    case LOAD_ERROR: {
      return getErrorState(state)
    }

    case RESET_ACTIVE_COLOR: {
      return {
        ...state,
        initializeWith: {
          ...state.initializeWith,
          colorWallActive: initialState.initializeWith.colorWallActive
        },
        colorWallActive: initialState.colorWallActive
      }
    }

    case MAKE_ACTIVE_COLOR: {
      const newState = doMakeActiveColor(state, action)

      if (newState) {
        return newState
      }
    }

    case MAKE_ACTIVE_COLOR_BY_ID: {
      const newState = doMakeActiveColorById(state, action)

      if (newState) {
        return newState
      }
    }

    case REQUEST_COLORS: {
      return {
        ...state,
        status: action.payload
      }
    }

    case RECEIVE_COLORS: {
      const newState = doReceiveColors(state, action)

      if (newState) {
        return newState
      }
    }

    case REMOVE_COLOR_FILTERS: {
      return {
        ...state,
        family: initialState.family,
        families: initialState.families,
        section: initialState.section,
        colorWallActive: initialState.colorWallActive
      }
    }

    case FILTER_BY_FAMILY: {
      const newState = doFilterByFamily(state, action)

      if (newState) {
        return newState
      }
    }

    case FILTER_BY_SECTION: {
      const newState = doFilterBySection(state, action)

      if (newState) {
        return newState
      }
    }

    case CLEAR_SEARCH: {
      return {
        ...state,
        search: {
          ...initialState.search
        }
      }
    }

    case REQUEST_SEARCH_RESULTS: {
      return {
        ...state,
        search: {
          ...state.search,
          loading: true
        }
      }
    }

    case RECEIVE_SEARCH_RESULTS: {
      return ({
        ...state,
        search: {
          ...state.search,
          loading: false,
          results: action.payload.results
        }
      })
    }
  }

  return state
}
