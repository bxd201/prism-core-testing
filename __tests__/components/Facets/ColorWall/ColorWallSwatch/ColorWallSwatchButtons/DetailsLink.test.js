/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import DetailsLink from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/DetailsLink'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

const formattedMessageId = 'VIEW_DETAILS'
const detailsLinkString = '/test'

const getDetailsLink = (props) => {
  let defaultProps = {
    config: {
      ColorWall: {
        displayViewDetails: true
      }
    },
    detailsLink: detailsLinkString
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<DetailsLink {...newProps} />)
}

describe('DetailsLink with config.ColorWall.displayViewDetails undefined', () => {
  let detailsLink
  beforeAll(() => {
    if (!detailsLink) {
      detailsLink = getDetailsLink({ config: { ColorWall: { displayViewDetails: undefined } } })
    }
  })

  it('should match snapshot', () => {
    expect(detailsLink).toMatchSnapshot()
  })

  it('should render null', () => {
    expect(detailsLink).toEqual({})
  })
})

describe('DetailsLink', () => {
  let detailsLink
  beforeAll(() => {
    if (!detailsLink) {
      detailsLink = getDetailsLink()
    }
  })

  it('should match snapshot', () => {
    expect(detailsLink).toMatchSnapshot()
  })

  it('should render Link with to prop defined as constant detailsLinkString', () => {
    expect(detailsLink.find(Link).prop('to')).toEqual(detailsLinkString)
  })

  it('should render Link component', () => {
    expect(detailsLink.find(Link).exists()).toBeTruthy()
  })

  it('should render FormattedMessage component', () => {
    expect(detailsLink.find(FormattedMessage).exists()).toBeTruthy()
  })

  it('should render FormattedMessage component with id defined as constant formattedMessageId', () => {
    expect(detailsLink.find(FormattedMessage).prop('id')).toEqual(formattedMessageId)
  })
})
