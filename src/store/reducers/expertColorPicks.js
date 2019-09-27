import {
  RECEIVED,
  REQUEST
} from '../actions/expertColorPicks'

export const initialState = { loading: false, data: [] }

export default function expertColorPicks (
  state = initialState,
  action = {}
) {
  switch (action.type) {
    case RECEIVED: return {
      ...state,
      ...action.payload
    }
    case REQUEST: return {
      ...state,
      ...action.payload
    }
    default: return state
  }
}
