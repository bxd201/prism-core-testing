// @flow
import { useState, useEffect } from 'react'
import * as deeplab from '@tensorflow-models/deeplab'
import memoize from 'lodash/memoize'

export type DeepLabModels = 'ade20k' | 'cityscapes' | 'pascal'
export type QuantizationBytes = 1 | 2 | 4

const deepLabModels = {
  PASCAL: 'pascal',
  CITYSCAPES: 'cityscapes',
  ADE20K: 'ade20k'
}

const defaultQuantizationBytes = 4

const getModel = memoize(async (modelName: DeepLabModels, quantizationBytes: QuantizationBytes) => {
  // eslint-disable-next-line no-return-await
  return await deeplab.load({ base: modelName, quantizationBytes })
}, (modelName: DeepLabModels, quantizationBytes: QuantizationBytes) => `${modelName}|${quantizationBytes}`)

function useDeepLabModel (modelName: DeepLabModels, quantizationBytes: QuantizationBytes = defaultQuantizationBytes) {
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

export { deepLabModels }

export default useDeepLabModel
