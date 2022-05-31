// @flow
/**
 * This facet assumes that all the surfaces map to the same color scheme; the types of surface has the same index throughout
 * If a default color is specified and an active color is set, the default color will been show on the inital presentation to the user.
 * If an active color is set and there is no default color, the active color will be presented.
 */
/**
 * @todo how do we select the scenes? Should we limit the surfaces painted via a flag? -RS
 * How do we associate tabs to scenes?
 */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { type FacetPubSubMethods } from 'src/facetSupport/facetPubSub'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import uniqueId from 'lodash/uniqueId'
import SceneBlobLoader from '../SceneBlobLoader/SceneBlobLoader'
import useSceneDataCVW from '../../shared/hooks/useSceneDataCVW'
import { useDispatch, useSelector } from 'react-redux'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import {
  setSelectedSceneUid,
  setSelectedVariantName,
  setVariantsCollection,
  setVariantsLoading
} from '../../store/actions/loadScenes'
import { BUTTON_POSITIONS, GROUP_NAMES, SCENE_TYPES } from '../../constants/globals'
import { mapItemsToList } from '../../shared/utils/tintableSceneUtils'
import {
  getMiniColorForSurfacesFromColorStrings
} from '../../shared/helpers/ColorDataUtils'
import useColors from '../../shared/hooks/useColors'
import { hasGroupAccess } from '../../shared/utils/featureSwitch.util'
import facetBinder from '../../facetSupport/facetBinder'
import cloneDeep from 'lodash/cloneDeep'
import isArray from 'lodash/isArray'

import './TabbedSceneVisualizerFacet.scss'
import { SV_COLOR_UPDATE } from '../../constants/pubSubEventsLabels'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import type { FacetBinderMethods } from '../../facetSupport/facetInstance'
import DayNightToggleV2 from '../SingleTintableSceneView/DayNightToggleV2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import debounce from 'lodash/debounce'
import { isDarkColor } from 'is-dark-color/dist/isDarkColor'

import 'src/providers/fontawesome/fontawesome'

type TabbedSceneVisualizerFacetProps = FacetPubSubMethods & FacetBinderMethods & {
  groupNames: string[],
  defaultColors: string[],
}

const baseFacetClassName = 'tabbed-scene-visualizer'
const wrapper = `${baseFacetClassName}__wrapper`
const tabClassName = `${baseFacetClassName}__tabs`
const tabItemClassName = `${tabClassName}__item`
const tabItemBtnClassname = `${tabItemClassName}__btn`
const mobileNavClassName = `${baseFacetClassName}__mobile_nav`
const mobileNavBtnClassName = `${mobileNavClassName}__btn`
const mobileNavWrapper = `${mobileNavBtnClassName}__wrapper`

const shouldUseActiveColor = (defColors: any[], activeColor, hasAccess) => {
  return !defColors && activeColor && hasAccess
}

export function TabbedSceneVisualizerFacet (props: TabbedSceneVisualizerFacetProps) {
  const dispatch = useDispatch()
  const { groupNames, defaultColors, subscribe } = props
  const { brandId, language } = useContext(ConfigurationContext)
  const [sceneFetchCalled, setSceneFetchCalled] = useState(false)
  const [facetId] = useState(uniqueId('tsv-facet_'))
  const initializingFacetId = useSelector(store => store.initializingFacetId)
  const fetchCalled = useSceneDataCVW(
    initializingFacetId,
    (groupNames?.indexOf(GROUP_NAMES.SCENES) > -1 ? facetId : null),
    sceneFetchCalled,
    brandId,
    language
  )
  const [colors] = useColors()
  const activeColor = useSelector(store => store.lp.activeColor)
  const [variantsCollection, scenesCollection] = useSelector(store => [store.variantsCollection, store.scenesCollection, store.selectedSceneUid])
  const [localSurfaceColors, setLocalSurfaceColors] = useState(null)
  const [localSelectedSceneUid, setLocalSelectedSceneUid] = useState(null)
  const [localScenesCollection, setLocalScenesCollection] = useState(null)
  const [localVariantsCollection, setLocalVariantsCollection] = useState(null)
  const [localError, setLocalError] = useState(null)
  // local variant loading is an api stub that is used elsewhere we use a singletintablesceneview
  // eslint-disable-next-line no-unused-vars
  const [localVariantsLoading, setLocalVariantsLoading] = useState(null)
  // local variant name is an api stub, if used it will only show one variant per scene
  // eslint-disable-next-line no-unused-vars
  const [localVariantName, setLocalVariantName] = useState(null)
  const [categories, setCategories] = useState(null)
  const [initialColors, setInitialColors] = useState(null)
  const [incomingColors, setIncomingColors] = useState(null)
  // this tracks if active color has ever changed, this flag is used to allow active color to override the default color.
  // it will only be triggered once the active color has been changed by value at least once.
  const [initialActiveColor, setInitialActiveColor] = useState(null)
  const [activeColorHasBeenChanged, setActiveColorHasBeenChanged] = useState(false)
  const tabItemListRef = useRef(null)
  const [tabItemListScrollOffset, setTabItemListScrollOffset] = useState(0)
  const [showNav, setShowNav] = useState({
    left: false,
    right: false
  })

  function checkShouldShowNav () {
    if (!tabItemListRef.current) {
      return
    }

    const { scrollLeft, clientWidth, scrollWidth } = tabItemListRef.current

    // bc math is hard and browsers will calculate things differently,
    // use a trivial amount of space to determine if you should be allowed to programmatically scroll.
    const padding = 5
    setShowNav({
      left: scrollLeft > padding,
      right: scrollLeft + clientWidth + padding < scrollWidth
    })
  }

  useEffect(() => {
    // Listen for color updates
    subscribe(SV_COLOR_UPDATE, (payload: any) => {
      const { data } = payload
      if (data) {
        const inboundColors = isArray(data) ? [...data] : [data]
        setIncomingColors(inboundColors)
      }
    })

    function _resizeHandler (e: SyntheticEvent) {
      checkShouldShowNav()
    }

    const resizeHandler = debounce(_resizeHandler, 300)

    window.addEventListener('resize', resizeHandler)

    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  // This ensures that useSceneDataCVW hook is only called once
  useEffect(() => {
    if (fetchCalled) {
      setSceneFetchCalled(fetchCalled)
    }
  }, [fetchCalled])

  useEffect(() => {
    if (localError) {
      console.error(localError)
    }
  }, [localError])

  const handleBlobLoaderInit = () => {
    if (hasGroupAccess(groupNames, GROUP_NAMES.SCENES)) {
      dispatch(setVariantsLoading(true))
    }
    setLocalVariantsLoading(true)
  }

  useEffect(() => {
    if (activeColor && !initialActiveColor) {
      setInitialActiveColor(createMiniColorFromColor(activeColor))
    }

    if (initialActiveColor && activeColor && !activeColorHasBeenChanged) {
      if (`${initialActiveColor.brandKey}-${initialActiveColor.colorNumber}` !== `${activeColor.brandKey}-${activeColor.colorNumber}`) {
        setActiveColorHasBeenChanged(true)
      }
    }

    const variants = variantsCollection ? variantsCollection.filter(variant => variant.sceneType === SCENE_TYPES.ROOM) : []
    const surfaces = variants.length ? variants[0].surfaces.map(surface => null) : null
    const hasAccess = hasGroupAccess(groupNames, GROUP_NAMES.COLORS)
    if ((surfaces && activeColor && hasAccess && activeColorHasBeenChanged) ||
      (!initialColors && activeColor && surfaces && hasAccess)) {
      const newColors = mapItemsToList([createMiniColorFromColor(activeColor)], surfaces)
      setLocalSurfaceColors(newColors)
    }
  }, [activeColor, variantsCollection, initialActiveColor, activeColorHasBeenChanged])

  useEffect(() => {
    if (localSurfaceColors?.length && !initialColors) {
      setInitialColors(localSurfaceColors)
    }
  }, [initialColors, localSurfaceColors])

  useEffect(() => {
    if (colors && incomingColors && initialColors) {
      // initialColors is a proxy for surfaces
      const newColors = getMiniColorForSurfacesFromColorStrings(incomingColors, initialColors, colors)
      setLocalSurfaceColors(newColors)
    }
  }, [colors, incomingColors, initialColors])

  useEffect(() => {
    checkShouldShowNav()
    // Do this bc Firefox centers the div scroll
    if (tabItemListRef.current) {
      tabItemListRef.current.scrollLeft = 0
    }
  }, [categories])

  // This callback initializes all of the scene data for cvw
  const handleSceneSurfacesLoaded = (variants) => {
    // @todo Default to the first room type for the CVW, we many need a way to ovveride this via facet props
    const variant = variants.filter(variant => variant.sceneType === SCENE_TYPES.ROOM)[0]
    const { sceneUid, variantName, surfaces } = variant

    // if there are no default colors there will be a sparse array
    const defColors = defaultColors ?? []
    const defSurfaceColors = getMiniColorForSurfacesFromColorStrings(defColors, surfaces, colors)
    const newSurfaceColors = !shouldUseActiveColor(
      defaultColors,
      activeColor,
      hasGroupAccess(groupNames, GROUP_NAMES.COLORS))
      ? defSurfaceColors : mapItemsToList([createMiniColorFromColor(activeColor)], surfaces)

    if (hasGroupAccess(groupNames, GROUP_NAMES.SCENES)) {
      dispatch(setVariantsCollection(variants))
      // When this value is set it can be used as a flag that the cvw has initialized the scene data
      dispatch(setSelectedSceneUid(sceneUid))
      dispatch(setSelectedVariantName(variantName))
      // @todo need to add override for this if we do not want to broadcast
      dispatch(setVariantsLoading(false))
    }
    // copy scenes and variants we need and keep state local.
    setLocalScenesCollection(cloneDeep(scenesCollection))
    // get sceneuids for each room type by getting first of kind, use this array to get all variants
    const sceneUids = variants.filter(variant => variant.isFirstOfKind).map(variant => variant.sceneUid)
    const categories = scenesCollection.filter(scene => sceneUids.indexOf(scene.uid) > -1).map(scene => {
      return {
        label: scene.categories[0],
        sceneUid: scene.uid
      }
    })
    const filteredVariants = variants.filter(variant => sceneUids.indexOf(variant.sceneUid) > -1)
    if (filteredVariants.length) {
      const variantName = filteredVariants[0].variantName
      setLocalVariantName(variantName)
    }
    setLocalVariantsCollection(cloneDeep(filteredVariants))
    setLocalSurfaceColors(newSurfaceColors)
    setLocalSelectedSceneUid(sceneUid)
    setLocalVariantsLoading(false)
    setCategories(categories)
  }

  const handleSceneBlobLoaderError = (err: any) => {
    if (hasGroupAccess(groupNames, GROUP_NAMES.SCENES)) {
      dispatch(err)
    }
    setLocalError(err)
  }

  const changeScene = (e: SyntheticEvent, uid: any) => {
    e.preventDefault()
    setLocalSelectedSceneUid(uid)
  }

  // @todo is this localized by config or do we use the category as a key to select the correct string?
  const createTabs = (data: any, index: number) => {
    const isHighlighted = localSelectedSceneUid === data.sceneUid
    const isDark = localSurfaceColors[0] ? isDarkColor(localSurfaceColors[0].hex) : false

    return <li style={{
      backgroundColor: isHighlighted ? localSurfaceColors[0]?.hex : null
    }} className={`${tabItemClassName}${index ? '' : '--first'}`} key={data.sceneUid}>
      <button style={{ textDecoration: isHighlighted ? 'underline' : null,
        color: isDark && isHighlighted ? '#ffffff' : '#000000',
        textDecorationColor: isHighlighted ? 'rgba(0, 0, 0, 0.45)' : null,
        textUnderlineOffset: '6px' }} className={tabItemBtnClassname} onClick={(e: SyntheticEvent) => changeScene(e, data.sceneUid)}>{data.label}
      </button>
    </li>
  }

  const renderCustomToggle = (variantIndex: number, variantList: any[], handler: Function, metaData: any) => {
    // eslint-disable-next-line no-unused-vars
    const { sceneUid, currentVariant } = metaData

    return (
      <DayNightToggleV2
        sceneUid={sceneUid}
        variantName={currentVariant}
        changeHandler={handler}
      />
    )
  }

  function scrollNavLeft (e: SytheticEvent) {
    scrollNav(e, false)
  }

  function scrollNavRight (e: SyntheticEvent) {
    scrollNav(e, true)
  }

  function scrollNav (e: SyntheticEvent, shouldScrollLeft = false) {
    e.preventDefault()

    const scrollAmount = tabItemListRef.current.scrollWidth / categories.length

    const _newOffset = shouldScrollLeft ? scrollAmount : scrollAmount * -1
    const newOffset = tabItemListScrollOffset + _newOffset
    // work around/ fallback for bug: https://bugs.webkit.org/show_bug.cgi?id=238497
    const checkIsSafari = () => {
      const ua = window.navigator.userAgent.toLowerCase()
      return ua.indexOf('chrome') === -1 && ua.indexOf('safari') > -1
    }

    if (!checkIsSafari()) {
      tabItemListRef.current.scrollTo({
        top: 0,
        left: newOffset,
        behavior: 'smooth'
      })
    } else {
      tabItemListRef.current.scrollLeft = newOffset
    }

    setTabItemListScrollOffset(newOffset)
    setTimeout(() => {
      checkShouldShowNav()
    }, 300)
  }

  return (
    <>{scenesCollection && colors?.colorMap ? <SceneBlobLoader
      scenes={scenesCollection}
      variants={variantsCollection}
      initHandler={handleBlobLoaderInit}
      handleBlobsLoaded={handleSceneSurfacesLoaded}
      handleError={handleSceneBlobLoaderError} /> : null}
      <div className={baseFacetClassName}>
        {categories ? categories.map(category => {
          const { sceneUid } = category
          return (
            <div key={sceneUid} style={sceneUid !== localSelectedSceneUid ? { visibility: 'hidden', display: 'none' } : null}>
              <SingleTintableSceneView
                surfaceColorsFromParents={localSurfaceColors}
                selectedSceneUid={sceneUid}
                scenesCollection={localScenesCollection}
                variantsCollection={localVariantsCollection}
                /* selectedVariantName={localVariantName} //this will only show the selected variant */
                buttonPosition={BUTTON_POSITIONS.TOP}
                allowVariantSwitch
                customToggle={renderCustomToggle}
              />
            </div>
          )
        }) : null}
        {categories ? <div className={wrapper}>
          <div className={mobileNavClassName}>
            <div className={`${mobileNavWrapper}--left`} style={{ visibility: showNav.left ? 'visible' : 'hidden' }} >
              <button onClick={scrollNavLeft} className={`${mobileNavBtnClassName}--left`}><FontAwesomeIcon icon={['fal', 'chevron-circle-left']} size='lg' /></button></div>
            <div className={`${mobileNavWrapper}--right`} style={{ visibility: showNav.right ? 'visible' : 'hidden' }}>
              <button onClick={scrollNavRight} className={`${mobileNavBtnClassName}--right`}><FontAwesomeIcon icon={['fal', 'chevron-circle-right']} size='lg' /></button></div>
          </div>
          <ul ref={tabItemListRef} className={tabClassName}>{categories ? categories.map(createTabs) : null}</ul>
        </div> : null }
      </div>
    </>
  )
}

export default facetBinder(TabbedSceneVisualizerFacet, 'TabbedSceneVisualizerFacet')
