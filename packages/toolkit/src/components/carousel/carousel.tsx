import React, { CSSProperties,useCallback, useEffect, useRef, useState } from 'react'
import { faChevronLeft,faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classnames from 'classnames'
import isFunction from 'lodash/isFunction'
import noop from 'lodash/noop'
import { KEY_CODES } from '../../constants'
import { FlatScene, FlatVariant } from '../../interfaces/scene'

export const TEST_ID = {
  PREV: 'carousel-prev',
  NEXT: 'carousel-next',
  INDICATOR: 'carousel-indicator'
}

interface CarouselPagerProps {
  onClick: () => void
  dir: 'prev' | 'next'
  label?: string
  icon?: JSX.Element
}

const CarouselPager = ({ dir, onClick, label, icon }: CarouselPagerProps): JSX.Element => {
  const [isHovered, setHovered] = useState(false)

  const className = classnames(
    'border',
    'fill-current',
    'cursor-pointer',
    'outline-secondary',
    'outline-2',
    'focus:outline'
  )

  const style: CSSProperties = {
    backgroundColor: isHovered
      ? 'var(--prism-theme-color-button-hover-bg-color, #f2f2f2)'
      : 'var(--prism-theme-color-button-bg-color, #fff)',
    borderColor: isHovered
      ? 'var(--prism-theme-color-button-hover-border, #0069af)'
      : 'var(--prism-theme-color-button-border, #0069af)',
    color: isHovered ? '(--prism-theme-color-button-hover-color, #000)' : 'var(--prism-theme-color-button-color, #000)',
    fontSize: '1em',
    padding: '1em',
    zIndex: isHovered ? 100 : 'auto'
  }

  const onMouseOver = (): void => setHovered(true)
  const onMouseOut = (): void => setHovered(false)

  return (
    <button
      style={style}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseOver}
      onMouseLeave={onMouseOut}
      aria-label={label}
      data-testid={dir === 'prev' ? TEST_ID.PREV : TEST_ID.NEXT}
    >
      {icon ?? <FontAwesomeIcon icon={dir === 'prev' ? faChevronLeft : faChevronRight} />}
    </button>
  )
}

interface CarouselIndicatorProps {
  index: number
  isActive?: boolean
}

const CarouselIndicator = ({ index, isActive = false }: CarouselIndicatorProps): JSX.Element => {
  const className = classnames(
    'inline-block',
    'rounded-full',
    'w-2.5',
    'h-2.5',
    'mx-1.5',
    { 'transition-none': isActive },
    { 'transition-all duration-100 ease-out': !isActive }
  )

  let style: CSSProperties

  if (isActive) {
    style = {
      background: 'var(--prism-theme-color-tertiary-bg, #000)',
      boxShadow: '0 0 0 0.5px var(--prism-theme-color-button-color-contrast-transer, rgb(255 255 255 / 60%))'
    }
  } else {
    style = {
      background: 'var(--prism-theme-color-button-bg-color-darker-trans, rgba(217, 217, 217, 0.9))',
      boxShadow: '0 0 1px 0 var(--prism-theme-color-button-bg-color-darker-contrast-transer, rgb(0 0 0 / 60%))'
    }
  }

  return (
    <span className={className} style={style} data-testid={TEST_ID.INDICATOR}>
      <span className='sr-only'>Page {index + 1}</span>
    </span>
  )
}

interface DirectionalButtonOptions {
  label?: string
  icon?: JSX.Element
}

export interface CarouselProps {
  BaseComponent: any
  btnRefList?: Array<React.MutableRefObject<HTMLButtonElement>>
  data: Object[]
  defaultItemsPerView: number
  getSummaryData?: (Object) => void
  initPosition?: number
  isInfinity: boolean
  pagerPosition?: 'bottom' | 'center' | 'top'
  setInitialPosition?: (number) => void
  setTabId?: (string) => void
  tabId?: string
  tabMap?: string[]
  // These props are automagically passed hence the need for comments to silence them
  deleteSavedScene?: Function
  leftButton?: DirectionalButtonOptions
  rightButton?: DirectionalButtonOptions
  scenes?: FlatScene[]
  selectAnonStockScene?: Function
  selectSavedScene?: Function
  showPageIndicators?: boolean
  variants?: FlatVariant[]
}

let nonTransition = false

const Carousel = (props: CarouselProps): JSX.Element => {
  const {
    BaseComponent,
    btnRefList = [],
    data,
    defaultItemsPerView,
    getSummaryData = noop,
    initPosition,
    isInfinity = false,
    pagerPosition = 'center',
    setInitialPosition,
    setTabId,
    showPageIndicators = false,
    tabId,
    tabMap = [],
    leftButton,
    rightButton
  } = props
  const [position, setPosition] = useState(initPosition || 0)
  const [focusIndex, setCurrentFocusItem] = useState(1)
  // tracks the previous position
  const prevPositionRef = useRef<number>()
  const prevPosition = prevPositionRef.current
  useEffect(() => {
    prevPositionRef.current = position
  })

  // update the position when tabId changes only if the position hasn't changed (tab button was clicked)
  useEffect(() => {
    prevPosition === position && tabMap && setPosition(tabMap.findIndex((e) => e === tabId))
    nonTransition = false
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
      const dataPerView: Object[] = indexedData.slice(
        i * defaultItemsPerView,
        i * defaultItemsPerView + defaultItemsPerView
      )
      slideList.push(dataPerView)
    }
    if (isInfinity) {
      slideList.push([data[0]])
      const dataPerView: Object[] = data.slice(-1)
      slideList.unshift(dataPerView)
    }
  }

  const handlePrev = (): void => {
    const currPosition = position - defaultItemsPerView
    isFunction(setInitialPosition) && setInitialPosition(currPosition)
    setPosition(currPosition)
    if (position === 0) {
      tabMap && setTabId && setTabId(tabMap[data.length - 1])
      setTimeout(() => {
        nonTransition = true
        setPosition(data.length - 1)
      }, 300)
    } else {
      tabMap && setTabId && setTabId(tabMap[position - defaultItemsPerView])
    }
  }

  const handleNext = (): void => {
    const currPosition = position + defaultItemsPerView
    isFunction(setInitialPosition) && setInitialPosition(currPosition)
    setPosition(currPosition)
    if (position + defaultItemsPerView === data.length) {
      tabMap && setTabId && setTabId(tabMap[defaultItemsPerView - 1])
      setTimeout(() => {
        nonTransition = true
        setPosition(defaultItemsPerView - 1)
      }, 300)
    } else {
      tabMap && setTabId && setTabId(tabMap[position + defaultItemsPerView])
    }
  }

  const onKeyDown = useCallback(
    (e) => {
      if (e.shiftKey && e.keyCode === KEY_CODES.KEY_CODE_TAB) {
        if (focusIndex !== 1 && focusIndex % defaultItemsPerView === 1) {
          handlePrev()
        }
        focusIndex > 1 && setCurrentFocusItem(focusIndex - 1)
      } else if (e.keyCode === KEY_CODES.KEY_CODE_TAB) {
        if (focusIndex !== btnRefList.length && focusIndex % defaultItemsPerView === 0) {
          e.preventDefault()
          handleNext()
          setTimeout(() => {
            btnRefList[focusIndex].current.focus()
          }, 300)
        }
        focusIndex <= btnRefList.length - 1 && setCurrentFocusItem(focusIndex + 1)
      } else if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) {
        getSummaryData(data[focusIndex - 1])
      }
    },
    [focusIndex, defaultItemsPerView]
  )

  const pager = {
    bottom: {
      alignment: 'flex-wrap justify-center',
      left: `mr-3 mb-4${isInfinity ? ' mt-12' : '' }`,
      right: `ml-3 mb-4${isInfinity ? ' mt-12' : '' }`,
      slideOrder: 'order-none',
      style: { order: '1', transform: 'translate(0%, -50%)' }
    },
    center: {
      alignment: 'justify-between',
      left: 'absolute left-0 top-1/2',
      right: 'absolute right-0 top-1/2',
      slideOrder: 'order-none',
      style: { order: '0', transform: 'translate(0%, -50%)', zIndex: 1000 }
    },
    top: {
      alignment: 'flex-wrap justify-center',
      left: 'mr-3',
      right: 'ml-3',
      slideOrder: 'order-1',
      style: isInfinity ? { order: '0' } : { order: '0', transform: 'translate(0%, 50%)' }
    }
  }

  return (
    <div className='relative w-full'>
      <div className={`flex ${pager[pagerPosition].alignment}`}>
        <div
          className={`flex items-center ${pager[pagerPosition].left}`}
          style={pager[pagerPosition].style}
        >
          {(isInfinity || position >= defaultItemsPerView) && (
            <CarouselPager dir='prev' onClick={handlePrev} icon={leftButton?.icon} label={leftButton?.label} />
          )}
        </div>
        <div
          className={`h-full w-full overflow-hidden py-12 ${
            isInfinity ? 'pt-0 pr-0 pb-0 pl-0 sm:pt-4 sm:pr-20 sm:pb-0 sm:pl-20' : ''
          } ${pager[pagerPosition].slideOrder}`}
        >
          <div
            className={`whitespace-nowrap ease-in-out${nonTransition ? '' : ' duration-300'}`}
            style={{ transform: `translateX(-${pageNumber * 100}%)` }}
          >
            {slideList?.map((slide: any, index: number) => {
              // this complicated boolean expression allows us to avoid fetching images before we need them
              const shouldRender =
                Array.isArray(btnRefList) ||
                pageNumber === index ||
                pageNumber === index + 1 ||
                pageNumber === index - 1 ||
                (isInfinity &&
                  // about to jump to page: data.length - 1 so load pages: [data.length - 2, data.length - 1, data.length]
                  ((pageNumber < 1 && index > data.length - 2) ||
                    // about to jump to page: 1 so load pages [0, 1, 2]
                    (pageNumber > data.length - 3 && index < 2)))

              return (
                <div key={index} className='inline-flex flex-wrap justify-center w-full align-top'>
                  {shouldRender &&
                    slide.map((item, key) => {
                      return (
                        <BaseComponent
                          className='collection-list__component'
                          key={`slide-${index}-${key as string}`}
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
          {showPageIndicators && slideList && slideList.length > 1 ? (
            <div className='absolute w-full text-center' style={{ lineHeight: 0, bottom: '10px', left: '0' }}>
              {slideList.map((slide, i: number) => {
                if (tabMap.length > 0) {
                  const activeTab = tabMap[pageNumber - 1] ?? tabMap[tabMap.length - 1]
                  const isActivePage = pageNumber === i + 1

                  if (activeTab && activeTab === tabMap[i]) {
                    return <CarouselIndicator key={`carousel-indicator-${i}`} index={i} isActive={isActivePage} />
                  }

                  return null
                } else {
                  const isActivePage = pageNumber === i

                  return <CarouselIndicator key={`carousel-indicator-${i}`} index={i} isActive={isActivePage} />
                }
              })}
            </div>
          ) : null}
        </div>
        <div
          className={`flex items-center ${pager[pagerPosition].right}`}
          style={pager[pagerPosition].style}
        >
          {(isInfinity || position + defaultItemsPerView < data.length) && (
            <CarouselPager dir='next' onClick={handleNext} icon={rightButton?.icon} label={rightButton?.label} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Carousel
