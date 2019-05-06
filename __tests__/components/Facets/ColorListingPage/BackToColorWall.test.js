import React from 'react'
import { shallow } from 'enzyme'
import { BackToColorWall } from 'src/components/Facets/ColorListingPage/BackToColorWall'
import * as Colors from '__mocks__/data/color/Colors'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

const color = Colors.getColor()
const defaultProps = {
  color: color
}
const createBackToColorWall = (props) => {
  return shallow(<BackToColorWall {...defaultProps} {...props} />)
}

describe('snapshot match testing', () => {
  it('should match snapshot', () => {
    const wrapper = createBackToColorWall()
    expect(wrapper).toMatchSnapshot()
  })
})

describe('BacktoColor wall rendring testing', () => {
  it('should rendring format message component', () => {
    const wrapper = createBackToColorWall()
    expect(wrapper.find(FormattedMessage)).toBeTruthy()
  })
  it('should rendring Link correctly', () => {
    const wrapper = createBackToColorWall()
    expect(wrapper.find(Link)).toBeTruthy()
  })
})
