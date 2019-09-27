import React from 'react'
import { shallow } from 'enzyme'
import { ExpertColorDetails } from 'src/components/ExpertColorPicks/ExpertColorDetails'

function getStubs() {
  const stubs = {}

  stubs.color = {
    hex: '#cdd2d2',
    brandKey: 'SW',
    colorNumber: 90210,
    name: 'Bobafett'
  }

  return stubs
}

function getProps () {
  const props = {}
  props.addColors = []
  props.addToLivePalette = () => null
  props.expertColors = {
    colorDefs: [getStubs().color],
    id: 911,
    name: 'burning man'
  }

  return props
}

const getExpertColorDetails = (overrides = {}) => {
  return shallow(<ExpertColorDetails {...getProps()} {...overrides}/>)
}

describe('ExpertColorDetails', () => {
  describe('rendering', () => {
    it('should match snapshot', () => {
      expect(getExpertColorDetails()).toMatchSnapshot()
    })
  })
})
