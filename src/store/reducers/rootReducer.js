import { combineReducers } from 'redux'

import { colors } from './colors/index'
import { scenes } from './scenes'
import { uploads } from './uploads'
import { lp } from './live-palette'
import { configurations } from './configurations'

const rootReducer = combineReducers({
  colors,
  lp,
  scenes,
  uploads,
  configurations
})

export default rootReducer
