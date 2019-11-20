/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { PrismNav } from 'src/components/Facets/Prism/PrismNav'

const paramActive = '/active'
const paramActiveColorWall = '/active/color-wall'
const firstButtonText = 'Scenes'
const secondButtonText = 'Color Wall'
const prismNavBtnActiveClass = 'prism-nav-btn--active'

const pushMock = jest.fn()
const historyMock = { push: pushMock }
const locationMock = { pathname: paramActive }
const matchMock = { params: { router: jest.fn() } }

const getPrismNav = (props) => {
  let defaultProps = {
    history: historyMock,
    location: locationMock,
    match: matchMock,
    toggleCompareColor: () => null
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<PrismNav {...newProps} />)
}

describe('PrismNav component with props', () => {
  let prismNav
  beforeAll(() => {
    if (!prismNav) {
      prismNav = getPrismNav()
    }
  })

  it('should match snapshot', () => {
    expect(prismNav).toMatchSnapshot()
  })

  it('should have buttons', () => {
    expect(prismNav.find('button.prism-nav-btn').exists()).toBe(true)
  })

  it(`should have first button with text defined as ${firstButtonText} constant`, () => {
    expect(prismNav.find('button.prism-nav-btn').at(0).text()).toEqual(firstButtonText)
  })

  it(`should have second button with text defined as ${secondButtonText} constant`, () => {
    expect(prismNav.find('button.prism-nav-btn').at(1).text()).toEqual(secondButtonText)
  })

  it(`should have first button with class name defined as ${prismNavBtnActiveClass} constant when pathname is ${paramActive}`, () => {
    expect(prismNav.find('button.prism-nav-btn').at(0).hasClass(prismNavBtnActiveClass)).toBe(true)
  })

  it(`should have second button with class name defined as ${prismNavBtnActiveClass} constant when pathname is ${paramActiveColorWall}`, () => {
    prismNav.setProps({ location: { pathname: paramActiveColorWall } })
    expect(prismNav.find('button.prism-nav-btn').at(1).hasClass(prismNavBtnActiveClass)).toBe(true)
  })
})

describe('PrismNav component with events', () => {
  let prismNav
  beforeAll(() => {
    if (!prismNav) {
      prismNav = getPrismNav()
    }
  })

  it(`should call pushMock with param defined as ${paramActive} constant when first button is clicked`, () => {
    prismNav.find('button.prism-nav-btn:first-child').simulate('click')
    expect(pushMock).toHaveBeenCalledWith(paramActive)
    pushMock.mockClear()
  })

  it(`should call pushMock with param defined as ${paramActiveColorWall} constant when second button is clicked`, () => {
    prismNav.find('button.prism-nav-btn').at(1).simulate('click')
    expect(pushMock).toHaveBeenCalledWith('/active/color-wall/section/sherwin-williams-colors')
    pushMock.mockClear()
  })
})
