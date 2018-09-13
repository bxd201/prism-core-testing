import { combineReducers } from 'redux'

import { colors } from './colors'
import { scenes } from './scenes'

const rootReducer = combineReducers({
  colors,
  scenes
})

export default rootReducer
