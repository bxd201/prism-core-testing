/* eslint-env jest */
import React from 'react'
import { shallow, mount } from 'enzyme'
import { CollectionDetail, collectionCover, collectionDescription, triggerPrevious, triggerNext } from 'src/components/ColorCollections/CollectionDetail'
import { getColorCollectionsData, allCollectionsData } from 'src/components/Carousel/data'
import * as Colors from '__mocks__/data/color/Colors'
import { AutoSizer } from 'react-virtualized'
import ColorWallSwatch from '../../../src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatch';

const colors = Colors.getAllColors()
const tabIdShow = 'tab1'

let defaultProps = {
  collectionDetailData: getColorCollectionsData(colors, allCollectionsData, tabIdShow)[0],
  addToLivePalette: jest.fn()
}

const getCollectionDetail = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<CollectionDetail {...newProps} />)
}

describe('CollectionDetail', () => {
  let collectionDetail
  beforeAll(() => {
    if (!collectionDetail) {
      collectionDetail = getCollectionDetail()
    }
  })

  it('should match snapshot', () => {
    expect(collectionDetail).toMatchSnapshot()
  })

  it('should render img with the src as in collectionDetailData', () => {
    expect(collectionDetail.find(`img.${collectionCover}`).exists()).toBe(true)
    expect(collectionDetail.find(`img.${collectionCover}`).prop('src')).toEqual(defaultProps.collectionDetailData.img)
  })

  it('should render collection description as in collectionDetailData', () => {
    expect(collectionDetail.find(`div.${collectionDescription}`).contains(defaultProps.collectionDetailData.name)).toBe(true)
  })

  it('should render previous trigger div', () => {
    expect(collectionDetail.find(`div.${triggerPrevious}`).exists()).toBe(true)
  })

  it('should render next trigger div', () => {
    expect(collectionDetail.find(`div.${triggerNext}`).exists()).toBe(true)
  })
})

describe('CollectionDetail with Autosizer mounted', () => {
  let collectionDetail
  let autoSizerMount
  beforeAll(() => {
    if (!collectionDetail) {
      collectionDetail = getCollectionDetail()
    }
    autoSizerMount = mount(collectionDetail.find(AutoSizer).prop('children')({ height: 200, width: 200 }))
  })

  it('should render Autosizer with ColorWallSwatch', () => {
    expect(autoSizerMount.find(ColorWallSwatch)).toHaveLength(defaultProps.collectionDetailData.collections.length)
  })

  it('should call addToLivePalette function for each ColorWallSwatch component', () => {
    autoSizerMount.find(ColorWallSwatch).map((colorWallSwatch, index) => {
      colorWallSwatch.prop('onAdd')()
      expect(defaultProps.addToLivePalette).toHaveBeenCalled()
    })
  })
})
