/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import SimilarColors from 'src/components/Facets/ColorDetails/SimilarColors/SimilarColors'
import * as Colors from '__mocks__/data/color/Colors'
import { FormattedMessage } from 'react-intl'

const color = Colors.getColor()
const colors = Colors.getAllColors()

const getSimilarColors = (props) => {
  return shallow(<SimilarColors {...props} />)
}

describe('SimilarColors component with props', () => {
  let similarColors
  beforeEach(() => {
    if (!similarColors) {
      similarColors = getSimilarColors({ colors: colors, color: color })
    }
  })

  it('SimilarColors is rendering', () => {
    expect(similarColors.exists()).toBe(true)
  })

  it('SimilarColors is rendering H5 with FormattedMessage', () => {
    expect(similarColors.find('h5.visually-hidden').contains(<FormattedMessage id='SIMILAR_COLORS' />)).toBeTruthy()
  })

  it('SimilarColors is rendering SimilarColorSwatch if color object contains similarColors', () => {
    if (color.similarColors) {
      expect(similarColors.find('SimilarColorSwatch').exists()).toBe(true)
    }
  })
})
