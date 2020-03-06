// @flow
import React, { useState, useEffect, useCallback } from 'react'
import uniqueId from 'lodash/uniqueId'
import * as deeplab from '@tensorflow-models/deeplab'

import FileInput from '../../FileInput/FileInput'
import GenericOverlay from '../../Overlays/GenericOverlay/GenericOverlay'

import { loadImage, getImageRgbaData, createCanvasElementWithData } from './utils'

import facetBinder from 'src/facetSupport/facetBinder'
import GenericMessage from '../../Messages/GenericMessage'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'

import './RoomTypeDetector.scss'
import RoomPiece from './RoomPiece'
import Card from './Card'

const FILE_UPLOAD_ID = uniqueId('roomTypeDetectorFileUpload_')
const VALID_SEGMENT_THRESHHOLD = 0.02

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

const loadModel = async () => {
  const modelName = 'ade20k' // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
  const quantizationBytes = 4 // either 1, 2 or 4

  // eslint-disable-next-line no-return-await
  return await deeplab.load({ base: modelName, quantizationBytes })
}

const RoomTypeDetector = () => {
  const [error, setError] = useState()
  const [uploadedImage, setUploadedImage] = useState()
  const [roomPieces, setRoomPieces] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deeplabModel, setDeeplabModel] = useState(null)
  const [displayedLabels, setDisplayedLabels] = useState([])
  const [labels, setLabels] = useState([])
  const [segmentationImagePath, setSegmentationImagePath] = useState()

  const handleChange = useCallback((e) => {
    const { target } = e

    if (target && target.files && target.files[0]) {
      setIsLoading(true)
      setSegmentationImagePath()
      setLabels([])
      setRoomPieces([])
      setDisplayedLabels([])
      setUploadedImage(URL.createObjectURL(e.target.files[0]))
    }
  })

  useEffect(() => {
    if (deeplabModel === null) {
      loadModel().then(model => {
        setDeeplabModel(model)
      })
    }
  }, [ deeplabModel ])

  useEffect(() => {
    if (uploadedImage && deeplabModel) {
      loadImage(uploadedImage).then((img) => {
        setIsLoading(false)
        setIsProcessing(true)
        deeplabModel.segment(img).then(results => {
          console.log(results)

          const { legend, height, width, segmentationMap }: {
            legend: string[],
            height: number,
            width: number,
            segmentationMap: Uint8ClampedArray
          } = results

          const sourceImgData = getImageRgbaData(img, width, height)
          const segmentationImgData = new ImageData(segmentationMap, width, height)

          // need to save this canvas element so we can render it
          setSegmentationImagePath(createCanvasElementWithData(segmentationImgData, width, height).toDataURL())

          /** HAHAH Let's see how slow this is if we get every single object */
          const labels = Object.keys(results.legend)
          const displayedLabels = []
          const roomPieces = []
          const sourceImageSize = sourceImgData.data.length / 4

          labels.forEach(label => {
            // this can maybe just be segmentationMap
            const legendColor = legend[label]
            const roomObjPixels = getObjectPixels(segmentationMap, legendColor, sourceImgData.data)

            // get sizes of array
            const maskedImageSize = roomObjPixels.filter((v, i) => (i + 1) % 4 === 0).filter(v => v > 0).length

            const segmentPct = Math.round(sourceImageSize * VALID_SEGMENT_THRESHHOLD)
            console.info(`${label} is ${maskedImageSize} ${segmentPct}% of the whole`)
            // only return objects that are xx% of the original image size
            if (maskedImageSize > segmentPct) {
              displayedLabels.push(label)
              roomPieces.push({
                label,
                width,
                height,
                legendColor,
                pixels: roomObjPixels
              })
            }
          })

          setRoomPieces(roomPieces)
          setDisplayedLabels(displayedLabels)
          setLabels(labels)
          setIsProcessing(false)

          /** ************************************************************** */
        }).catch(error => {
          console.error(error)
          setError('The image segmentation process encountered an error.')
        })
      }).catch(error => {
        console.error(error)
        setError('Unable to load the image.')
      })
    }
  }, [ uploadedImage, deeplabModel ])

  if (deeplabModel === null) {
    return (
      <GenericMessage>Loading model...</GenericMessage>
    )
  }

  if (error) {
    return (
      <GenericMessage type={GenericMessage.TYPES.ERROR}>{error}</GenericMessage>
    )
  }

  return (
    <>
      <FileInput onChange={handleChange} disabled={false} id={FILE_UPLOAD_ID} placeholder={uploadedImage ? 'Select new image' : 'Select an image'} />

      <div className='RoomTypeDetector__side-by-side'>
        {uploadedImage ? <>
          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Original Image' image={!isLoading ? uploadedImage : undefined} omitShim={isProcessing}>
              {isLoading ? (
                <CircleLoader />
              ) : isProcessing ? (
                <GenericOverlay type={GenericOverlay.TYPES.LOADING} message='Detecting...' semitransparent />
              ) : null}
            </Card>
          </div>

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Detected Regions' image={segmentationImagePath}>
              {isLoading || isProcessing ? (
                <CircleLoader />
              ) : null}
            </Card>
          </div>
        </> : null}
      </div>

      {labels.length ? (
        <ul className='RoomTypeDetector__labels'>
          {labels.map((l, i) => {
            return (
              <li key={i} className={`RoomTypeDetector__labels__label ${displayedLabels.indexOf(l) > -1 ? 'RoomTypeDetector__labels__label--bold' : ''}`}>
                {l}
              </li>
            )
          })}
        </ul>
      ) : null}

      {roomPieces && roomPieces.length ? (
        <div className='RoomTypeDetector__found-pieces'>
          {roomPieces.map((piece, index) => <div key={piece.label} className='RoomTypeDetector__found-pieces__piece'>
            <RoomPiece width={piece.width} height={piece.height} label={piece.label} pixels={piece.pixels} legendColor={piece.legendColor} />
          </div>)}
        </div>
      ) : null}
    </>
  )
}

export default facetBinder(RoomTypeDetector, 'RoomTypeDetector')
