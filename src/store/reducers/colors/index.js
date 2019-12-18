// @flow
import { RECEIVE_COLORS, FILTER_BY_FAMILY, MAKE_ACTIVE_COLOR, RESET_ACTIVE_COLOR, FILTER_BY_SECTION, REMOVE_COLOR_FILTERS, MAKE_ACTIVE_COLOR_BY_ID, LOAD_ERROR, EMIT_COLOR } from '../../actions/loadColors'
import { RECEIVE_SEARCH_RESULTS, CLEAR_SEARCH, SEARCH_RESULTS_ERROR, UPDATE_SEARCH_QUERY, TOGGLE_SEARCH_MODE } from '../../actions/loadSearchResults'

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
          ...initialState.search,
          active: state.search.active
        }
      }
    }

    case UPDATE_SEARCH_QUERY: {
      return {
        ...state,
        search: {
          ...state.search,
          error: false,
          loading: true,
          query: action.payload || ''
        }
      }
    }

    case RECEIVE_SEARCH_RESULTS: {
      return ({
        ...state,
        search: {
          ...state.search,
          loading: false,
          error: false,
          results: action.payload.results,
          suggestions: action.payload.suggestions,
          count: action.payload.count
        }
      })
    }

    case SEARCH_RESULTS_ERROR: {
      return ({
        ...state,
        search: {
          ...initialState.search,
          loading: false,
          error: true
        }
      })
    }

    case TOGGLE_SEARCH_MODE: {
      return ({
        ...state,
        search: {
          ...state.search,
          active: action.payload
        }
      })
    }

    case EMIT_COLOR: {
      return ({
        ...state,
        emitColor: {
          color: action.payload,
          timestamp: Date.now()
        }
      })
    }
  }

  return state
}
