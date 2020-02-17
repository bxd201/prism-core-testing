import React from 'react'
import Carousel from 'src/components/Carousel/Carousel'
import CollectionSummary from 'src/components/ColorCollections/CollectionSummary'

// eslint-disable-next-line no-undef
const wrapper = mocked(<Carousel BaseComponent={CollectionSummary} data={[]} />)

describe('Carousel should rendering correctly', () => {
  it('snapshot matches', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
