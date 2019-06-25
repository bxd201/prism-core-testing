// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faChevronLeft, faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import CollectionSummary from './CollectionSummary'
import { varValues } from 'variables'
import './Carousel.scss'

type ComponentProps = {
  data: Array,
  defaultItemsPerView: number
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
    constructor (props) {
      super(props)
      const { data } = props
      this.state = {
        curr: 0,
        itemsPerView: 8,
        width: window.innerWidth
      }
      this.dotsNumbers = Math.floor(data.length / 8) + (data.length > 8 ? 1 : 0)
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
      this.setState({ width: window.innerWidth, itemsPerView: screenSize }, () => {
        this.updateIndicatorsNumber()
      })
    };

    // update Indicators List when scree size change
    updateIndicatorsNumber= () => {
      const { data } = this.props
      const { itemsPerView } = this.state
      this.dotsNumbers = Math.floor(data.length / itemsPerView) + (data.length > itemsPerView ? 1 : 0)
    }

    isShowSlideButton = () => {
      const { curr, itemsPerView } = this.state
      const { data } = this.props
      let buttonVisibility = {
        isHidePrevButton: false,
        isHideNextButton: true
      }
      if (curr >= itemsPerView) {
        buttonVisibility.isHidePrevButton = true
      }
      if (curr + itemsPerView >= data.length) {
        buttonVisibility.isHideNextButton = false
      }
      return buttonVisibility
    }

    handlePrev = () => {
      const { curr, itemsPerView } = this.state

      if (curr >= itemsPerView) {
        this.setState({ curr: curr - itemsPerView })
      }
    };

    handleNext = () => {
      const { curr, itemsPerView } = this.state
      const { data } = this.props

      if (curr + itemsPerView < data.length) {
        this.setState({ curr: curr + itemsPerView })
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
      const { data } = this.props
      const { itemsPerView } = this.state
      let slideList = []
      if (data.length > 0) {
        const numsOfViews = Math.floor(data.length / itemsPerView) + 1
        for (let i = 0; i < numsOfViews; i++) {
          let dataPerView = data.slice(i * itemsPerView, i * itemsPerView + itemsPerView)
          slideList.push(dataPerView)
        }
        return slideList
      }
    }

    render () {
      const { curr, itemsPerView } = this.state
      const { isHidePrevButton, isHideNextButton } = this.isShowSlideButton()
      const pageIndicatorList = this.renderPageIndicatorList()
      let slideList = this.renderingSlider()
      const pageNumber = Math.floor(curr / itemsPerView)
      return (
        <div className={`${baseClass}__wrapper`}>
          <div className={`${contentWrapper}`}>
            <div className={`${contentWrapper}__prev-btn__wrapper`}>
              {
                <button className={`${contentWrapper}__buttons ${!isHidePrevButton && `${contentWrapper}__buttons--visible`}`} onClick={this.handlePrev}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>}
            </div>
            <div className={`${contentWrapper}__list__wrapper`}>
              <div className='collection-list__container' style={{ transform: `translateX(-${pageNumber * 100}%)` }}>
                {
                  slideList.map((slide, index) => {
                    return (
                      <div key={index} className='collection-list__wrapper'>
                        {
                          slide.map((item, key) => (
                            <BaseComponent className='collection-list__component' key={key} {...this.props} data={item} />
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
                <button className={`${contentWrapper}__buttons ${!isHideNextButton && `${contentWrapper}__buttons--visible`}`} onClick={this.handleNext}>
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
