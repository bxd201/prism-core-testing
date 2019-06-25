// @flow
import React, { useState } from 'react'
import './ColorCollections.scss'

type Props = {
  collectionTabs: Array,
  showTab: Function,
  tabIdShow: string
}

const baseClass = 'color-collections'

function ColorCollectionsTab (props: Props) {
  const { collectionTabs, showTab, tabIdShow } = props
  const [tabListMobileShow, showTabListMobile] = useState(false)
  const tabActive = collectionTabs.find(tab => tab.id === tabIdShow).tabName
  const tabShowName = (tabActive !== undefined) ? tabActive : 'Choose collection'

  return (
    <div className={`${baseClass}__tab-list-select`}>
      <span className={`${baseClass}__tab-list-heading`}>Choose a Collection</span>
      <span className={`${baseClass}__tab-list-dropdown-mobile`} tabIndex='-1' role='button' onKeyDown={() => {}} onClick={() => showTabListMobile(!tabListMobileShow)}>{tabShowName}</span>
      <ul className={`${baseClass}__tab-list ${(tabListMobileShow) ? `${baseClass}__tab-list--active` : `${baseClass}__tab-list--inactive`}`}>
        {collectionTabs.map((tab, id) => {
          return (
            <li role='presentation' onKeyDown={() => {}} className={`${baseClass}__tab-list-item ${(tab.id === tabIdShow) ? `${baseClass}__tab-list-item--active` : ``} `} key={tab.id} onClick={() => {
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
