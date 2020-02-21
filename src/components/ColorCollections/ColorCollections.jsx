// @flow
import CollectionDetail from '../Shared/CollectionDetail'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import React, { useState, useEffect, useContext } from 'react'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import Carousel from '../Carousel/Carousel'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import { useSelector, useDispatch } from 'react-redux'
import { loadCollectionSummaries as loadCS } from '../../store/actions/collectionSummaries'
import { loadColors } from '../../store/actions/loadColors'
import './ColorCollections.scss'

export function ColorCollections () {
  const { summaries, categories, colorMap } = useSelector(state => ({
    categories: state.collectionSummaries.categories,
    summaries: state.collectionSummaries.summaries,
    colorMap: state.colors.items.colorMap
  }))

  const { brandId } = useContext(ConfigurationContext)
  const dispatch = useDispatch()

  const [tabId, setTabId] = useState('')
  const [collectionData, setCollectionData] = useState([])

  useEffect(() => { loadCS()(dispatch) }, [])
  useEffect(() => { loadColors(brandId)(dispatch) }, [])
  useEffect(() => { !tabId && categories.data.length && setTabId(categories.data[0].id) }, [categories.data])
  useEffect(() => {
    const category = categories.data[categories.idToIndexHash[tabId]]
    colorMap && category && setCollectionData(category.summaryIds.map(summaryId => {
      const { name, thumbUrl: img, description, colorIds } = summaries.data[summaries.idToIndexHash[summaryId]]
      return {
        collections: colorIds.map(id => colorMap[id]).filter(collection => collection),
        description,
        img,
        name
      }
    }))
  }, [colorMap, tabId])

  return (
    <CardMenu menuTitle='Color Collections'>
      {(setCardShowing, setCardTitle) => (
        <div className='color-collections__wrapper'>
          <ColorCollectionsTab collectionTabs={categories.data} showTab={setTabId} tabIdShow={tabId} />
          <div className='color-collections__collections-list'>
            <Carousel
              BaseComponent={({ data, getSummaryData }) => (
                <ColorStripButton onClick={() => getSummaryData(data)} colors={data.collections.slice(0, 5)} bottomLabel={data.name}>
                  <img className={`collection__summary__top-section__image`} alt={`${data.name}`} src={data.img} />
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
