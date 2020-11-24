// @flow
import React, { useState, useEffect, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { groupScenesByCategory } from './utils.js'
import { loadScenes } from '../../store/actions/scenes'
import { SCENE_TYPES } from 'constants/globals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import './SampleScenes.scss'

const baseClass = 'color-collections'
type ComponentProps = { isColorTinted: boolean, setHeader: Function, activateScene: Function }

export const SampleScenesWrapper = ({ isColorTinted, setHeader, activateScene }: ComponentProps) => {
  const [tabId: string, setTabId: string => void] = useState('tab0')
  const [maxHeight, setMaxHeight] = useState(Number.MAX_SAFE_INTEGER)
  const dispatch = useDispatch()
  const { locale } = useIntl()
  const { brandId } = useContext(ConfigurationContext)
  const scenes = useSelector(state => {
    if (state.scenes.sceneCollection) {
      let collections = Object.values(state.scenes.sceneCollection).flat()
      return groupScenesByCategory(collections)
    }
  })

  const getClientMinHeight = (height) => {
    const minHeight = Math.min(maxHeight, height)
    setMaxHeight(minHeight)
  }

  useEffect(() => {
    fetchData(SCENE_TYPES.ROOM)
  }, [])

  const fetchData = (type = null) => {
    /** load specific type of collection */
    if (type) {
      (scenes.groupScenes.length === 0) && dispatch(loadScenes(type, brandId, { language: locale }))
    } else {
      /** load all types */
      Object.values(SCENE_TYPES).forEach((type) => {
        (scenes.groupScenes.length === 0) && dispatch(loadScenes(type, brandId, { language: locale }))
      })
    }
  }
  return (
    <CardMenu menuTitle={'Use Our Photo'}>
      {() => (<div className={`${baseClass}__wrapper`}>
        {scenes && scenes.collectionTabs && <ColorCollectionsTab collectionTabs={scenes.collectionTabs} tabIdShow={tabId} showTab={setTabId} />}
        <div className={`${baseClass}__collections-list`}>
          {scenes && scenes.groupScenes && scenes.tabMap && <Carousel
            BaseComponent={StaticTintSceneWrapper}
            getClientHeight={getClientMinHeight}
            maxHeight={maxHeight}
            data={scenes.groupScenes}
            defaultItemsPerView={1}
            tabId={tabId}
            setTabId={setTabId}
            tabMap={scenes.tabMap}
            isInfinity
            isColorTinted={isColorTinted}
            activateScene={activateScene}
          />}
        </div>
      </div>
      )}
    </CardMenu>
  )
}

type Props = { data: Object, isColorTinted: boolean, activateScene: Function, getClientHeight: Function, isActivedPage?: boolean, maxHeight: Number}
const StaticTintSceneWrapper = ({ data, isColorTinted, activateScene, isActivedPage, getClientHeight, maxHeight }: Props) => {
  const sceneWrapperRef: RefObject = useRef()
  let props = isColorTinted ? {
    color: void (0),
    scene: data,
    config: {
      isNightScene: false,
      type: SCENE_TYPES.ROOM
    }
  } : {
    color: null,
    scene: data
  }

  useEffect(() => {
    sceneWrapperRef.current && getClientHeight(sceneWrapperRef.current.clientHeight)
  }, [sceneWrapperRef])

  return (
    <>
      <div className='static__scene__image__wrapper' ref={sceneWrapperRef} style={{ maxHeight: maxHeight }}>
        <StaticTintScene {...props} />
      </div>
      <button tabIndex={(isActivedPage) ? '0' : '-1'} className='static__scene__paint__btn' onClick={() => activateScene(data.id)}>
        <FontAwesomeIcon className={`cvw__btn-overlay__svg`} size='lg' icon={['fal', 'square-full']} />
        <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--brush`} icon={['fa', 'brush']} size='lg' transform={{ rotate: 320 }} style={{ transform: 'translateX(-10px)' }} />
        <FormattedMessage id='PAINT_THIS_SCENE' />
      </button>
    </>
  )
}

export default SampleScenesWrapper
