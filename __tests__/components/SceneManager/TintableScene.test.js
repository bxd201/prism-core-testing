import React from 'react'
import renderer from 'react-test-renderer'
import _ from 'lodash'

import TintableScene from 'src/components/SceneManager/TintableScene'
import TintableSceneOverlay from 'src/components/SceneManager/TintableSceneOverlay'
import TintableSceneHitArea from 'src/components/SceneManager/TintableSceneHitArea'
import TintableSceneSurface from 'src/components/SceneManager/TintableSceneSurface'
import { SCENE_TYPES } from 'constants/globals'

import * as Colors from '__mocks__/data/color/Colors'
import * as Scenes from '__mocks__/data/scene/Scenes'

const getTintableScene = (props) => {
  let defaultProps = {
    width: 100,
    height: 100,
    type: 'someType',
    sceneId: 1,
    background: 'someImageURL'
  }

  let newProps = Object.assign({}, defaultProps, props)

  return <TintableScene {...newProps} />
}

describe('<TintableScene />', () => {
  test('does not render without width and height', () => {
    expect(renderer.create(
      <TintableScene />
    ).toJSON()).toEqual(null)

    expect(renderer.create(
      <TintableScene width={100} />
    ).toJSON()).toEqual(null)

    expect(renderer.create(
      <TintableScene height={100} />
    ).toJSON()).toEqual(null)

    expect(renderer.create(
      getTintableScene()
    ).toJSON()).not.toEqual(null)
  })

  test('does not render when render set to false', () => {
    expect(renderer.create(
      getTintableScene({ render: false })
    ).toJSON()).toEqual(null)
  })

  test('shows loading', () => {
    const scene = renderer.create(
      getTintableScene({
        loading: true
      })
    )

    // does it contain a TintableSceneOverlay and is it a LOADING type?
    expect(scene.root.findByType(TintableSceneOverlay).props.type).toEqual(TintableSceneOverlay.TYPES.LOADING)
  })

  test('shows error', () => {
    const scene = renderer.create(
      getTintableScene({
        error: true
      })
    )

    // does it contain a TintableSceneOverlay and is it an ERROR type?
    expect(scene.root.findByType(TintableSceneOverlay).props.type).toEqual(TintableSceneOverlay.TYPES.ERROR)
  })

  test('shows error overlay for hit area error', () => {
    const scene = renderer.create(
      getTintableScene()
    )

    // no error at first
    expect(scene.root.findAllByType(TintableSceneOverlay)).toHaveLength(0)

    scene.getInstance().handleHitAreaLoadingError()

    // does it contain a TintableSceneOverlay and is it an ERROR type?
    expect(scene.root.findAllByType(TintableSceneOverlay)[0].props.type).toEqual(TintableSceneOverlay.TYPES.ERROR)
  })

  test('renders hit areas only for interactive scenes', () => {
    const surfaces = Scenes.getSurfaces()

    // interactive: true
    const interactiveScene = renderer.create(
      getTintableScene({
        surfaces: surfaces,
        interactive: true
      })
    )

    expect(interactiveScene.root.findAllByType(TintableSceneHitArea)).toHaveLength(surfaces.length)

    // interactive: false
    const nonInteractiveScene = renderer.create(
      getTintableScene({
        surfaces: surfaces,
        interactive: false
      })
    )

    expect(nonInteractiveScene.root.findAllByType(TintableSceneHitArea)).toHaveLength(0)
  })

  test('calls parent prop to update surface colors when a surface is clicked and clickToPaint has a color', () => {
    const surfaces = Scenes.getSurfaces()
    const clickToPaintColor = Colors.getColor()
    const sceneId = 'testID'
    const scene = renderer.create(
      getTintableScene({
        surfaces: surfaces,
        clickToPaintColor: clickToPaintColor,
        sceneId: sceneId
      })
    )
    const instance = scene.getInstance()

    let spied = jest.spyOn(instance, 'updateSurfaceColor')

    // no TintableSceneSurfaces should render since none of the surface data contains color
    expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(0)

    for (let i in surfaces) {
      instance.handleClickSurface(surfaces[i].id)

      expect(spied).toHaveBeenCalledWith(surfaces[i].id, clickToPaintColor)
    }
  })

  test('calls parent prop to update surface colors when a color is dropped on a surface', () => {
    const surfaces = Scenes.getSurfaces()
    const sceneId = 'testID'
    const scene = renderer.create(
      getTintableScene({
        surfaces: surfaces,
        sceneId: sceneId
      })
    )
    const instance = scene.getInstance()

    let spied = jest.spyOn(instance, 'updateSurfaceColor')

    // no TintableSceneSurfaces should render since none of the surface data contains color
    expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(0)

    for (let i in surfaces) {
      const droppedColor = Colors.getColor()

      expect(instance.getTintColorBySurface(surfaces[i].id)).toBeUndefined()

      instance.handleColorDrop(surfaces[i].id, droppedColor)

      expect(spied).toHaveBeenCalledWith(surfaces[i].id, droppedColor)
    }
  })

  test('calls parent prop to update surface colors internal updateSurfaceColors is hit', () => {
    const onUpdateColor = jest.fn()
    const surfaces = Scenes.getSurfaces()
    const sceneId = 'testID'
    const scene = renderer.create(
      getTintableScene({
        surfaces: surfaces,
        onUpdateColor: onUpdateColor,
        sceneId: sceneId
      })
    )
    const instance = scene.getInstance()
    const color = Colors.getColor()

    instance.updateSurfaceColor(surfaces[0].id, color)

    expect(onUpdateColor).toHaveBeenCalledWith(sceneId, surfaces[0].id, color)
  })

  test('matches snapshot of scene with colored surfaces', () => {
    const surfaces = Scenes.getSurfaces().map( surface => {
      surface.color = Colors.getColor()
      return surface
    })

    const scene = renderer.create(
      getTintableScene({
        surfaces: surfaces
      })
    ).toJSON()

    expect(scene).toMatchSnapshot()
  })

  test('renders for hovered surfaces when previewColor is active', () => {
    const surfaces = Scenes.getSurfaces()

    const scene = renderer.create(
      getTintableScene({
        surfaces: surfaces,
        previewColor: {
          hex: '#FFF'
        }
      })
    )

    // no TintableSceneSurfaces currently rendered
    expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(0)

    // hover over first surface
    scene.getInstance().handleOver(surfaces[0].id)

    // one TintableSceneSurface should render
    expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(1)

    // hover out first surface
    scene.getInstance().handleOut(surfaces[0].id)

    // zero TintableSceneSurfaces should render
    expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(0)
  })
})