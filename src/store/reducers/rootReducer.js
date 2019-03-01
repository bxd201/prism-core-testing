import { combineReducers } from 'redux'

import { colors } from './colors/index'
import { scenes } from './scenes'
import { lp } from './live-palette'

const rootReducer = combineReducers({
  colors,
  lp,
  scenes
})

export default rootReducer
