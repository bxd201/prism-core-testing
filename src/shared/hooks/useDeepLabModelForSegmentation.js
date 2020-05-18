// @flow
import { useState, useEffect } from 'react'
import { loadImage, getImageRgbaData, createCanvasElementWithData } from 'src/components/Facets/RoomTypeDetector/utils'
import intersection from 'lodash/intersection'
import { type RGBArr } from 'src/shared/types/Colors.js.flow'

const VALID_SEGMENT_THRESHHOLD = 0.03
const desiredLabels = ['wall', 'floor', 'flooring', 'ceiling', 'bed', 'cabinet', 'table', 'plant', 'flora', 'plantlife', 'curtain', 'drape', 'drapery', 'mantle', 'pall', 'chair', 'painting', 'picture', 'sofa', 'couch', 'lounge', 'shelf', 'rug', 'carpet', 'carpeting', 'armchair', 'desk', 'wardrobe', 'closet', 'press', 'chestofdrawers', 'chest', 'bureau', 'dresser', 'counter', 'sink', 'fireplace', 'hearth', 'openfireplace', 'refrigerator', 'icebox', 'case', 'displaycase', 'showcase', 'vitrine', 'bookcase', 'coffeetable', 'cocktailtable', 'countertop', 'stove', 'kitchenstove', 'range', 'kitchenrange', 'cookingstove', 'kitchen island', 'ottoman', 'pouf', 'pouffe', 'puff', 'hassock', 'buffet', 'counter', 'sideboard', 'oven', 'dishwasher', 'dishwasher', 'dishwashingmachine']

type Piece = {
  height: number,
  width: number,
  pixels: Uint8ClampedArray,
  legendColor: RGBArr,
  label: string
}

type Results = {
  legend: {
    [key: string]: RGBArr
  },
  height: number,
  width: number,
  segmentationMap: Uint8ClampedArray
}

type Response = [
  {
    segmentationMapImagePath: string,
    displayedLabels: string[],
    pieces: Piece[],
    relevantLabels: string[]
  } | typeof undefined,
  boolean, // success
  string | typeof undefined, // error
  boolean, // loading
  boolean // processing
]

function useModelForSegmentation (model, inputImage): Response {
  const [results, setResults] = useState()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const reset = () => {
    setResults()
    setSuccess(false)
    setError()
    setLoading(false)
    setProcessing(false)
  }

  useEffect(() => {
    if (inputImage && model) {
      reset()
      setLoading(true)

      loadImage(inputImage).then((loadedImg) => {
        setLoading(false)
        setProcessing(true)
        model.segment(loadedImg).then(results => {
          const { legend, height, width, segmentationMap }: Results = results
          const sourceImgData = getImageRgbaData(loadedImg, width, height)
          const segmentationMapImageData = new ImageData(segmentationMap, width, height)

          // need to save this canvas element so we can render it
          const segmentationMapImagePath = createCanvasElementWithData(segmentationMapImageData, width, height).toDataURL()

          // get every object based on the provided labels that are returned and cross checking that with the
          // list of labels we care about.
          const labels = Object.keys(legend)

          const relevantLabels = intersection(desiredLabels, labels)
          const displayedLabels: string[] = []
          const roomPieces: Piece[] = []
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

          setResults({
            segmentationMapImagePath: segmentationMapImagePath,
            displayedLabels: displayedLabels,
            pieces: roomPieces,
            relevantLabels: relevantLabels
          })
          setProcessing(false)
          setSuccess(true)
        }).catch(error => {
          console.error(error)
          setError('The image segmentation process encountered an error.')
        })
      }).catch(error => {
        console.error(error)
        setError('Unable to load the image.')
      })
    }
  }, [ inputImage, model ])

  return [
    results,
    success,
    error,
    loading,
    processing
  ]
}

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

export default useModelForSegmentation
