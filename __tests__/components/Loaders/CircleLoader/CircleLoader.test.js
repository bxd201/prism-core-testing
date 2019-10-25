/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'

const loaderClass = 'color-wall-wall__loader'
// const loaderClass = 'prism-scene-manager__loader'
const color = 'red'

const getCircleLoader = (props) => {
  let defaultProps = {
    color: color,
    className: loaderClass
  }

  let newProps = Object.assign({}, defaultProps, props)
  return mount(<CircleLoader {...newProps} />)
}

describe('CircleLoader with empty props', () => {
  let circleLoader
  beforeEach(() => {
    if (!circleLoader) {
      circleLoader = getCircleLoader()
    }
  })

  it('should match snapshot', () => {
    expect(circleLoader).toMatchSnapshot()
  })

  it('should render svg tag', () => {
    expect(circleLoader.find('svg').exists()).toBe(true)
  })

  it('should render circle tag', () => {
    expect(circleLoader.find('circle').exists()).toBe(true)
  })
})

describe('CircleLoader with props', () => {
  let circleLoader
  beforeEach(() => {
    if (!circleLoader) {
      circleLoader = getCircleLoader()
    }
  })

  it('should match snapshot', () => {
    expect(circleLoader).toMatchSnapshot()
  })

  it('should render svg tag with class name defined as loaderClass constant', () => {
    expect(circleLoader.find('svg').hasClass(loaderClass)).toBe(true)
  })
})
