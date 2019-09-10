import { combineReducers } from 'redux'

import { colors } from './colors/index'
import { scenes, sceneWorkspaces, currentVariant, currentSurfaceId, currentActiveSceneId } from './scenes'
import { uploads } from './uploads'
import { lp } from './live-palette'
import { configurations } from './configurations'

const rootReducer = combineReducers({
  colors,
  lp,
  scenes,
  uploads,
  configurations,
  sceneWorkspaces,
  currentVariant,
  currentSurfaceId,
  currentActiveSceneId
})

export default rootReducer
