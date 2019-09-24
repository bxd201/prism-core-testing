/* eslint-env jest */
import React from 'react'
import { shallow, mount } from 'enzyme'
import { ColorCollections } from 'src/components/ColorCollections/ColorCollections'
import mocks from '../../../__mocks__/helpers/MockUtility'

// create reusable mocks
// available as mocks.fn.MOCK_NAME
mocks.create([
  'getSummary',
  'loadColors',
  'loadCS'
])

const defaultProps = {
  categories: { idToIndexHash: {}, data: [] },
  colorMap: {},
  colorNumberToIdHash: {},
  config: {},
  intl: {},
  isShowBack: false,
  setHeader: () => null,
  showBack: () => null,
  summaries: { idToIndexHash: {}, data: [] },
  loadColors: mocks.fn.loadColors,
  loadCS: mocks.fn.loadCS
}

function getStubs () {
  const config = {
    brandId: 'mike'
  }
  const intl = {
    locale: 'tyson'
  }

  const vals = {
    colorIds: [4, 5, 6, 7],
    description: 'undescribable',
    summaryId: 'birthdaycake',
    summaryName: 'jack casino',
    tabId: 'michaeljackson',
    thumbUrl: 'sher-in-your-williams.com'
  }

  const colorMap = {
    4: 'color 4 config',
    5: 'color 5 config',
    6: 'color 6 config',
    7: undefined
  }

  const colorNumberToIdHash = {
    4: 'color4',
    5: 'color5',
    6: 'color6'
  }

  const summaries = {
    data: {
      [vals.summaryId]: {
        name: vals.summaryName,
        thumbUrl: vals.thumbUrl,
        description: vals.description,
        colorIds: vals.colorIds
      }
    },
    idToIndexHash: {
      [vals.tabId]: vals.summaryId
    }
  }

  const props = {
    summaries,
    colorMap,
    colorNumberToIdHash,
    colorIds: vals.colorIds,
    categories: {
      data: [
        null,
        {
          summaryIds: [1, 2, 3]
        },
        undefined
      ],
      idToIndexHash: {
        [vals.tabId]: 1
      }
    }
  }

  return {
    ...vals,
    props,
    config,
    intl
  }
}

const getColorCollections = (overrides = {}, mountIt = false) => {
  return (mountIt ? mount : shallow)(
    <ColorCollections {...defaultProps} {...overrides} />
  )
}

describe('Color Collections component', () => {
  describe('instantiation', () => {
    let stub, cc // eslint-disable-line
    beforeEach(() => {
      mocks.clearAll()
      stub = getStubs()
      getColorCollections(stub, true /* mount it */); // eslint-disable-line
    })

    // requires mount
    // @see https://itnext.io/testing-components-built-using-react-hooks-with-jest-enzyme-edb87d703756
    it('should load collection summaries', () => {
      expect(mocks.fn.loadCS.mock.calls).toHaveLength(1)
    })

    it('should load colors', () => {
      getColorCollections(stub, true)
      expect(mocks.fn.loadColors.mock.calls).toHaveLength(2)
      expect(mocks.fn.loadColors.mock.calls[0]).toEqual(expect.arrayContaining(['mike', {language: 'tyson'}]))
    })

    it('should NOT load colors if NOT required', () => {
      expect(mocks.fn.loadColors.mock.calls).toHaveLength(1)
      expect(JSON.stringify(defaultProps.loadColors.mock.calls[0])).toBe(JSON.stringify(['mike', {language: 'tyson'}]))
    })
  })

  describe('instance methods', () => {
    describe('getSummary', () => {
      let stub
      beforeEach(() => {
        mocks.clearAll()
        stub = getStubs()
      })

      it('should return appropriate values for this summary', () => {
        expect(ColorCollections.getSummary(stub.tabId, stub.props))
          .toEqual(expect.objectContaining({
            collections: Object.values(stub.props.colorMap).filter(x => x),
            description: stub.description,
            img: stub.thumbUrl,
            name: stub.summaryName
          }))
      })

      it('should remove all falsy values from collections', () => {
        expect(ColorCollections.getSummary(stub.tabId, stub.props).collections)
          .toHaveLength(stub.colorIds.length - 1)
      })
    })

    describe('getSummariesForTab', () => {
      let stub
      beforeEach(() => {
        mocks.clearAll()
        stub = getStubs()
      })

      it('should return empty array if category is falsy', () => {
        mocks.set(ColorCollections, 'getSummary')
        expect(ColorCollections.getSummariesForTab('doesnt exist', stub.props)).toHaveLength(0)

        // should not call getSummary
        expect(ColorCollections.getSummary.mock.calls).toHaveLength(0)
      })

      it('should return the summaries for the current tab', () => {
        mocks.restore(ColorCollections, 'getSummariesForTab')

        mocks.set(ColorCollections, 'getSummary', () => 'munchies')
        const actual = ColorCollections.getSummariesForTab(stub.tabId, stub.props);

        // returns whatever getSummary returns
        expect(actual).toEqual(Array(stub.props.categories.data[1].summaryIds.length).fill('munchies'))

        // call getSummary correct number of times
        expect(ColorCollections.getSummary.mock.calls)
          .toHaveLength(stub.props.categories.data[1].summaryIds.length)
      })
    })

    describe('updateCollectionData', () => {
      let stub
      beforeEach(() => {
        mocks.clearAll()
        stub = getStubs()
      })

      it('should set collection data to the tab summaries if expert color is falsy', () => {
        mocks.set(ColorCollections, 'getSummariesForTab')
        ColorCollections.collectionData = 'this little piggy'
        ColorCollections.updateCollectionData({
          data: 'jam sessions with the band',
          props: stub.props,
          tabId: stub.tabId
        })

        expect(mocks.fn.getSummariesForTab).toHaveBeenCalledWith(stub.tabId, stub.props)

        expect(ColorCollections.collectionData).toEqual(expect.arrayContaining([
          stub.tabId,
          stub.props
        ]))

        expect(mocks.fn.getSummariesForTab.mock.calls).toHaveLength(1)
      })
    })
  })

  describe('ColorCollections with prop isShowBack as true', () => {
    let colorCollections
    let newProps = { isShowBack: true }
    beforeAll(() => {
      colorCollections = getColorCollections(newProps)
    })

    it('should render CollectionDetail if isShowBack is true', () => {
      if (newProps.isShowBack) {
        expect(colorCollections.type().displayName).toEqual('Connect(CollectionDetail)')
      }
    })
  })
})
