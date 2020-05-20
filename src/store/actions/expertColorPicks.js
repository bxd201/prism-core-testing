// @flow
import axios from 'axios'
import { EXPERT_COLOR_PICKS_ENDPOINT as ECP } from 'constants/endpoints'

export const RECEIVED = 'RECEIVE_EXPERT_COLOR_PICKS'
export const REQUEST = 'REQUEST_EXPERT_COLOR_PICKS'

export const requestCollectionSummaries = () => {
  return {
    type: REQUEST,
    payload: { loadingECP: true }
  }
}

export const receivedCollectionSummaries = (res) => {
  return {
    type: RECEIVED,
    payload: { loadingECP: false, data: res.data }
  }
}

export const loadExpertColorPicks = (dispatch) => {
  dispatch(requestCollectionSummaries)
  axios.get(ECP).then(response => dispatch(receivedCollectionSummaries(response)))
}
