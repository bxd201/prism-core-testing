/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
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
  return shallow(<CircleLoader {...newProps} />)
}

describe('CircleLoader with empty props', () => {
  let circleLoader
  beforeEach(() => {
    if (!circleLoader) {
      circleLoader = getCircleLoader({ color: '', className: '' })
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

  it('should render animateTransform tag', () => {
    expect(circleLoader.find('animateTransform').exists()).toBe(true)
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

  it('should render circle tag with prop stroke defined as color constant', () => {
    expect(circleLoader.find('circle').prop('stroke')).toEqual(color)
  })
})
