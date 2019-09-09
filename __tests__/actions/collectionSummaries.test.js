import * as colSummaryModule from '../../src/store/actions/collectionSummaries'
import api from '../../src/store/actions/api/collectionSummaries'
import configureMockStore from 'redux-mock-store'
import mocks from '../../__mocks__/helpers/MockUtility'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])
function getStubs () {
  const collectionSummaries = {
    categories: [
      {
        id: 'category id',
        label: 'category label',
        summaryIds: [0, 1, 2]
      }
    ],
    summaries: [
      {
        id: 0,
        summary: 'config object'
      }
    ]
  }

  const categories = {
    idToIndexHash: { [collectionSummaries.categories[0].id]: 0 },
    data: [{
      id: collectionSummaries.categories[0].id,
      tabName: collectionSummaries.categories[0].label,
      summaryIds: collectionSummaries.categories[0].summaryIds
    }]
  }
  const summaries = {
    idToIndexHash: { [collectionSummaries.summaries[0].id]: 0 },
    data: collectionSummaries.summaries
  }

  return {
    categories,
    summaries,
    collectionSummaries
  }
}

describe('collectionSummaries', () => {
  describe('handleGetCollectionSummaries', () => {
    it('should transform collection summaries into useable objects', () => {
      const { collectionSummaries, categories, summaries } = getStubs()
      expect(colSummaryModule.handleGetCollectionSummaries(collectionSummaries))
        .toEqual(expect.objectContaining({ summaries, categories }))
    })
  })

  describe('loadCollectionSummaries', () => {
    beforeEach(() => {
      mocks.clearAll()
    })
    it('should dispatch receivedCollectionSummary on success', () => {
      mocks.set(
        api,
        'getCollectionSummaries',
        () => Promise.resolve({ status: 200, data: getStubs().collectionSummaries })
      )

      const store = mockStore()

      return colSummaryModule.loadCollectionSummaries()(store.dispatch)
        .then(() => {
          const expectedSequence = [
            colSummaryModule.requestCollectionSummaries(),
            colSummaryModule.receivedCollectionSummaries(
              colSummaryModule.handleGetCollectionSummaries(
                getStubs().collectionSummaries
              )
            )
          ]
          expect(store.getActions()).toEqual(expect.objectContaining(expectedSequence))
        })
    })

    it('should dispatch loadError on failure', () => {
      mocks.set(
        api,
        'getCollectionSummaries',
        () => Promise.resolve({status: 201})
      )

      const store = mockStore()

      return colSummaryModule.loadCollectionSummaries()(store.dispatch)
        .then(() => {
          const expectedSequence = [
            colSummaryModule.requestCollectionSummaries(),
            colSummaryModule.loadError()
          ]
          expect(store.getActions()).toEqual(expect.objectContaining(expectedSequence))
        })
    })
  })
})
