// @flow
import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'

import FastMaskSVGDef from './FastMaskSVGDef'
import TotalImageWorker from './workers/totalImage.worker'

import { loadImage, getImageRgbaData } from './FastMaskUtils'

import { uploadImage } from '../../store/actions/user-uploads'

import type { Color } from '../../shared/types/Colors'

import './FastMask.scss'
import FileInput from '../FileInput/FileInput'
import uniqueId from 'lodash/uniqueId'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'

const FILE_UPLOAD_ID = uniqueId('fastMaskFileUpload_')

type Props = {
  color: Color,
  uploadImage: Function,
  uploads: Object
}

export function FastMask ({ color, uploadImage, uploads }: Props) {
  const { masks: maskSources, source, uploading } = uploads

  const [userImage, setUserImage] = useState()
  const [masks, setMasks] = useState([])
  const [maskHunches, setMaskHunches] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasDoneAnything, setHasDoneAnything] = useState(false)
  const wrapperRef = useRef(null)
  const hasMasks = masks && masks.length > 0
  const hasHunches = maskHunches && maskHunches.length > 0
  const isUploading = uploading

  function handleChange (e) {
    const { target } = e

    if (target && target.files && target.files[0]) {
      setHasDoneAnything(true)
      setUserImage()
      setMasks([])
      setMaskHunches([])
      uploadImage(e.target.files[0])
    }
  }

  function handleStartProcessing () {
    setIsProcessing(true)
  }

  function handleFinishProcessing () {
    setIsProcessing(false)
  }

  useEffect(() => {
    if (source && maskSources && maskSources.length) {
      // load source image

      Promise.all([
        loadImage(source),
        ...maskSources.map(mask => loadImage(mask))
      ]).then(images => {
        handleStartProcessing()
        const mainImage = images[0]
        const masks = images.slice(1)

        // $FlowIgnore - flow can't understand how the worker is being used since it's not exporting anything
        const totalImageWorker = new TotalImageWorker()
        const userImageData = getImageRgbaData(mainImage, mainImage.naturalWidth, mainImage.naturalHeight)
        const userImageBinaryData = userImageData.data

        totalImageWorker.onmessage = ({ data }) => {
          console.info('Total Image Analysis Results', data)

          setMaskHunches(data.maskBrightnessData)
          setMasks(masks)
        }

        totalImageWorker.postMessage({ image: userImageBinaryData,
          masks: masks.map(mask => {
            const maskImageData = getImageRgbaData(mask, mask.naturalWidth, mask.naturalHeight)
            return maskImageData.data
          })
        })

        setUserImage(mainImage)
      })
    }
  }, [source, maskSources])

  return (
    <React.Fragment>
      <FileInput onChange={handleChange} id={FILE_UPLOAD_ID} disabled={isUploading || isProcessing} placeholder={userImage ? 'Select new image' : 'Select an image'} />

      {!hasDoneAnything ? (
        <hr />
      ) : (
        <div className='fm-wrapper' style={{ maxWidth: 1000, minHeight: 200 }}>

          {userImage && hasMasks && hasHunches ? (
            <div className='fm-wrapper' ref={wrapperRef} style={{ maxWidth: 1000, minHeight: 200 }}>
              {color ? masks.map((mask, maskIndex) => (
                <FastMaskSVGDef
                  key={mask.src}
                  isLight={maskHunches[maskIndex].hunches.isLight}
                  hasHighlight={maskHunches[maskIndex].hunches.hasHighlight}
                  width={userImage.naturalWidth}
                  height={userImage.naturalHeight}
                  color={color}
                  maskId={`mask_${maskIndex}`}
                  filterId={`filter_${maskIndex}`}
                  source={userImage}
                  mask={mask}
                  onFinishProcessing={handleFinishProcessing}
                  onStartProcessing={handleStartProcessing}
                />
              )) : null}
              <img className='image-natural' src={userImage.src} alt='' />
              {color ? masks.map((mask, maskIndex) => (
                <svg key={mask.src} className='image-tinted' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${userImage.naturalWidth * 2} ${userImage.naturalHeight * 2}`} preserveAspectRatio='none'>
                  <rect fill='rgba(0,0,0,0)' x='0' y='0' width='100%' height='100%' mask={`url(#mask_${maskIndex})`} filter={`url(#filter_${maskIndex})`} />
                </svg>
              )) : null}
            </div>
          ) : null}

          {isProcessing || isUploading ? (
            <GenericOverlay type={GenericOverlay.TYPES.LOADING} message={isUploading ? 'Loading...' : 'Processing, slowly...'} semitransparent />
          ) : null}
        </div>
      )}
    </React.Fragment >
  )
}

const mapStateToProps = (state, props) => {
  const { uploads, lp } = state

  return {
    color: lp.activeColor || { hex: '#aeaeae' },
    uploads
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    uploadImage: (file: any) => {
      dispatch(uploadImage(file))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FastMask)
