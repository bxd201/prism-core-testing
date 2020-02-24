// @flow
//
import React, { useState } from 'react'
import type { ColorCollectionsTabs } from '../../shared/types/Colors.js.flow'

type Props = {
  collectionTabs: ColorCollectionsTabs,
  showTab: Function,
  tabIdShow: string
}

const baseClass = 'color-collections'
const tabListSelect = `${baseClass}__tab-list-select`
const tabListHeading = `${baseClass}__tab-list-heading`
const tabListDropdownMobile = `${baseClass}__tab-list-dropdown-mobile`
const tabList = `${baseClass}__tab-list`
const tabListActive = `${baseClass}__tab-list--active`
const tabListInactive = `${baseClass}__tab-list--inactive`
const tabListItem = `${baseClass}__tab-list-item`
const tabListItemActive = `${baseClass}__tab-list-item--active`

function ColorCollectionsTab (props: Props) {
  const { collectionTabs, showTab, tabIdShow } = props
  const [tabListMobileShow, showTabListMobile] = useState(false)
  const tabFind = collectionTabs.find(tab => tab.id === tabIdShow)
  const tabActive = (tabFind) ? tabFind.tabName : undefined
  const tabShowName = (tabActive !== undefined) ? tabActive : 'Choose collection'

  return (
    <div className={tabListSelect} role='tablist'>
      <span className={`${tabListHeading}`}>Choose a Collection</span>

      <span
        className={`${tabListDropdownMobile}`}
        tabIndex='-1'
        role='button'
        onKeyDown={() => {}}
        onClick={() => showTabListMobile(!tabListMobileShow)}>{tabShowName}
      </span>

      <ul className={`${tabList} ${(tabListMobileShow) ? `${tabListActive}` : `${tabListInactive}`}`}>
        {collectionTabs.map((tab, id) => {
          return (
            <li
              data-testid={`${tab.id}`}
              role='tab'
              onKeyDown={() => {}}
              className={`${tabListItem} ${(tab.id === tabIdShow) ? `${tabListItemActive}` : ''}`}
              key={tab.id}
              onClick={() => {
                if (tab.id !== tabIdShow) {
                  showTab(tab.id, true)
                }
                showTabListMobile(!tabListMobileShow)
              }}
            >
              {tab.tabName}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export {
  tabListSelect,
  tabListHeading,
  tabListDropdownMobile,
  tabList,
  tabListActive,
  tabListInactive,
  tabListItem,
  tabListItemActive
}
export default ColorCollectionsTab
