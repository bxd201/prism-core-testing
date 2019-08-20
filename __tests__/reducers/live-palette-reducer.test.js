import * as actions from 'src/store/actions/live-palette'
import { lp, initialState } from 'src/store/reducers/live-palette'
import * as Colors from '__mocks__/data/color/Colors'
import shuffle from 'lodash/shuffle'
import filter from 'lodash/filter'

const color = Colors.getColor()
const colors = Colors.getlpColorsByCount(4)
const colorIds = colors.colors.map(color => color.id)

describe('live-palette-reduer', () => {
  it('should return the initial state', () => {
    expect(lp(undefined, initialState)).toEqual(initialState)
  })

  it('should handle ADD_LP_COLOR', () => {
    const mock = {
      type: actions.ADD_LP_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp({ colors: [] }, mock)).toEqual({ colors: [color], activeColor: color })
  })

  it('should handle REMOVE_LP_COLOR', () => {
    const mock = {
      type: actions.REMOVE_LP_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp([], mock)).toEqual({ colors: [], activeColor: null })
  })

  it('should handle ACTIVATE_LP_COLOR', () => {
    const mock = {
      type: actions.ACTIVATE_LP_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp([], mock)).toEqual({ activeColor: color })
  })

  it('should handle ACTIVATE_LP_PREVIEW_COLOR', () => {
    const mock = {
      type: actions.ACTIVATE_LP_PREVIEW_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp([], mock)).toEqual({ activePreviewColor: color })
  })

  it('should handle REORDER_LP_COLORS', () => {
    const colorsByIndex = shuffle(colorIds)
    const mock = {
      type: actions.REORDER_LP_COLORS,
      payload: {
        colorsByIndex: colorsByIndex
      }
    }

    const reconstructedColors = []
    for (let id = 0; id < colorsByIndex.length; id++) {
      const color = filter(colors.colors, color => (color.id === colorsByIndex[id]))[0]
      reconstructedColors.push(color)
    }

    const lpReturn = lp({ colors: colors.colors }, mock)
    expect(lpReturn).toEqual({ colors: reconstructedColors })
  })
})
