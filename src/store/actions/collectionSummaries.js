// @flow
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'
import { generateBrandedEndpoint } from 'src/shared/helpers/DataUtils'
import {
  // COLLECTION_SUMMARIES_ENDPOINT,
  DETAILED_COLLECTIONS_ENDPOINT
} from 'constants/endpoints'

export const REQUEST_CS: string = 'REQUEST_COLLECTION_SUMMARIES'
export const RECEIVED_CS: string = 'RECEIVE_COLLECTION_SUMMARIES'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export function handleGetCollectionSummaries (collectionSummaries: any) {
  if (isEmpty(collectionSummaries)) { return {} }
  const categories: { idToIndexHash: Object, data?: any[] } = { idToIndexHash: {} }
  categories.data = collectionSummaries.categories.map(({ id, label: tabName, summaryIds }, i) => {
    categories.idToIndexHash[id] = i
    return { id, tabName, summaryIds }
  })

  const summaries = {
    data: collectionSummaries.summaries,
    idToIndexHash: collectionSummaries.summaries.reduce(
      (indexes, curSummary, i) => {
        indexes[curSummary.id] = i
        return indexes
      },
      {}
    )
  }
  return { categories, summaries }
}

export const requestCollectionSummaries = () => ({ type: REQUEST_CS, payload: { loadingCS: true } })

export const receivedCollectionSummaries = (res: { data: any }) => ({ type: RECEIVED_CS, payload: { loadingCS: false, ...handleGetCollectionSummaries(res.data) } })

export const loadCollectionSummaries = (brandId: string, options?: {}) => {
  return (dispatch: Function) => {
    dispatch(requestCollectionSummaries)
    // axios.get(generateBrandedEndpoint(COLLECTION_SUMMARIES_ENDPOINT, brandId, options)).then(res => dispatch(receivedCollectionSummaries(res)))
    axios.get(generateBrandedEndpoint(DETAILED_COLLECTIONS_ENDPOINT, brandId, options)).then(res => dispatch(receivedCollectionSummaries(res)))
  }
}
