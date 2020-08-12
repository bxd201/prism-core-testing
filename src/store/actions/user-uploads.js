// @flow
/* global FormData */
import axios from 'axios'

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

export const uploadImage = (file: File) => {
  return (dispatch: Function) => {
    // const imageUrl = URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    dispatch(clearUploads())

    uploadForm.append('image', file)

    dispatch(startUploading())

    axios
      .post(`${ML_API_URL}/pipeline/`, uploadForm, {})
      .then(res => {
        // -------------- FAKE ABOVE / REAL BELOW ---------------//
        const resp = res.data.per_img_resp
        const payload = resp[0][0].payload
        const mask = payload.mask_path0.replace('https://None', ML_API_URL)
        const originalImage = payload.original_img_path.replace('https://None', ML_API_URL)

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
