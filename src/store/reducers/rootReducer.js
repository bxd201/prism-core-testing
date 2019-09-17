import { colors } from './colors/index'
import { combineReducers } from 'redux'
import { configurations } from './configurations'
import { lp } from './live-palette'
import {
  scenes,
  currentActiveSceneId,
  currentSurfaceId,
  currentVariant,
  isEditMode,
  sceneWorkspaces,
  currentWorkspace
} from './scenes'
import { uploads } from './uploads'
import collectionSummaries from './collectionSummaries'

export default combineReducers({
  collectionSummaries,
  colors,
  configurations,
  currentActiveSceneId,
  currentSurfaceId,
  currentVariant,
  isEditMode,
  lp,
  scenes,
  sceneWorkspaces,
  uploads,
  currentWorkspace
})
