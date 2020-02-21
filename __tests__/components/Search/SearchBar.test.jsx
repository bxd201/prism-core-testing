import React from 'react'
import SearchBar from 'src/components/Search/SearchBar'
import ButtonBar from 'src/components/GeneralButtons/ButtonBar/ButtonBar'

describe('<SearchBar />', () => {
  test('renders a cancel button by default', () => {
    expect(mocked(<SearchBar />).contains(ButtonBar.Button)).toBe(true)
  })

  describe('initialized with search term', () => {
    let MockedSearchBar

    beforeEach(() => (
      MockedSearchBar = mocked(<SearchBar />, {
        url: '/search/blue',
        routeParams: { query: 'blue' }
      })
    ))

    test('"clear input" button is rendered', () => {
      expect(MockedSearchBar.find('.SearchBar__clean').exists()).toBe(true)
    })

    test('clears input when "clear input" button is clicked', () => {
      expect(MockedSearchBar.find('.SearchBar__input').instance().value).toBe('blue')
      expect(MockedSearchBar.history.location.pathname).toBe('/search/blue')
      MockedSearchBar.find('button.SearchBar__clean').simulate('click')
      expect(MockedSearchBar.find('.SearchBar__input').instance().value).toBe('')
      expect(MockedSearchBar.history.location.pathname).toBe('/search/')
    })
  })

  describe('initialized without search term', () => {
    let MockedSearchBar
    beforeEach(() => (MockedSearchBar = mocked(<SearchBar />, { url: '/search/' })))

    test('"clear input" button is not rendered', () => {
      expect(MockedSearchBar.find('.SearchBar__clean').exists()).toBe(false)
    })

    test('url changes after input is entered', () => {
      expect(MockedSearchBar.find('.SearchBar__input').instance().value).toBe('')
      MockedSearchBar.find('.SearchBar__input').simulate('change', { target: { value: 'blue' } })
      expect(MockedSearchBar.history.location.pathname).toBe('/search/blue')
      expect(MockedSearchBar.find('.SearchBar__input').instance().value).toBe('blue')
    })
  })
})

describe('<SearchBar showCancelButton=true />', () => {
  test('does not render the cancel button when showCancelButton = false', () => {
    expect(mocked(<SearchBar showCancelButton={false} />).contains(ButtonBar.Button)).toBe(false)
  })
})
