import axios from 'axios'

export const REQUEST_COLORS = 'REQUEST_COLORS'
const requestColors = () => {
  return {
    type: REQUEST_COLORS,
    payload: { loading: true }
  }
}

export const RECEIVE_COLORS = 'RECEIVE_COLORS'
const receiveColors = (colors) => {
  return {
    type: RECEIVE_COLORS,
    payload: { loading: false, colors: colors }
  }
}

export const loadColors = () => {
  return (dispatch) => {
    dispatch(requestColors())

    return axios.get(`/api/v1/colors/sherwin`)
      .then(r => r.data)
      .then(data => {
        dispatch(receiveColors(data))
      })
  }
}
