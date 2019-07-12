// @flow
/* global FormData */
// eslint-disable-next-line no-unused-vars
import axios from 'axios'

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
const clearUploads = () => {
  return {
    type: CLEAR_UPLOADS,
    payload: {
      error: false
    }
  }
}

export const uploadImage = (file: File) => {
  return (dispatch: Function) => {
    const imageUrl = URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    dispatch(clearUploads())

    uploadForm.append('image', file)

    dispatch(startUploading())

    axios
      .post(ML_PIPELINE_ENDPOINT, uploadForm, {})
      .then(res => {
        const { payload } = res.data
        const images = {
          source: imageUrl,
          masks: [
            // payload.full_wall_mask
            // payload.wall_view1,
            // payload.wall_view2
            payload.full_wall_mask_local
            // payload.wall_view1_local,
            // payload.wall_view2_local`
          ]
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
