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
const clearUploads = () => {
  return {
    type: CLEAR_UPLOADS,
    payload: {
      error: false
    }
  }
}

// export const uploadImage = (file: File) => {
//   return (dispatch: Function) => {
//     const imageUrl = URL.createObjectURL(file)
//     const uploadForm = new FormData()

//     // clear out any existing images that were uploaded
//     dispatch(clearUploads())

//     uploadForm.append('image', file)

//     dispatch(startUploading())

//     axios
//       .post(ML_PIPELINE_ENDPOINT, uploadForm, {})
//       .then(res => {
//         // const base = 'pool'
//         // let masks = [
//         //   `http://localhost:800/static/${base}/left.png`,
//         //   `http://localhost:800/static/${base}/right.png`
//         // ]

//         // -------------- FAKE ABOVE / REAL BELOW ---------------//

//         const { payload } = res.data
//         // let maskI = 1
//         let masks = []

//         // this will get all the individual masks; comment out one or the other
//         // while (maskI) {
//         //   const mask = payload[`wall_view${maskI}_local`]
//         //   if (mask) {
//         //     masks.push(mask)
//         //     maskI++
//         //     continue
//         //   }
//         //   break
//         // }

//         // this will get the monolithic mask; comment out one or the other
//         masks.push(payload.full_wall_mask_local)

//         const images = {
//           source: imageUrl,
//           masks
//         }
//         dispatch(loadLocalImageUrl(images))
//         dispatch(stopUploading())
//       })
//       .catch(err => {
//         console.error('issue with segmentation: ', err)
//         dispatch(errorUploading())
//       })
//   }
// }

const NANONETS_PREDICTION_ENDPOINT = 'https://customer.nanonets.com/sherwinWilliams/predict/rgbamask'
const NANONETS_AUTH_KEY = 'wrusnuj4vDg14jcrXOxmIirV6p33U8Az'

export const uploadImage = (file: File) => {
  return (dispatch: Function) => {
    const imageUrl = URL.createObjectURL(file)
    const uploadForm = new FormData()

    // clear out any existing images that were uploaded
    dispatch(clearUploads())

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
