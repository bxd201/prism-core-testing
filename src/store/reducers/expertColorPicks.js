import { RECEIVED } from '../actions/expertColorPicks'

export default function expertColorPicks (state = { data: [] }, action = {}) {
  switch (action.type) {
    case RECEIVED: return { ...state, ...action.payload }
    default: return state
  }
}
