/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Tinter } from 'src/components/Facets/Tinter/Tinter'

const sceneSet = 'rooms'
const getTinter = (props) => {
  let defaultProps = {
    sceneSet: sceneSet
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<Tinter {...newProps} />)
}

describe('Tinter without props', () => {
  let tinter
  beforeAll(() => {
    if (!tinter) {
      tinter = getTinter({ sceneSet: '' })
    }
  })

  it('should match snapshot', () => {
    expect(tinter).toMatchSnapshot()
  })

  it('should render', () => {
    expect(tinter.exists()).toBe(true)
  })

  it('should render SceneManager with Connect', () => {
    expect(tinter.find('Connect(SceneManager)').exists()).toBe(true)
  })

  it('should render LivePalette with Connect', () => {
    expect(tinter.find('Connect(LivePalette)').exists()).toBe(true)
  })
})

describe('Tinter with props', () => {
  let tinter
  beforeAll(() => {
    if (!tinter) {
      tinter = getTinter()
    }
  })

  it('should match snapshot', () => {
    expect(tinter).toMatchSnapshot()
  })

  it('should render', () => {
    expect(tinter.exists()).toBe(true)
  })

  it('should render SceneManager with Connect', () => {
    expect(tinter.find('Connect(SceneManager)').exists()).toBe(true)
  })

  it('should render LivePalette with Connect', () => {
    expect(tinter.find('Connect(LivePalette)').exists()).toBe(true)
  })

  it('should render SceneManager with Connect & prop type defined as sceneSet constant', () => {
    expect(tinter.find('Connect(SceneManager)').prop('type')).toEqual(sceneSet)
  })
})
