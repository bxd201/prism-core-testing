// @flow
import axios from 'axios'

import { COLORS_SEARCH_ENDPOINT } from '../../constants/endpoints'

import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'

import type { ColorList } from '../../shared/types/Colors'

export const CLEAR_SEARCH: string = 'CLEAR_SEARCH'
export const clearSearch = () => {
  return {
    type: CLEAR_SEARCH
  }
}

export const REQUEST_SEARCH_RESULTS: string = 'REQUEST_SEARCH_RESULTS'
const requestSearchResults = () => {
  return {
    type: REQUEST_SEARCH_RESULTS
  }
}

type SearchResults = {
  count: Number,
  suggestions: String[],
  results: ColorList
}

export const RECEIVE_SEARCH_RESULTS: string = 'RECEIVE_SEARCH_RESULTS'
const receiveSearchResults = ({ count, suggestions, results }: SearchResults) => {
  return {
    type: RECEIVE_SEARCH_RESULTS,
    payload: {
      results,
      count,
      suggestions
    }
  }
}

export const UPDATE_SEARCH_QUERY: string = 'UPDATE_SEARCH_QUERY'
export const updateSearchQuery = (query: string) => {
  return (dispatch: Function) => {
    dispatch({
      type: UPDATE_SEARCH_QUERY,
      payload: query
    })

    // if query isn't empty...
    if (query) {
      // ... turn search mode on
      dispatch(toggleSearchMode(true))
    }
  }
}

export const TOGGLE_SEARCH_MODE: string = 'TOGGLE_SEARCH_MODE'
export const toggleSearchMode = (on: boolean) => {
  return (dispatch: Function) => {
    if (!on) {
      dispatch(clearSearch())
    }

    dispatch({
      type: TOGGLE_SEARCH_MODE,
      payload: !!on
    })
  }
}

export const SEARCH_RESULTS_ERROR: string = 'SEARCH_RESULTS_ERROR'
const searchResultsError = () => {
  return {
    type: SEARCH_RESULTS_ERROR
  }
}

export const MIN_SEARCH_LENGTH = 3
export const loadSearchResults = (term: string, family?: string) => {
  return (dispatch: Function) => {
    if (!term || term.length < MIN_SEARCH_LENGTH) {
      return
    }

    dispatch(updateSearchQuery(term))
    dispatch(requestSearchResults())
    dispatch(toggleSearchMode(true))

    // const { brandId } = getState().configurations
    const SEARCH_URL = generateBrandedEndpoint(COLORS_SEARCH_ENDPOINT, 'sherwin')

    return axios.get(SEARCH_URL, {
      params: {
        query: term,
        family
      }
    }).then(({ data }) => {
      dispatch(receiveSearchResults(data))
    }).catch(data => {
      dispatch(searchResultsError())
    })
  }
}
