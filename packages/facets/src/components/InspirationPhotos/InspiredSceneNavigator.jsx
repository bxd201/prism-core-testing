// @flow
import React, { useContext,useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { shallowEqual,useDispatch, useSelector } from 'react-redux'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { loadInspirationalPhotos } from '../../store/actions/inspirationalPhotos'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import InspiredScene from './InspiredScene'
import '../ColorCollections/ColorCollections.scss'

const baseClass = 'color-collections'

const InspiredSceneNavigator = () => {
  const dispatch = useDispatch()
  const { formatMessage, locale } = useIntl()
  const { brandId, cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { inspirationalPhotos } = cvw

  useEffect(() => { loadInspirationalPhotos(brandId, { language: locale })(dispatch) }, [])

  const { collectionTabs, flatData, tabMap } = useSelector(({ inspirationalPhotos: { data } }) => ({
    collectionTabs: data.flatMap((scene, i) => ({ id: `tab${i}`, tabName: scene.name })),
    tabMap: data.flatMap((scene, i) => Array(scene.sceneDefinition.length).fill(`tab${i}`)),
    flatData: data.flatMap((scene, i) => (
      scene.sceneDefinition.map((def, x) => ({ img: def.photoUrl, id: `tab${i}-${x}`, initPins: def.initPins }))
    ))
  }), shallowEqual)

  const [tabId: string, setTabId: string => void] = useState('tab0')

  return (
    <CardMenu menuTitle={inspirationalPhotos?.title ?? formatMessage({ id: 'INSPIRATIONAL_PHOTOS' })}>
      {() => (
        <div className={`${baseClass}__wrapper`}>
          <ColorCollectionsTab collectionsSelectLabel={inspirationalPhotos?.collectionsSelectLabel} collectionTabs={collectionTabs} tabIdShow={tabId} showTab={setTabId} />
          <div className={`${baseClass}__collections-list`} role='main'>
            <Carousel
              BaseComponent={InspiredScene}
              data={flatData}
              defaultItemsPerView={1}
              tabId={tabId}
              setTabId={setTabId}
              isInfinity
              tabMap={tabMap}
            />
          </div>
        </div>
      )}
    </CardMenu>
  )
}

export default InspiredSceneNavigator
