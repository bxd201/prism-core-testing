// @flow
import axios from 'axios'
import { COLLECTION_SUMMARIES_ENDPOINT } from 'constants/endpoints'

export const REQUEST_CS: string = 'REQUEST_COLLECTION_SUMMARIES'
export const RECEIVED_CS: string = 'RECEIVE_COLLECTION_SUMMARIES'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export function handleGetCollectionSummaries (collectionSummaries: any) {
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

export const loadCollectionSummaries = (dispatch: Function) => {
  axios
    .get(COLLECTION_SUMMARIES_ENDPOINT)
    .then(res => dispatch({ type: RECEIVED_CS, payload: { ...handleGetCollectionSummaries(res.data) } }))
}
