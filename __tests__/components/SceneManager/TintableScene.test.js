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

  test('renders surfaces only when a surface has a color', () => {
    const surfaces = Scenes.getSurfaces()

    let scene = renderer.create(
      getTintableScene({
        surfaces: surfaces
      })
    )

    // no TintableSceneSurfaces should render since none of the surface data contains color
    expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(0)

    // stub in a color of red for all surfaces and verify that the number of rendered TintableSceneSurfaces increases in a 1:1 ratio
    for (let i in surfaces) {
      surfaces[i].color = Colors.getColor()

      scene = renderer.create(
        getTintableScene({
          surfaces: surfaces
        })
      )

      expect(scene.root.findAllByType(TintableSceneSurface)).toHaveLength(surfaces.filter(surface => surface.color).length)
    }
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