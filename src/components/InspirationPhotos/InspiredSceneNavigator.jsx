// @flow
import React, { useState, useEffect, useContext } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import InspiredScene from './InspiredScene'
import Carousel from '../Carousel/Carousel'
import { useIntl } from 'react-intl'
import { loadInspirationalPhotos } from '../../store/actions/inspirationalPhotos'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import '../ColorCollections/ColorCollections.scss'

const baseClass = 'color-collections'

const InspiredSceneNavigator = () => {
  const dispatch = useDispatch()
  const { formatMessage, locale } = useIntl()
  const { brandId } = useContext(ConfigurationContext)

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
    <CardMenu menuTitle={`${formatMessage({ id: 'INSPIRATIONAL_PHOTOS' })}`}>
      {() => (
        <div className={`${baseClass}__wrapper`}>
          <ColorCollectionsTab collectionTabs={collectionTabs} tabIdShow={tabId} showTab={setTabId} />
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
