import { combineReducers } from 'redux'

import { colors } from './colors/index'
import { scenes } from './scenes'
import { lp } from './live-palette-reducer'

const rootReducer = combineReducers({
  colors,
  scenes,
  lp
})

export default rootReducer
