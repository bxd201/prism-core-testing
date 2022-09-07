import { cleanup, render } from '@testing-library/react'
import React from 'react'
import ColorWallToolbar, { TEST_ID_SEARCH, TEST_ID_VIEWALL } from './color-wall-toolbar'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import mockGroupData from '../../test-utils/mocked-endpoints/groups.json'

const onGroupBtnClick = jest.fn()
const onSubGroupBtnClick = jest.fn()
const onShowAllBtnClick = jest.fn()
const onSearchBtnClick = jest.fn()

const toolBarProps = {
  uiStyle: 'minimal',
  onSearchBtnClick: onSearchBtnClick,
  onSubGroupBtnClick: onSubGroupBtnClick,
  onGroupBtnClick: onGroupBtnClick,
  onShowAllBtnClick: onShowAllBtnClick,
  onPrimeBtnClick: () => null,
  onCloseBtnClick: () => null,
  messages: {
    CLOSE: 'Close',
    SEARCH_COLOR: 'Search Color',
    VIEW_ENTIRE_COLOR_WALL: 'View entire color wall',
    CANCEL: 'cancel',
    COLOR_FAMILIES: 'families',
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

describe('Color Wall Toolbar', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

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
    const toolBarProps2 = {
      ...toolBarProps,
      toolBarData: {
        ...toolBarProps.toolBarData,
        subgroups: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel']
      }
    }

    const { getByTestId } = render(<ColorWallToolbar {...toolBarProps2} />)
    const subGroupBtn = getByTestId('btn-Explore color families')
    expect(subGroupBtn)
    expect(subGroupBtn).toHaveAttribute('aria-disabled', 'false')
  })

  test('should calls the correct function passed in by the user, when a subgroup option is selected.', async () => {
    const toolBarProps2 = {
      ...toolBarProps,
      toolBarData: {
        ...toolBarProps.toolBarData,
        subgroups: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel']
      }
    }

    const { getByTestId } = render(<ColorWallToolbar {...toolBarProps2} />)
    const subGroupBtn = getByTestId('btn-Explore color families')
    await user.click(subGroupBtn)
    const subgroupItem = getByTestId('item-Red')
    await user.click(subgroupItem)

    expect(subgroupItem)
    expect(onSubGroupBtnClick).toHaveBeenCalled()
  })

  test('should render a view entire wall button, than when clicked calls the correct function passed in by the user.', async () => {
    // ARRANGE
    const { getByTestId } = render(<ColorWallToolbar {...toolBarProps} />)
    const viewAllBtn = getByTestId(TEST_ID_VIEWALL)
    await user.click(viewAllBtn)

    expect(viewAllBtn)
    expect(onShowAllBtnClick).toHaveBeenCalled()
  })
})
