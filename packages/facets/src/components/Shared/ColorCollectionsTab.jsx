// @flow
//
import React, { useState, useEffect, useCallback, useContext } from 'react'
import type { ColorCollectionsTabs } from '../../shared/types/Colors.js.flow'
import { GA_TRACKER_NAME_BRAND, HASH_CATEGORIES, KEY_CODES } from 'src/constants/globals'
import { FormattedMessage, useIntl } from 'react-intl'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import at from 'lodash/at'
import startCase from 'lodash/startCase'
import * as GA from 'src/analytics/GoogleAnalytics'

type Props = {
  collectionsSelectLabel?: string,
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
  const { collectionsSelectLabel, collectionTabs, showTab, tabIdShow } = props
  const { brandId }: ConfigurationContextType = useContext(ConfigurationContext)
  const [tabListMobileShow, showTabListMobile] = useState(false)
  const tabFind = collectionTabs.find(tab => tabIdShow && tab.id.toString() === tabIdShow.toString())
  const tabActive = (tabFind) ? tabFind.tabName : undefined
  const { messages = {} } = useIntl()
  const tabShowName = (tabActive !== undefined) ? tabActive : at(messages, 'CHOOSE_A_COLLECTION')[0]

  const tabRefs = collectionTabs.reduce((acc, value) => {
    acc[value.id.toString()] = React.createRef()
    return acc
  }, {})

  useEffect(() => {
    if (collectionTabs && collectionTabs.length) {
      tabRefs[collectionTabs[0].id.toString()].current.focus()
    }
  }, [])

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

  const getGAEvent = tabId => {
    GA.event({
      category: startCase(window.location.hash.split('/').filter(hash => HASH_CATEGORIES.indexOf(hash) >= 0)),
      action: collectionsSelectLabel ?? messages.CHOOSE_A_COLLECTION,
      label: startCase(collectionTabs.filter(({ id }) => (typeof id === 'number' ? `${id}` : id) === tabId)[0].tabName.toLowerCase())
    }, GA_TRACKER_NAME_BRAND[brandId])
  }

  const handleKeyDownLiTab = useCallback((e: SyntheticEvent) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_SPACE || e.keyCode === KEY_CODES.KEY_CODE_ENTER) {
      if (e.currentTarget.dataset.tabid !== tabIdShow) {
        showTab(e.currentTarget.dataset.tabid, true)
      }
      showTabListMobile(!tabListMobileShow)
      getGAEvent(e.currentTarget.dataset.tabid)
    }
  }, [showTabListMobile, tabListMobileShow])

  const handleClickLiTab = useCallback((e: SyntheticEvent) => {
    if (e.currentTarget.dataset.tabid !== tabIdShow) {
      showTab(e.currentTarget.dataset.tabid, true)
    }
    showTabListMobile(!tabListMobileShow)
    getGAEvent(e.currentTarget.dataset.tabid)
  }, [showTabListMobile, tabListMobileShow])

  const mouseDownHandler = (e: SyntheticEvent) => {
    e.preventDefault()
  }

  return (
    <>
      <div className={tabListSelect}>
        <span className={`${tabListHeading}`}>{collectionsSelectLabel ?? <FormattedMessage id='CHOOSE_A_COLLECTION' />}</span>
        <span
          className={`${tabListDropdownMobile}`}
          tabIndex='0'
          role='button'
          onKeyDown={handleKeyDownSpan}
          onClick={handleClickSpan}
        >
          {tabShowName}
        </span>
      </div>
      <ul className={`${tabList} ${(tabListMobileShow) ? `${tabListActive}` : `${tabListInactive}`}`} role='tablist'>
        {collectionTabs.map((tab, id) => {
          return (
            <li
              ref={tabRefs[tab.id.toString()]}
              data-testid={`${tab.id}`}
              data-tabid={tab.id}
              role='tab'
              tabIndex='0'
              aria-selected={tabIdShow && tab.id.toString() === tabIdShow.toString()}
              onKeyDown={handleKeyDownLiTab}
              className={`${tabListItem} ${(tabIdShow && tab.id.toString() === tabIdShow.toString()) ? `${tabListItemActive}` : ''}`}
              key={tab.id}
              onClick={handleClickLiTab}
              onMouseDown={mouseDownHandler}
            >
              {tab.tabName}
            </li>
          )
        })}
      </ul>
    </>
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
