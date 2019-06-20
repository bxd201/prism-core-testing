/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ColorCollections, collectionsList } from 'src/components/ColorCollections/ColorCollections'
import ColorCollectionsTab from 'src/components/ColorCollections/ColorCollectionsTab'
import CollectionDetail from 'src/components/ColorCollections/CollectionDetail'

let defaultProps = {
  isShowBack: false
}

const tabIdShow = 'tab2'

const getColorCollections = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorCollections {...newProps} />)
}

describe('ColorCollections with prop isExpertColor as false', () => {
  let colorCollections
  beforeAll(() => {
    if (!colorCollections) {
      colorCollections = getColorCollections()
    }
  })

  it('should match snapshot', () => {
    expect(colorCollections).toMatchSnapshot()
  })

  it('should render ColorCollectionsTab if isExpertColor is not defined or false', () => {
    if (!defaultProps.isExpertColor) {
      expect(colorCollections.find(ColorCollectionsTab).exists()).toBe(true)
    }
  })

  it('should update ColorCollectionsTab prop tabIdShow to tabIdShow value when showTab is called', () => {
    colorCollections.find(ColorCollectionsTab).prop('showTab')(tabIdShow)
    expect(colorCollections.find(ColorCollectionsTab).prop('tabIdShow')).toEqual(tabIdShow)
  })

  it('should render collectionsList div', () => {
    expect(colorCollections.find(`div.${collectionsList}`).exists()).toBe(true)
  })
})

describe('ColorCollections with prop isExpertColor as true', () => {
  let colorCollections
  let newProps = { isExpertColor: true }
  beforeAll(() => {
    if (!colorCollections) {
      colorCollections = getColorCollections(newProps)
    }
  })

  it('should match snapshot', () => {
    expect(colorCollections).toMatchSnapshot()
  })

  it('should render collectionsList div', () => {
    expect(colorCollections.find(`div.${collectionsList}`).exists()).toBe(true)
  })
})

describe('ColorCollections with prop isShowBack as true', () => {
  let colorCollections
  let newProps = { isShowBack: true }
  beforeAll(() => {
    if (!colorCollections) {
      colorCollections = getColorCollections(newProps)
    }
  })

  it('should match snapshot', () => {
    expect(colorCollections).toMatchSnapshot()
  })

  it('should render CollectionDetail if isShowBack is true', () => {
    if (newProps.isShowBack) {
      expect(colorCollections.find(CollectionDetail).exists()).toBe(true)
    }
  })
})
