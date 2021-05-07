// @flow
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import { ACTIVE_SCENE_LABELS_ENUM } from 'src/store/actions/navigation'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { groupVariantsByCarouselTabs } from './utils.js'
import { loadScenes } from '../../store/actions/scenes'
import { cacheCarousel, setActiveSceneLabel } from '../../store/actions/navigation'
import { setSelectedSceneUid } from '../../store/actions/loadScenes'
import { SCENE_TYPES } from 'constants/globals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import './SampleScenes.scss'

const baseClass = 'color-collections'
type ComponentProps = { isColorTinted: boolean, setHeader: Function, activateScene: Function }

export const SampleScenesWrapper = ({ isColorTinted, setHeader, activateScene }: ComponentProps) => {
  const carouselCache = useSelector(state => ({ initPosition: state.carouselCache?.[0], tabId: state.carouselCache?.[1] }))
  const filteredVariants = useSelector(state => state.variantsCollection)?.filter((scene) => scene?.sceneCategories?.length && scene?.variantName === 'day')
  const [tabId: string, setTabId: string => void] = useState(carouselCache?.tabId)
  const history = useHistory()
  const maxHeight = useRef(Number.MAX_SAFE_INTEGER)
  const dispatch = useDispatch()
  const { locale, formatMessage } = useIntl()
  const { brandId } = useContext(ConfigurationContext)
  const variantsCarouselTabsData = useMemo(() => filteredVariants ? groupVariantsByCarouselTabs(filteredVariants) : undefined, [filteredVariants])
  const handleSelectedSceneUid = (uid: string) => {
    const initPosition = filteredVariants.findIndex((item) => {
      return item.sceneUid === uid
    })
    dispatch(cacheCarousel([initPosition, tabId]))
    dispatch(setSelectedSceneUid(uid))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE))
    history.push('/test')
  }

  const getClientMinHeight = (height) => {
    const minHeight = Math.min(maxHeight.current, height)
    maxHeight.current = minHeight
  }

  useEffect(() => {
    fetchData(SCENE_TYPES.ROOM)
  }, [])

  const fetchData = (type = null) => {
    /** load specific type of collection */
    if (type) {
      (filteredVariants?.length === 0) && dispatch(loadScenes(type, brandId, { language: locale }))
    } else {
      /** load all types */
      Object.values(SCENE_TYPES).forEach((type) => {
        (filteredVariants?.length === 0) && dispatch(loadScenes(type, brandId, { language: locale }))
      })
    }
  }
  return (
    <CardMenu menuTitle={formatMessage({ id: 'USE_OUR_PHOTO' })}>
      {() => (<div className={`${baseClass}__wrapper`}>
        {variantsCarouselTabsData && variantsCarouselTabsData.collectionTabs && <ColorCollectionsTab collectionTabs={variantsCarouselTabsData.collectionTabs} tabIdShow={tabId} showTab={setTabId} />}
        <div className={`${baseClass}__collections-list`}>
          {variantsCarouselTabsData && filteredVariants && variantsCarouselTabsData.tabMap && <Carousel
            BaseComponent={StaticTintSceneWrapper}
            getClientHeight={getClientMinHeight}
            maxHeight={maxHeight.current}
            data={filteredVariants}
            defaultItemsPerView={1}
            tabId={tabId}
            initPosition={carouselCache?.initPosition}
            setTabId={setTabId}
            tabMap={variantsCarouselTabsData.tabMap}
            isInfinity
            isColorTinted={isColorTinted}
            handleSelectedSceneUid={handleSelectedSceneUid}
          />}
        </div>
      </div>
      )}
    </CardMenu>
  )
}

type Props = { data: Object, isColorTinted: boolean, handleSelectedSceneUid: Function, getClientHeight: Function, isActivedPage?: boolean, maxHeight: Number}
const StaticTintSceneWrapper = ({ data, isColorTinted, handleSelectedSceneUid, isActivedPage, getClientHeight, maxHeight }: Props) => {
  const sceneWrapperRef: RefObject = useRef()
  const tintColor = isColorTinted ? void (0) : null
  const allColors = useSelector(state => state?.colors?.items?.colorMap)
  const sceneSurfaces = data.surfaces
  const surfaceColors: SurfaceStatus[] = sceneSurfaces.map((surface: Surface) => {
    const key = surface.colorId && ((surface.colorId).toString())
    if (allColors) {
      return tintColor || (tintColor === void (0) ? allColors[key] : '')
    }
  })

  useEffect(() => {
    sceneWrapperRef.current && getClientHeight(sceneWrapperRef.current.clientHeight)
  }, [sceneWrapperRef])

  return (
    <>
      <div className='static__scene__image__wrapper' ref={sceneWrapperRef}>
        <SingleTintableSceneView surfaceColors={surfaceColors} fallbackSelectedSceneUID={data?.sceneUid} allowVariantSwitch={false} interactive={false} />
      </div>
      <button tabIndex={(isActivedPage) ? '0' : '-1'} className='static__scene__paint__btn' onClick={() => handleSelectedSceneUid(data?.sceneUid)}>
        <FontAwesomeIcon className={`cvw__btn-overlay__svg`} size='lg' icon={['fal', 'square-full']} />
        <FontAwesomeIcon className={`cvw__btn-overlay__svg cvw__btn-overlay__svg--brush`} icon={['fa', 'brush']} size='lg' transform={{ rotate: 320 }} style={{ transform: 'translateX(-10px)' }} />
        <FormattedMessage id='PAINT_THIS_SCENE' />
      </button>
    </>
  )
}

export default SampleScenesWrapper
