// @flow
import React, { useState, useEffect } from 'react'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import { helpTabs, KEY_CODE_ENTER, KEY_CODE_SPACE, helpHeader } from './data'
import './Help.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import debounce from 'lodash/debounce'
import smoothscroll from 'smoothscroll-polyfill'

const baseClass = `help`
const wrapper = `${baseClass}__wrapper`
const tabsContainer = `${baseClass}__tabs-container`
const contentWrapper = `${baseClass}__content-wrapper`
const helpContent = `${baseClass}__help-content`
const helpContentHide = `${helpContent}--hide`
const activeLi = `active`
const inactiveLi = `inactive`
const contentHeader = `${baseClass}__content-header`
const contentDetails = `${baseClass}__content-details`
const subContent = `${baseClass}__subcontent`
const subContentHeader = `${baseClass}__subContent-header`
const subContentDetails = `${baseClass}__subContent-details`
const helpIcons = `${baseClass}__help-icons`
const helpImages = `${baseClass}__help-images`
const helpImagesMobile = `${baseClass}__help-images-mobile`
const iconWrap = `${baseClass}__icon-wrap`
const iconWrapUndoRedo = `${baseClass}__icon-wrap-undoredo`
const iconInfo = `${baseClass}__icon-info`
const secondIcon = `${baseClass}__second-icon`

type Props = {
  setHeader: Function
}

smoothscroll.polyfill()

let isTabClick: boolean = false

const helpTabsHeaderList = (activeTabIndex: number, setActiveTabIndex: Function, handleClick: Function) => {
  return helpTabs.map((tab: Object, index: number) => {
    return (
      <li
        key={`hints-tab-${index}`}
        className={(index === activeTabIndex) ? activeLi : inactiveLi}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => showTabContent(e, index, setActiveTabIndex, false, handleClick)}
        onKeyDown={(e) => showTabContent(e, index, setActiveTabIndex, true, handleClick)}
        role='tab'
        tabIndex='0'
      >
        {tab.header}
      </li>
    )
  })
}

const helpTabsContentList = (refs: Object) => {
  return helpTabs.map((tab: Object, index: number) => {
    const tabContent = tab.content
    const imageList = tab.imageList
    const tabSubContent = tab.subContent
    const imageListMobile = tab.imageListMobile
    return (
      <div ref={refs[index]} key={`content-${index}`} className={`${helpContent} ${tab.isHiddenMobile ? helpContentHide : ''}`}>
        <div className={`${contentHeader}`}>
          <h2>{tab.header}</h2>
          <span>{tab.subHeader}</span>
        </div>
        <div className={`${contentDetails}`}>
          {
            (tabContent) ? <ul className={`${helpIcons}`}>
              {
                tabContent && tabContent.map((tab: Object, index: number) => {
                  const iconProps = {}
                  if (!Array.isArray(tab.fontAwesomeIcon) && tab.fontAwesomeIcon.flip) {
                    iconProps.flip = tab.fontAwesomeIcon.flip
                  }
                  if (!Array.isArray(tab.fontAwesomeIcon) && tab.fontAwesomeIcon.size) {
                    iconProps.size = `${tab.fontAwesomeIcon.size}`
                  }
                  return <li key={`li-${index}`}>
                    <div className={`${iconWrap} ${(tab.isUndoRedo) ? `${iconWrapUndoRedo}` : ``}`}>
                      {
                        (Array.isArray(tab.fontAwesomeIcon))
                          ? tab.fontAwesomeIcon.map((fontIcon, index) => {
                            if (fontIcon.flip) {
                              iconProps.flip = fontIcon.flip
                            }
                            if (fontIcon.size) {
                              iconProps.size = `${fontIcon.size}`
                            }
                            return <FontAwesomeIcon key={`icon-${index}`} className={`${(index > 0 && !tab.isUndoRedo) ? secondIcon : ``}`} icon={[fontIcon.variant, fontIcon.icon]} size='lg' transform={{ rotate: fontIcon.rotate }} {...iconProps} />
                          }) : <FontAwesomeIcon className={``} icon={[tab.fontAwesomeIcon.variant, tab.fontAwesomeIcon.icon]} size='lg' transform={{ rotate: tab.fontAwesomeIcon.rotate }} {...iconProps} />
                      }
                    </div>
                    <div className={`${iconInfo}`}>
                      <h3>
                        {tab.iconInfoName}
                      </h3>
                      <p>
                        {tab.iconInfoContent[0]}
                      </p>
                    </div>
                  </li>
                })
              }
            </ul> : (imageList) ? <ul className={`${helpImages}`}>
              {
                imageList && imageList.map((imageData, index) => {
                  return <li key={`li-${index}`} className={`${(index > 0) ? `cel cel-${index}` : ``}`}>
                    <img src={`${imageData.imagePath}`} alt={`${imageData.alt}`} />
                  </li>
                })
              }
            </ul> : ''
          }
          {
            imageListMobile && <ul className={`${helpImagesMobile}`}>
              {
                imageListMobile.map((list, index) => {
                  return <li key={`li-mobile-image-${index}`} className={`cel`}>
                    <img src={`${list.imagePath}`} alt={`${list.alt}`} />
                  </li>
                })
              }
            </ul>
          }
        </div>
        {tabSubContent && tabSubContent.map((content, index) => {
          return (
            <div key={`tabSubContent-${index}`} className={`${subContent}`}>
              <div className={`${subContentHeader}`}>
                {content.header}
              </div>
              <p className={`${subContentDetails}`}>
                {content.content}
              </p>
            </div>
          )
        })}
      </div>
    )
  })
}

const showTabContent = (e: SyntheticEvent, index: number, setActiveTabIndex: Function, isKeyDown: boolean = false, handleClick: Function) => {
  if (isKeyDown) {
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      e.preventDefault()
      isTabClick = true
      setActiveTabIndex(index)
      handleClick(index)
    }
  } else {
    isTabClick = true
    setActiveTabIndex(index)
    handleClick(index)
  }
}

const getElementWindowTop = (elem: RefObject, contentWrapperRef: RefObject) => {
  return elem && typeof elem.getBoundingClientRect === 'function' ? elem.getBoundingClientRect().top - contentWrapperRef.current.getBoundingClientRect().top : 0
}

const Help = ({ setHeader }: Props) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const contentWrapperRef = React.createRef()

  useEffect(() => {
    setHeader(helpHeader)
  })

  const refs = helpTabs.reduce((acc, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})

  const handleClick = (id: number) => {
    refs[id].current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
    setTimeout(() => { isTabClick = false }, 200)
  }

  const contentWrapperScrollHandler = debounce(() => {
    if (!isTabClick) {
      scrollFinished()
    }
  }, 200)

  const scrollFinished = () => {
    let currentVisible = 0
    const positionWithKey = []
    for (let [key] of Object.entries(refs)) {
      const topPosition = parseInt(getElementWindowTop(refs[key].current, contentWrapperRef))
      positionWithKey.push(topPosition)
      if (topPosition < -400) {
        currentVisible = parseInt(key) + 1
      }
    }
    setActiveTabIndex(currentVisible)
  }

  return (
    <div className={`${wrapper}`}>
      <div className={`${tabsContainer}`}>
        <ul>
          {helpTabsHeaderList(activeTabIndex, setActiveTabIndex, handleClick)}
        </ul>
      </div>
      <div role='tab' tabIndex='0' ref={contentWrapperRef} className={`${contentWrapper}`} onScroll={contentWrapperScrollHandler}>
        {helpTabsContentList(refs)}
      </div>
    </div>
  )
}

export default CollectionsHeaderWrapper(Help)
