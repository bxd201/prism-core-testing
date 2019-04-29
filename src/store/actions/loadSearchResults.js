// @flow
import axios from 'axios'

import { COLORS_SEARCH_ENDPOINT } from '../../constants/endpoints'

import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'

import type { ColorList } from '../../shared/types/Colors'

export const REQUEST_SEARCH_RESULTS: string = 'REQUEST_SEARCH_RESULTS'
const requestSearchResults = () => {
  return {
    type: REQUEST_SEARCH_RESULTS,
    payload: { loading: true }
  }
}

export const RECEIVE_SEARCH_RESULTS: string = 'RECEIVE_SEARCH_RESULTS'
const receiveSearchResults = (results: ColorList) => {
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

    // const { brandId } = getState().configurations
    const SEARCH_URL = generateBrandedEndpoint(COLORS_SEARCH_ENDPOINT, 'sherwin')

    return axios.get(SEARCH_URL, {
      params: {
        query: term
      }
    }).then(({ data }) => {
      dispatch(receiveSearchResults(data))
    })
  }
}
