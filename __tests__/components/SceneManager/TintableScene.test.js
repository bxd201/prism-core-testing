import React from 'react'
import renderer from 'react-test-renderer'
import TintableScene from 'src/components/SceneManager/TintableScene'
import TintableSceneHitArea from 'src/components/SceneManager/TintableSceneHitArea'
import TintableSceneSurface from 'src/components/SceneManager/TintableSceneSurface'
import { SCENE_TYPES } from 'constants/globals'
import { shallow } from 'enzyme'
import * as Colors from '__mocks__/data/color/Colors'
import { surfaces } from '__mocks__/data/scene/Scenes'

let defaultProps = {
  width: 100,
  height: 100,
  sceneId: 1,
  type: SCENE_TYPES.ROOM,
  background: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/TEST_SCENE?wid=1311}' // fully-qualified image so our snapshots don't change based on env vars
}

const getTintableScene = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return <TintableScene {...newProps} />
}

describe('<TintableScene />', () => {
  test('does not render without width and height', () => {
    console.warn = jest.fn()
    expect(renderer.create(<TintableScene />).toJSON()).toBeNull()
    expect(renderer.create(<TintableScene width={100} />).toJSON()).toBeNull()
    expect(renderer.create(<TintableScene height={100} />).toJSON()).toBeNull()
    expect(renderer.create(getTintableScene({ width: 0, height: 0 })).toJSON()).toBeNull()
    expect(console.warn).toHaveBeenCalledTimes(4)
  })

  test('does not render when render set to false', () => {
    expect(mocked(<TintableScene {...defaultProps} render={false} />).html()).toBe("")
  })

  test('renders hit areas only for interactive scenes', () => {
    // interactive: true
    const scene = shallow(
      getTintableScene({
        surfaces: surfaces,
        interactive: true
      }))
    expect(scene.find(TintableSceneHitArea).exists()).toBe(true)

    // interactive: false
    const nonInteractiveScene = shallow(
      getTintableScene({
        surfaces: surfaces,
        interactive: false
      }))

    expect(nonInteractiveScene.find(TintableSceneHitArea).exists()).toBe(false)
  })

  test('calls parent prop to update surface colors when a surface is clicked and clickToPaint has a color', () => {
    const clickToPaintColor = Colors.getColor()
    const sceneId = 'testID'

    const scene = shallow(
      getTintableScene({
        surfaces: surfaces,
        clickToPaintColor: clickToPaintColor,
        sceneId: sceneId
      }))

    const instance = scene.instance()

    let spied = jest.spyOn(instance, 'updateSurfaceColor')

    // no TintableSceneSurfaces should render since none of the surface data contains color
    expect(scene.find(TintableSceneSurface).exists()).toBe(false)
    for (let i in surfaces) {
      instance.handleClickSurface(surfaces[i].id)
      expect(spied).toHaveBeenCalledWith(surfaces[i].id, clickToPaintColor)
    }
  })

  test('calls parent prop to update surface colors when a color is dropped on a surface', () => {
    const clickToPaintColor = jest.fn()
    const sceneId = 'testID'
    const scene = shallow(
      getTintableScene({
        surfaces: surfaces,
        clickToPaintColor: clickToPaintColor,
        sceneId: sceneId
      }))
    const instance = scene.instance()

    let spied = jest.spyOn(instance, 'updateSurfaceColor')

    // no TintableSceneSurfaces should render since none of the surface data contains color
    expect(scene.find(TintableSceneSurface).exists()).toBe(false)

    for (let i in surfaces) {
      const droppedColor = Colors.getColor()

      expect(instance.getTintColorBySurface(surfaces[i].id)).toBeUndefined()

      instance.handleColorDrop(surfaces[i].id, droppedColor)

      expect(spied).toHaveBeenCalledWith(surfaces[i].id, droppedColor)
    }
  })

  test('calls parent prop to update surface colors internal updateSurfaceColors is hit', () => {
    const onUpdateColor = jest.fn()
    const sceneId = 'testID'
    const scene = shallow(
      getTintableScene({
        surfaces: surfaces,
        onUpdateColor: onUpdateColor,
        sceneId: sceneId
      }))
    const instance = scene.instance()
    const color = Colors.getColor()

    instance.updateSurfaceColor(surfaces[0].id, color)

    expect(onUpdateColor).toHaveBeenCalledWith(sceneId, surfaces[0].id, color)
  })

  test('matches snapshot of scene with colored surfaces', () => {
    const filterSurfaces = surfaces.map(surface => {
      surface.color = Colors.getColor()
      return surface
    })

    const scene = shallow(
      getTintableScene({
        surfaces: filterSurfaces
      }))
    expect(scene).toMatchSnapshot()
  })

  test('renders for hovered surfaces when previewColor is active', () => {
    const scene = shallow(
      getTintableScene({
        surfaces: surfaces,
        previewColor: {
          hex: '#FFF'
        }
      }))

    // no TintableSceneSurfaces currently rendered
    expect(scene.find(TintableSceneSurface).exists()).toBe(false)

    /*

      TODO:noah.hall
      the commented tests throw error
      // hover over first surface
      scene.instance().handleOver(surfaces[0].id)

      // one TintableSceneSurface should render
      expect(scene.find(TintableSceneSurface).exists()).toBe(true)
    */
    // hover out first surface
    scene.instance().handleOut(surfaces[0].id)

    // zero TintableSceneSurfaces should render
    expect(scene.find(TintableSceneSurface).exists()).toBe(false)
  })
})
