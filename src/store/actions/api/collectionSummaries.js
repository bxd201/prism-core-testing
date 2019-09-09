import * as endpoints from 'constants/endpoints'
import axios from 'axios'

export function getCollectionSummaries () {
  return axios.get(endpoints.COLLECTION_SUMMARIES_ENDPOINT, {
    // TODO:noah.hall
    // confirm with api contract what to expect
    validateStatus (status) {
      return status === 200
    }
  })
    .then(data => data)
    .catch(err => err.response)
}

export default {
  getCollectionSummaries
}
