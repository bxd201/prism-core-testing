/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import CollectionsHeaderWrapper, { buttonLeft, heading, buttonRight } from 'src/components/CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import { ColorCollections } from 'src/components/ColorCollections/ColorCollections'
import { Link } from 'react-router-dom'

const getCollectionsHeaderWrapper = (props) => {
  const ColorCollectionsWrapped = CollectionsHeaderWrapper(ColorCollections)
  return shallow(<ColorCollectionsWrapped {...props} />)
}

describe('CollectionsHeaderWrapper', () => {
  let collectionsHeaderWrapper

  beforeAll(() => (collectionsHeaderWrapper = getCollectionsHeaderWrapper()))

  it('should render Link and with to prop as /active', () => {
    expect(collectionsHeaderWrapper.find(Link).exists()).toBe(true)
    expect(collectionsHeaderWrapper.find(Link).prop('to')).toEqual('/active')
  })

  it('should render CLOSE button', () => expect(collectionsHeaderWrapper.find(`button.${buttonRight}`).exists()).toBe(true))

  it('should not render BACK button', () => expect(collectionsHeaderWrapper.find(`button.${buttonLeft}`).exists()).toBe(false))

  it('should render wrapped component', () => expect(collectionsHeaderWrapper.find(ColorCollections).exists()).toBe(true))
})

describe('CollectionsHeaderWrapper states & events', () => {
  let collectionsHeaderWrapper

  beforeAll(() => (collectionsHeaderWrapper = getCollectionsHeaderWrapper()))

  it('should update heading when setHeader is called on wrapped component', () => {
    const headerContent = 'Color Collections'
    collectionsHeaderWrapper.find(ColorCollections).props().setHeader(headerContent)
    expect(collectionsHeaderWrapper.find(`div.${heading}`).contains(headerContent)).toBe(true)
  })

  it('should render BACK button when showBack is called by wrapped component', () => {
    collectionsHeaderWrapper.find(ColorCollections).props().showBack()
    expect(collectionsHeaderWrapper.find(`button.${buttonLeft}`).exists()).toBe(true)
  })

  it('should remove BACK button when it is clicked', () => {
    collectionsHeaderWrapper.find(`button.${buttonLeft}`).simulate('click')
    expect(collectionsHeaderWrapper.find(`button.${buttonLeft}`).exists()).toBe(false)
  })
})
