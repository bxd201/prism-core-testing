import { RECEIVED, REQUEST } from '../actions/expertColorPicks'

export default function expertColorPicks (state = { data: [], loadingECP: true }, action = {}) {
  switch (action.type) {
    case RECEIVED: return { ...state, ...action.payload }
    case REQUEST: return { ...state, ...action.payload }
    default: return state
  }
}
