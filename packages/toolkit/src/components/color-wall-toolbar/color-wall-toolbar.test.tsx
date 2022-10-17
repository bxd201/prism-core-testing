import React from 'react'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import mockGroupData from '../../test-utils/mocked-endpoints/groups.json'
import ColorWallToolbar, {
  IColorWallToolbarProps,
  TEST_ID_CANCEL,
  TEST_ID_FAMILIES,
  TEST_ID_FAMILIES_COLORS,
  TEST_ID_PRIME,
  TEST_ID_SEARCH,
  TEST_ID_VIEWALL
} from './color-wall-toolbar'

const onGroupBtnClick = jest.fn()
const onSubGroupBtnClick = jest.fn()
const onShowAllBtnClick = jest.fn()
const onSearchBtnClick = jest.fn()
const onPrimeBtnClick = jest.fn()

const toolBarProps: IColorWallToolbarProps = {
  uiStyle: 'minimal',
  onSearchBtnClick: onSearchBtnClick,
  onSubGroupBtnClick: onSubGroupBtnClick,
  onGroupBtnClick: onGroupBtnClick,
  onShowAllBtnClick: onShowAllBtnClick,
  onPrimeBtnClick: onPrimeBtnClick,
  onCloseBtnClick: () => null,
  messages: {
    CLOSE: 'Close',
    SEARCH_COLOR: 'Search Color',
    VIEW_ENTIRE_COLOR_WALL: 'View entire color wall',
    CANCEL: 'cancel',
    COLOR_FAMILIES: 'Color Families',
    SELECT_COLLECTION: 'Select Color Selections',
    ALL_COLORS: 'ALL_COLORS',
    EXPLORE_COLOR_FAMILIES: 'Explore color families',
    EXPLORE_COLLECTIONS: 'Explore collections'
  },
  toolBarData: {
    groups: mockGroupData?.map((group) => group.name),
    activeGroup: 'Top 50 Colors',
    subgroups: [],
    activeSubgroup: null,
    primeColorWall: 'Sherwin-Williams Colors'
  },
  toolBarConfig: { alwaysShowSubGroups: false, closeBtn: {}, shouldShowCloseButton: false }
}
const toolBarProps2 = {
  ...toolBarProps,
  toolBarData: {
    ...toolBarProps.toolBarData,
    subgroups: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel']
  }
}

describe('Color Wall Toolbar', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })
  describe('Minimal', () => {
    test('should render a search button, than when clicked calls the correct function passed in by the user.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} />)
      const searchBtn = getByTestId(TEST_ID_SEARCH)
      await user.click(searchBtn)

      expect(searchBtn)
      expect(onSearchBtnClick).toHaveBeenCalled()
    })

    test('should render a sub group dropdown, than is initial disabled.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} />)
      const subGroupBtn = getByTestId('btn-Explore color families')
      expect(subGroupBtn)
      expect(subGroupBtn).toHaveAttribute('aria-disabled', 'true')
    })

    test('should render a group drop down, then when an option is selected calls the correct function passed in by the user.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} />)
      const groupBtn = getByTestId('btn-Top 50 Colors')
      await user.click(groupBtn)
      const groupItem = getByTestId('item-Timeless Colors')
      await user.click(groupItem)

      expect(groupItem)
      expect(onGroupBtnClick).toHaveBeenCalled()
    })

    test('should enable the subgroup drop down, when a group with multiple subgroups(families) is selected.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps2} />)
      const subGroupBtn = getByTestId('btn-Explore color families')
      expect(subGroupBtn)
      expect(subGroupBtn).toHaveAttribute('aria-disabled', 'false')
    })

    test('should calls the correct function passed in by the user, when a subgroup option is selected.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps2} />)
      const subGroupBtn = getByTestId('btn-Explore color families')
      await user.click(subGroupBtn)
      const subgroupItem = getByTestId('item-Red')
      await user.click(subgroupItem)

      expect(subgroupItem)
      expect(onSubGroupBtnClick).toHaveBeenCalled()
    })

    test('should render a view entire wall button, that when clicked calls the correct function passed in by the user.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} />)
      const viewAllBtn = getByTestId(TEST_ID_VIEWALL)
      await user.click(viewAllBtn)

      expect(viewAllBtn)
      expect(onShowAllBtnClick).toHaveBeenCalled()
    })
  })
  describe('Advanced Full', () => {
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

    beforeAll(() => {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 1000 })
    })

    afterAll(() => {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
    })
    test('should render the correct buttons when advanced Toolbar is enabled.', () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} uiStyle={null} />)

      const searchBtn = getByTestId(TEST_ID_SEARCH)
      const colorFamiliesBtn = getByTestId(TEST_ID_FAMILIES)
      const primeColorWall = getByTestId(TEST_ID_PRIME)
      const groupBtn = getByTestId('btn-Top 50 Colors')

      expect(searchBtn)
      expect(colorFamiliesBtn)
      expect(primeColorWall)
      expect(groupBtn)
    })

    test('should have color families disabled when Sherwin-Williams Colors is  not selected and disabled when not.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} uiStyle={null} />)

      const colorFamiliesBtn = getByTestId(TEST_ID_FAMILIES)

      expect(colorFamiliesBtn).toHaveAttribute('aria-disabled', 'true')
    })

    test('should have color families enabled when multiple families are available.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps2} uiStyle={null} />)

      const colorFamiliesBtn = getByTestId(TEST_ID_FAMILIES)

      expect(colorFamiliesBtn).toHaveAttribute('aria-disabled', 'false')
    })

    test('should call user defined callback when Prime color button is clicked', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} uiStyle={null} />)

      const primeColorWall = getByTestId(TEST_ID_PRIME)
      await user.click(primeColorWall)

      expect(onPrimeBtnClick).toHaveBeenCalled()
    })
    test('should render color family buttons when Color Families is selected .', async () => {
      const { getAllByTestId, getByTestId } = render(<ColorWallToolbar {...toolBarProps2} uiStyle={null} />)

      const colorFamiliesBtn = getByTestId(TEST_ID_FAMILIES)
      await user.click(colorFamiliesBtn)
      const colorsBtn = getAllByTestId(TEST_ID_FAMILIES_COLORS)
      expect(colorsBtn).toHaveLength(8)
    })
    test('should close family buttons when cancel is selected.', async () => {
      const { getByTestId } = render(<ColorWallToolbar {...toolBarProps2} uiStyle={null} />)

      const colorFamiliesBtn = getByTestId(TEST_ID_FAMILIES)
      await user.click(colorFamiliesBtn)
      const cancelBtn = getByTestId(TEST_ID_CANCEL)
      expect(cancelBtn)
    })
  })
})
