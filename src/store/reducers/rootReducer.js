import { combineReducers } from 'redux'

import { colors } from './colors/index'
import { scenes } from './scenes'
import { lp } from './live-palette'
import { configurations } from './configurations'

const rootReducer = combineReducers({
  colors,
  lp,
  scenes,
  configurations
})

export default rootReducer
