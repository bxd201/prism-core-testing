// @flow
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import uniqueId from 'lodash/uniqueId'
import * as deeplab from '@tensorflow-models/deeplab'
import intersection from 'lodash/intersection'

import FileInput from '../../FileInput/FileInput'
import GenericOverlay from '../../Overlays/GenericOverlay/GenericOverlay'

import { loadImage, getImageRgbaData, createCanvasElementWithData } from './utils'
import { desiredLabels } from './RoomTypeDetector.constants'

import facetBinder from 'src/facetSupport/facetBinder'
import GenericMessage from '../../Messages/GenericMessage'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'
import FastMask from 'src/components/FastMask/FastMask'

import { uploadImage } from '../../../store/actions/user-uploads'

import './RoomTypeDetector.scss'
import RoomPiece from './RoomPiece'
import Card from './Card'

const FILE_UPLOAD_ID = uniqueId('roomTypeDetectorFileUpload_')
const VALID_SEGMENT_THRESHHOLD = 0.03

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
  const dispatch = useDispatch()
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
      dispatch(uploadImage(e.target.files[0]))
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

          // get every object based on the provided labels that are returned and cross checking that with the
          // list of labels we care about.
          const labels = Object.keys(legend)
          const relevantLabels = intersection(desiredLabels, labels)
          const displayedLabels = []
          const roomPieces = []
          const sourceImageSize = sourceImgData.data.length / 4

          relevantLabels.forEach(label => {
            // this can maybe just be segmentationMap
            const legendColor = legend[label]
            const roomObjPixels = getObjectPixels(segmentationMap, legendColor, sourceImgData.data)

            // get sizes of array
            const maskedImageSize = roomObjPixels.filter((v, i) => (i + 1) % 4 === 0).filter(v => v > 0).length

            // only return objects that are xx% of the original image size
            if (maskedImageSize > Math.round(sourceImageSize * VALID_SEGMENT_THRESHHOLD)) {
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
          setLabels(relevantLabels)
          setIsProcessing(false)
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

          <div className='RoomTypeDetector__side-by-side__side'>
            <Card title='Fast Mask'>
              <FastMask hideUploadBtn />
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
