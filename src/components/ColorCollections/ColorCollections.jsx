// @flow
import CollectionDetail from '../Shared/CollectionDetail'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import React, { useState, useEffect } from 'react'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
import Carousel from '../Carousel/Carousel'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { loadCollectionSummaries as loadCS } from '../../store/actions/collectionSummaries'
import { loadColors } from '../../store/actions/loadColors'
import './ColorCollections.scss'

type SummaryProps = {
  categories: Object,
  colorMap: Object,
  config: Object,
  intl: Object,
  isShowBack: boolean,
  loadColors: Function,
  loadCS: Function,
  setHeader: string => void,
  showBack: Function,
  summaries: {
    data: any[],
    idToIndexHash: any[]
  },
  collectionSummary?: Object
}

type CollectionDataInput = {
  data?: any,
  props: Object,
  tabId: string,
}

const baseClass = 'color-collections'
const wrapper = `${baseClass}__wrapper`
export const collectionsList = `${baseClass}__collections-list`

ColorCollections.collectionData = []

ColorCollections.getSummary = function getSummary (id, props: SummaryProps) {
  const { name, thumbUrl: img, description, colorIds } = props.summaries.data[props.summaries.idToIndexHash[id]]

  return {
    collections: colorIds.map(id => props.colorMap[id]).filter(collection => collection),
    description,
    img,
    name
  }
}

ColorCollections.getSummariesForTab = function getSummariesForTab (tabId, props) {
  const category = props.categories.data[props.categories.idToIndexHash[tabId]]

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

ColorCollections.updateCollectionData = function updateCollectionData ({ props = {}, tabId }: CollectionDataInput) {
  ColorCollections.collectionData = ColorCollections.getSummariesForTab(tabId, props)
}

export function ColorCollections (props: SummaryProps) {
  const { isShowBack, showBack, setHeader, collectionSummary, categories } = props
  const [hasColors, setHasColors] = useState(!!Object.keys(props.colorMap).length)
  const [tabId, setTabId] = useState('')

  useEffect(() => { props.loadCS() }, [])
  useEffect(() => { props.loadColors(props.config.brandId, { language: props.intl.locale }) }, [])
  useEffect(() => { isShowBack || setHeader('Color Collections') }, [isShowBack])

  const [collectionDataDetails, updateCollectionDataDetails] = useState(collectionSummary === undefined ? {} : {
    collections: collectionSummary.colorIds.map(id => props.colorMap[id]),
    description: collectionSummary.description,
    img: collectionSummary.thumbUrl,
    name: collectionSummary.name
  })

  const showTabHandler = (tabId: string) => {
    setTabId((prevTab) => {
      prevTab !== tabId && ColorCollections.updateCollectionData({ tabId, props })
      return tabId
    })
  }

  // initial render, selected tab unknown set selected tab
  if (!tabId && categories.data.length) {
    if (collectionSummary !== undefined) {
      showTabHandler(categories.data.find(category => category.summaryIds.indexOf(collectionSummary.id) !== -1).id)
    } else {
      showTabHandler(categories.data[0].id)
    }
  }
  // subsequent renders, tab known once colors exist, update collection only once
  if (tabId && !hasColors && Object.keys(props.colorMap).length) {
    setHasColors(true)
    ColorCollections.updateCollectionData({ tabId: tabId, props })
  }

  const showSpecificCollection = (collectionSummaryData: Object) => {
    updateCollectionDataDetails(collectionSummaryData)
    showBack()
    setHeader(collectionSummaryData.name)
  }

  return isShowBack
    ? <CollectionDetail collectionDetailData={collectionDataDetails} />
    : <div className={`${wrapper}`}>
      <ColorCollectionsTab collectionTabs={props.categories.data} showTab={showTabHandler} tabIdShow={tabId} />
      <div className={`${collectionsList}`}>
        <Carousel
          BaseComponent={({ data, getSummaryData }) => (
            <ColorStripButton onClick={() => getSummaryData(data)} colors={data.collections.slice(0, 5)} bottomLabel={data.name}>
              <img className={`collection__summary__top-section__image`} alt={`${data.name}`} src={data.img} />
            </ColorStripButton>
          )}
          defaultItemsPerView={8}
          isInfinity={false}
          key={tabId}
          data={ColorCollections.collectionData}
          getSummaryData={showSpecificCollection}
        />
      </div>
    </div>
}

const mapStateToProps = (state) => {
  const {
    collectionSummaries: { categories, summaries },
    colors: { items: { colorMap = {} } }
  } = state

  return { categories, summaries, colorMap }
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
