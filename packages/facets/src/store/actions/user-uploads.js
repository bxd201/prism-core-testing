// @flow
/* global FormData */
import axios from 'axios'
import at from 'lodash/at'
import { type ProcessedImageMetadata } from '../../shared/types/Scene.js.flow'

export const START_UPLOADING = 'START_UPLOADING'
const startUploading = () => {
  return {
    type: START_UPLOADING,
    payload: {
      uploading: true
    }
  }
}

export const STOP_UPLOADING = 'STOP_UPLOADING'
const stopUploading = () => {
  return {
    type: STOP_UPLOADING,
    payload: {
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
      uploading: false,
      mask: null
    }
  }
}

export const UPLOAD_COMPLETE = 'UPLOAD_COMPLETE'
const loadLocalImageUrl = (images) => {
  return {
    type: UPLOAD_COMPLETE,
    payload: {
      ...images,
      error: false,
      uploading: false
    }
  }
}

export const CLEAR_UPLOADS = 'CLEAR_UPLOADS'
export const clearUploads = () => {
  return {
    type: CLEAR_UPLOADS,
    payload: {
      error: false,
      source: null,
      iris: null,
      uploading: false,
      processing: false
    }
  }
}

export const IRIS_PROCESSING_BEGIN = 'IRIS_PROCESSING_BEGIN'
const beginIrisProcessing = () => {
  return {
    type: IRIS_PROCESSING_BEGIN,
    payload: {
      processing: true
    }
  }
}

export const IRIS_PROCESSING_COMPLETE = 'IRIS_PROCESSING_COMPLETE'
const completeIrisProcessing = (irisData, originalImage) => {
  return {
    type: IRIS_PROCESSING_COMPLETE,
    payload: {
      iris: irisData,
      image: originalImage,
      processing: false
    }
  }
}

export const IRIS_LOADING_BEGIN = 'IRIS_LOADING_BEGIN'
const beginIrisUploading = () => {
  return {
    type: IRIS_LOADING_BEGIN,
    payload: {
      uploading: true
    }
  }
}

export const IRIS_LOADING_COMPLETE = 'IRIS_LOADING_COMPLETE'
const completeIrisUploading = () => {
  return {
    type: IRIS_LOADING_COMPLETE,
    payload: {
      uploading: false
    }
  }
}

export const uploadImage = (file: File) => {
  return (dispatch: Function) => {
    // const imageUrl = URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    dispatch(clearUploads())

    uploadForm.append('image', file)

    dispatch(startUploading())

    axios
      .post(`${ML_API_URL}/prism-ml/`, uploadForm, {})
      .then(res => at(res, 'data.per_img_resp[0][0].payload')[0] || (() => { throw new Error('No relevant data in response') })())
      .then(data => {
        // eslint-disable-next-line camelcase
        const { mask_path0, original_img_path } = data
        // eslint-disable-next-line camelcase
        const masks = [mask_path0]

        const images = {
          source: original_img_path,
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

// @todo check to see if we need the queuing logic. I think this is related to fast mask old way. new way is simpler.
export const QUEUE_IMAGE_UPLOAD = 'QUEUE_IMAGE_UPLOAD'
export const queueImageUpload = (imageMetadata: ProcessedImageMetadata) => {
  return (dispatch: Function) => {
    dispatch({
      type: QUEUE_IMAGE_UPLOAD,
      payload: imageMetadata
    })
  }
}

export const DEQUEUE_IMAGE_UPLOAD = 'DEQUEUE_IMAGE_UPLOAD'
export const dequeueImageUpload = () => {
  return (dispatch: Function) => {
    dispatch({
      type: DEQUEUE_IMAGE_UPLOAD,
      payload: null
    })
  }
}

// polling for iris API since it returns a processing state when a worker in the api is running
function poll (fn, timeout, interval) {
  const endTime = Number(new Date()) + (timeout || 2000)

  interval = interval || 100

  const checkCondition = (resolve, reject) => {
    const ajax = fn()

    ajax
      .then(r => r.data)
      .then(r => {
        if (!r.Status || r.Status !== 'Processing') {
          resolve(r)
        } else if (Number(new Date()) < endTime) {
          setTimeout(checkCondition, interval, resolve, reject)
        } else {
          reject(new Error(`Timeout for poll function exceeded: ${arguments}`))
        }
      })
  }

  return new Promise(checkCondition)
}

export const uploadIrisImage = (file: File) => {
  return (dispatch: Function) => {
    const imageUrl = URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    dispatch(clearUploads())
    dispatch(beginIrisUploading())

    // uploadForm.append('image_file', file)
    uploadForm.append('image', file)

    axios
      .post('https://develop-prism-ml-api.ebus.swaws/iris/upload', uploadForm)
      .then(r => r.data)
      .then(r => {
        const uuid = r.uuid
        dispatch(completeIrisUploading())
        dispatch(beginIrisProcessing())

        poll(() => axios.get(`https://develop-prism-ml-api.ebus.swaws/iris/pieces/${uuid}`), 30000, 500).then(data => {
          dispatch(completeIrisProcessing(data, imageUrl))
        }).catch(err => {
          console.error('issue with iris processing: ', err)
          dispatch(errorUploading())
        })
      })
      .catch(err => {
        console.error('issue with iris upload: ', err)
        dispatch(errorUploading())
      })
  }
}

// @todo I suspect this can be removed to, this me thinks is related to the old fast mask
export const INGESTED_IMAGE_URL = 'INGESTED_IMAGE_URL'
export const setIngestedImage = (imageMetadata?: ProcessedImageMetadata) => {
  return {
    type: INGESTED_IMAGE_URL,
    payload: imageMetadata
  }
}
