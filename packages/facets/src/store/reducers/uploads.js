// @flow
import { type ProcessedImageMetadata } from '../../shared/types/Scene.js.flow'
import {
  CLEAR_UPLOADS,
  ERROR_UPLOADING,
  INGESTED_IMAGE_URL,
  IRIS_LOADING_BEGIN,
  IRIS_LOADING_COMPLETE,
  IRIS_PROCESSING_BEGIN,
  IRIS_PROCESSING_COMPLETE,
  START_UPLOADING,
  STOP_UPLOADING,
  UPLOAD_COMPLETE} from '../actions/user-uploads'

const initialState: Object = {
  uploading: false,
  error: false,
  processing: false,
  iris: null
}

export const uploads = (state: any = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case START_UPLOADING:
    case STOP_UPLOADING:
    case UPLOAD_COMPLETE:
    case ERROR_UPLOADING:
    case CLEAR_UPLOADS:
    case IRIS_LOADING_BEGIN:
    case IRIS_LOADING_COMPLETE:
    case IRIS_PROCESSING_BEGIN:
    case IRIS_PROCESSING_COMPLETE:
      return {
        ...state,
        ...action.payload
      }
    case QUEUE_IMAGE_UPLOAD:
      return {
        ...state,
        sceneName: action.payload.name
      }

    default:
      return state
  }
}

export const QUEUE_IMAGE_UPLOAD = 'QUEUE_IMAGE_UPLOAD'
export const queueImageUpload = (file: File) => {
  return (dispatch: any) => {
    dispatch({
      type: QUEUE_IMAGE_UPLOAD,
      payload: file
    })
  }
}

export const DEQUEUE_IMAGE_UPLOAD = 'DEQUEUE_IMAGE_UPLOAD'
export const dequeueImageUpload = () => {
  return (dispatch: any) => {
    dispatch({
      type: DEQUEUE_IMAGE_UPLOAD,
      payload: null
    })
  }
}

export const queuedImageUpload = (state: File | null = null, action: {type: string, payload: File | null }) => {
  if (action.type === QUEUE_IMAGE_UPLOAD || action.type === DEQUEUE_IMAGE_UPLOAD) {
    return action.payload
  }

  if ([UPLOAD_COMPLETE, ERROR_UPLOADING, STOP_UPLOADING].indexOf(action.type) > -1) {
    return null
  }

  return state
}

export const ingestedImageMetadata = (state: ProcessedImageMetadata | null = null, action: { type: string, payload: ProcessedImageMetadata | null }) => {
  if (action.type === INGESTED_IMAGE_URL) {
    return action.payload
  }

  return state
}
