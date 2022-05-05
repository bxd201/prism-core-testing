// @flow
/* global FormData */
import type { MiniColor } from '../../shared/types/Scene'
import * as axios from 'axios'

// THIS IS HUMAN READABLE APP DATA, use for logging and logic, DO NOT USE TO DISPLAY TO END USERS
export const EMPTY_RESPONSE_ERR = 'No response from the server.'

export type RealColorPayload = {
  originalImage?: string,
  mask?: string,
  tintedImage: string,
  realColorId: string,
  color?: MiniColor
}

const extractPayload = (response: any, color: Mini) => {
  // @todo - Standardize internal type for all fastmask request, pull all into hooks. -RS
  const payload = response.data?.['per_img_resp']?.[0]?.[0]?.payload

  return {
    originalImage: payload?.['orig_path'],
    mask: payload?.['mask_path0'],
    tintedImage: payload?.['tinted_path'],
    realColorId: payload?.['id'],
    color: { ...color } // pass the color back to make data self-referential, use brandkey as an id to cache
  }
}

const REAL_COLOR_URL = `${MOCK_API ? '' : ML_API_URL}/prism-ml`

function handleRespError (callback, reject) {
  return (err) => {
    let errorMsg = 'Error fetching real color.'
    if (err.response?.status === 502 || !err.response) {
      errorMsg = EMPTY_RESPONSE_ERR
    }

    const error = new Error(errorMsg)
    console.error(err)
    callback ? callback(null, error) : reject(error)
  }
}

// This function can either return a promise or fire a callback to support different programming styles
export default function getTintedImage (
  activeColor: MiniColor,
  imageUrl: string,
  realColorId: null | string,
  callback?: (any | null, null | Error) => {}): Promise | void {
  // The payload is duck typed, if it is missing a mask, it is a secondary response for a new color for an image
  // that has already been uploaded
  function handleRealColor (resolve, reject) {
    const blobImagePromise = axios.get(imageUrl, { responseType: 'blob' })
      .then((res) => res.data)
      .catch((err) => {
        console.error(err)
        const error = new Error('Could not convert base64 to blob')
        callback ? callback(null, error) : reject(error)
      })

    blobImagePromise.then((imageBlob) => {
      const uploadForm = new FormData()
      uploadForm.append('image', imageBlob)
      uploadForm.append('color', `${activeColor.red},${activeColor.green},${activeColor.blue}`)
      console.log('machine learning api: ', REAL_COLOR_URL)
      return axios.post(`${REAL_COLOR_URL}/`, uploadForm)
    }).then((res) => {
      const realColorData = extractPayload(res, activeColor)// @todo format data -RS
      callback ? callback(realColorData) : resolve(realColorData)
    })
      .catch(handleRespError(callback, reject))
  }

  // return a promise if the dev does not specify a callback
  if (!callback) {
    return new Promise(handleRealColor)
  }

  // directly call the handler if there is a callback
  handleRealColor()
}

export function getVariantTintedImage (activeColor, realColorId, callback) {
  function handleRealColorUpdate (resolve, reject) {
    const uploadForm = new FormData()
    uploadForm.append('caseID', realColorId)
    uploadForm.append('color', `${activeColor.red},${activeColor.green},${activeColor.blue}`)
    return axios.post(`${REAL_COLOR_URL}/realcolorB`, uploadForm)
      .then((res) => {
        const realColorData = extractPayload(res, activeColor)
        callback ? callback(realColorData) : resolve(realColorData)
      })
      .catch(handleRespError(callback, reject))
  }

  if (!callback) {
    return new Promise(handleRealColorUpdate)
  }

  handleRealColorUpdate()
}
