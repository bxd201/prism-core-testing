import * as colorActions from 'src/store/actions/loadColors'
import * as searchActions from 'src/store/actions/loadSearchResults'
import { initialState } from 'src/store/reducers/colors/colorReducerMethods'
import { colors } from 'src/store/reducers/colors'
import * as Colors from '__mocks__/data/color/Colors'
import kebabCase from 'lodash/kebabCase'

const color = Colors.getColor()
const colorId = 1544
const colorMap = Colors.getAllColors()
const section = 'Sherwin-Williams Colors'

const family = 'Red'
const families = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel']

const structure = [
  {
    default: false,
    families: ['Historic Color'],
    name: 'Historic Colors'
  },
  {
    default: true,
    families: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel'],
    name: 'Sherwin-Williams Colors'
  },
  {
    default: false,
    families: ['Timeless Color'],
    name: 'Timeless Colors'
  }
]

describe('colors-reducer', () => {
  test('changes status for error', () => {
    const state = colors(initialState, {
      type: colorActions.LOAD_ERROR
    })

    const expectedState = {
      ...initialState,
      status: {
        loading: false,
        error: true,
        activeRequest: false
      }
    }

    expect(state).toEqual(expectedState)
  })

  test('changes status for colors request', () => {
    const state = colors(initialState, {
      type: colorActions.REQUEST_COLORS,
      payload: { loading: false }
    })

    expect(state).toEqual({
      ...initialState,
      status: { loading: false }
    })
  })

  test('updates seekingColorWallActive to payload color id if loading status is true', () => {
    const initialStateWithLoading = { ...initialState, status: { loading: true } }

    const state = colors(initialStateWithLoading, {
      type: colorActions.MAKE_ACTIVE_COLOR_BY_ID,
      payload: { id: colorId }
    })

    expect(state).toEqual({
      ...initialStateWithLoading,
      initializeWith: {
        ...initialStateWithLoading.initializeWith,
        colorWallActive: colorId
      }
    })
  })

  test('updates colorWallActive to state.items.colorMap data of payload color id if colorMap exists', () => {
    const initialStateWithItemsColorMap = {
      ...initialState,
      items: { colorMap: colorMap },
      status: {
        ...initialState.status,
        loading: false
      }
    }

    const foundColor = initialStateWithItemsColorMap.items.colorMap[colorId]

    const state = colors(initialStateWithItemsColorMap, {
      type: colorActions.MAKE_ACTIVE_COLOR_BY_ID,
      payload: { id: colorId }
    })

    const expectedState = {
      ...initialStateWithItemsColorMap,
      colorWallActive: foundColor,
      seekingColorWallActive: initialState.seekingColorWallActive
    }

    expect(state).toEqual(expectedState)
  })

  test('returns initial state for MAKE_ACTIVE_COLOR_BY_ID if loading status is false & items colorMap is not set', () => {
    const initialStateWithLoadingFalse = {
      ...initialState,
      status: {
        ...initialState.status,
        loading: false
      }
    }
    const state = colors(initialStateWithLoadingFalse, {
      type: colorActions.MAKE_ACTIVE_COLOR_BY_ID
    })

    expect(state).toEqual({
      ...initialStateWithLoadingFalse,
      status: {
        ...initialStateWithLoadingFalse.status,
        error: true
      }
    })
  })

  test('resets active color', () => {
    const state = colors(initialState, {
      type: colorActions.RESET_ACTIVE_COLOR
    })

    expect(state).toEqual(initialState)
  })

  test('removes color filters', () => {
    const initialStateWithLoadingFalse = {
      ...initialState,
      family: {
        ...initialState.family,
        family: undefined,
        families: ['Timeless Color'],
        section: 'Timeless Colors'
      }
    }

    const state = colors(initialStateWithLoadingFalse, {
      type: colorActions.REMOVE_COLOR_FILTERS
    })

    expect(state).toEqual(initialState)
  })

  test('filters by family with loading true', () => {
    const state = colors(initialState, {
      type: colorActions.FILTER_BY_FAMILY,
      payload: { family: 'green' }
    })

    expect(state).toEqual({
      ...initialState,
      initializeWith: {
        ...initialState.initializeWith,
        family: 'green'
      }
    })
  })

  test('filters by family', () => {
    const initialStateWithLoadingFalse = {
      ...initialState,
      status: {
        ...initialState.status,
        loading: false
      },
      families: families
    }

    const state = colors(initialStateWithLoadingFalse, {
      type: colorActions.FILTER_BY_FAMILY,
      payload: { family: family }
    })

    const expectedState = {
      ...initialState,
      family: family,
      families: families,
      initializeWith: {
        ...initialState.initializeWith,
        family: initialState.initializeWith.family
      },
      status: {
        ...initialState.status,
        loading: false
      }
    }

    expect(state).toEqual(expectedState)
  })

  test('filters by section with loading true', () => {
    const state = colors(initialState, {
      type: colorActions.FILTER_BY_SECTION,
      payload: { section: section }
    })

    const expectedState = {
      ...initialState,
      initializeWith: {
        ...initialState.initializeWith,
        section: kebabCase(section)
      }
    }
    expect(state).toEqual(expectedState)
  })

  test('filters by section', () => {
    const initialStateWithLoadingFalse = {
      ...initialState,
      status: {
        ...initialState.status,
        loading: false
      },
      structure: structure
    }

    const state = colors(initialStateWithLoadingFalse, {
      type: colorActions.FILTER_BY_SECTION,
      payload: { section: section }
    })

    const expectedState = {
      ...initialStateWithLoadingFalse,
      family: void (0),
      families: initialStateWithLoadingFalse.structure.find(el => el.name === section).families,
      section: initialStateWithLoadingFalse.structure.find(el => el.name === section).name
    }

    expect(state).toEqual(expectedState)
  })

  test('changes status for search request', () => {
    const state = colors(initialState, {
      type: searchActions.REQUEST_SEARCH_RESULTS,
      payload: { status: { loading: true } }
    })

    expect(state).toEqual({
      ...initialState,
      search: {
        ...initialState.search,
        loading: true
      }
    })
  })

  test('updates results for search received', () => {
    const state = colors(initialState, {
      type: searchActions.RECEIVE_SEARCH_RESULTS,
      payload: {
        results: [color],
        count: 1
      }
    })

    expect(state).toEqual({
      ...initialState,
      search: {
        ...initialState.search,
        loading: false,
        results: [color],
        count: 1
      }
    })
  })

  test('default', () => {
    const state = colors(initialState, {
      type: 'TEST',
      payload: { colors: [color] }
    })

    expect(state).toEqual(initialState)
  })

  test('handles undefined state', () => {
    const state = colors(undefined, {
      type: 'TEST'
    })

    expect(state).toEqual(initialState)
  })
})
