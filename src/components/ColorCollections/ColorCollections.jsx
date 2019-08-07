// @flow
import React, { useState, useEffect } from 'react'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import CollectionDetail from './CollectionDetail'
import ColorCollectionsTab from './ColorCollectionsTab'
import { ColorListWithCarousel } from '../Carousel/Carousel'
import { getColorCollectionsData, allCollectionsData, expertColorsData, collectionTabs } from '../Carousel/data'
import * as Colors from '../../../__mocks__/data/color/Colors'
import './ColorCollections.scss'
import ExpertColorDetails from '../Carousel/ExpertColorDetails'

type Props = {
  showBack: Function,
  isShowBack: boolean,
  setHeader: Function,
  isExpertColor: boolean
}

const baseClass = 'color-collections'
const wrapper = `${baseClass}__wrapper`
export const collectionsList = `${baseClass}__collections-list`
const colors = Colors.getAllColors()

export function ColorCollections (props: Props) {
  const { isShowBack, showBack, setHeader, isExpertColor } = props
  const [tabIdShow, showTab] = useState('tab1')
  const [collectionDataDetails, updateCollectionDataDetails] = useState({})
  const collectionData = (isExpertColor) ? expertColorsData : getColorCollectionsData(colors, allCollectionsData, tabIdShow)
  const headerContent = (isExpertColor) ? 'Expert Color Picks' : 'Color Collections'

  useEffect(() => {
    if (!isShowBack) {
      setHeader(headerContent)
    }
  }, [isShowBack])

  if (isShowBack === true) {
    return (isExpertColor) ? <ExpertColorDetails expertColors={collectionDataDetails} /> : <CollectionDetail collectionDetailData={collectionDataDetails} />
  }

  const onClickHandler = (collectionSummaryData) => {
    showBack()
    if (!isExpertColor) {
      setHeader(collectionSummaryData.name)
    }
    updateCollectionDataDetails(collectionSummaryData)
  }

  return (
    <div className={`${wrapper}`}>
      {(!isExpertColor) && <ColorCollectionsTab collectionTabs={collectionTabs} showTab={showTab} tabIdShow={tabIdShow} />}
      <div className={`${collectionsList}`}>
        <ColorListWithCarousel defaultItemsPerView={8} isInfinity={false} key={JSON.stringify(collectionData)} data={collectionData} getSummaryData={onClickHandler} isExpertColor={isExpertColor} />
      </div>
    </div>
  )
}

export default CollectionsHeaderWrapper(ColorCollections)
