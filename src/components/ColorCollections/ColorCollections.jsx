// @flow
import CollectionDetail from 'src/components/Shared/CollectionDetail'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ColorCollectionsTab from 'src/components/Shared/ColorCollectionsTab'
import React, { useState, useEffect, useContext } from 'react'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import Carousel from 'src/components/Carousel/Carousel'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { loadCollectionSummaries } from 'src/store/actions/collectionSummaries'
import { loadColors } from 'src/store/actions/loadColors'
import './ColorCollections.scss'

export function ColorCollections () {
  const dispatch = useDispatch()
  useEffect(() => { loadCollectionSummaries(dispatch) }, [])
  useEffect(() => { loadColors(brandId)(dispatch) }, [])

  const { summaries, categories } = useSelector(state => state.collectionSummaries, shallowEqual)
  const colorMap = useSelector(state => state.colors.items.colorMap, shallowEqual)
  const { brandId } = useContext(ConfigurationContext)
  const [tabId, setTabId] = useState(1)

  const category = categories.data[categories.idToIndexHash[tabId]]
  const collectionData = colorMap && category ? category.summaryIds.map(summaryId => {
    const { name, thumbUrl: img, description, colorIds } = summaries.data[summaries.idToIndexHash[summaryId]]
    return { description, img, name, collections: colorIds.map(id => colorMap[id]) }
  }) : []

  return (
    <CardMenu menuTitle='Color Collections'>
      {(setCardShowing, setCardTitle) => (
        <div className='color-collections__wrapper'>
          <ColorCollectionsTab collectionTabs={categories.data} showTab={setTabId} tabIdShow={tabId} />
          <div className='color-collections__collections-list' role='main'>
            <Carousel
              BaseComponent={({ data, getSummaryData }) => (
                <ColorStripButton onClick={() => getSummaryData(data)} colors={data.collections.slice(0, 5)} bottomLabel={data.name}>
                  <img className='collection__summary__top-section__image' alt={data.name} src={data.img} />
                </ColorStripButton>
              )}
              defaultItemsPerView={8}
              isInfinity={false}
              key={tabId}
              data={collectionData}
              getSummaryData={(collectionSummaryData) => {
                setCardShowing(<CollectionDetail collectionDetailData={collectionSummaryData} />)
                setCardTitle(collectionSummaryData.name)
              }}
            />
          </div>
        </div>
      )}
    </CardMenu>
  )
}

export default ColorCollections
