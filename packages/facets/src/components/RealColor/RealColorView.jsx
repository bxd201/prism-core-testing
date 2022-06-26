// @flow
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { CircleLoader } from '../ToolkitComponents'

import './RealColorView.scss'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import getTintedImage, { EMPTY_RESPONSE_ERR, getVariantTintedImage } from './RealColorService'
import type { RealColorPayload } from './RealColorService'
import type { MiniColor } from '../../shared/types/Scene'
import cloneDeep from 'lodash/cloneDeep'

type RealColorViewProps = {
  imageUrl: string,
  spinner?: any,
  imageOpacity?: number,
  activeColor: Color,
  cleanupCallback: Function,
  handlerError: Function,
  handleUpdate: Function,
  waitMessage?: string
}

const baseClassName = 'real-color-view'
const realColorWrapperClassName = `${baseClassName}__wrapper`
const imageClassName = `${baseClassName}__image`
const spinnerWrapperClassName = `${baseClassName}__spinner-wrapper`
const spinnerClassName = `${baseClassName}__spinner`
const waitTextClassName = `${baseClassName}__wait-text`

const getColorBrandKey = (color: MiniColor) => `${color.brandKey}-${color.colorNumber}`

export default function RealColorView (props: RealColorViewProps) {
  const {
    imageUrl,
    spinner,
    imageOpacity,
    activeColor,
    handlerError,
    cleanupCallback,
    handleUpdate,
    waitMessage
  } = props

  const [showSpinner, setShowSpinner] = useState<boolean>(true)
  const [displayImage, setDisplayImage] = useState<string>(imageUrl)
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
    handleUpdate()
  }

  useEffect(() => {
    // This is the initializer, it should only run for the first color,
    // retryCount drives this hook to be called until it succeeds or hits the retry limit.
    // the retry limit is enforced by the error handling useEffect
    if (!realColorId.current && retryCountShadow.current <= RETRY_LIMIT) { // this means the get tint has not succeeded
      const color = createMiniColorFromColor(activeColor)
      getTintedImage(
        color,
        imageUrl,
        realColorId.current,
        handleRealColorUpdate)
    }

    return () => {
      console.log('Cleaning up real color...')
      cleanupCallback()
    }
  }, [retryCount])

  useEffect(() => {
    // Handle new tinted images
    if (realColorPayload) {
      const { tintedImage, realColorId: id, color } = realColorPayload
      realColorId.current = id
      const brandColorKey = getColorBrandKey(color)
      if (!cachedImages.current[brandColorKey]) {
        cachedImages.current[brandColorKey] = tintedImage
      }

      retryCountShadow.current = 0
      setDisplayImage(tintedImage)
      setShowSpinner(false)
    }
  }, [realColorPayload])

  useEffect(() => {
    const color = createMiniColorFromColor(activeColor)
    const colorBrandKey = getColorBrandKey(color)
    // check for cached image and exit if one found
    const cachedImage = cachedImages.current[colorBrandKey]

    if (cachedImage) {
      setDisplayImage(cachedImage)
      setShowSpinner(false)

      return
    }

    if (realColorId.current && retryCountShadow.current <= RETRY_LIMIT) {
      setShowSpinner(true)
      getVariantTintedImage(color, realColorId.current, handleRealColorUpdate)
    }
  }, [activeColor, retryCount])

  useEffect(() => {
    if (realColorError) {
      if (realColorError?.message === EMPTY_RESPONSE_ERR && retryCountShadow.current === 0) {
        // Added retry logic to call the api again if a 502 or empty response comes back
        console.log('Retrying realcolor request...')
        retryCountShadow.current++
        setRetryCount(retryCount + 1)

        return
      }
      console.log('Handling real color error...')
      // Errors are handled up the hierarchy and the parent will resolve, probably by rerendering
      handlerError(realColorError, retryCount)
    }
  }, [realColorError])

  return <div className={realColorWrapperClassName}>
    <img
      style={showSpinner ? { opacity: imageOpacity ?? 0.74 } : null}
      className={imageClassName}
      src={displayImage}
      alt={intl.formatMessage({ id: 'USER_UPLOAD' })} />
    {showSpinner ? <div className={spinnerWrapperClassName}>
      {waitMessage ? <div className={waitTextClassName}>{waitMessage}</div> : null}
      <div className={spinnerClassName}>{spinner || <CircleLoader />}</div>
    </div> : null}
  </div>
}
