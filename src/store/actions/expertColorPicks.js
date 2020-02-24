// @flow
import axios from 'axios'
import { EXPERT_COLOR_PICKS_ENDPOINT as ECP } from 'constants/endpoints'

export const RECEIVED = 'RECEIVE_EXPERT_COLOR_PICKS'

export const loadExpertColorPicks = (dispatch: Function) => {
  axios.get(ECP).then(response => dispatch({ type: RECEIVED, payload: { data: response.data } }))
}
