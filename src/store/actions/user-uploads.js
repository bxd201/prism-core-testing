// @flow
/* global FormData */
import axios from 'axios'
import at from 'lodash/at'

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

// const NANONETS_PREDICTION_ENDPOINT = 'https://customer.nanonets.com/sherwinWilliams/predict/rgbamask'
// const NANONETS_AUTH_KEY = 'wrusnuj4vDg14jcrXOxmIirV6p33U8Az'

export const uploadImage = (file: File) => {
  // TODO: remove this when we no longer hvae to deal with https://None showing up in the API results
  const deNoneify = (str: string = ''): string => {
    return `${ML_API_URL}/${str.replace(/^(https?:\/\/None)?\//, '')}`
  }

  return (dispatch: Function) => {
    // const imageUrl = URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    dispatch(clearUploads())

    uploadForm.append('image', file)

    dispatch(startUploading())

    axios
      .post(`${ML_API_URL}/pipeline/`, uploadForm, {})
      .then(res => at(res, 'data.per_img_resp[0][0].payload')[0] || (() => { throw new Error('No relevant data in response') })())
      .then(data => {
        // eslint-disable-next-line camelcase
        const { mask_path0, original_img_path } = data
        const mask = deNoneify(mask_path0)
        const originalImage = deNoneify(original_img_path)

        let masks = []

        // this will get the monolithic mask; comment out one or the other
        masks.push(mask)

        const images = {
          source: originalImage,
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
  return (dispatch: Function) => {
    dispatch({
      type: QUEUE_IMAGE_UPLOAD,
      payload: file
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

export const INGESTED_IMAGE_URL = 'INGESTED_IMAGE_URL'
export const setIngestedImage = (imageUrl: string = '') => {
  return {
    type: INGESTED_IMAGE_URL,
    payload: imageUrl
  }
}
