// @flow
import React, { useCallback, useContext, useEffect, useMemo,useState } from 'react'
import { useIntl } from 'react-intl'
import { shallowEqual,useDispatch, useSelector } from 'react-redux'
import * as GA from 'src/analytics/GoogleAnalytics'
import CardMenu from 'src/components/CardMenu/CardMenu'
import Carousel from 'src/components/Carousel/Carousel'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import CollectionDetail from 'src/components/Shared/CollectionDetail'
import ColorCollectionsTab from 'src/components/Shared/ColorCollectionsTab'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { loadCollectionSummaries } from 'src/store/actions/collectionSummaries'
import { loadColors } from 'src/store/actions/loadColors'
import './ColorCollections.scss'

export function ColorCollections () {
  const dispatch = useDispatch()
  const { formatMessage, locale } = useIntl()
  const { brandId, cvw = {} } = useContext(ConfigurationContext)
  const { colorCollections } = cvw

  const { summaries, categories } = useSelector(state => state.collectionSummaries, shallowEqual)
  const colorMap = useSelector(state => state.colors.items.colorMap, shallowEqual)
  useEffect(() => { loadCollectionSummaries(brandId, { language: locale })(dispatch) }, [])
  useEffect(() => { loadColors(brandId)(dispatch) }, [])

  const [tabId, setTabId] = useState()
  const [collectionData, setCollectionData] = useState([])

  useEffect(() => {
    if (typeof tabId !== 'undefined') {
      const category = categories.data.filter(({ id }) => `${id}` === `${tabId}`)[0]
      const collectionData = colorMap && category
        ? category.summaryIds.map(summaryId => {
          const { name, coverUrl, thumbUrl, description, colorIds, pdfUrl } = summaries.data[summaries.idToIndexHash[summaryId]]
          return { description, coverUrl, thumbUrl, name, collections: colorIds.map(id => colorMap[id]), pdfUrl }
        })
        : []
      setCollectionData(collectionData)
    }
  }, [tabId, colorMap])

  useEffect(() => {
    if (categories.data.length) {
      setTabId(categories.data[0].id)
    }
  }, [categories])

  return (
    <CardMenu menuTitle={formatMessage({ id: 'COLOR_COLLECTIONS' })}>
      {(setCardShowing, setCardTitle) => (
        <>
          {colorCollections?.subtitle && <div className='color-collections__subtitle'>{colorCollections?.subtitle}</div>}
          <div className='color-collections__wrapper'>
            <ColorCollectionsTab collectionTabs={categories.data} showTab={setTabId} tabIdShow={tabId} />
            <div className='color-collections__collections-list' role='main'>
              <Carousel
                showPageIndicators
                BaseComponent={ColorStripButtonWrapper}
                btnRefList={[]}
                defaultItemsPerView={8}
                isInfinity={false}
                key={tabId}
                data={collectionData}
                getSummaryData={(collectionSummaryData) => {
                  setCardShowing(<CollectionDetail collectionDetailData={collectionSummaryData} />)
                  setCardTitle(collectionSummaryData.name)
                  GA.event({ category: 'Color Collections', action: 'Collection Click', label: collectionSummaryData.name }, GA_TRACKER_NAME_BRAND[brandId])
                }}
              />
            </div>
          </div>
        </>
      )}
    </CardMenu>
  )
}

const ColorStripButtonWrapper = (props: any) => {
  const { data, getSummaryData, itemNumber, btnRefList, onKeyDown } = props
  const clickHandler = useCallback(() => getSummaryData(data), [data])
  const colors = useMemo(() => data.collections.slice(0, 5), [data.collections])
  btnRefList[itemNumber] = React.useRef()
  let imgAltText = `${data.name}.`

  if (colors.length > 0) {
    imgAltText += ' Color group includes '
    colors.map((color, index) => {
      imgAltText += (colors.length === index + 1) ? `${color.name}.` : `${color.name}, `
    })
  }

  return (
    <ColorStripButton
      onClick={clickHandler}
      onKeyDown={onKeyDown}
      colors={colors}
      bottomLabel={data.name}
      ref={btnRefList[itemNumber]}
    >
      <img className='collection__summary__top-section__image' alt={imgAltText} src={data.thumbUrl} />
    </ColorStripButton>
  )
}

export default ColorCollections
