// @flow
import concat from 'lodash/concat'
import uniq from 'lodash/uniq'
import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'
import without from 'lodash/without'
import find from 'lodash/find'
import includes from 'lodash/includes'

import type { Scene, SceneStatus, SurfaceStatus, Surface, Variant, SceneWorkspace } from '../../shared/types/Scene'

import {
  RECEIVE_SCENES,
  REQUEST_SCENES,
  ACTIVATE_ONLY_SCENE,
  ACTIVATE_SCENE,
  CHANGE_SCENE_VARIANT,
  DEACTIVATE_SCENE,
  PAINT_SCENE_SURFACE,
  PAINT_ALL_SCENE_SURFACES,
  PAINT_SCENE_MAIN_SURFACE,
  PAINT_ALL_MAIN_SURFACES,
  ADD_NEW_MASK,
  UPDATE_CURRENT_SCENE,
  TOGGLE_EDIT_MODE,
  EDIT_MASK,
  UPDATE_MASK,
  UNPAINT_SCENE_SURFACES
} from '../actions/scenes'
import { registerMask, updateMask } from '../masks/store'

type State = {
  sceneCollection: {
    [key: string]: Scene[]
  },
  sceneStatus: {
    [key: string]: SceneStatus[]
  },
  type: string | void,
  numScenes: number,
  loadingScenes: boolean,
  activeScenes: number[]
}

export const initialState: State = {
  sceneCollection: {},
  sceneStatus: {},
  type: void (0),
  numScenes: 0,
  loadingScenes: true,
  activeScenes: []
}

export const scenes = (state: Object = initialState, action: { type: string, payload: Object }) => {
  switch (action.type) {
    case RECEIVE_SCENES:
      const sceneType = action.payload.type

      const _sceneCollection = state.sceneCollection.hasOwnProperty(sceneType) ? state.sceneCollection : Object.assign({}, state.sceneCollection, {
        [sceneType]: action.payload.scenes.map(scene => {
          return {
            ...scene,
            variants: scene.variants.map(variant => {
              return {
                ...variant,
                surfaces: variant.surfaces.map(surface => {
                  const { mask, ...other } = surface
                  return {
                    ...other,
                    mask: registerMask(mask)
                  }
                })
              }
            })
          }
        })
      })

      // initialize sceneStatus to track scene variant and scene surface color
      const _sceneStatus = state.sceneStatus.hasOwnProperty(sceneType) ? state.sceneStatus : Object.assign({}, state.sceneStatus, {
        [sceneType]: _sceneCollection[sceneType].map((scene: Scene) => {
          const variantName = scene.variant_names[0]
          const variant: Variant | void = find(scene.variants, { 'variant_name': variantName })

          if (!variant) {
            return void (0)
          }

          const sceneStatus: SceneStatus = {
            id: scene.id,
            variant: variantName,
            surfaces: variant.surfaces.map((surface: Surface) => {
              const surfaceStatus: SurfaceStatus = {
                // optional color prop will not yet be defined
                id: surface.id
              }

              return surfaceStatus
            })
          }

          return sceneStatus
        })
      })

      return Object.assign({}, state, {
        sceneCollection: _sceneCollection,
        sceneStatus: _sceneStatus,
        type: sceneType,
        numScenes: action.payload.numScenes,
        loadingScenes: action.payload.loadingScenes
      })

    case REQUEST_SCENES:
      return Object.assign({}, state, {
        loadingScenes: action.payload.loadingScenes
      })

    case ACTIVATE_ONLY_SCENE:
      return Object.assign({}, state, {
        // replace active scenes with a single scene ID
        activeScenes: [action.payload.id]
      })

    case ACTIVATE_SCENE:
      return Object.assign({}, state, {
        // combines activeScenes[] with one or more additional scene IDs, removes dupes, removes null/undefined
        activeScenes: uniq(concat(state.activeScenes, action.payload.id))
          .filter(val => (!isNull(val) && !isUndefined(val)))
      })

    case CHANGE_SCENE_VARIANT:
      return Object.assign({}, state, {
        sceneStatus: Object.assign({}, state.sceneStatus, {
          [state.type]: state.sceneStatus[state.type].map((_surface: SceneStatus) => {
            if (_surface.id === action.payload.id) {
              return Object.assign({}, _surface, {
                variant: action.payload.variant
              })
            }

            return _surface
          })
        })
      })

    case DEACTIVATE_SCENE:
      return Object.assign({}, state, {
        // removes one or more scene IDs from activeScenes[], removes dupes, removes null/undefined
        activeScenes: uniq(without.apply(null, concat([state.activeScenes], action.payload.id)))
          .filter(val => (!isNull(val) && !isUndefined(val)))
      })

    case PAINT_SCENE_SURFACE:
      const newState = Object.assign({}, state, {
        sceneStatus: Object.assign({}, state.sceneStatus, {
          [state.type]: state.sceneStatus[state.type].map((_scene: SceneStatus) => {
            if (_scene.id === action.payload.sceneId) {
              return Object.assign({}, _scene, {
                surfaces: _scene.surfaces.map((_surface: SurfaceStatus) => {
                  if (_surface.id === action.payload.surfaceId) {
                    return Object.assign({}, _surface, {
                      color: action.payload.color
                    })
                  }

                  return _surface
                })
              })
            }

            return _scene
          })
        })
      })
      return newState

    case UNPAINT_SCENE_SURFACES:
      return Object.assign({}, state, {
        sceneStatus: Object.assign({}, state.sceneStatus, {
          [state.type]: state.sceneStatus[state.type].map((_scene: SceneStatus) => {
            if (_scene.id === action.payload.sceneId) {
              return Object.assign({}, _scene, {
                surfaces: _scene.surfaces.map((_surface: SurfaceStatus) => {
                  const newSurface = Object.assign({}, _surface)
                  if (_surface.color) {
                    delete newSurface.color
                  }

                  return newSurface
                })
              })
            }

            return _scene
          })
        })
      })

    case PAINT_ALL_SCENE_SURFACES:
      return Object.assign({}, state, {
        sceneStatus: Object.assign({}, state.sceneStatus, {
          [state.type]: state.sceneStatus[state.type].map((_scene: SceneStatus) => {
            return Object.assign({}, _scene, {
              surfaces: _scene.surfaces.map((_surface: SurfaceStatus) => {
                return Object.assign({}, _surface, {
                  color: action.payload.color
                })
              })
            })
          })
        })
      })

    case PAINT_ALL_MAIN_SURFACES:
    case PAINT_SCENE_MAIN_SURFACE:
      return Object.assign({}, state, {
        sceneStatus: Object.assign({}, state.sceneStatus, {
          [state.type]: state.sceneStatus[state.type].map((_scene: SceneStatus) => {
            if (action.payload.hasOwnProperty('id') && _scene.id !== action.payload.id) {
              return _scene
            }

            const targetScene = find(state.sceneCollection[state.type], { 'id': _scene.id })

            if (targetScene) {
              // we can just take the first variant -- both variants must be identical, so any will work for our purposes here
              const mainSurfaceIds = targetScene.variants[0].surfaces.filter((surface: Surface) => surface.role === 'main').map((surface: Surface) => surface.id)

              if (mainSurfaceIds.length) {
                return Object.assign({}, _scene, {
                  surfaces: _scene.surfaces.map((_surface: SurfaceStatus) => {
                    // set color for all "main" surfaces
                    if (includes(mainSurfaceIds, _surface.id)) {
                      return Object.assign({}, _surface, {
                        color: action.payload.color
                      })
                    }

                    return _surface
                  })
                })
              }
            }

            return _scene
          })
        })
      })
    case UPDATE_MASK: {
      const { type } = state
      const { mask, data } = action.payload

      return {
        ...state,
        sceneCollection: {
          ...state.sceneCollection,
          [type]: state.sceneCollection[type].map(scene => {
            return {
              ...scene,
              variants: scene.variants.map(variant => {
                return {
                  ...variant,
                  surfaces: variant.surfaces.map(surface => {
                    const { mask: thisMask, ...other } = surface

                    if (thisMask !== mask) {
                      return surface
                    }

                    return {
                      ...other,
                      mask: updateMask(thisMask, data)
                    }
                  })
                }
              })
            }
          })
        }
      }
    }
    default:
      return state
  }
}

export const sceneWorkspaces = (state: SceneWorkspace[] = [], action: {type: string, payload: SceneWorkspace}) => {
  if (action.type === ADD_NEW_MASK) {
    const newSceneWorkspace = action.payload
    const filteredState = state.filter(workspace => {
      return workspace.surfaceId !== action.payload.surfaceId &&
         workspace.sceneId !== action.payload.sceneId
    })
    return [newSceneWorkspace, ...filteredState]
  }

  return state
}

// This value is unknown at runtime since scene data must be loaded
export const currentVariant = (state: any = null, action: {type: string, payload: any}) => {
  // Make sure this is set to the default variant when ever a new scene is selected
  if (action.type === CHANGE_SCENE_VARIANT) {
    return action.payload
  }

  if (action.type === RECEIVE_SCENES) {
    if (action.payload.scenes && action.payload.scenes.length) {
      const defaultScene = action.payload.scenes[0]
      if (defaultScene.variant_names && defaultScene.variant_names.length) {
        return action.payload.scenes[0]
      }
    }

    return null
  }

  return state
}

export const currentSurfaceId = (state: number | null = null, action: {type: string, payload: Object}) => {
  // Only set via action triggered from within tintable scene, haven't found a better deterministic way to know user intent
  if (action.type === UPDATE_CURRENT_SCENE) {
    return action.payload.surfaceId
  }

  return state
}

export const currentActiveSceneId = (state: number | null = null, action: {type: string, payload: Object}) => {
  // Only set via action triggered from within tintable scene, haven't found a better deterministic way to know user intent
  if (action.type === UPDATE_CURRENT_SCENE) {
    return action.payload.sceneId
  }

  return state
}

export const isEditMode = (state: boolean = false, action: {type: string, payload: boolean}) => {
  if (action.type === TOGGLE_EDIT_MODE) {
    return action.payload
  }

  return state
}

export const currentWorkspace = (state: SceneWorkspace | null = null, action: { type: string, payload: SceneWorkspace}) => {
  if (action.type === EDIT_MASK) {
    return action.payload
  }

  return state
}
