// @flow
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import { exception, getRealColorException } from '../../analytics/GoogleAnalytics'
import type { ResizePayload } from '../../shared/helpers/imageTools'
import { handleResize } from '../../shared/helpers/imageTools'
import type { BreakpointObj } from '../../shared/hooks/useResponsiveListener'
import useResponsiveListener, { getScreenSize, SCREEN_SIZES } from '../../shared/hooks/useResponsiveListener'
import type { Color } from '../../shared/types/Colors'
import type { MiniColor } from '../../shared/types/Scene'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import { CircleLoader } from '../ToolkitComponents'
import type { RealColorPayload } from './RealColorService'
import getTintedImage, { EMPTY_RESPONSE_ERR, getVariantTintedImage } from './RealColorService'
import './RealColorView.scss'

type RealColorViewProps = {
  imageUrl: string,
  spinner?: any,
  imageOpacity?: number,
  activeColor: Color,
  cleanupCallback: Function,
  handlerError: Function,
  handleUpdate: Function,
  waitMessage?: string,
  breakpoints?: BreakpointObj
}

const baseClassName = 'real-color-view'
const realColorWrapperClassName = `${baseClassName}__wrapper`
const imageClassName = `${baseClassName}__image`
const spinnerWrapperClassName = `${baseClassName}__spinner-wrapper`
const spinnerClassName = `${baseClassName}__spinner`
const waitTextClassName = `${baseClassName}__wait-text`

const getColorBrandKey = (color: MiniColor) => `${color.brandKey}-${color.colorNumber}`

export default function RealColorView(props: RealColorViewProps) {
  const {
    imageUrl,
    spinner,
    imageOpacity,
    activeColor,
    handlerError,
    cleanupCallback,
    handleUpdate,
    waitMessage,
    breakpoints
  } = props

  const { MEDIUM, LARGE } = SCREEN_SIZES
  const [showSpinner, setShowSpinner] = useState<boolean>(true)
  const [displayImage, setDisplayImage] = useState<string | null>(null)
  const cachedImages = useRef<any>({})
  const realColorId = useRef(null)
  const [realColorPayload, setRealColorPayload] = useState(null)
  const [realColorError, setRealColorError] = useState(null)
  // This is used to drive the hooks to retry, this value will always reflect the true total number of all retries, this could be useful for tracking/reporting errors
  const [retryCount, setRetryCount] = useState(0)
  // This is used to track how many recounts since success. This will reset to zero if a successful req has occurred either initially or for variants
  const retryCountShadow = useRef(0)
  const RETRY_LIMIT = 1

  const intl = useIntl()

  const handleRealColorUpdate = (data: RealColorPayload, err) => {
    if (err) {
      setRealColorError(err)
      return
    }

    setRealColorPayload(cloneDeep(data))
    console.log('Handling real color update...')
    handleUpdate(cloneDeep(data))
  }

  const clockId = useRef(null)
  const requestClock = useRef(0)
  // The image ref should only be read by the viewport resize hook
  const imageRef = useRef(null)
  const [viewportSize, setViewportSize] = useState(getScreenSize(breakpoints, SCREEN_SIZES))
  // this is used as a shadow val to prevent rerenders
  const viewportSizeRef = useRef(viewportSize)
  // This is a tracking var to know what the og viewport is so that we can crop appropriately
  const [ogViewport] = useState(viewportSize)
  const colorBrandKeyRef = useRef(getColorBrandKey(createMiniColorFromColor(activeColor)))

  /**
   * This is a good but not great fix for realcolor responsive image problem. A detail explanation here:
   * https://sherwin-williams.atlassian.net/l/cp/0QE1NHtF
   */
  const handleScreenResize = (size: string): undefined => {
    setViewportSize(size)
    viewportSizeRef.current = size
  }

  useResponsiveListener(breakpoints, handleScreenResize)

  useEffect(() => {
    // This is the initializer, it should only run for the first color,
    // retryCount drives this hook to be called until it succeeds or hits the retry limit.
    // the retry limit is enforced by the error handling useEffect
    if (!realColorId.current && retryCountShadow.current <= RETRY_LIMIT) {
      // this means the get tint has not succeeded
      const color = createMiniColorFromColor(activeColor)

      // Reset error clock
      if (clockId.current !== null) {
        window.clearInterval(clockId.current)
        requestClock.current = 0
      }

      clockId.current = setInterval(() => {
        requestClock.current++
      }, 1000)

      getTintedImage(color, imageUrl, realColorId.current, handleRealColorUpdate)
    }

    return () => {
      console.log('Cleaning up real color...')
      if (clockId.current) {
        window.clearInterval(clockId.current)
      }
      cleanupCallback()
    }
  }, [retryCount])

  useEffect(() => {
    // Handle new tinted images
    if (realColorPayload) {
      // clear log counter
      if (clockId.current) {
        window.clearInterval(clockId.current)
        requestClock.current = 0
        clockId.current = null
      }
      const { tintedImage, realColorId: id, color } = realColorPayload
      realColorId.current = id
      const colorBrandKey = getColorBrandKey(color)
      colorBrandKeyRef.current = colorBrandKey
      // use image size as a proxy since they are linked
      const vpSize = viewportSizeRef.current
      const cacheKey = `${colorBrandKey}.${vpSize}`

      if (!cachedImages.current[cacheKey]) {
        cachedImages.current[cacheKey] = tintedImage
      }

      retryCountShadow.current = 0

      // If this is called, there is no cached image so you don't need to check before setting
      const handleImageUpdate = (data: ResizePayload | string): undefined => {
        const url = data.url ? data.url : data
        setDisplayImage(url)
        setShowSpinner(false)
        cachedImages.current[cacheKey] = url
      }

      const {
        md: { sceneWidth: mdWidth, sceneHeight: mdHeight },
        lg: { sceneWidth: lgWidth, sceneHeight: lgHeight }
      } = breakpoints

      const imageLoadHandler = (e: SyntheticEvent) => {
        const { naturalWidth, naturalHeight, src } = e.target
        handleResize(
          src,
          naturalWidth,
          naturalHeight,
          breakpoints,
          viewportSizeRef.current,
          handleImageUpdate,
          handleResizeError
        )

        e.target.removeEventListener('load', imageLoadHandler)
      }
      // load image to get size of it, when this runs, the image in the dom is stale
      const img = document.createElement('img')
      img.addEventListener('load', imageLoadHandler)
      img.src = realColorPayload.tintedImage
    }
  }, [realColorPayload])

  useEffect(() => {
    const color = createMiniColorFromColor(activeColor)
    const colorBrandKey = getColorBrandKey(color)
    colorBrandKeyRef.current = colorBrandKey
    const vpSize = viewportSizeRef.current
    const cacheKey = `${colorBrandKey}.${vpSize}`
    // check for cached image and exit if one found
    const cachedImage = cachedImages.current[cacheKey]
    if (cachedImage) {
      setDisplayImage(cachedImage)
      setShowSpinner(false)

      return
    }

    if (realColorId.current && retryCountShadow.current <= RETRY_LIMIT) {
      setShowSpinner(true)

      // start clock to log error
      clockId.current = setInterval(() => {
        requestClock.current++
      }, 1000)

      getVariantTintedImage(color, realColorId.current, handleRealColorUpdate)
    }
  }, [activeColor, retryCount])

  useEffect(() => {
    if (realColorError) {
      // log real color error
      exception(getRealColorException(requestClock.current))
      requestClock.current = 0

      if (realColorError?.message === EMPTY_RESPONSE_ERR && retryCountShadow.current === 0) {
        // Added retry logic to call the api again if a 502 or empty response comes back
        console.log('Retrying realcolor request...')

        retryCountShadow.current++
        setRetryCount(retryCount + 1)

        return
      }
      console.log('Handling real color error...')
      // Errors are handled up the hierarchy and the parent will resolve, probably by rerendering
      if (retryCount === RETRY_LIMIT) {
        if (clockId.current) {
          window.clearInterval(clockId.current)
          clockId.current = null
          requestClock.current = 0
        }
      }
      handlerError(realColorError, retryCount)
    }
  }, [realColorError])

  const handleResizeError = (err: Error) => {
    console.error(`Could not resize RealColor image: ${err?.message ?? err}`)
  }

  useEffect(
    (url: string) => {
      const successCallback = (data: ResizePayload | string): undefined => {
        const url = data.url ? data.url : data
        const cacheKey = `${colorBrandKeyRef.current}.${viewportSize}`
        cachedImages.current[cacheKey] = url
        setDisplayImage(url)
      }

      const failCallback = (err: Error | string) => setRealColorError(err)
      // this block will resize the default image onmount
      if (!imageRef.current?.src) {
        const imageLoadHandler = (e: SyntheticEvent) => {
          const { naturalWidth, naturalHeight, src } = e.target
          handleResize(
            imageUrl,
            naturalWidth,
            naturalHeight,
            breakpoints,
            viewportSizeRef.current,
            successCallback,
            failCallback
          )
          e.target.removeEventListener('load', imageLoadHandler)
        }

        const img = document.createElement('img')
        img.addEventListener('load', imageLoadHandler)
        img.src = imageUrl
      } else {
        // This block will handle all viewport update mostly synchronously
        // (no preloading to get dimensions) using the imageRef, exit if there is a cached version
        const cacheKey = `${colorBrandKeyRef.current}.${viewportSize}`
        const cachedImage = cachedImages.current[cacheKey]

        if (cachedImage) {
          successCallback(cachedImage)
          return
        }
        const { naturalWidth, naturalHeight, src } = imageRef.current

        handleResize(
          src,
          naturalWidth,
          naturalHeight,
          breakpoints,
          viewportSizeRef.current,
          successCallback,
          failCallback
        )
      }
    },
    [viewportSize]
  )

  return displayImage ? (
    <div className={realColorWrapperClassName}>
      <img
        ref={imageRef}
        style={showSpinner ? { opacity: imageOpacity ?? 0.74 } : null}
        className={imageClassName}
        src={displayImage}
        alt={intl.formatMessage({ id: 'USER_UPLOAD' })}
      />
      {showSpinner ? (
        <div className={spinnerWrapperClassName}>
          {waitMessage ? <div className={waitTextClassName}>{waitMessage}</div> : null}
          <div className={spinnerClassName}>{spinner || <CircleLoader />}</div>
        </div>
      ) : null}
    </div>
  ) : null
}
