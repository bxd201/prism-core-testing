// @flow
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import InspiredScene from './InspiredScene'
import Carousel from '../Carousel/Carousel'
import { loadInspirationalPhotos } from '../../store/actions/inspirationalPhotos'
import '../ColorCollections/ColorCollections.scss'

const baseClass = 'color-collections'

const InspiredSceneNavigator = () => {
  const dispatch = useDispatch()
  useEffect(() => { loadInspirationalPhotos()(dispatch) }, [])

  const { collectionTabs, flatData, tabMap } = useSelector(({ inspirationalPhotos: { data } }) => ({
    collectionTabs: data.flatMap((scene, i) => ({ id: `tab${i}`, tabName: scene.name })),
    tabMap: data.flatMap((scene, i) => Array(scene.sceneDefinition.length).fill(`tab${i}`)),
    flatData: data.flatMap((scene, i) => (
      scene.sceneDefinition.map((def, x) => ({ img: def.photoUrl, id: `tab${i}-${x}`, initPins: def.initPins }))
    ))
  }))

  const [tabId: string, setTabId: string => void] = useState('tab0')

  return (
    <CardMenu menuTitle='Inspirational Photos'>
      {() => (
        <div className={`${baseClass}__wrapper`}>
          <ColorCollectionsTab collectionTabs={collectionTabs} tabIdShow={tabId} showTab={setTabId} />
          <div className={`${baseClass}__collections-list`}>
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
