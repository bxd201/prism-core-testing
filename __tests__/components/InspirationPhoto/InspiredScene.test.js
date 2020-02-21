import React from 'react'
import { shallow } from 'enzyme'
import InspiredScene from 'src/components/InspirationPhotos/InspiredScene'
import ColorsFromImage from 'src/components/InspirationPhotos/ColorsFromImage'
let defaultProps = {
  data: {},
  isActivedPage: true,
  isRenderingPage: true
}

const createInspiredScene = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<InspiredScene {...newProps} />)
}

const wrapper = createInspiredScene()

describe('compoments rendring test', () => {
  it('should rendering ColorsFromImage Component', () => {
    expect(wrapper.find(ColorsFromImage).exists()).toBe(true)
  })
})
