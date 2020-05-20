import {
  RECEIVED_CS,
  REQUEST_CS
} from '../actions/collectionSummaries'

export const defaultCollectionSummaries = {
  categories: { idToIndexHash: {}, data: [] },
  summaries: { idToIndexHash: {}, data: [] },
  loadingCS: true
}

export default function collectionSummaries (
  state = defaultCollectionSummaries,
  action = {}
) {
  switch (action.type) {
    case RECEIVED_CS: return {
      ...state,
      ...action.payload
    }
    case REQUEST_CS: return {
      ...state,
      ...action.payload
    }
    default: return state
  }
}
