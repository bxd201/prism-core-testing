/* eslint-env jest */
import React from 'react'
import Search from 'src/components/Search/Search'
import GenericOverlay from 'src/components/Overlays/GenericOverlay/GenericOverlay'

test('displays heroLoader while loading', () => {
  const MockedSearch = mocked(<Search />, {
    mockedStoreValues: {
      colors: {
        items: { colorStatuses: [] },
        search: { loading: true }
      }
    }
  })
  expect(MockedSearch.find(GenericOverlay).exists()).toBe(true)
})

test('displays error message when there is no search results', () => {
  const MockedSearch = mocked(<Search />, {
    mockedStoreValues: {
      colors: {
        items: { colorStatuses: [] },
        search: { loading: false, error: true, count: 0, results: [{}] }
      }
    }
  })
  expect(MockedSearch.text()).toBe('Sorry, no color matches found.')
})

test('displays list of color swatches when there are search results and no errors', () => {
  const MockedSearch = mocked(<Search />, {
    mockedStoreValues: {
      colors: {
        items: { colorStatuses: [] },
        search: { loading: false, error: false, count: 1, results: [{}] }
      }
    }
  })
  expect(MockedSearch.find('.color-wall-swatch-list').exists()).toBe(true)
})
