// @flow
import { type ColorsState,type ReduxAction } from '../../../shared/types/Actions.js.flow'
import { EMIT_COLOR, FILTER_BY_FAMILY, FILTER_BY_SECTION, HIDE_COLOR_DETAILS_MODAL, LOAD_ERROR, RECEIVE_COLORS, REMOVE_COLOR_FILTERS, REQUEST_COLORS, SET_CWV3,SHOW_COLOR_DETAILS_MODAL, UPDATE_COLOR_STATUSES } from '../../actions/loadColors'
import { CLEAR_SEARCH, RECEIVE_SEARCH_RESULTS, SEARCH_RESULTS_ERROR, TOGGLE_SEARCH_MODE, UPDATE_SEARCH_QUERY } from '../../actions/loadSearchResults'
import { doFilterByFamily, doFilterBySection, doReceiveColors, getErrorState,initialState } from './colorReducerMethods'

export const colors = (state: ColorsState = initialState, action: ReduxAction) => {
  switch (action.type) {
    case LOAD_ERROR: {
      return getErrorState(state, action.payload)
    }

    case SET_CWV3: {
      return {
        ...state,
        cwv3: action.payload
      }
    }

    // @todo we should refactor to flatten, we also need a way to describe that all things have loaded since we have added additional data calls -RS
    case REQUEST_COLORS: {
      return {
        ...state,
        status: {
          ...state.status,
          activeRequest: true,
          error: false,
          loading: true,
          requestComplete: false
        }
      }
    }

    case RECEIVE_COLORS: {
      const newState = doReceiveColors(state, action)

      if (newState) {
        return newState
      }

      return state
    }

    case REMOVE_COLOR_FILTERS: {
      return {
        ...state,
        family: initialState.family,
        families: initialState.families,
        section: initialState.section
      }
    }

    case FILTER_BY_FAMILY: {
      const newState = doFilterByFamily(state, action)

      if (newState) {
        return newState
      }

      return state
    }

    case FILTER_BY_SECTION: {
      const newState = doFilterBySection(state, action)

      if (newState) {
        return newState
      }

      return state
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

    case SHOW_COLOR_DETAILS_MODAL: {
      return ({ ...state, colorDetailsModal: { showing: true, color: action.payload } })
    }

    case HIDE_COLOR_DETAILS_MODAL: {
      return ({ ...state, colorDetailsModal: { showing: false } })
    }
    case UPDATE_COLOR_STATUSES: {
      return ({
        ...state,
        items: {
          ...state.items,
          colorStatuses: action.payload
        }
      })
    }
  }

  return state
}
