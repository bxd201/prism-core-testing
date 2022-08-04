/**
 * Facet should is sized by parent div.
 */
// @flow
import React, { useContext, useEffect, useState } from 'react'
import facetBinder from 'src/facetSupport/facetBinder'
import { type FacetPubSubMethods } from 'src/facetSupport/facetPubSub'
import type { FacetBinderMethods } from '../../facetSupport/facetInstance'
import uniqueId from 'lodash/uniqueId'
import ConfigurationContext from '../../contexts/ConfigurationContext/ConfigurationContext'
import { useSelector } from 'react-redux'
import { GROUP_NAMES, SCENE_TYPES } from '../../constants/globals'
import { useIntl } from 'react-intl'

import './SceneVisualizerFacet.scss'
import { extractRefDimensions, scaleAndCropImageToSquare, scaleImage } from '../../shared/helpers/imageTools'
import {
  SV_COLOR_UPDATE,
  SV_ERROR,
  SV_NEW_IMAGE_UPLOAD,
  SV_TRIGGER_IMAGE_UPLOAD
} from '../../constants/pubSubEventsLabels'
import FastMaskView from '../FastMask/FastMaskView'
import useColors from '../../shared/hooks/useColors'
import { getColorByBrandAndColorNumber } from '../../shared/helpers/ColorDataUtils'
import SceneVisualizerContent from './SceneVisualizerContent'
import { SimpleTintableScene } from '../ToolkitComponents'
import { hasGroupAccess } from '../../shared/utils/featureSwitch.util'
import BallSpinner from '../BallSpinner/BallSpinner'

type SceneVisualizerProps = FacetPubSubMethods & FacetBinderMethods & {
  groupNames: string[],
  maxSceneHeight: number,
  defaultImage: string,
  defaultMask: string,
  forceSquare?: number,
  defaultColor: string,
  sceneName: string,
  uploadButtonText: string
}

export function SceneVisualizerFacet (props: SceneVisualizerProps) {
  const { loadingConfiguration } = useContext(ConfigurationContext)
  // eslint-disable-next-line no-unused-vars
  const { groupNames, defaultMask, maxSceneHeight, sceneName, uploadButtonText } = props
  const [facetId] = useState(uniqueId('sv-facet_'))
  const [error, setError] = useState(null)
  const [fastMaskLoading, setFastMaskLoading] = useState(false)
  const [uploadInitiated, setUploadInitiated] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedImageRefDims, setUploadedImageRefDims] = useState(null)
  const activeColor = useSelector(store => store.lp.activeColor)
  const [tintColor, setTintColor] = useState(null)
  const [colors] = useColors()
  // This flag is used to inform the facet if fastmask has been drawn to screen with api mask data
  const [tinterRendered, setTinterRendered] = useState(false)
  const [uploadId, setUploadId] = useState(null)
  // used to trigger reflow in hook that is color aware
  const [colorName, setColorName] = useState(null)
  const [initialImageUrl, setInitialImageUrl] = useState(null)
  const [initialUploadedImageRefDims, setInitialUploadedImageRefDims] = useState(null)
  const [shouldShowInitialImage, setShouldShowInitialImage] = useState(true)
  const [initialMaskImageUrl, setInitialMaskImageUrl] = useState(null)

  const intl = useIntl()

  const setNewTintColor = (colorName: string, colors: any) => {
    const [brand, colorNo] = colorName?.split('-')
    if (colors?.colorMap && brand) {
      const color = getColorByBrandAndColorNumber(brand, colorNo, colors)
      if (!color) {
        throw new Error('No color found. Hint: Make sure the color number and brand code are correct in the embed.')
      }
      setTintColor(color)
    }
  }

  const getEventId = () => uniqueId('sv_event_id_')

  const loadAndCrop = (payload: any, toHeight: number, makeSquare?: number) => {
    const { data: image, eventId } = payload
    const imageBlobUrl = URL.createObjectURL(image)
    const imagePromise = makeSquare ? scaleAndCropImageToSquare(imageBlobUrl, makeSquare) : scaleImage(imageBlobUrl, toHeight)
    imagePromise
      .then(data => {
        setUploadedImage(data.url)
        setUploadedImageRefDims(extractRefDimensions(data))
        setFastMaskLoading(false)
        setShouldShowInitialImage(false)
        setUploadId(eventId)
        URL.revokeObjectURL(imageBlobUrl)
      })
      .catch(err => setError(err))
  }

  const imageScaleCallback = data => {
    setInitialImageUrl(data.url)
    setInitialUploadedImageRefDims(extractRefDimensions(data))
    setTinterRendered(true)
  }

  const cropDefaultImage = (imageUrl: string, toHeight: number, makeSquare?: number, callback: Function) => {
    // crop image
    if (makeSquare) {
      scaleAndCropImageToSquare(imageUrl, makeSquare)
        .then(callback)
        .catch(err => setError(err))
    } else {
      scaleImage(imageUrl, toHeight)
        .then(callback)
        .catch(err => setError(err))
    }
  }

  useEffect(() => {
    const { forceSquare, defaultImage, subscribe } = props
    // Listen for color updates
    subscribe(SV_COLOR_UPDATE, (payload: any) => {
      setColorName(payload.data)
    })
    // listen for image uploads
    subscribe(SV_NEW_IMAGE_UPLOAD, (payload: any) => {
      setUploadInitiated(false)
      if (payload.data) {
        setFastMaskLoading(true)
        loadAndCrop(payload, props.maxSceneHeight, forceSquare)
      }
    })
    // @todo wrap this in an if statement and use facet prop to determine if initial images needs to be cropped.  Pre cropping loads A LOT faster.
    cropDefaultImage(defaultImage, maxSceneHeight, forceSquare, imageScaleCallback)
    // ref dims should be the same as parent...
    cropDefaultImage(defaultMask, maxSceneHeight, forceSquare, (data) => setInitialMaskImageUrl(data.url))
  }, [])

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])

  // If there is an active color set it if allowed by groups, but this will be overridden by the default color if one is specified after the colors load
  useEffect(() => {
    if (hasGroupAccess(groupNames, GROUP_NAMES.COLORS)) {
      setTintColor(activeColor)
    }
  }, [activeColor])

  useEffect(() => {
    const { defaultColor } = props

    if (colorName) {
      setNewTintColor(colorName, colors)
    } else {
      setNewTintColor(defaultColor, colors)
    }
  }, [colors, colorName])

  const initUpload = (e: SyntheticEvent) => {
    e.preventDefault()
    const eventId = getEventId()
    setUploadInitiated(true)
    props.publish(SV_TRIGGER_IMAGE_UPLOAD, { eventId })
  }

  const handleFastMaskLoadError = (err: any) => {
    // Reset State
    setUploadId(null)
    setTinterRendered(true)
    setShouldShowInitialImage(true)
    props.publish(SV_ERROR, { error: err })
  }

  const handleFastMaskCleanup = () => {
    setTinterRendered(false)
  }

  const handleFastMaskUpdates = (data: any) => {
    setTinterRendered(true)
  }

  const handleFastMaskClose = (e: SyntheticEvent) => {
    e.preventDefault()
    setShouldShowInitialImage(true)
  }

  return (<>
    <div
      className={!shouldShowInitialImage ? 'scene-visualizer--hidden' : 'scene-visualizer'}>
      {fastMaskLoading ? <div className={'scene-visualizer__loader'}><BallSpinner /></div> : null}
      {
        !loadingConfiguration &&
      initialImageUrl &&
      initialMaskImageUrl &&
      initialUploadedImageRefDims &&
      tintColor
          ? <SceneVisualizerContent
            tinterRendered={tinterRendered}
            initUpload={initUpload}
            uploadInitiated={uploadInitiated}
            uploadButtonText={uploadButtonText}
            tinter={<SimpleTintableScene
              spinner={<BallSpinner />}
              sceneType={SCENE_TYPES.ROOM}
              sceneName={sceneName}
              background={initialImageUrl}
              surfaceUrls={[initialMaskImageUrl]}
              surfaceIds={[facetId]}
              surfaceColors={[tintColor]}
              width={initialUploadedImageRefDims.imageWidth}
              height={initialUploadedImageRefDims.imageHeight} />} />
          : null}</div>
    <div className={shouldShowInitialImage ? 'scene-visualizer--hidden' : 'scene-visualizer'}>{
      uploadedImage &&
      uploadedImageRefDims &&
      tintColor &&
      uploadId
        ? <SceneVisualizerContent
          tinterRendered={tinterRendered}
          handleFastMaskClose={handleFastMaskClose}
          initUpload={initUpload}
          uploadInitiated={uploadInitiated}
          shouldShowCloseBtn
          tinter={<FastMaskView
            shouldPrimeImage
            spinner={<BallSpinner />}
            key={uploadId}
            showSpinner={fastMaskLoading}
            handleSceneBlobLoaderError={handleFastMaskLoadError}
            handleError={handleFastMaskLoadError}
            refDims={uploadedImageRefDims}
            imageUrl={uploadedImage}
            activeColor={tintColor}
            handleUpdates={handleFastMaskUpdates}
            cleanupCallback={handleFastMaskCleanup}
            shouldHide
            loadingMessage={[
              intl.formatMessage({ id: 'SCENE_VISUALIZER.FASTMASK_LOADING_MSG_1' }),
              intl.formatMessage({ id: 'SCENE_VISUALIZER.FASTMASK_LOADING_MSG_2' })
            ]}
          />} />
        : null}</div>
  </>)
}

export default facetBinder(SceneVisualizerFacet, 'SceneVisualizerFacet')
