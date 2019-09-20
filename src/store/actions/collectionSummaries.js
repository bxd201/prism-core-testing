// @flow

import api from './api/collectionSummaries'

export const REQUEST_CS: string = 'REQUEST_COLLECTION_SUMMARIES'
export const RECEIVED_CS: string = 'RECEIVE_COLLECTION_SUMMARIES'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export const requestCollectionSummaries = () => {
  return {
    type: REQUEST_CS,
    payload: {
      loading: true
    }
  }
}

export const receivedCollectionSummaries = (collectionSummaries: any) => {
  return {
    type: RECEIVED_CS,
    payload: {
      loading: false,
      ...collectionSummaries
    }
  }
}

export const loadError = () => {
  return {
    type: LOAD_ERROR
  }
}

export function handleGetCollectionSummaries (collectionSummaries: any) {
  const categories: {
    idToIndexHash: Object,
    data?: any[]
  } = { idToIndexHash: {} }

  categories.data = collectionSummaries.categories.map(({
    id,
    label: tabName,
    summaryIds
    // ...rest, has bunches of stuff
  }, i) => {
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

export const loadCollectionSummaries = () => {
  return (dispatch: Function) => {
    dispatch(requestCollectionSummaries())

    return api.getCollectionSummaries()
      .then(response => {
        // TODO:noah.hall
        // confirm error handling
        // are we informing the user? logging? etc
        if (response.status === 200) {
          dispatch(receivedCollectionSummaries(handleGetCollectionSummaries(response.data)))
        } else dispatch(loadError())
      })
  }
}
