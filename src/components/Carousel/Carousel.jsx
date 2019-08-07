// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faChevronLeft, faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import CollectionSummary from './CollectionSummary'
import { varValues } from 'variables'
import './Carousel.scss'

type ComponentProps = {
  data: Object[],
  tabMap?: any,
  defaultItemsPerView: number,
  isInfinity: boolean,
  showTab?: Function
}

type ComponentState = {
  curr: number,
  itemsPerView: number,
  width: number
}

const baseClass = 'prism-slick-carousel'
const contentWrapper = `${baseClass}__wrapper__content`
const indicators = `${baseClass}__wrapper__indicators`
const ListWithCarousel = (BaseComponent: any) => {
  class EnhanceComponent extends React.Component<ComponentProps, ComponentState> {
    nonTransition: boolean
    dotsNumbers: number
    constructor (props: ComponentProps) {
      super(props)
      const { data, defaultItemsPerView, isInfinity } = props
      this.state = {
        curr: 0,
        itemsPerView: defaultItemsPerView,
        width: window.innerWidth
      }

      this.nonTransition = false
      this.dotsNumbers = isInfinity ? 0 : Math.floor(data.length / defaultItemsPerView) + (data.length > defaultItemsPerView ? 1 : 0)
    }

    componentDidMount () {
      this.updateWindowDimensions()
      window.addEventListener('resize', this.updateWindowDimensions)
    }

    componentWillUnmount () {
      window.removeEventListener('resize', this.updateWindowDimensions)
    }

    // Display different rows per view for slider based on different screen size
    updateWindowDimensions = () => {
      const { width } = this.state
      const { defaultItemsPerView } = this.props
      let screenSize
      if (width <= varValues.slick.mobile) {
        screenSize = varValues.slick.xs
      }
      if (width > varValues.slick.mobile && width <= varValues.slick.tablet) {
        screenSize = varValues.slick.sm
      }
      if (width > varValues.slick.tablet) {
        screenSize = varValues.slick.lg
      }
      if (!defaultItemsPerView) {
        this.setState({ width: window.innerWidth, itemsPerView: screenSize }, () => {
          this.updateIndicatorsNumber()
        })
      }
    };

    // update Indicators List when scree size change
    updateIndicatorsNumber= () => {
      const { data } = this.props
      const { itemsPerView } = this.state
      this.dotsNumbers = Math.floor(data.length / itemsPerView) + (data.length > itemsPerView ? 1 : 0)
    }

    isShowSlideButton = () => {
      const { curr, itemsPerView } = this.state
      const { data, isInfinity } = this.props
      let buttonVisibility = {
        isHidePrevButton: false,
        isHideNextButton: true
      }
      if (!isInfinity) {
        if (curr >= itemsPerView) {
          buttonVisibility.isHidePrevButton = true
        }
        if (curr + itemsPerView >= data.length) {
          buttonVisibility.isHideNextButton = false
        }
      } else {
        buttonVisibility.isHidePrevButton = true
        buttonVisibility.isHidePrevButton = true
      }
      return buttonVisibility
    }

    handlePrev = () => {
      const { curr, itemsPerView } = this.state
      const { data, isInfinity, tabMap, showTab } = this.props
      if (curr >= itemsPerView) {
        this.setState({ curr: curr - itemsPerView })
      }
      if (isInfinity) {
        if (curr < itemsPerView) {
          this.nonTransition = true
          tabMap && showTab && showTab(tabMap[data.length - 1], false)
          this.setState({ curr: data.length })
          setTimeout(() => {
            this.nonTransition = false
            this.setState({ curr: data.length - 1 })
          }, 10)
        } else {
          tabMap && showTab && showTab(tabMap[curr - 1], false)
        }
      }
    };

    handleNext = () => {
      const { curr, itemsPerView } = this.state
      const { data, isInfinity, tabMap, showTab } = this.props
      this.nonTransition = false
      if (curr + itemsPerView < data.length) {
        this.setState({ curr: curr + itemsPerView })
      }
      if (isInfinity) {
        if (curr + itemsPerView === data.length) {
          tabMap && showTab && showTab(tabMap[0], false)
          this.nonTransition = true
          this.setState({ curr: -1 })
          setTimeout(() => {
            this.nonTransition = false
            this.setState({ curr: 0 })
          }, 10)
        } else {
          tabMap && showTab && showTab(tabMap[curr + 1], false)
        }
      }
    };

    renderPageIndicatorList = () => {
      const { curr, itemsPerView } = this.state
      let el = []
      let activedView = Math.floor(curr / itemsPerView)
      for (let i = 0; i < this.dotsNumbers; i++) {
        if (activedView === i) {
          el.push(<FontAwesomeIcon key={i} className={`${indicators}__icons ${indicators}__icons--active`} icon={faCircle} />)
        } else {
          el.push(<FontAwesomeIcon key={i} className={`${indicators}__icons ${indicators}__icons--unactive`} icon={faCircle} />)
        }
      }
      return el
    }

    renderingSlider = () => {
      const { data, isInfinity } = this.props
      const { itemsPerView } = this.state
      const slideList = []
      if (data.length > 0) {
        const count = Math.floor(data.length / itemsPerView)
        const numsOfViews = isInfinity ? count : count + 1
        for (let i = 0; i < numsOfViews; i++) {
          const dataPerView: Object[] = data.slice(i * itemsPerView, i * itemsPerView + itemsPerView)
          slideList.push(dataPerView)
        }
        if (isInfinity) {
          slideList.push([data[0]])
          const dataPerView: Object[] = data.slice(-1)
          slideList.unshift(dataPerView)
        }
        return slideList
      }
    }
    render () {
      const { curr, itemsPerView } = this.state
      const { isInfinity } = this.props
      const { isHidePrevButton, isHideNextButton } = this.isShowSlideButton()
      const pageIndicatorList = this.renderPageIndicatorList()
      const slideList = this.renderingSlider()
      const pageNumber = isInfinity ? Math.floor(curr + 1) : Math.floor(curr / itemsPerView)
      return (
        <div className={`${baseClass}__wrapper`}>
          <div className={`${contentWrapper}`}>
            <div className={`${contentWrapper}__prev-btn__wrapper`}>
              {
                <button className={`${contentWrapper}__buttons ${!isHidePrevButton ? `${contentWrapper}__buttons--visible` : ''}`} onClick={this.handlePrev}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>}
            </div>
            <div className={`${contentWrapper}__list__wrapper ${isInfinity ? `${contentWrapper}__list__wrapper--loop` : ''}`}>
              <div className={`collection-list__container  ${this.nonTransition ? `collection-list__container--non-transition` : ''}`} style={{ transform: `translateX(-${pageNumber * 100}%)` }}>
                {
                  slideList && slideList.map((slide: any, index: number) => {
                    return (
                      <div key={index} className={`collection-list__wrapper`}>
                        {
                          slide.map((item, key) => (
                            <BaseComponent className='collection-list__component' key={key} {...this.props} data={item} isActivedPage={index === pageNumber} isRenderingPage={index === pageNumber || index - 1 === pageNumber || index + 1 === pageNumber} />
                          ))
                        }
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div className={`${contentWrapper}__next-btn__wrapper`}>
              {
                <button className={`${contentWrapper}__buttons ${!isHideNextButton ? `${contentWrapper}__buttons--visible` : ''}`} onClick={this.handleNext}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              }
            </div>
          </div>
          <div className={`${indicators}`}>
            {
              pageIndicatorList.map(el => el)
            }
          </div>
        </div>
      )
    }
  }
  return EnhanceComponent
}
export default ListWithCarousel
export const ColorListWithCarousel = ListWithCarousel(CollectionSummary)
