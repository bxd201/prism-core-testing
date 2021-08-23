// @flow
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { groupVariantsByCarouselTabs } from './utils.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './SampleScenes.scss'
import { useIntl } from 'react-intl'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'

const baseClass = 'color-collections'
type ComponentProps = { isColorTinted: boolean, setHeader: Function, activateScene: Function }

export const SampleScenesWrapper = ({ isColorTinted, setHeader, activateScene }: ComponentProps) => {
  const { cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const carouselCache = useSelector(state => ({ initPosition: state.carouselCache?.[0], tabId: state.carouselCache?.[1] }))
  const filteredVariants = useSelector(state => state.variantsCollection)?.filter((scene) => scene?.sceneCategories?.length && scene?.variantName === 'day')
  const [tabId: string, setTabId: string => void] = useState(carouselCache?.tabId)
  const maxHeight = useRef(Number.MAX_SAFE_INTEGER)
  const variantsCarouselTabsData = useMemo(() => filteredVariants ? groupVariantsByCarouselTabs(filteredVariants) : undefined, [filteredVariants])
  const handleSelectedSceneUid = (uid: string) => {
    const initPosition = filteredVariants.findIndex((item) => {
      return item.sceneUid === uid
    })
    console.log('TAB ID::', tabId)
    activateScene(uid, [initPosition, tabId])
  }

  const getClientMinHeight = (height) => {
    const minHeight = Math.min(maxHeight.current, height)
    maxHeight.current = minHeight
  }

  const intl = useIntl()

  return (
    <CardMenu menuTitle={cvw.useOurPhotos?.title ?? intl.formatMessage({ id: 'USE_OUR_PHOTO' })}>
      {() => (<div className={`${baseClass}__wrapper`}>
        {variantsCarouselTabsData && variantsCarouselTabsData.collectionTabs && <ColorCollectionsTab collectionTabs={variantsCarouselTabsData.collectionTabs} tabIdShow={tabId} showTab={setTabId} />}
        <div className={`${baseClass}__collections-list`}>
          {variantsCarouselTabsData && filteredVariants && variantsCarouselTabsData.tabMap && <Carousel
            BaseComponent={TintSceneWrapper}
            data={filteredVariants}
            defaultItemsPerView={1}
            getClientHeight={getClientMinHeight}
            handleSelectedSceneUid={handleSelectedSceneUid}
            initPosition={carouselCache?.initPosition}
            isColorTinted={isColorTinted}
            isInfinity
            maxHeight={maxHeight.current}
            setTabId={setTabId}
            showPageIndicators
            tabId={tabId}
            tabMap={variantsCarouselTabsData.tabMap}
          />}
        </div>
      </div>
      )}
    </CardMenu>
  )
}

type Props = { data: Object, isColorTinted: boolean, handleSelectedSceneUid: Function, getClientHeight: Function, isActivedPage?: boolean, maxHeight: Number}
const TintSceneWrapper = ({ data, isColorTinted, handleSelectedSceneUid, isActivedPage, getClientHeight, maxHeight }: Props) => {
  const sceneWrapperRef: RefObject = useRef()
  const tintColor = isColorTinted ? void (0) : null
  const allColors = useSelector(state => state?.colors?.items?.colorMap)
  const [variantsCollection, scenesCollection] = useSelector(store => [store.variantsCollection, store.scenesCollection])
  const sceneSurfaces = data.surfaces
  const surfaceColors: SurfaceStatus[] = sceneSurfaces.map((surface: Surface) => {
    const key = surface.colorId && ((surface.colorId).toString())
    if (allColors) {
      return tintColor || (tintColor === void (0) ? allColors[key] : '')
    }
  })

  const intl = useIntl()

  useEffect(() => {
    sceneWrapperRef.current && getClientHeight(sceneWrapperRef.current.clientHeight)
  }, [sceneWrapperRef])

  return (
    <>
      <div className='static__scene__image__wrapper' ref={sceneWrapperRef}>
        <SingleTintableSceneView surfaceColorsFromParents={surfaceColors} selectedSceneUid={data?.sceneUid} variantsCollection={variantsCollection} scenesCollection={scenesCollection} allowVariantSwitch={false} interactive={false} />
      </div>
      <button tabIndex={(isActivedPage) ? '0' : '-1'} className='static__scene__paint__btn' onClick={() => handleSelectedSceneUid(data?.sceneUid)}>
        <FontAwesomeIcon className={`cvw__btn-overlay__svg`} size='lg' icon={['fal', 'square-full']} />
        <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--brush`} icon={['fa', 'brush']} size='lg' transform={{ rotate: 320 }} style={{ transform: 'translateX(-10px)' }} />
        <span className='static__scene__paint__btn__contents'>{intl.formatMessage({ id: 'PAINT_THIS_SCENE' })}</span>
      </button>
    </>
  )
}

export default SampleScenesWrapper
