// @flow
import { useEffect,useState } from 'react'
import * as deeplab from '@tensorflow-models/deeplab'
import memoize from 'lodash/memoize'
import { type RGBArr } from 'src/shared/types/Colors.js.flow'

// ----------------------------------------------
// TYPES
// ----------------------------------------------

export type DeepLabModels = 'ade20k' | 'cityscapes' | 'pascal'
export type QuantizationBytes = 1 | 2 | 4
export type ModelSegmentationResults = {
  legend: {
    [key: string]: RGBArr
  },
  height: number,
  width: number,
  segmentationMap: Uint8ClampedArray
}

type Output = [ typeof deeplab.SemanticSegmentation, boolean, boolean ]

// ----------------------------------------------
// CONSTANTS
// ----------------------------------------------

export const deepLabModels = {
  PASCAL: 'pascal',
  CITYSCAPES: 'cityscapes',
  ADE20K: 'ade20k'
}

const defaultQuantizationBytes = 4

const getModel = memoize(async (modelName: DeepLabModels, quantizationBytes: QuantizationBytes): Promise<typeof deeplab.SemanticSegmentation> => {
  // eslint-disable-next-line no-return-await
  return await deeplab.load({ base: modelName, quantizationBytes })
}, (modelName: DeepLabModels, quantizationBytes: QuantizationBytes) => `${modelName}|${quantizationBytes}`)

// ----------------------------------------------
// HOOK
// ----------------------------------------------

function useDeepLabModel (modelName: DeepLabModels, quantizationBytes: QuantizationBytes = defaultQuantizationBytes): Output {
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)

    getModel(modelName, quantizationBytes)
      .then(model => setModel(model))
      .catch(err => {
        console.warn('Error loading model', err)
        setError(true)
      })
      .then(() => setLoading(false))
  }, [modelName, quantizationBytes])

  return [model, loading, error]
}

export default useDeepLabModel
