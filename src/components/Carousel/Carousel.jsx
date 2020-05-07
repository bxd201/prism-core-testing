// @flow
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import './Carousel.scss'
import times from 'lodash/times'
import isFunction from 'lodash/isFunction'
import { KEY_CODES } from 'src/constants/globals'

type ComponentProps = {
  BaseComponent: any,
  data: Object[],
  defaultItemsPerView: number,
  isInfinity: boolean,
  tabId?: string,
  setTabId?: string => void,
  tabMap?: string[],
  initPosition?: number,
  setInitialPosition?: number => void,
  btnRefList?: Object[],
  getSummaryData?: object=> void,
   // eslint-disable-next-line react/no-unused-prop-types
  baseSceneData?: Object,
  // eslint-disable-next-line react/no-unused-prop-types
  deleteSavedScene?: Function,
  // eslint-disable-next-line react/no-unused-prop-types
  selectSavedScene?: Function,
  // eslint-disable-next-line react/no-unused-prop-types
  selectAnonStockScene?: Function
}

const baseClass = 'prism-slick-carousel'
const contentWrapper = `${baseClass}__wrapper__content`
const indicators = `${baseClass}__wrapper__indicators`
let nonTransition = false

export default (props: ComponentProps) => {
  const { BaseComponent, defaultItemsPerView, data, isInfinity, tabId, setTabId, tabMap, setInitialPosition, initPosition, btnRefList, getSummaryData } = props
  const [position, setPosition] = useState(initPosition || 0)
  const [focusIndex, setCurrentFocusItem] = useState(1)
  // tracks the previous position
  const prevPositionRef = useRef()
  const prevPosition = prevPositionRef.current
  useEffect(() => { prevPositionRef.current = position })

  // update the position when tabId changes only if the position hasn't changed (tab button was clicked)
  useEffect(() => {
    prevPosition === position && tabMap && setPosition(tabMap.findIndex(e => e === tabId))
  }, [position, tabId])

  const pageNumber = isInfinity ? Math.floor(position + 1) : Math.floor(position / defaultItemsPerView)
  const slideList = []
  if (data.length > 0) {
    const indexedData = data.map((item, i) => {
      return { ...item, itemIndex: i }
    })
    const count = Math.floor(data.length / defaultItemsPerView)
    const numsOfViews = isInfinity ? count : count + 1
    for (let i = 0; i < numsOfViews; i++) {
      const dataPerView: Object[] = indexedData.slice(i * defaultItemsPerView, i * defaultItemsPerView + defaultItemsPerView)
      slideList.push(dataPerView)
    }
    if (isInfinity) {
      slideList.push([data[0]])
      const dataPerView: Object[] = data.slice(-1)
      slideList.unshift(dataPerView)
    }
  }

  const handlePrev = () => {
    const currPosition = position - defaultItemsPerView
    isFunction(setInitialPosition) && setInitialPosition(currPosition)
    setPosition(currPosition)
    if (position === 0) {
      tabMap && setTabId && setTabId(tabMap[data.length - 1])
      setTimeout(() => {
        nonTransition = true
        setPosition(data.length - 1)
        nonTransition = false
      }, 300)
    } else {
      tabMap && setTabId && setTabId(tabMap[position - defaultItemsPerView])
    }
  }

  const handleNext = () => {
    const currPosition = position + defaultItemsPerView
    isFunction(setInitialPosition) && setInitialPosition(currPosition)
    setPosition(currPosition)
    if (position + defaultItemsPerView === data.length) {
      tabMap && setTabId && setTabId(tabMap[defaultItemsPerView - 1])
      setTimeout(() => {
        nonTransition = true
        setPosition(defaultItemsPerView - 1)
        nonTransition = false
      }, 300)
    } else {
      tabMap && setTabId && setTabId(tabMap[position + defaultItemsPerView])
    }
  }

  const onKeyDown = useCallback((e) => {
    if (e.shiftKey && e.keyCode === KEY_CODES.KEY_CODE_TAB) {
      if (focusIndex !== 1 && focusIndex % defaultItemsPerView === 1) { handlePrev() }
      focusIndex > 1 && setCurrentFocusItem(focusIndex - 1)
    } else if (e.keyCode === KEY_CODES.KEY_CODE_TAB) {
      if (focusIndex !== btnRefList.length && focusIndex % defaultItemsPerView === 0) {
        e.preventDefault()
        handleNext()
        setTimeout(() => { btnRefList[focusIndex].current.focus() }, 300)
      }
      focusIndex <= btnRefList.length - 1 && setCurrentFocusItem(focusIndex + 1)
    } else if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) {
      getSummaryData(data[focusIndex - 1])
    }
  })

  return (
    <div className={`${baseClass}__wrapper`}>
      <div className={`${contentWrapper}`}>
        <div className={`${contentWrapper}__prev-btn__wrapper`}>
          {(isInfinity || position >= defaultItemsPerView) && <button className={`${contentWrapper}__buttons`} onClick={handlePrev} aria-label='previous'>
            <FontAwesomeIcon icon={['fa', 'chevron-left']} />
          </button>}
        </div>
        <div className={`${contentWrapper}__list__wrapper ${isInfinity ? `${contentWrapper}__list__wrapper--loop` : ''}`}>
          <div
            className={`collection-list__container  ${nonTransition ? `collection-list__container--non-transition` : ''}`}
            style={{ transform: `translateX(-${pageNumber * 100}%)` }}
          >
            {slideList && slideList.map((slide: any, index: number) => {
              // this complicated boolean expression allows us to avoid fetching images before we need them
              const shouldRender = (Array.isArray(btnRefList)) || pageNumber === index || pageNumber === index + 1 || pageNumber === index - 1 || (isInfinity && (
                // about to jump to page: data.length - 1 so load pages: [data.length - 2, data.length - 1, data.length]
                (pageNumber < 1 && (index > data.length - 2)) ||
                // about to jump to page: 1 so load pages [0, 1, 2]
                (pageNumber > data.length - 3 && (index < 2))
              ))

              return (
                <div key={index} className='collection-list__wrapper'>
                  {shouldRender && slide.map((item, key) => {
                    return (
                      <BaseComponent
                        className='collection-list__component'
                        key={`slide-${item.itemIndex}`}
                        itemNumber={item.itemIndex}
                        {...props}
                        data={item}
                        handlePrev={handlePrev}
                        handleNext={handleNext}
                        itemsPerView={defaultItemsPerView}
                        isActivedPage={index === pageNumber}
                        totalItems={data.length}
                        onKeyDown={onKeyDown}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
        <div className={`${contentWrapper}__next-btn__wrapper`}>
          {(isInfinity || position + defaultItemsPerView < data.length) && <button className={`${contentWrapper}__buttons`} onClick={handleNext} aria-label='next'>
            <FontAwesomeIcon icon={['fa', 'chevron-right']} />
          </button>}
        </div>
      </div>
      {isInfinity || <div className={`${indicators}`}>
        {times(data.length <= defaultItemsPerView ? 0 : Math.ceil(data.length / defaultItemsPerView), i => (
          <FontAwesomeIcon
            key={i}
            className={`${indicators}__icons ${indicators}__icons--${i === Math.floor(position / defaultItemsPerView) ? '' : 'un'}active`}
            icon={['fa', 'circle']}
          />
        ))}
      </div>}
    </div>
  )
}
