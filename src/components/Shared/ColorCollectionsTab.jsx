// @flow
//
import React, { useState, useEffect, useCallback } from 'react'
import type { ColorCollectionsTabs } from '../../shared/types/Colors.js.flow'
import { KEY_CODES } from 'src/constants/globals'
import { FormattedMessage, useIntl } from 'react-intl'
import at from 'lodash/at'

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
  const { messages = {} } = useIntl()
  const tabShowName = (tabActive !== undefined) ? tabActive : at(messages, 'CHOOSE_A_COLLECTION')[0]

  const tabRefs = collectionTabs.reduce((acc, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})

  useEffect(() => {
    if (tabRefs[tabIdShow] && tabRefs[tabIdShow].current) {
      tabRefs[tabIdShow].current.focus()
    }
  }, [tabIdShow])

  const handleKeyDownSpan = useCallback((e: SyntheticEvent) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) {
      showTabListMobile(!tabListMobileShow)
    }
  }, [showTabListMobile, tabListMobileShow])

  const handleClickSpan = useCallback(() => {
    showTabListMobile(!tabListMobileShow)
  }, [showTabListMobile, tabListMobileShow])

  const handleKeyDownLiTab = useCallback((e: SyntheticEvent) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_SPACE || e.keyCode === KEY_CODES.KEY_CODE_ENTER) {
      if (e.currentTarget.dataset.tabid !== tabIdShow) {
        showTab(e.currentTarget.dataset.tabid, true)
      }
      showTabListMobile(!tabListMobileShow)
    }
  }, [showTabListMobile, tabListMobileShow])

  const handleClickLiTab = useCallback((e: SyntheticEvent) => {
    if (e.currentTarget.dataset.tabid !== tabIdShow) {
      showTab(e.currentTarget.dataset.tabid, true)
    }
    showTabListMobile(!tabListMobileShow)
  }, [showTabListMobile, tabListMobileShow])

  return (
    <div className={tabListSelect} role='tablist'>
      <span className={`${tabListHeading}`}><FormattedMessage id='CHOOSE_A_COLLECTION' /></span>

      <span
        className={`${tabListDropdownMobile}`}
        tabIndex='0'
        role='button'
        onKeyDown={handleKeyDownSpan}
        onClick={handleClickSpan}
      >
        {tabShowName}
      </span>

      <ul className={`${tabList} ${(tabListMobileShow) ? `${tabListActive}` : `${tabListInactive}`}`} role='tablist'>
        {collectionTabs.map((tab, id) => {
          return (
            <li
              data-testid={`${tab.id}`}
              data-tabid={tab.id}
              role='tab'
              tabIndex='0'
              aria-selected={tab.id === tabIdShow}
              onKeyDown={handleKeyDownLiTab}
              className={`${tabListItem} ${(tab.id === parseInt(tabIdShow)) ? `${tabListItemActive}` : ''}`}
              key={tab.id}
              onClick={handleClickLiTab}
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
