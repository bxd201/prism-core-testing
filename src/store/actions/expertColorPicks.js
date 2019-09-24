// @flow
import api from './api'
import { EXPERT_COLOR_PICKS_ENDPOINT as ECP } from 'constants/endpoints'

export const REQUEST: string = 'REQUEST_EXPERT_COLOR_PICKS'
export const RECEIVED: string = 'RECEIVE_EXPERT_COLOR_PICKS'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export const request = () => {
  return {
    type: REQUEST,
    payload: {
      loading: true
    }
  }
}

export const received = (data: any) => {
  return {
    type: RECEIVED,
    payload: {
      loading: false,
      data
    }
  }
}

export const loadError = () => {
  return {
    type: LOAD_ERROR
  }
}

export const loadExpertColorPicks = () => {
  return (dispatch: Function) => {
    dispatch(request())

    return api.get(ECP)
      .then(response => {
        // TODO:noah.hall
        // confirm error handling
        // are we informing the user? logging? etc
        if (response.status === 200) {
          dispatch(received(response.data))
        } else dispatch(loadError())
      })
  }
}
