// @flow
import axios from 'axios'

import { SW_COLORS_SEARCH_ENDPOINT } from '../../constants/endpoints'
import type { ColorListPayload } from '../../shared/types/Colors'

export const REQUEST_SEARCH_RESULTS: string = 'REQUEST_SEARCH_RESULTS'
const requestSearchResults = () => {
  return {
    type: REQUEST_SEARCH_RESULTS,
    payload: { loading: true }
  }
}

export const RECEIVE_SEARCH_RESULTS: string = 'RECEIVE_SEARCH_RESULTS'
const receiveSearchResults = (results: ColorListPayload) => {
  return {
    type: RECEIVE_SEARCH_RESULTS,
    payload: {
      loading: false,
      results: results
    }
  }
}

export const loadSearchResults = (term: string) => {
  return (dispatch: Function) => {
    dispatch(requestSearchResults())

    return axios.get(SW_COLORS_SEARCH_ENDPOINT, {
      params: {
        query: term
      }
    }).then(({ data }) => {
      dispatch(receiveSearchResults(data))
    })
  }
}
