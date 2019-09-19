// @flow
import CollectionDetail from './CollectionDetail'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ColorCollectionsTab from './ColorCollectionsTab'
import ExpertColorDetails from '../Carousel/ExpertColorDetails'
import React, { useState, useEffect } from 'react'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'

import { ColorListWithCarousel } from '../Carousel/Carousel'
import { connect } from 'react-redux'
import { expertColorsData } from '../Carousel/data'
import { injectIntl } from 'react-intl'
import { loadCollectionSummaries as loadCS } from '../../store/actions/collectionSummaries'
import { loadColors } from '../../store/actions/loadColors'

import './ColorCollections.scss'

type Props = {
  categories: Object,
  colorMap: Object,
  config: Object,
  intl: Object,
  isExpertColor: boolean,
  isShowBack: boolean,
  loadColors: Function,
  loadCS: Function,
  setHeader: Function,
  showBack: Function,

}

const baseClass = 'color-collections'
const wrapper = `${baseClass}__wrapper`
export const collectionsList = `${baseClass}__collections-list`

ColorCollections.collectionData = []

ColorCollections.getSummary = function getSummary (id, props) {
  const {
    name,
    thumbUrl: img,
    description,
    colorIds
    // ...rest // has a bunch of stuff

  } = props.summaries.data[props.summaries.idToIndexHash[id]]

  return {
    collections: colorIds
      .map(id => props
        .colorMap[id]
      ).filter(collection => collection),
    description,
    img,
    name
  }
}

ColorCollections.getSummariesForTab = function getSummariesForTab (
  tabId, props
) {
  const category = props
    .categories
    .data[props.categories.idToIndexHash[tabId]]

  if (category) {
    return category.summaryIds.reduce(
      (summaries, summaryId) => {
        summaries.push(ColorCollections.getSummary(summaryId, props))
        return summaries
      },
      []
    )
  }

  return []
}

ColorCollections.updateCollectionData = function updateCollectionData ({
  data = expertColorsData,
  props = {},
  tabId
}) {
  ColorCollections.collectionData = (props.isExpertColor)
    ? data
    : ColorCollections.getSummariesForTab(tabId, props)
}

export function ColorCollections (props: Props) {
  const [hasColors, setHasColors] = useState(!!Object.keys(props.colorMap).length)

  // TODO:noah.hall
  // wtf do we show while loading?
  // check with cody for loading screen
  const [csLoaded, setCsLoaded] = useState(false)
  useEffect(() => {
    if (!csLoaded) {
      setCsLoaded(true)
      props.loadCS()
    }
  })

  const [colorsRequested, setColorsRequested] = useState(false)
  // load colors if dont exist
  if (!colorsRequested && !hasColors) {
    props.loadColors(props.config.brandId, { language: props.intl.locale })
    setColorsRequested(true)
  }

  const { isShowBack, showBack, setHeader, isExpertColor } = props
  const [tabIdShow, showTab] = useState('')
  const [collectionDataDetails, updateCollectionDataDetails] = useState({})

  const showTabHandler = (tabId: string, isClickTab: boolean) => {
    showTab((prevTab) => {
      if (prevTab !== tabId) ColorCollections.updateCollectionData({ tabId, props })

      return tabId
    })
  }

  // initial render, selected tab unknown
  // set selected tab
  if (!tabIdShow && props.categories.data.length) {
    showTabHandler(props.categories.data[0].id)
  }
  // subsequent renders, tab known
  // once colors exist, update collection only once
  if (tabIdShow && !hasColors && Object.keys(props.colorMap).length) {
    setHasColors(true)
    ColorCollections.updateCollectionData({ tabId: tabIdShow, props })
  }

  const headerContent = (isExpertColor)
    ? 'Expert Color Picks'
    : 'Color Collections'

  useEffect(() => {
    if (!isShowBack) {
      setHeader(headerContent)
    }
  }, [isShowBack])

  if (isShowBack === true) {
    return (isExpertColor)
      ? <ExpertColorDetails expertColors={collectionDataDetails} />
      : <CollectionDetail collectionDetailData={collectionDataDetails} />
  }

  const onClickHandler = (collectionSummaryData: Object) => {
    showBack()
    if (!isExpertColor) {
      setHeader(collectionSummaryData.name)
    }
    updateCollectionDataDetails(collectionSummaryData)
  }

  return (
    <div className={`${wrapper}`}>
      {
        (!isExpertColor) &&
          <ColorCollectionsTab
            collectionTabs={props.categories.data}
            showTab={showTabHandler}
            tabIdShow={tabIdShow}
          />
      }
      {
        <div className={`${collectionsList}`}>
          <ColorListWithCarousel
            defaultItemsPerView={8}
            isInfinity={false}
            key={tabIdShow}
            data={ColorCollections.collectionData}
            getSummaryData={onClickHandler}
            isExpertColor={isExpertColor}
          />
        </div>
      }
    </div>
  )
}

const mapStateToProps = (state) => {
  const {
    collectionSummaries: {
      categories,
      summaries
    },
    colors: {
      items: {
        colorMap = {}
      }
    }
  } = state

  return {
    categories,
    summaries,
    colorMap
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadCS () { dispatch(loadCS()) },
    loadColors (brandId, opts) { dispatch(loadColors(brandId, opts)) }
  }
}
export default CollectionsHeaderWrapper(connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(WithConfigurationContext(ColorCollections))))
