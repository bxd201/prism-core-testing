/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import InfoButton from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/InfoButton'
import { Link } from 'react-router-dom'

const detailsLinkString = '/test'

const getInfoButton = (props) => {
  let defaultProps = {
    config: { displayInfoButton: true },
    detailsLink: detailsLinkString
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<InfoButton {...newProps} />)
}

describe('InfoButton with config.ColorWall.displayAddButton undefined', () => {
  let infoButton
  beforeAll(() => {
    if (!infoButton) {
      infoButton = getInfoButton({ config: { ColorWall: { displayAddButton: undefined } } })
    }
  })

  it('should match snapshot', () => {
    expect(infoButton).toMatchSnapshot()
  })

  it('should render null', () => {
    expect(infoButton).toEqual({})
  })
})

describe('InfoButton', () => {
  let infoButton
  beforeAll(() => {
    if (!infoButton) {
      infoButton = getInfoButton()
    }
  })

  it('should match snapshot', () => {
    expect(infoButton).toMatchSnapshot()
  })

  it('should render Link component', () => {
    expect(infoButton.find(Link).exists()).toBeTruthy()
  })

  it('should render Link component with to prop defined as detailsLinkString constant', () => {
    expect(infoButton.find(Link).prop('to')).toEqual(detailsLinkString)
  })
})
