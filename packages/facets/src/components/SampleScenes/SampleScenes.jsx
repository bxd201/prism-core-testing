// @flow
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CardMenu from 'src/components/CardMenu/CardMenu'
import {
  ANALYTICS_EVENTS,
  ANALYTICS_INTERACTIONS_TYPE,
  createGTMData,
  pushToDataLayer
} from '../../analytics/analyticsUtils'
import ConfigurationContext, {
  type ConfigurationContextType
} from '../../contexts/ConfigurationContext/ConfigurationContext'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import { groupVariantsByCarouselTabs } from './utils.js'
import './SampleScenes.scss'

const baseClass = 'color-collections'
type ComponentProps = { isColorTinted: boolean, setHeader: Function, activateScene: Function }

export const SampleScenesWrapper = ({ isColorTinted, setHeader, activateScene }: ComponentProps) => {
  const { cvw = {}, allowedAnalytics } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { useOurPhotos = {} } = cvw
  const carouselCache = useSelector((state) => ({
    initPosition: state.carouselCache?.[0],
    tabId: state.carouselCache?.[1]
  }))
  const filteredVariants = useSelector((state) => state.variantsCollection)?.filter(
    (scene) => scene?.sceneCategories?.length && scene?.variantName === 'day'
  )
  const [tabId: string, setTabId: (string) => void] = useState(carouselCache?.tabId)
  const maxHeight = useRef(Number.MAX_SAFE_INTEGER)
  const variantsCarouselTabsData = useMemo(
    () => (filteredVariants ? groupVariantsByCarouselTabs(filteredVariants) : undefined),
    [filteredVariants]
  )
  const handleSelectedSceneUid = (uid: string) => {
    const initPosition = filteredVariants.findIndex((item) => {
      return item.sceneUid === uid
    })

    activateScene(uid, [initPosition, tabId])

    const roomName = filteredVariants.find((item) => item.sceneUid === uid)?.description ?? ''
    pushToDataLayer(
      createGTMData(ANALYTICS_EVENTS.INTERACTION, ANALYTICS_INTERACTIONS_TYPE.TAB, roomName),
      allowedAnalytics
    )
  }

  const getClientMinHeight = (height) => {
    const minHeight = Math.min(maxHeight.current, height)
    maxHeight.current = minHeight
  }

  const intl = useIntl()

  return (
    <CardMenu menuTitle={useOurPhotos.title ?? intl.formatMessage({ id: 'USE_OUR_PHOTO' })}>
      {() => (
        <div className={`${baseClass}__wrapper`}>
          {variantsCarouselTabsData && variantsCarouselTabsData.collectionTabs && (
            <ColorCollectionsTab
              collectionsSelectLabel={useOurPhotos.collectionsSelectLabel}
              collectionTabs={variantsCarouselTabsData.collectionTabs}
              tabIdShow={tabId}
              showTab={setTabId}
            />
          )}
          <div className={`${baseClass}__collections-list`}>
            {variantsCarouselTabsData && filteredVariants && variantsCarouselTabsData.tabMap && (
              <Carousel
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
              />
            )}
          </div>
        </div>
      )}
    </CardMenu>
  )
}

type Props = {
  data: Object,
  isColorTinted: boolean,
  handleSelectedSceneUid: Function,
  getClientHeight: Function,
  isActivedPage?: boolean,
  maxHeight: Number
}
const TintSceneWrapper = ({
  data,
  isColorTinted,
  handleSelectedSceneUid,
  isActivedPage,
  getClientHeight,
  maxHeight
}: Props) => {
  const { cvw } = useContext<ConfigurationContextType>(ConfigurationContext)
  const sceneWrapperRef: RefObject = useRef()
  const tintColor = isColorTinted ? void 0 : null
  const allColors = useSelector((state) => state?.colors?.items?.colorMap)
  const [variantsCollection, scenesCollection] = useSelector((store) => [
    store.variantsCollection,
    store.scenesCollection
  ])
  const sceneSurfaces = data.surfaces
  const surfaceColors: SurfaceStatus[] = sceneSurfaces.map((surface: Surface) => {
    const key = surface.colorId && surface.colorId.toString()
    if (allColors) {
      return tintColor || (tintColor === void 0 ? allColors[key] : '')
    }
  })

  const intl = useIntl()

  useEffect(() => {
    sceneWrapperRef.current && getClientHeight(sceneWrapperRef.current.clientHeight)
  }, [sceneWrapperRef])

  return (
    <>
      <div className='static__scene__image__wrapper' ref={sceneWrapperRef} style={{ maxHeight }}>
        <SingleTintableSceneView
          surfaceColorsFromParents={surfaceColors}
          selectedSceneUid={data?.sceneUid}
          variantsCollection={variantsCollection}
          scenesCollection={scenesCollection}
          allowVariantSwitch={false}
          interactive={false}
        />
      </div>
      <button
        tabIndex={isActivedPage ? '0' : '-1'}
        className='text-sm static__scene__paint__btn'
        onClick={() => handleSelectedSceneUid(data?.sceneUid)}
      >
        {cvw.scene?.paintThisSceneBtn?.showIcon && (
          <>
            <FontAwesomeIcon className={'cvw__btn-overlay__svg'} size='lg' icon={['fal', 'square-full']} />
            <FontAwesomeIcon
              className={'cvw__btn-overlay__svg cvw__btn-overlay__svg--brush'}
              icon={['fa', 'brush']}
              size='lg'
              transform={{ rotate: 320 }}
              style={{ transform: 'translateX(-10px)' }}
            />
          </>
        )}
        <span className='static__scene__paint__btn__contents'>{intl.formatMessage({ id: 'PAINT_THIS_SCENE' })}</span>
      </button>
    </>
  )
}

export default SampleScenesWrapper
