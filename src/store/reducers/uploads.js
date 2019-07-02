// @flow
import { UPLOAD_COMPLETE, CLEAR_UPLOADS, START_UPLOADING, STOP_UPLOADING } from '../actions/user-uploads'

const initialState: Object = {
  uploading: false
}

export const uploads = (state: Object = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case START_UPLOADING:
    case STOP_UPLOADING:
    case UPLOAD_COMPLETE:
    case CLEAR_UPLOADS:
      return Object.assign({}, state, {
        ...action.payload
      })

    default:
      return state
  }
}
