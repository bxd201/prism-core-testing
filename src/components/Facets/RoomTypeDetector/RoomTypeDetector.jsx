// @flow
import React, { useState, useRef } from 'react'
import uniqueId from 'lodash/uniqueId'
import * as deeplab from '@tensorflow-models/deeplab'

import FileInput from '../../FileInput/FileInput'
import GenericOverlay from '../../Overlays/GenericOverlay/GenericOverlay'

import facetBinder from 'src/facetSupport/facetBinder'

const FILE_UPLOAD_ID = uniqueId('roomTypeDetectorFileUpload_')

// get the object out of the original image
function getObjectPixels (imageData, label, src) {
  const len = imageData.length
  const step = 4
  const objPixels = new Uint8ClampedArray(len)

  const imgRgb = [
    label[0],
    label[1],
    label[2]
  ].join(',')

  for (let i = 0; i < len; i += step) {
    const maskRgb = [
      imageData[i],
      imageData[i + 1],
      imageData[i + 2]
    ].join(',')

    if (maskRgb === imgRgb) {
      objPixels[i] = src[i]
      objPixels[i + 1] = src[i + 1]
      objPixels[i + 2] = src[i + 2]
      objPixels[i + 3] = src[i + 3]
    } else {
      objPixels[i] = 0
      objPixels[i + 1] = 0
      objPixels[i + 2] = 0
      objPixels[i + 3] = 0
    }
  }

  return objPixels
}

// Generates a data URL given some image data and the size of it
function getObjectImageUrl (imageData, width, height) {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.putImageData(imageData, 0, 0)

  return elem.toDataURL()
}

const RoomTypeDetector = () => {
  const [uploadedImage, setUploadedImage] = useState()
  const [roomObjectImages, setRoomObjectImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [deeplabModel, setDeeplabModel] = useState(null)
  const [labels, setLabels] = useState([])
  const imgRef = useRef()
  const segmentCanvas = useRef()
  const originalImageCanvas = useRef()

  const loadModel = async () => {
    const modelName = 'ade20k' // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
    const quantizationBytes = 2 // either 1, 2 or 4

    // eslint-disable-next-line no-return-await
    return await deeplab.load({ base: modelName, quantizationBytes })
  }

  if (deeplabModel === null) {
    loadModel().then(model => {
      console.log('model loaded')
      setDeeplabModel(model)
    })
  }

  function handleChange (e) {
    const { target } = e

    if (target && target.files && target.files[0]) {
      setUploadedImage(URL.createObjectURL(e.target.files[0]))

      setIsProcessing(true)

      const userImage = new Image()
      userImage.src = URL.createObjectURL(e.target.files[0])
      userImage.onload = () => {
        deeplabModel.segment(userImage).then(results => {
          console.log(results)
          const { legend, height, width, segmentationMap } = results
          const ctx = segmentCanvas.current.getContext('2d')
          const ctxSource = originalImageCanvas.current.getContext('2d')

          // eslint-disable-next-line no-undef
          const segmentationImg = new ImageData(segmentationMap, width, height)

          segmentCanvas.current.height = height
          segmentCanvas.current.width = width

          originalImageCanvas.current.height = height
          originalImageCanvas.current.width = width

          ctx.putImageData(segmentationImg, 0, 0)

          ctxSource.drawImage(imgRef.current, 0, 0, width, height)
          const sourceImgData = ctxSource.getImageData(0, 0, width, height)

          /** HAHAH Let's see how slow this is if we get every single object */
          const labels = Object.keys(results.legend)
          const objectImages = []
          labels.forEach(label => {
            const roomObjPixels = getObjectPixels(segmentationImg.data, legend[label], sourceImgData.data)
            // eslint-disable-next-line no-undef
            const roomObjImageData = new ImageData(roomObjPixels, width, height)
            const roomObjImg = getObjectImageUrl(roomObjImageData, width, height)

            // get sizes of array
            const sourceImageSize = sourceImgData.data.length
            const maskedImageSize = roomObjPixels.filter(v => v > 0).length

            // only return objects that are xx% of the original image size
            if (maskedImageSize > Math.round(sourceImageSize * 0.05)) {
              objectImages.push({
                label,
                img: roomObjImg
              })
            }
          })

          setRoomObjectImages(objectImages)
          /** ************************************************************** */

          setLabels(labels)
          setIsProcessing(false)
        })
      }
    }
  }

  if (deeplabModel === null) {
    return (
      <>Loading model...</>
    )
  }

  return (
    <>
      <FileInput onChange={handleChange} disabled={false} id={FILE_UPLOAD_ID} placeholder={uploadedImage ? 'Select new image' : 'Select an image'} />
      {uploadedImage ? (
        <div className='fm-wrapper' style={{ maxWidth: 1000, minHeight: 200 }}>
          <img ref={imgRef} className='image-natural' src={uploadedImage} alt='' />
          {isProcessing ? (
            <GenericOverlay type={GenericOverlay.TYPES.LOADING} message='Detecting...' semitransparent />
          ) : null}
        </div>
      ) : null}
      {roomObjectImages.map((obj, index) => (
        <React.Fragment key={obj.label}>
          <h3>{obj.label}</h3>
          <img src={obj.img} alt='' />
        </React.Fragment>
      ))}
      <canvas ref={segmentCanvas} />
      <canvas ref={originalImageCanvas} />
      {labels.length ? (
        <ul>
          {labels.map((l, i) => (
            <li key={i}>
              {l}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

export default facetBinder(RoomTypeDetector, 'RoomTypeDetector')
