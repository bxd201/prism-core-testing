// @flow
import React, { useState } from 'react'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { sceneData } from './data.js'
import { groupScenesByCategory } from './utils.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './SampleScenes.scss'

const baseClass = 'color-collections'
type ComponentProps = { isColorTinted: boolean, setHeader: Function, activateScene: Function }

export const SampleScenesWrapper = ({ isColorTinted, setHeader, activateScene }: ComponentProps) => {
  const [tabId: string, setTabId: string => void] = useState('tab0')
  const { tabMap, groupScenes, collectionTabs } = groupScenesByCategory(sceneData)

  return (
    <CardMenu menuTitle={'Use Our Photo'}>
      {() => (<div className={`${baseClass}__wrapper`}>
        <ColorCollectionsTab collectionTabs={collectionTabs} tabIdShow={tabId} showTab={setTabId} />
        <div className={`${baseClass}__collections-list`}>
          <Carousel
            BaseComponent={StaticTintSceneWrapper}
            data={groupScenes}
            defaultItemsPerView={1}
            tabId={tabId}
            setTabId={setTabId}
            tabMap={tabMap}
            isInfinity
            isColorTinted={isColorTinted}
            activateScene={activateScene}
          />
        </div>
      </div>
      )}
    </CardMenu>
  )
}

type Props = { data: Object, isColorTinted: boolean, activateScene: Function}
const StaticTintSceneWrapper = ({ data, isColorTinted, activateScene }: Props) => {
  let props = isColorTinted ? {
    color: void (0),
    scene: data
  } : {
    color: null,
    scene: data
  }

  return (
    <>
      <div className='static__scene__image__wrapper'>
        <StaticTintScene {...props} />
      </div>
      <button className='static__scene__paint__btn' onClick={() => activateScene(data.id)}>
        <FontAwesomeIcon className={`cvw__btn-overlay__svg`} size='lg' icon={['fal', 'square-full']} />
        <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--brush`} icon={['fa', 'brush']} size='lg' transform={{ rotate: 320 }} />
        Paint this Scene
      </button>
    </>
  )
}

export default SampleScenesWrapper
