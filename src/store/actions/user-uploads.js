// @flow
/* global FormData */
// eslint-disable-next-line no-unused-vars
import axios from 'axios'
// eslint-disable-next-line no-unused-vars
import { ML_PIPELINE_ENDPOINT } from '../../constants/endpoints'

export const START_UPLOADING = 'START_UPLOADING'
const startUploading = () => {
  return {
    type: START_UPLOADING,
    payload: {
      error: false,
      uploading: true
    }
  }
}

export const STOP_UPLOADING = 'STOP_UPLOADING'
const stopUploading = () => {
  return {
    type: STOP_UPLOADING,
    payload: {
      error: false,
      uploading: false
    }
  }
}

export const ERROR_UPLOADING = 'ERROR_UPLOADING'
const errorUploading = () => {
  return {
    type: ERROR_UPLOADING,
    payload: {
      error: true,
      uploading: false
    }
  }
}

export const UPLOAD_COMPLETE = 'UPLOAD_COMPLETE'
const loadLocalImageUrl = (images) => {
  return {
    type: UPLOAD_COMPLETE,
    payload: {
      ...images,
      error: false
    }
  }
}

export const CLEAR_UPLOADS = 'CLEAR_UPLOADS'
export const clearUploads = () => {
  return {
    type: CLEAR_UPLOADS,
    payload: {
      error: false
    }
  }
}

const NANONETS_PREDICTION_ENDPOINT = 'https://customer.nanonets.com/sherwinWilliams/predict/rgbamask'
const NANONETS_AUTH_KEY = 'wrusnuj4vDg14jcrXOxmIirV6p33U8Az'

export const uploadImage = (file: File | string, suppressClear: ?boolean = false) => {
  return (dispatch: Function) => {
    const imageUrl = typeof file === 'string' ? file : URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    if (!suppressClear) {
      dispatch(clearUploads())
    }

    uploadForm.append('image_file', file)

    dispatch(startUploading())

    axios
      .post(NANONETS_PREDICTION_ENDPOINT, uploadForm, { headers: { Authorization: NANONETS_AUTH_KEY } })
      .then(res => {
        let masks = []

        masks.push(res.data.result.wall)

        const images = {
          source: imageUrl,
          masks
        }
        dispatch(loadLocalImageUrl(images))
        dispatch(stopUploading())
      })
      .catch(err => {
        console.error('issue with segmentation: ', err)
        dispatch(errorUploading())
      })
  }
}

export const QUEUE_IMAGE_UPLOAD = 'QUEUE_IMAGE_UPLOAD'
export const queueImageUpload = (file: File) => {
  return (dispatch) => {
    dispatch({
      type: QUEUE_IMAGE_UPLOAD,
      payload: file
    })
  }
}

export const DEQUEUE_IMAGE_UPLOAD = 'DEQUEUE_IMAGE_UPLOAD'
export const dequeueImageUpload = () => {
  return (dispatch) => {
    dispatch({
      type: DEQUEUE_IMAGE_UPLOAD,
      payload: null
    })
  }
}
