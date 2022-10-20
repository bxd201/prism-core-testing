/**
 * Facet should is sized by parent div.
 */
// @flow
import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash/lang'
import uniqueId from 'lodash/uniqueId'
import facetBinder from 'src/facetSupport/facetBinder'
import { type FacetPubSubMethods } from 'src/facetSupport/facetPubSub'
import 'src/providers/fontawesome/fontawesome'
import { GROUP_NAMES, SCENE_TYPES } from '../../constants/globals'
import {
  SV_COLOR_UPDATE,
  SV_ERROR,
  SV_NEW_IMAGE_UPLOAD,
  SV_SERVICE_UPDATE,
  SV_TRIGGER_IMAGE_UPLOAD
} from '../../constants/pubSubEventsLabels'
import ConfigurationContext from '../../contexts/ConfigurationContext/ConfigurationContext'
import type { FacetBinderMethods } from '../../facetSupport/facetInstance'
import { getColorByBrandAndColorNumber } from '../../shared/helpers/ColorDataUtils'
import type { ResizePayload } from '../../shared/helpers/imageTools'
import { resizeAndCropImageWithCanvas } from '../../shared/helpers/imageTools'
import useColors from '../../shared/hooks/useColors'
import type { SizedImages } from '../../shared/hooks/useResponsiveListener'
import useResponsiveListener, { getScreenSize, SCREEN_SIZES } from '../../shared/hooks/useResponsiveListener'
import { hasGroupAccess } from '../../shared/utils/featureSwitch.util'
import BallSpinner from '../BallSpinner/BallSpinner'
import RealColorView from '../RealColor/RealColorView'
import { SimpleTintableScene } from '../ToolkitComponents'
import SceneVisualizerContent from './SceneVisualizerContent'
import './SceneVisualizerFacet.scss'

// The breakpoints object contains the programmatic breakpoint and the scene dimensions for all sizes.
// Right now this is a just enough API to meet the need, ideally, we would use responsive images and css but need the
// infrastructure to support it. -RS
type RealColorFacetProps = FacetPubSubMethods &
  FacetBinderMethods & {
    groupNames: string[],
    images: SizedImages,
    masks?: SizedImages,
    defaultColor: string,
    sceneName: string,
    uploadButtonText: string,
    waitMessage?: string,
    breakpoints?: BreakpointObj
  }
// This is a single pixel transparent png image, pass a mask object with empty strings for the url to use this
// This forces the scene tinter to be used  and just render an image
export const FAUX_MASK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC'

function getDefaultMask(mask: SizedImages, viewportSize, fauxMask): string | undefined {
  const maskUrl = mask?.[viewportSize]

  if (maskUrl === '') {
    return fauxMask
  }

  return maskUrl
}

export function RealColorFacet(props: RealColorFacetProps) {
  const { loadingConfiguration } = useContext(ConfigurationContext)
  // eslint-disable-next-line no-unused-vars
  const { groupNames, images, masks, sceneName, uploadButtonText, waitMessage, breakpoints } = props
  const [facetId] = useState(uniqueId('sv-facet_'))
  const [error, setError] = useState(null)
  const [fastMaskLoading, setFastMaskLoading] = useState(false)
  const [uploadInitiated, setUploadInitiated] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const activeColor = useSelector((store) => store.lp.activeColor)
  const [tintColor, setTintColor] = useState(null)
  const [colors] = useColors()
  // This flag is used to inform the facet if fastmask has been drawn to screen with api mask data
  const [tinterRendered, setTinterRendered] = useState(false)
  const [uploadId, setUploadId] = useState(null)
  // used to trigger reflow in hook that is color aware
  const [colorName, setColorName] = useState(null)
  const [initialImageUrl, setInitialImageUrl] = useState(null)
  const [shouldShowInitialImage, setShouldShowInitialImage] = useState(true)
  const [initialMaskImageUrl, setInitialMaskImageUrl] = useState(null)
  // @todo this should be handled server sized by a 3rd party -RS
  // select default image to suite the screens needed aspect ratio, the ref is a
  // shadow to prevent unnecessary renders
  const [viewportSize, setViewportSize] = useState(getScreenSize(breakpoints, SCREEN_SIZES))
  const defaultImage = images[viewportSize]
  const defaultMask = getDefaultMask(masks, viewportSize, FAUX_MASK)
  const sceneWidth = breakpoints[viewportSize].sceneWidth
  const sceneHeight = breakpoints[viewportSize].sceneHeight
  const [updatedImages, setUpdatedImages] = useState(null)

  const handleScreenResize = (size: string): undefined => {
    setViewportSize(size)
  }

  useResponsiveListener(breakpoints, handleScreenResize)

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

  const loadAndCrop = (payload: any, w: number, h: number) => {
    const { data: image, eventId } = payload
    const imageBlobUrl = URL.createObjectURL(image)
    const imagePromise = resizeAndCropImageWithCanvas(imageBlobUrl, w, h)
    imagePromise
      .then((data) => {
        setUploadedImage(data.url)
        setFastMaskLoading(false)
        setShouldShowInitialImage(false)
        setUploadId(eventId)
        URL.revokeObjectURL(imageBlobUrl)
      })
      .catch((err) => setError(err))
  }

  const imageScaleCallback = (data: ResizePayload) => {
    setInitialImageUrl(data.url)
    setTinterRendered(true)
  }

  const cropDefaultImage = (imageUrl: string, w: number, h: number, callback: Function) => {
    // crop image
    resizeAndCropImageWithCanvas(imageUrl, w, h)
      .then(callback)
      .catch((err) => setError(err))
  }

  useEffect(() => {
    const { subscribe } = props
    // Listen for color updates
    subscribe(SV_COLOR_UPDATE, (payload: any) => {
      const { brandColorNumber, images } = payload.data
      setColorName(brandColorNumber)
      setUpdatedImages(cloneDeep(images))
    })
    // listen for image uploads
    subscribe(SV_NEW_IMAGE_UPLOAD, (payload: any) => {
      setUploadInitiated(false)
      if (payload.data) {
        setFastMaskLoading(true)
        loadAndCrop(payload, sceneWidth, sceneHeight)
      }
    })

    cropDefaultImage(defaultImage, sceneWidth, sceneHeight, imageScaleCallback)
    // ref dims should be the same as parent...
    if (defaultMask) {
      cropDefaultImage(defaultMask, sceneWidth, sceneHeight, (data: ResizePayload) => setInitialMaskImageUrl(data.url))
    }
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

  useEffect(() => {
    const imageUrl = updatedImages?.[viewportSize] ?? images[viewportSize]
    const { sceneWidth, sceneHeight } = breakpoints[viewportSize]
    cropDefaultImage(imageUrl, sceneWidth, sceneHeight, (e: ResizePayload) => {
      setInitialImageUrl(imageUrl)
    })
  }, [updatedImages, viewportSize])

  const initUpload = (e: SyntheticEvent) => {
    e.preventDefault()
    const eventId = getEventId()
    setUploadInitiated(true)
    props.publish(SV_TRIGGER_IMAGE_UPLOAD, { eventId })
  }

  const handleRealColorError = (err: any) => {
    // Reset State
    setUploadId(null)
    setTinterRendered(true)
    setShouldShowInitialImage(true)
    props.publish(SV_ERROR, { error: err })
  }

  const handleRealColorCleanup = () => {
    // @todo for fastmask this is set to false document why the render lifecycles differ -RS
    setTinterRendered(true)
  }

  const handleRealColorUpdates = (data: any) => {
    setTinterRendered(true)
    props.publish(SV_SERVICE_UPDATE, data)
  }

  const handleRealColorClose = (e: SyntheticEvent) => {
    e.preventDefault()
    setShouldShowInitialImage(true)
  }

  return (
    <>
      <div className={!shouldShowInitialImage ? 'scene-visualizer--hidden' : 'scene-visualizer'}>
        {fastMaskLoading ? (
          <div className={'scene-visualizer__loader'}>
            <BallSpinner />
          </div>
        ) : null}
        {!loadingConfiguration && tintColor ? (
          <SceneVisualizerContent
            tinterRendered={tinterRendered}
            initUpload={initUpload}
            uploadInitiated={uploadInitiated}
            uploadButtonText={uploadButtonText}
            tinter={
              defaultMask ? (
                <SimpleTintableScene
                  spinner={<BallSpinner />}
                  sceneType={SCENE_TYPES.ROOM}
                  sceneName={sceneName}
                  background={initialImageUrl}
                  surfaceUrls={[defaultMask]}
                  surfaceIds={[facetId]}
                  surfaceColors={[tintColor]}
                  width={sceneWidth}
                  height={sceneHeight}
                />
              ) : (
                <RealColorView
                  key={uploadId}
                  activeColor={tintColor}
                  spinner={<BallSpinner />}
                  imageOpacity={0.5}
                  waitMessage={waitMessage}
                  handlerError={handleRealColorError}
                  handleUpdate={handleRealColorUpdates}
                  cleanupCallback={handleRealColorCleanup}
                  imageUrl={initialImageUrl}
                  breakpoints={breakpoints}
                  sceneWidth={sceneWidth}
                  sceneHeight={sceneHeight}
                />
              )
            }
          />
        ) : null}
      </div>
      <div className={shouldShowInitialImage ? 'scene-visualizer--hidden' : 'scene-visualizer'}>
        {uploadedImage && tintColor && uploadId ? (
          <SceneVisualizerContent
            tinterRendered={tinterRendered}
            handleFastMaskClose={handleRealColorClose}
            initUpload={initUpload}
            uploadInitiated={uploadInitiated}
            uploadButtonText={uploadButtonText}
            shouldShowCloseBtn
            tinter={
              <RealColorView
                key={uploadId}
                activeColor={tintColor}
                spinner={<BallSpinner />}
                imageOpacity={0.5}
                waitMessage={waitMessage}
                handlerError={handleRealColorError}
                handleUpdate={handleRealColorUpdates}
                cleanupCallback={handleRealColorCleanup}
                imageUrl={uploadedImage}
                breakpoints={breakpoints}
              />
            }
          />
        ) : null}
      </div>
    </>
  )
}

export default facetBinder(RealColorFacet, 'RealColorFacet')
