// @flow
import axios from 'axios'
import { COLORS_SEARCH_ENDPOINT } from '../../constants/endpoints'
import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'
import type { ColorList } from '../../shared/types/Colors.js.flow'

export const CLEAR_SEARCH: string = 'CLEAR_SEARCH'
export const clearSearch = () => ({ type: CLEAR_SEARCH })

type SearchResults = { count: Number, suggestions: String[], results: ColorList }
export const RECEIVE_SEARCH_RESULTS: string = 'RECEIVE_SEARCH_RESULTS'
const receiveSearchResults = ({ count, suggestions, results }: SearchResults) => (
  { type: RECEIVE_SEARCH_RESULTS, payload: { results, count, suggestions } }
)

export const UPDATE_SEARCH_QUERY: string = 'UPDATE_SEARCH_QUERY'
export const updateSearchQuery = (query: string) => {
  return (dispatch: Function) => {
    dispatch({ type: UPDATE_SEARCH_QUERY, payload: query })
    query && dispatch(toggleSearchMode(true))
  }
}

export const TOGGLE_SEARCH_MODE: string = 'TOGGLE_SEARCH_MODE'
export const toggleSearchMode = (on: boolean) => {
  return (dispatch: Function) => {
    on || dispatch(clearSearch())
    dispatch({ type: TOGGLE_SEARCH_MODE, payload: !!on })
  }
}

export const SEARCH_RESULTS_ERROR: string = 'SEARCH_RESULTS_ERROR'
const searchResultsError = () => ({ type: SEARCH_RESULTS_ERROR })

export const MIN_SEARCH_LENGTH = 3
export const loadSearchResults = (term: string, family?: string) => {
  return (dispatch: Function, getState: Function) => {
    if (!term || term.length < MIN_SEARCH_LENGTH) { return }

    const { current } = getState().language

    dispatch(updateSearchQuery(term))
    dispatch(toggleSearchMode(true))

    return axios
      .get(generateBrandedEndpoint(COLORS_SEARCH_ENDPOINT, 'sherwin', { language: current }), { params: { query: term, family } })
      .then(({ data }) => dispatch(receiveSearchResults(data)))
      .catch(data => dispatch(searchResultsError()))
  }
}
