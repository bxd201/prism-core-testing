// @flow
import React, { useState } from 'react'
import './ColorCollections.scss'

type Props = {
  collectionTabs: Array,
  showTab: Function,
  tabIdShow: string
}

const baseClass = 'color-collections'
export const tabListSelect = `${baseClass}__tab-list-select`
export const tabListHeading = `${baseClass}__tab-list-heading`
export const tabListDropdownMobile = `${baseClass}__tab-list-dropdown-mobile`
export const tabList = `${baseClass}__tab-list`
export const tabListActive = `${baseClass}__tab-list--active`
export const tabListInactive = `${baseClass}__tab-list--inactive`
export const tabListItem = `${baseClass}__tab-list-item`
export const tabListItemActive = `${baseClass}__tab-list-item--active`

function ColorCollectionsTab (props: Props) {
  const { collectionTabs, showTab, tabIdShow } = props
  const [tabListMobileShow, showTabListMobile] = useState(false)
  const tabActive = collectionTabs.find(tab => tab.id === tabIdShow).tabName
  const tabShowName = (tabActive !== undefined) ? tabActive : 'Choose collection'

  return (
    <div className={`${tabListSelect}`}>
      <span className={`${tabListHeading}`}>Choose a Collection</span>
      <span className={`${tabListDropdownMobile}`} tabIndex='-1' role='button' onKeyDown={() => {}} onClick={() => showTabListMobile(!tabListMobileShow)}>{tabShowName}</span>
      <ul className={`${tabList} ${(tabListMobileShow) ? `${tabListActive}` : `${tabListInactive}`}`}>
        {collectionTabs.map((tab, id) => {
          return (
            <li data-testid={`${tab.id}`} role='presentation' onKeyDown={() => {}} className={`${tabListItem} ${(tab.id === tabIdShow) ? `${tabListItemActive}` : ``}`} key={tab.id} onClick={() => {
              if (tab.id !== tabIdShow) {
                showTab(tab.id)
              }
              showTabListMobile(!tabListMobileShow)
            }}>
              {tab.tabName}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ColorCollectionsTab
