// @flow
import type { Node } from 'react'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import * as scroll from 'scroll'
import { KEY_CODES } from 'src/constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import {
  contentWrapper,
  SCROLL_SPEED,
  tabsContainer,
  wrapper,
} from './constants'
import { filterHelpItems } from './data'
import HelpItemContent from './HelpItemContent'
import HelpItemHeader from './HelpItemHeader'

const HelpInterior = (): Node => {
  const { cvw = {}, featureExclusions = [] }: ConfigurationContextType =
    useContext(ConfigurationContext)
  const { help = {} } = cvw
  const contentWrapperRef = React.createRef<HTMLDivElement>()
  const [contentRefs, setContentRefs] = useState([])
  const [filteredHelpItems, setFilteredHelpItems] = useState([])
  const [activeTabIdentifier, setActiveTabIdentifier] = useState({
    index: 0,
    timestamp: 0, // this is necessary since "visual active" drives the appearance of the active tab
  })
  const [visualactiveTabIndex, setVisualactiveTabIndex] = useState(0)

  // scroll the help contents when setting an active tab
  useEffect(() => {
    if (contentRefs.length === 0) return

    const tgtOffset = contentRefs[activeTabIdentifier.index]?.current?.offsetTop

    if (contentWrapperRef.current && typeof tgtOffset !== 'undefined') {
      scroll.top(contentWrapperRef.current, tgtOffset, {
        duration: SCROLL_SPEED,
      })
    }
  }, [activeTabIdentifier, contentRefs, contentWrapperRef.current])

  // update sidebar active state when content scrolls
  const contentWrapperScrollHandler = useCallback(
    debounce((e) => {
      if (!contentWrapperRef.current) return

      const tgt = contentRefs.reduce((accum, next, index) => {
        const scrollTrigger = {
          top: contentWrapperRef.current.scrollTop,
          bottom:
            contentWrapperRef.current.scrollTop +
            contentRefs[index - 1]?.current.scrollHeight -
            70,
        }
        if (
          scrollTrigger[help.scrollContentPosition ?? 'top'] >=
          next.current.offsetTop
        ) {
          return index
        }
        return accum
      }, 0)
      setVisualactiveTabIndex(tgt)
    }, SCROLL_SPEED),
    [contentRefs, contentWrapperRef]
  )

  // handle clicking on sidebar nav item
  const handleNavClick = (index) => (e) => {
    e.preventDefault()
    setActiveTabIdentifier({ index: index, timestamp: Date.now() })
    setVisualactiveTabIndex(index)
  }

  const handleNavKeyDown = (index) => (e) => {
    if (
      e.keyCode === KEY_CODES.KEY_CODE_ENTER ||
      e.keyCode === KEY_CODES.KEY_CODE_SPACE
    ) {
      e.preventDefault()
      setActiveTabIdentifier({ index: index, timestamp: Date.now() })
      setVisualactiveTabIndex(index)
    }
  }

  useEffect(() => {
    const { contents = [], contentsHiddenMobile = [] } = help
    const filtered = filterHelpItems(
      contents,
      contentsHiddenMobile,
      featureExclusions
    )
    setFilteredHelpItems(filtered)
    setContentRefs(filtered.map((item, index) => React.createRef()))
  }, [featureExclusions, help])

  return (
    <div className={`${wrapper}`}>
      <div className={`${tabsContainer}`}>
        <ul className={`${tabsContainer}__list`}>
          {filteredHelpItems.map((tab: Object, index: number) => (
            <HelpItemHeader
              messageId={tab.header}
              key={index}
              isActive={index === visualactiveTabIndex}
              onClick={handleNavClick(index)}
              onKeyDown={handleNavKeyDown(index)}
            />
          ))}
        </ul>
      </div>
      <div
        role="tab"
        tabIndex="0"
        ref={contentWrapperRef}
        className={contentWrapper}
        onScroll={contentWrapperScrollHandler}
      >
        {filteredHelpItems.map((tab: Object, index: number) => (
          <HelpItemContent key={index} data={tab} ref={contentRefs[index]} />
        ))}
      </div>
    </div>
  )
}

export default HelpInterior
