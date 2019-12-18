import axios from 'axios'

export function get (endpoint) {
  return axios.get(endpoint, {
    validateStatus (status) {
      return status === 200
    }
  })
    .then(data => data)
    .catch(err => err.response)
}

export default {
  get
}
