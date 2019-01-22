// @flow
import { concat, uniq, isUndefined, isNull, without, find, includes } from 'lodash'

import type { Scene, SceneStatus, SurfaceStatus, Surface, Variant } from '../shared/types/Scene'

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
  PAINT_ALL_MAIN_SURFACES
} from '../actions/scenes'

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
        [sceneType]: Object.freeze(action.payload.scenes)
      })

      // initialize sceneStatus to track scene variant and scene surface color
      const _sceneStatus = state.sceneStatus.hasOwnProperty(sceneType) ? state.sceneStatus : Object.assign({}, state.sceneStatus, {
        [sceneType]: _sceneCollection[sceneType].map((scene: Scene) => {
          const variantName = scene.variant_names[0]
          const variant: Variant = find(scene.variants, { 'variant_name': variantName })

          const sceneStatus: SceneStatus = {
            id: scene.id,
            variant: variantName,
            surfaces: variant.surfaces.map((surface: Surface) => {
              const surfaceStatus: SurfaceStatus = {
                id: surface.id,
                color: void (0)
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
      return Object.assign({}, state, {
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

    default:
      return state
  }
}
