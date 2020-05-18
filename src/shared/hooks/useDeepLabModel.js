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

  useEffect(() => {
    getModel(modelName, quantizationBytes).then(model => setModel(model))
  }, [])

  return model
}

export { deepLabModels }

export default useDeepLabModel
