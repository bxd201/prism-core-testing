/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import SearchBar from 'src/components/Search/SearchBar'

const mockFnOnSearchInput = jest.fn()
const mockFnOnClearSearch = jest.fn()
const mockHandleSearchInput = jest.fn()
const mockPersist = jest.fn()

const getSearch = (props) => {
  const defaultProps = {
    onSearchInput: mockFnOnSearchInput,
    onClearSearch: mockFnOnClearSearch
  }
  const newProps = Object.assign({}, defaultProps, props)
  return shallow(<SearchBar {...newProps} />)
}

describe('SearchBar', () => {
  let search
  beforeEach(() => {
    if (!search) {
      search = getSearch()
    }
  })

  it('should match snapshot', () => {
    expect(search).toMatchSnapshot()
  })

  it('should render input', () => {
    expect(search.find('input').exists()).toBe(true)
  })
})

describe('SearchBar with events', () => {
  let search
  beforeEach(() => {
    if (!search) {
      search = getSearch()
    }
  })

  xit('should call handleInput on input change', () => {
    search.instance().handleInput = mockHandleSearchInput
    search.instance().forceUpdate()
    search.find('input').simulate('input', { target: { value: 'xyz' }, persist: mockPersist })
    expect(mockHandleSearchInput).toHaveBeenCalledWith('xyz')
  })
})
