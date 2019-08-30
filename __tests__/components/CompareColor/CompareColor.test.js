/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import {
  CompareColor,
  containerHeaderClass,
  containerHeaderButtonClass,
  prevBtnWrapperClass,
  buttonsClass,
  nextBtnWrapperClass,
  queueWrapperClass,
  colorInfoNumberClass,
  colorInfoNameClass
} from 'src/components/CompareColor/CompareColor'
import { StaticTintScene } from 'src/components/CompareColor/TintableScene'
import * as Colors from '__mocks__/data/color/Colors'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'

const colors = Colors.getlpColorsPredefined()
const mockToggleCompareColorFn = jest.fn()
const colorsCount = colors.colors.length

const getCompareColor = props => {
  let defaultProps = {
    colors: colors.colors,
    toggleCompareColor: mockToggleCompareColorFn,
    colorsId: []
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<CompareColor {...newProps} />)
}

describe('CompareColor with props', () => {
  let compareColor
  beforeEach(() => {
    if (!compareColor) {
      compareColor = getCompareColor({})
    }
  })

  it('should match snapshot with props', () => {
    expect(compareColor).toMatchSnapshot()
  })

  it('CompareColor is rendering with props', () => {
    expect(compareColor.exists()).toBe(true)
  })

  it('should initialize state correctly', () => {
    const initialState = compareColor.instance().state

    expect(initialState).toEqual({
      colors: compareColor.instance().props.colors,
      colorsId: compareColor.instance().props.colorsId,
      renderColors: [],
      curr: 0,
      isHidePrevButton: true,
      isHideNextButton: true
    })
  })

  it('should render Close button', () => {
    expect(compareColor.find(`button.${containerHeaderButtonClass}`).exists()).toBe(true)
  })

  it(`should render div.${queueWrapperClass} number of times equal to ${colorsCount}-count of colors`, () => {
    expect(compareColor.find(`div.${queueWrapperClass}`)).toHaveLength(colorsCount)
  })

  it(`should render StaticTintScene component number of times equal to ${colorsCount}-count of colors`, () => {
    expect(compareColor.find(StaticTintScene)).toHaveLength(colorsCount)
  })

  it('should render span with Compare Colors as content', () => {
    const headerContent = 'Compare Colors'
    expect(compareColor.find(`div.${containerHeaderClass} > span`).contains(headerContent)).toBe(true)
  })

  it(`should render span.${colorInfoNumberClass} number of times equal to ${colorsCount}-count of colors with content from colors prop`, () => {
    const colorNumbersArray = []
    compareColor.find(`span.${colorInfoNumberClass}`).map(el => {
      colorNumbersArray.push(el.props().children)
    })

    const colorNumbersFromPropColors = []
    compareColor.instance().props.colors.map(color => {
      colorNumbersFromPropColors.push(fullColorNumber(color.brandKey, color.colorNumber))
    })

    expect(colorNumbersArray).toEqual(colorNumbersFromPropColors)
  })

  it(`should render span.${colorInfoNameClass} number of times equal to ${colorsCount}-count of colors with content from colors prop`, () => {
    const colorNamesArray = []
    compareColor.find(`span.${colorInfoNameClass}`).map(el => {
      colorNamesArray.push(el.props().children)
    })

    const colorNamesFromPropColors = []
    compareColor.instance().props.colors.map(color => {
      colorNamesFromPropColors.push(color.name)
    })

    expect(colorNamesArray).toEqual(colorNamesFromPropColors)
  })
})

describe('CompareColor events', () => {
  let compareColor
  beforeEach(() => {
    if (!compareColor) {
      compareColor = getCompareColor({})
    }
  })

  it('should call mockToggleCompareColorFn on button.containerHeaderButtonClass click', () => {
    compareColor.find(`button.${containerHeaderButtonClass}`).simulate('click')
    expect(mockToggleCompareColorFn).toHaveBeenCalled()
  })

  it('should update curr state on next button click', () => {
    const currState = compareColor.state('curr')

    if (colorsCount > 3) {
      compareColor.find(`div.${nextBtnWrapperClass} > button.${buttonsClass}`).simulate('click')
      const currStateAfterClickNext = compareColor.state('curr')
      expect(currStateAfterClickNext).toBeGreaterThan(currState)
    }
  })

  it('should update curr state on previous button click', () => {
    compareColor.setState({ curr: 2 })
    const currState = compareColor.state('curr')

    if (colorsCount > 3) {
      compareColor.find(`div.${prevBtnWrapperClass} > button.${buttonsClass}`).simulate('click')
      const currStateAfterClickPrev = compareColor.state('curr')
      expect(currStateAfterClickPrev).toBeLessThan(currState)
    }
  })
})
