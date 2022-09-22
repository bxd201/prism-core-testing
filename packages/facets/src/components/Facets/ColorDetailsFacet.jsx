// @flow
import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Route, useHistory, useParams } from 'react-router-dom'
import findKey from 'lodash/findKey'
import uniqueId from 'lodash/uniqueId'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import { ROUTE_PARAM_NAMES, ROUTE_PARAMS, SCENE_TYPES } from 'src/constants/globals'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps, PubSubCtx } from 'src/facetSupport/facetPubSub'
import { cleanColorNameForURL, generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'
import type { Color, ColorIdFromColorSEO, ColorMap } from 'src/shared/types/Colors.js.flow'
import { loadColors } from 'src/store/actions/loadColors'
import { SCENES_ENDPOINT } from '../../constants/endpoints'
import {
  fetchRemoteScenes,
  handleScenesFetchedForCVW,
  handleScenesFetchErrorForCVW,
  setSelectedSceneUid,
  setSelectedVariantName,
  setVariantsCollection,
  setVariantsLoading
} from '../../store/actions/loadScenes'
import { setInitializingFacetId } from '../../store/actions/system'
import HeroLoader from '../Loaders/HeroLoader/HeroLoader'
import GenericMessage from '../Messages/GenericMessage'
import SceneBlobLoader from '../SceneBlobLoader/SceneBlobLoader'

const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

type Props = {
  colorSEO?: string, // ${brandKey}-${colorNumber}-${cleanColorNameForURL(name)}
  brand: string,
  language: string
}

export const ColorDetailsPage = function ColorDetailsPage(props: Props) {
  const { colorSEO, brand, language } = props
  const dispatch = useDispatch()
  loadColors(brand || 'sherwin')(dispatch)
  const history = useHistory()
  const [familyLink: string, setFamilyLink: (string) => void] = useState('')
  const colorMap: ColorMap = useSelector((store) => store.colors.items.colorMap)
  const { colorId: colorIdFromParams }: { colorId?: ?string } = useParams()
  const colorIdFromColorSEO: ?ColorIdFromColorSEO = findKey(colorMap, { colorNumber: colorSEO.match(/\d+/)[0] })
  const colorIdInUse = colorIdFromParams || colorIdFromColorSEO
  const color: ?Color = colorMap && colorIdInUse ? colorMap[colorIdInUse] : undefined
  const [facetId] = useState(uniqueId('cdp-facet_'))
  const initializingFacetId = useSelector((store) => store.initializingFacetId)
  const scenesCollection = useSelector((store) => store.scenesCollection)
  const variantsCollection = useSelector((store) => store.variantsCollection)
  const selectedSceneUid = useSelector((store) => store.selectedSceneUid)
  const [scenesFetchCalled, setScenesFetchCalled] = useState(false)
  const initialSelectedVariantName = useSelector((store) => store.selectedVariantName)
  const { subscribe, unsubscribe, publish } = useContext(PubSubCtx)
  const [CTAs, setCTAs] = useState()
  const [hasInitNav, setHasInitNav] = useState(false)

  const handleNewCTAs = function handleNewCTAs(newCTAs) {
    setCTAs(newCTAs)
  }

  useEffect(() => {
    if (color && colorIdInUse && !hasInitNav) {
      history.push(
        `${colorDetailsBaseUrl}/${colorIdInUse}/${color.brandKey}-${color.colorNumber}-${cleanColorNameForURL(
          color.name
        )}`
      )
      setHasInitNav(true)
    }
  }, [color, colorIdInUse, hasInitNav])

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
      fetchRemoteScenes(
        brand || 'sherwin',
        { language },
        SCENES_ENDPOINT,
        handleScenesFetchedForCVW,
        handleScenesFetchErrorForCVW,
        dispatch
      )
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
    const variant = variants.filter((variant) => variant.sceneType === SCENE_TYPES.ROOM)[0]
    // When this value is set it can be used as a flag that the cvw has initialized the scene data
    dispatch(setSelectedSceneUid(variant.sceneUid))
    dispatch(setSelectedVariantName(variant.variantName))
    dispatch(setVariantsLoading(false))
  }

  return (
    <>
      {scenesCollection && (
        <SceneBlobLoader
          scenes={scenesCollection}
          variants={variantsCollection}
          handleBlobsLoaded={handleSceneSurfacesLoaded}
          handleError={handleSceneBlobLoaderError}
          initHandler={handleBlobLoaderInit}
        />
      )}
      {!colorMap || !selectedSceneUid ? (
        <HeroLoader />
      ) : colorIdFromColorSEO && color ? (
        <>
          {hasInitNav && (
            <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`}>
              <ColorDetails
                familyLink={familyLink}
                colorFromParent={color}
                intitialVariantName={initialSelectedVariantName}
                onColorChanged={(newColor) => {
                  publish('prism-new-color', newColor)
                  history.push(generateColorDetailsPageUrl(newColor))
                }}
                onColorChipToggled={(newPosition) => publish('prism-color-chip-toggled', newPosition)}
                callsToAction={CTAs}
              />
            </Route>
          )}
        </>
      ) : (
        <GenericMessage type={GenericMessage.TYPES.ERROR}>
          <FormattedMessage id='UNSPECIFIED_COLOR' />
        </GenericMessage>
      )}
    </>
  )
}

ColorDetailsPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDetailsPage, 'ColorDetailsFacet')
