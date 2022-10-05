// @flow
import axios from 'axios'
import { EXPERT_COLOR_PICKS_ENDPOINT } from 'constants/endpoints'
import { generateBrandedEndpoint } from 'src/shared/helpers/DataUtils'

export const RECEIVED = 'RECEIVE_EXPERT_COLOR_PICKS'
export const REQUEST = 'REQUEST_EXPERT_COLOR_PICKS'

export const requestCollectionSummaries = () => ({ type: REQUEST, payload: { loadingECP: true } })

export const receivedCollectionSummaries = (res: { data: any }) => ({ type: RECEIVED, payload: { loadingECP: false, data: res.data } })

export const loadExpertColorPicks = (brandId: string, options?: {}): Function => {
  return (dispatch: Function) => {
    dispatch(requestCollectionSummaries)
    axios.get(generateBrandedEndpoint(EXPERT_COLOR_PICKS_ENDPOINT, brandId, options)).then(res => dispatch(receivedCollectionSummaries(res)))
  }
}
