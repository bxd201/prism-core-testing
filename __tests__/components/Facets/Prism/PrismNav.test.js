/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import PrismNav from 'src/components/Facets/Prism/PrismNav'

describe('PrismNav component with props', () => {
  let prismNav
  beforeAll(() => {
    prismNav = mocked(<PrismNav />)
  })

  test('should have buttons', () => {
    expect(prismNav.find('a.prism-nav-btn').exists()).toBe(true)
  })

  const firstButtonText = 'Scenes'
  test(`should have first button with text defined as ${firstButtonText} constant`, () => {
    expect(prismNav.find('a.prism-nav-btn').at(0).text()).toEqual(firstButtonText)
  })

  test(`should have second button with text defined as "Color Wall" constant`, () => {
    expect(prismNav.find('a.prism-nav-btn').at(1).text()).toEqual('Color Wall')
  })

  test('first link is to "/active"', () => {
    expect(prismNav.find('a.prism-nav-btn').at(0).props().href).toBe('/active')
  })

  test('second link is to "/active/color-wall/section/sherwin-williams-colors"', () => {
    expect(prismNav.find('a.prism-nav-btn').at(1).props().href).toBe('/active/color-wall/section/sherwin-williams-colors')
  })
})

test('links are active when url matches their destination', () => {
  mocked(<PrismNav />).find('a.prism-nav-btn').forEach((link, index) => {
    const href = link.props().href
    expect(mocked(<PrismNav />, { url: href }).find('a.prism-nav-btn').at(index).hasClass('prism-nav-btn--active')).toBe(true)
  })
})
