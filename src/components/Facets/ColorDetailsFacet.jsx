// @flow
import React, { useState, useEffect, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Redirect, useLocation, useHistory } from 'react-router-dom'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES, SCENE_TYPES } from 'src/constants/globals'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps, PubSubCtx } from 'src/facetSupport/facetPubSub'
import GenericMessage from '../Messages/GenericMessage'
import { FormattedMessage } from 'react-intl'
import type { ColorMap, Color, ColorId } from 'src/shared/types/Colors.js.flow'
import findKey from 'lodash/findKey'
import { loadColors } from 'src/store/actions/loadColors'
import HeroLoader from '../Loaders/HeroLoader/HeroLoader'
import { cleanColorNameForURL, generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'
import uniqueId from 'lodash/uniqueId'
import { setInitializingFacetId } from '../../store/actions/system'
import {
  fetchRemoteScenes, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW,
  setSelectedSceneUid, setSelectedVariantName,
  setVariantsCollection,
  setVariantsLoading
} from '../../store/actions/loadScenes'
import SceneBlobLoader from '../SceneBlobLoader/SceneBlobLoader'
import { SCENES_ENDPOINT } from '../../constants/endpoints'

const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

type Props = {
  colorSEO?: string, // ${brandKey}-${colorNumber}-${cleanColorNameForURL(name)}
  brand: string,
  language: string
}

export const ColorDetailsPage = function ColorDetailsPage (props: Props) {
  const { colorSEO, brand, language } = props
  const dispatch = useDispatch()
  loadColors(brand)(dispatch)
  const location = useLocation()
  const history = useHistory()
  const [familyLink: string, setFamilyLink: string => void] = useState('')
  const colorMap: ColorMap = useSelector(store => store.colors.items.colorMap)
  const colorId: ?ColorId = findKey(colorMap, { colorNumber: colorSEO.match(/\d+/)[0] })
  const color: ?Color = colorId ? colorMap[colorId] : undefined
  const [facetId] = useState(uniqueId('cdp-facet_'))
  const initializingFacetId = useSelector(store => store.initializingFacetId)
  const scenesCollection = useSelector(store => store.scenesCollection)
  const variantsCollection = useSelector(store => store.variantsCollection)
  const selectedSceneUid = useSelector(store => store.selectedSceneUid)
  const [scenesFetchCalled, setScenesFetchCalled] = useState(false)
  const initialSelectedVariantName = useSelector(store => store.selectedVariantName)
  const { subscribe, unsubscribe, publish } = useContext(PubSubCtx)
  const [CTAs, setCTAs] = useState()

  const handleNewCTAs = function handleNewCTAs (newCTAs) {
    setCTAs(newCTAs)
  }

  useEffect(() => {
    subscribe('PRISM/in/update-color-ctas', handleNewCTAs)
    return () => unsubscribe('PRISM/in/update-color-ctas', handleNewCTAs)
  }, [])

  useEffect(() => {
    subscribe('prism-family-link', setFamilyLink)
    return () => unsubscribe('prism-family-link', setFamilyLink)
  }, [])

  // This hook is used to control loading of the scene data
  useEffect(() => {
    if (!initializingFacetId) {
      dispatch(setInitializingFacetId(facetId))
    }

    if (initializingFacetId && initializingFacetId === facetId && !scenesFetchCalled) {
      // @todo scene type should probably be a facet prop -RS
      fetchRemoteScenes(brand, { language }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW, dispatch)
      setScenesFetchCalled(true)
    }
  }, [initializingFacetId, facetId, scenesFetchCalled])

  const handleBlobLoaderInit = () => {
    dispatch(setVariantsLoading(true))
  }

  const handleSceneBlobLoaderError = (err) => {
    dispatch(err)
  }

  // This callback initializes all of the scene data
  const handleSceneSurfacesLoaded = (variants) => {
    dispatch(setVariantsCollection(variants))
    // Default to the first room type for the CVW.
    const variant = variants.filter(variant => variant.sceneType === SCENE_TYPES.ROOM)[0]
    // When this value is set it can be used as a flag that the cvw has initialized the scene data
    dispatch(setSelectedSceneUid(variant.sceneUid))
    dispatch(setSelectedVariantName(variant.variantName))
    dispatch(setVariantsLoading(false))
  }

  return (
    <>
      {scenesCollection && <SceneBlobLoader
        scenes={scenesCollection}
        variants={variantsCollection}
        handleBlobsLoaded={handleSceneSurfacesLoaded}
        handleError={handleSceneBlobLoaderError}
        initHandler={handleBlobLoaderInit} />}
      {!colorMap || !selectedSceneUid ? <HeroLoader /> : (colorId && color
        ? (
          <>
            <Redirect to={`${colorDetailsBaseUrl}/${colorId}/${color.brandKey}-${color.colorNumber}-${cleanColorNameForURL(color.name)}`} />
            {location.pathname !== '/' && (
              <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`}>
                <ColorDetails
                  familyLink={familyLink}
                  initialColor={color}
                  intitialVariantName={initialSelectedVariantName}
                  onColorChanged={newColor => {
                    publish('prism-new-color', newColor)
                    history.push(generateColorDetailsPageUrl(newColor))
                  }}
                  onColorChipToggled={newPosition => publish('prism-color-chip-toggled', newPosition)}
                  callsToAction={CTAs}
                />
              </Route>
            )}
          </>
        )
        : (
          <GenericMessage type={GenericMessage.TYPES.ERROR}>
            <FormattedMessage id='UNSPECIFIED_COLOR' />
          </GenericMessage>
        )
      )}
    </>
  )
}

ColorDetailsPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDetailsPage, 'ColorDetailsFacet')
