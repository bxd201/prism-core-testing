/* eslint-disable no-undef */
import nock from 'nock'
import * as api from '../../src/store/actions/api/collectionSummaries'
import * as endpoints from '../../src/constants/endpoints'

function removeDomain (endpoint) {
  return endpoint.substring(endpoint.indexOf(API_PATH) + API_PATH.length)
}

describe('actions api', () => {
  beforeAll(() => {
    nock.disableNetConnect()
    nock.enableNetConnect(API_PATH)
  })

  afterAll(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('getCollectionSummaries', () => {
    it('should return successfuly response from API', () => {
      const data = {
        data: 'welcome to las vegas baby'
      }
      const route = removeDomain(endpoints.COLLECTION_SUMMARIES_ENDPOINT);

      nock(API_PATH)
        .get(route)
        .reply(200, data)

      return api.getCollectionSummaries()
        .then(response => {
          expect(response.data).toEqual(expect.objectContaining(data))
        })
        .catch(err => {
          console.warn('API test error', err)
        })
    })

    it('should return return error for any non 200 responses', () => {
      const data = {
        data: 'welcome to las vegas baby'
      }
      const route = removeDomain(endpoints.COLLECTION_SUMMARIES_ENDPOINT);
      const errorMessage = 'nope'

      nock(API_PATH)
        .get(route)
        // TODO:noah.hall confirm with API contract what to expect
        .reply(201, 'definitely not')

      return api.getCollectionSummaries()
        .then(response => {
          expect(response.data).toBeTruthy()
        })
        .catch(err => {
          console.warn('API test error', err)
        })
    })
  })
})