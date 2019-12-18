/* eslint-disable no-undef */
import * as api from '../../src/store/actions/api/collectionSummaries'
import * as endpoints from '../../src/constants/endpoints'
import mockAxios from 'axios'

describe('actions api', () => {
  describe('getCollectionSummaries', () => {
    it('should return successfuly response from API', () => {
      mockAxios.get.mockResolvedValue({ data: 'welcome to las vegas baby' })
      return api.getCollectionSummaries().then(res => expect(res.data).toEqual('welcome to las vegas baby'))
    })
  })
})
