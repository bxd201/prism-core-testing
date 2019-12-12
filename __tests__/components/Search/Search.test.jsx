import React from 'react'
import Search from 'src/components/Search/Search'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import ColorWallSwatch from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'

test('matches snapshot', () => expect(mocked(<Search />)).toMatchSnapshot())

test('displays heroLoader while loading', () => {
  const MockedSearch = mocked(<Search />, {
    mockedStoreValues: { colors: { search: { loading: true } } }
  })
  expect(MockedSearch.find(HeroLoader).exists()).toBe(true)
})

test('displays error message when there is no search results', () => {
  const MockedSearch = mocked(<Search />, {
    mockedStoreValues: { colors: { search: { loading: false, error: true } } }
  })
  expect(MockedSearch.text()).toBe('Sorry, no color matches found.')
})

test('displays list of color swatches when there are search results and no errors', () => {
  const MockedSearch = mocked(<Search />, {
    mockedStoreValues: { colors: { search: { loading: false, error: false, count: 1, results: [{}] } } }
  })
  expect(MockedSearch.find('.color-wall-swatch-list').exists()).toBe(true)
})
