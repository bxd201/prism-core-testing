// @flow
import { useState, useEffect } from 'react'
import intersection from 'lodash/intersection'
import { type RGBArr, type Color } from 'src/shared/types/Colors.js.flow'
import RgbQuant from 'rgbquant'
import { tinycolor } from '@ctrl/tinycolor'
import { colorMatch, getColorDistance } from 'src/components/PaintScene/utils'
import flattenDeep from 'lodash/flattenDeep'
import uniq from 'lodash/uniq'
import sortBy from 'lodash/sortBy'
import values from 'lodash/values'
import useColors from 'src/shared/hooks/useColors'
import { type ModelSegmentationResults } from 'src/shared/hooks/useDeepLabModel'
import { type SemanticSegmentation } from '@tensorflow-models/deeplab'
import getImageDataFromImage from 'src/shared/utils/getImageDataFromImage.util'
import loadImage from 'src/shared/utils/loadImage.util'
import createCanvasElementWithData from 'src/shared/utils/createCanvasElementWithData.util'

const SW_COLOR_MATCH_THRESHHOLD = 8 // 0 = perfect match, 100 = worst possible match
const VALID_SEGMENT_THRESHHOLD = 0.03
const DESIRED_LABELS = ['wall', 'floor', 'flooring', 'ceiling', 'bed', 'cabinet', 'table', 'plant', 'flora', 'plantlife', 'curtain', 'drape', 'drapery', 'mantle', 'pall', 'chair', 'painting', 'picture', 'sofa', 'couch', 'lounge', 'shelf', 'rug', 'carpet', 'carpeting', 'armchair', 'desk', 'wardrobe', 'closet', 'press', 'chestofdrawers', 'chest', 'bureau', 'dresser', 'counter', 'sink', 'fireplace', 'hearth', 'openfireplace', 'refrigerator', 'icebox', 'case', 'displaycase', 'showcase', 'vitrine', 'bookcase', 'coffeetable', 'cocktailtable', 'countertop', 'stove', 'kitchenstove', 'range', 'kitchenrange', 'cookingstove', 'kitchen island', 'ottoman', 'pouf', 'pouffe', 'puff', 'hassock', 'buffet', 'counter', 'sideboard', 'oven', 'dishwasher', 'dishwasher', 'dishwashingmachine']
const RGB_QUANT_OPTIONS = {
  colors: 20 // how many colors to which to reduce input image
}

type Piece = {
  height: number,
  width: number,
  pixels: Uint8ClampedArray,
  legendColor: RGBArr,
  label: string
}

type PiecePosterizationData = {
  image: string,
  palette: tinycolor[],
  swPalette: (Color[] | typeof undefined)[],
  recurringCoordinatingColors: Color[],
  suggestedColors: string[]
}

type SegmentationResults = {
  segmentationMapImagePath: string,
  displayedLabels: string[],
  pieces: Piece[],
  piecesData: PiecePosterizationData[],
  relevantLabels: string[]
} | typeof undefined

type Response = [
  SegmentationResults,
  boolean, // success
  string | typeof undefined, // error
  boolean, // loading
  boolean // processing
]

function useDeepLabModelForSegmentation (model: SemanticSegmentation, inputImage: typeof undefined | string): Response {
  const [results, setResults] = useState<SegmentationResults | typeof undefined>()
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | typeof undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [processing, setProcessing] = useState<boolean>(false)
  const [ { colorMap }, { loading: loadingColorData } ] = useColors()

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

      if (loadingColorData) {
        return
      }

      loadImage(inputImage).then((loadedImg) => {
        setLoading(false)
        setProcessing(true)

        model.segment(loadedImg).then((results: ModelSegmentationResults) => {
          const { legend, height, width, segmentationMap } = results
          const sourceImgData = getImageDataFromImage(loadedImg, width, height)

          // need to save this canvas element so we can render it
          const segmentationMapImagePath = createCanvasElementWithData(new ImageData(segmentationMap, width, height), width, height).toDataURL()

          // get every object based on the provided labels that are returned and cross checking that with the
          // list of labels we care about.
          const labels = Object.keys(legend)

          const relevantLabels = intersection(DESIRED_LABELS, labels)
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

          Promise.all(roomPieces.map((piece: Piece): Promise<PiecePosterizationData> => {
            return new Promise((resolve, reject) => {
              // -----------------------------------------------
              // DETERMINE MOST PROMINENT COLORS IN IMAGE
              const { height, pixels, width } = piece
              const ctx = createCanvasElementWithData(new ImageData(pixels, width, height), width, height)
              const q = new RgbQuant(RGB_QUANT_OPTIONS)

              q.sample(ctx)

              const palette = q.palette(true, true)

              const filteredPalette = palette.map((rgb: RGBArr) => tinycolor(`rgb(${rgb.join(',')})`)).filter(tc => {
                const sat = tc.toHsl().s
                const l = tc.toHsl().l
                // colors need to be at least 5% saturated, and 20-90% light to be considered part of our palette
                return sat > 0.05 && l < 0.9 && l > 0.2
              })

              const filteredPalette2 = filteredPalette.filter((val, i) => {
                let keep = true

                filteredPalette.forEach((val2, i2) => {
                  // don't test same colors
                  if (i === i2) {
                    return
                  }

                  // if these two colors are at least 90% similar...
                  if (colorMatch(val, val2, 85)) {
                    // AND our main index is > this index...
                    if (i > i2) {
                      // ... we need to reject this color
                      keep = false
                    }
                  }
                })

                return keep
              })

              // -----------------------------------------------
              // GET NEAREST SW COLOR MATCHES

              const swColorMatches = filteredPalette2.map((color: tinycolor) => {
                const thisRgb = color.toRgb()
                const thisMatches = sortBy(
                  values(colorMap)
                    .map((swCol) => {
                      const { red: r, green: g, blue: b } = swCol
                      return {
                        _dist: getColorDistance({ r: r, g: g, b: b }, thisRgb),
                        color: swCol
                      }
                    })
                    .filter(({ _dist }) => _dist <= SW_COLOR_MATCH_THRESHHOLD)
                    .map(({ color }) => color),
                  '_dist'
                ).slice(0, 3)

                return thisMatches
              })

              // -----------------------------------------------
              // GET REPEATED ACCENT COLORS

              const allCoordinating = sortBy(flattenDeep(swColorMatches.map((colors: Color[]) => colors.map((color: Color) => values(color.coordinatingColors)))))
              const duplicates = uniq(allCoordinating.filter((v, i, a) => a.indexOf(v) !== i)).map(id => id && colorMap[id])

              resolve({
                palette: filteredPalette2,
                swPalette: swColorMatches,
                recurringCoordinatingColors: duplicates,
                image: ctx.toDataURL(),
                suggestedColors: [] // TODO: Add suggested color strings in here from color relationship logic @cody.richmond
              })
            })
          })).then((piecesPosterizationData: PiecePosterizationData[]) => {
            setResults({
              segmentationMapImagePath: segmentationMapImagePath,
              displayedLabels: displayedLabels,
              pieces: roomPieces,
              piecesData: piecesPosterizationData,
              relevantLabels: relevantLabels
            })
            setSuccess(true)
          }).catch(error => {
            console.error(error)
            setSuccess(false)
            setError('Encountered an issue determining segment colors.')
          }).then(() => {
            setProcessing(false)
          })
        }).catch(e => {
          setError('The image segmentation process encountered an error.')
        })
      }).catch(error => {
        console.error(error)
        setError('Unable to load the image.')
      })
    }
  }, [ inputImage, model, loadingColorData ])

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

export default useDeepLabModelForSegmentation
