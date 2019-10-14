/* eslint-disable flowtype/no-types-missing-file-annotation */
import { scenes, initialState } from 'src/store/reducers/scenes'
import * as actions from 'src/store/actions/scenes'
import { surfaces as scene, sceneStatus } from '__mocks__/data/scene/Scenes.js'
import * as Colors from '__mocks__/data/color/Colors'
import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'

const color = Colors.getColor()
let receiveScenes

// FIXME: Repair scene reducer tests @cody.richmond
xdescribe('scenes-reducer', () => {
  test('handles undefined state', () => {
    const state = scenes(undefined, { type: 'TEST' })

    expect(state).toEqual(initialState)
  })

  test('request scenes', () => {
    const action = { type: actions.REQUEST_SCENES, payload: { loadingScenes: true } }
    const newState = scenes(initialState, action)

    expect(newState).toEqual({
      sceneCollection: {},
      sceneStatus: {},
      numScenes: 0,
      loadingScenes: true,
      activeScenes: []
    })
  })

  test('active one scene', () => {
    const maxCount = scene.length
    const id = Math.floor(Math.random() * maxCount + 1)
    const action = { type: actions.ACTIVATE_ONLY_SCENE, payload: { id: id } }
    const newState = scenes(initialState, action)

    expect(newState).toEqual({
      sceneCollection: {},
      sceneStatus: {},
      numScenes: 0,
      loadingScenes: true,
      activeScenes: [id] })
  })

  test('receive scenes', () => {
    const action = { type: actions.RECEIVE_SCENES,
      payload: {
        loadingScenes: false,
        scenes: scene,
        numScenes: scene.length,
        type: 'rooms'
      } }
    const newState = scenes(initialState, action)
    receiveScenes = cloneDeep(newState)
    expect(newState).toEqual({ ...initialState,
      numScenes: scene.length,
      loadingScenes: false,
      type: 'rooms',
      sceneCollection: { rooms: scene },
      sceneStatus: { rooms: sceneStatus }
    })
  })

  test('active scene', () => {
    const maxCount = scene.length
    const id = 1
    const newId = Math.floor(Math.random() * maxCount) + 2
    const action = { type: actions.ACTIVATE_SCENE, payload: { id: newId } }
    const newState = scenes({ ...initialState,
      activeScenes: [id] }, action)

    expect(newState).toEqual({
      sceneCollection: {},
      sceneStatus: {},
      numScenes: 0,
      loadingScenes: true,
      activeScenes: [id, newId] })
  })

  test('deactive scene', () => {
    const maxCount = scene.length
    const id = 1
    const newId = Math.floor(Math.random() * maxCount) + 2
    const action = { type: actions.DEACTIVATE_SCENE, payload: { id: newId } }
    const newState = scenes({ ...initialState,
      activeScenes: [id, newId] }, action)

    expect(newState).toEqual({
      sceneCollection: {},
      sceneStatus: {},
      numScenes: 0,
      loadingScenes: true,
      activeScenes: [id] })
  })

  test('change scene variant', () => {
    const sceneId = Math.floor(Math.random() * scene.length) + 1
    const variant = 'night'
    const action = { type: actions.CHANGE_SCENE_VARIANT, payload: { id: sceneId, variant: variant } }
    const newState = scenes(cloneDeep(receiveScenes), action)
    const expectSceneStatus = sceneStatus.map((scene) => {
      let sceneCopy = { ...scene }
      if (scene.id === sceneId) {
        sceneCopy = { ...sceneCopy, variant: variant }
      }
      return sceneCopy
    })
    expect(newState.sceneStatus.rooms).toEqual(expectSceneStatus)
  })

  test('paint scene surface', () => {
    const sceneId = Math.floor(Math.random() * scene.length) + 1
    const surfaceId = Math.floor(Math.random() * scene.length) + 1
    const action = { type: actions.PAINT_SCENE_SURFACE, payload: { sceneId: sceneId, surfaceId: surfaceId, color: color } }
    const newState = scenes(cloneDeep(receiveScenes), action)
    const expectSceneStatus = sceneStatus.map((scene) => {
      let sceneCopy = { ...scene }
      let updatedScene
      if (scene.id === sceneId) {
        updatedScene = scene.surfaces.map((surface) => {
          let updatedSuface = { ...surface }
          if (surfaceId === surface.id) {
            updatedSuface = { ...updatedSuface, color: color }
          }
          return updatedSuface
        })
        sceneCopy = { ...sceneCopy, surfaces: updatedScene }
      }
      return sceneCopy
    })

    expect(newState.sceneStatus.rooms).toEqual(expectSceneStatus)
  })

  test('paint all scene surfaces', () => {
    const action = {
      type: actions.PAINT_ALL_SCENE_SURFACES,
      payload: { color: color }
    }
    const newState = scenes(cloneDeep(receiveScenes), action)
    const expectSceneStatus = sceneStatus.map((scene) => {
      let sceneCopy = { ...scene }
      let updatedScene = scene.surfaces.map((surface) => {
        let updatedSuface = { ...surface }
        updatedSuface = { ...updatedSuface, color: color }
        return updatedSuface
      })
      sceneCopy = { ...sceneCopy, surfaces: updatedScene }
      return sceneCopy
    })

    expect(newState.sceneStatus.rooms).toEqual(expectSceneStatus)
  })

  test('test paint scene main surface', () => {
    const sceneId = Math.floor(Math.random() * scene.length) + 1
    const targetScene = find(scene, { 'id': sceneId })
    const mainSurfaceIds = targetScene.variants[0].surfaces.filter((surface: Surface) => surface.role === 'main').map((surface: Surface) => surface.id)
    const action = {
      type: actions.PAINT_SCENE_MAIN_SURFACE,
      payload: { id: sceneId, color: color }
    }
    const newState = scenes(cloneDeep(receiveScenes), action)

    mainSurfaceIds.forEach((index) => {
      expect(newState.sceneStatus.rooms[sceneId - 1].surfaces[index - 1].color).toEqual(color)
    })
  })
})
