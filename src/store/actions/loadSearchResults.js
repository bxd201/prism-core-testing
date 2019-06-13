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

export const SEARCH_RESULTS_ERROR: string = 'SEARCH_RESULTS_ERROR'
const searchResultsError = () => {
  return {
    type: SEARCH_RESULTS_ERROR
  }
}

export const loadSearchResults = (term: string) => {
  return (dispatch: Function) => {
    dispatch(requestSearchResults())

    // const { brandId } = getState().configurations
    const SEARCH_URL = generateBrandedEndpoint(COLORS_SEARCH_ENDPOINT, 'sherwin')

    return axios.get(SEARCH_URL, {
      params: {
        query: term
      }
    }).then(({ data }) => {
      dispatch(receiveSearchResults(data))
    }).catch(data => {
      dispatch(searchResultsError())
    })
  }
}
