/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
// import { renderHook, act } from 'react-hooks-testing-library'
import { render, fireEvent, getByTestId } from '@testing-library/react'
import ColorCollectionsTab, {
  tabListSelect,
  tabList, tabListItem,
  tabListDropdownMobile,
  tabListActive,
  tabListInactive
} from 'src/components/ColorCollections/ColorCollectionsTab'
import { collectionTabs } from 'src/components/Carousel/data'

let defaultProps = {
  collectionTabs: collectionTabs,
  showTab: jest.fn(),
  tabIdShow: 'tab1'
}

const getColorCollectionsTab = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorCollectionsTab {...newProps} />)
}

describe('ColorCollectionsTab', () => {
  let colorCollectionsTab
  beforeAll(() => {
    if (!colorCollectionsTab) {
      colorCollectionsTab = getColorCollectionsTab()
    }
  })

  it('should match snapshot', () => {
    expect(colorCollectionsTab).toMatchSnapshot()
  })

  it('should render tabListSelect class div', () => {
    expect(colorCollectionsTab.find(`div.${tabListSelect}`).exists()).toBe(true)
  })

  it('should render tabListDropdownMobile class span', () => {
    expect(colorCollectionsTab.find(`span.${tabListDropdownMobile}`).exists()).toBe(true)
  })

  it('should render tabList class ul', () => {
    expect(colorCollectionsTab.find(`ul.${tabList}`).exists()).toBe(true)
  })

  it('should render number of li with class tabListItem equal to items in collectionTabs', () => {
    expect(colorCollectionsTab.find(`li.${tabListItem}`)).toHaveLength(collectionTabs.length)
  })

  it('should render li content equal to each tabs tabName in collectionTabs', () => {
    collectionTabs.map((tab, index) => {
      expect(colorCollectionsTab.find(`li.${tabListItem}`).contains(tab.tabName)).toBe(true)
    })
  })

  it('should change ul class when span with class tabListDropdownMobile is clicked', () => {
    const tabListUl = colorCollectionsTab.find(`ul.${tabListInactive}`)
    colorCollectionsTab.find(`span.${tabListDropdownMobile}`).simulate('click')
    if (tabListUl) {
      expect(colorCollectionsTab.find(`ul.${tabListActive}`).exists()).toBe(true)
    } else {
      expect(colorCollectionsTab.find(`ul.${tabListInactive}`).exists()).toBe(true)
    }
  })
})

describe('ColorCollectionsTab with react-testing-library', () => {
  let colorCollectionsTab
  beforeAll(() => {
    if (!colorCollectionsTab) {
      colorCollectionsTab = render(<ColorCollectionsTab {...defaultProps} />)
    }
  })

  it('should call showTab when inactive tab is clicked', () => {
    const { container } = colorCollectionsTab
    collectionTabs.map((tab, index) => {
      const tabLi = getByTestId(container, tab.id)
      fireEvent.click(tabLi)
      if (tab.id !== defaultProps.tabIdShow) {
        expect(defaultProps.showTab).toHaveBeenCalled()
      } else {
        expect(defaultProps.showTab).not.toHaveBeenCalled()
      }
    })
  })
})
