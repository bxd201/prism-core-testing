// @flow
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import './RealColorView.scss'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import getTintedImage, { getVariantTintedImage } from './RealColorService'
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
    const color = createMiniColorFromColor(activeColor)
    getTintedImage(
      color,
      imageUrl,
      realColorId.current,
      handleRealColorUpdate)

    return () => {
      console.log('Cleaning up real color...')
      cleanupCallback()
    }
  }, [])

  useEffect(() => {
    // Handle new tinted images
    if (realColorPayload) {
      const { tintedImage, realColorId: id, color } = realColorPayload
      realColorId.current = id
      const brandColorKey = getColorBrandKey(color)
      if (!cachedImages.current[brandColorKey]) {
        cachedImages.current[brandColorKey] = tintedImage
      }

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

    if (realColorId.current) {
      setShowSpinner(true)
      getVariantTintedImage(color, realColorId.current, handleRealColorUpdate)
    }
  }, [activeColor])

  useEffect(() => {
    if (realColorError) {
      console.log('Handling real color error...')
      // Errors are handled up the hierarchy and the parent will resolve, probably by rerendering
      handlerError(realColorError)
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
