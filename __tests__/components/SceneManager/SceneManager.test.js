import React from 'react'
import { shallow } from 'enzyme'
import { SceneManager } from 'src/components/SceneManager/SceneManager'
import SceneVariantSwitch from 'src/components/SceneManager/SceneVariantSwitch'
import ColorPickerSlide from 'src/components/ColorPickerSlide/ColorPickerSlide'
import { surfaces, sceneStatus } from '__mocks__/data/scene/Scenes'
import { SCENE_TYPES } from 'constants/globals'
import * as Colors from '__mocks__/data/color/Colors'
import CircleLoader from '../../../src/components/Loaders/CircleLoader/CircleLoader'
import ImagePreloader from '../../../src/helpers/ImagePreloader'

const defaultProps = {
  scenes: [{
    id: 1,
    variant_names: ['day'],
    variants: [{
      variant_name: 'day',
      associatedColorCollection: 31738,
      expertColorPicks: [2761, 2043, 2689],
      surfaces: []
    }]
  }],
  sceneStatus: [{
    id: 1,
    variant: 'day',
  }],
  maxActiveScenes: 2,
  activeScenes: [1],
  type: SCENE_TYPES.ROOM,
  loadScenes: jest.fn(),
  activateScene: jest.fn(),
  deactivateScene: jest.fn(),
  paintSceneSurface: jest.fn(),
  changeSceneVariant: jest.fn(),
  interactive: true,
  loadingScenes: false,
  sceneWorkspaces: [],
  expertColorPicks: true
}

const sample = (arr) => {
  return Math.floor(Math.random() * arr.length)
}

const createSceneManager = (props = {}) => {
  return shallow(<SceneManager {...defaultProps} {...props} />)
}

describe('snapshot testing', () => {
  it('should get correct snapshot', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('Scene Manager Rendering Testing', () => {
  it('Component should rendering loading icon correctly when loading scene set to true', () => {
    const wrapper = createSceneManager({ loadingScenes: true })
    expect(wrapper.find(CircleLoader).exists()).toBe(true)
  })

  it('Component should rendering prism scene manager correctly when loading scene set to false', () => {
    const wrapper = createSceneManager()
    expect(wrapper.find(CircleLoader).exists()).toBe(false)
    expect(wrapper.find('.prism-scene-manager').exists()).toBe(true)
  })

  it('Component should rendering list of scene correctly when scene loading', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    expect(wrapper.find('button').length).toBeGreaterThan(0)
  })

  it('Component should rendering image loader component correctly', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    expect(wrapper.find(ImagePreloader).length).toBeGreaterThan(0)
  })

  it('Component should rendering SceneVariantSwitch if scene has variant_names', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    const variants = surfaces[Math.floor(Math.random() * surfaces.length)].variant_names
    if (variants.length > 1 && SceneVariantSwitch.DayNight.isCompatible(variants)) {
      expect(wrapper.find(SceneVariantSwitch.DayNight).exists()).toBe(true)
    } else {
      expect(wrapper.find(SceneVariantSwitch.DayNight).exists()).toBe(false)
    }
  })

  it('ColorPickerSlide component is present when one scene is visible', () => {
    const wrapper = createSceneManager()
    expect(wrapper.find(ColorPickerSlide).exists()).toBe(true)
  })

  it('ColorPickerSlide component is not present when two scenes are visible', () => {
    const wrapper = createSceneManager({ activeScenes: [1, 2] })
    expect(wrapper.find(ColorPickerSlide).exists()).toBe(false)
  })
})

describe('Scene Manager Event Testing', () => {
  it('should call handleClickSceneToggle with scene id when button be clicked', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    wrapper.find('button').forEach((el, index) => {
      const handleClickSceneToggle = jest.fn()
      wrapper.instance().handleClickSceneToggle = handleClickSceneToggle
      wrapper.instance().forceUpdate()
      el.simulate('click')
      expect(handleClickSceneToggle).toHaveBeenCalledWith(surfaces[index].id)
    })
  })

  it('should call handleColorUpdate when callback is invoked from ImagePreloader', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    const handleColorUpdate = jest.fn()
    const surfacesId = surfaces[sample(surfaces)].id
    const sceneId = sceneStatus[sample(sceneStatus)].id
    const color = Colors.getColor().hex

    wrapper.instance().handleColorUpdate = handleColorUpdate
    wrapper.instance().forceUpdate()
    wrapper.find('ImagePreloader').first().props().onUpdateColor(surfacesId, sceneId, color)
    expect(handleColorUpdate).toHaveBeenCalledWith(surfacesId, sceneId, color)
  })

  it('should call changeVariant with scene id when SceneVariantSwitch get change', () => {
    const wrapper = createSceneManager({ scenes: surfaces, sceneStatus: sceneStatus })
    const variants = surfaces[Math.floor(Math.random() * surfaces.length)].variant_names
    const changeVariant = jest.fn()

    if (variants.length > 1 && SceneVariantSwitch.DayNight.isCompatible(variants)) {
      wrapper.instance().changeVariant = changeVariant
      wrapper.find(SceneVariantSwitch.DayNight).props().onChange()
      wrapper.instance().forceUpdate()
      expect(changeVariant).toHaveBeenCalled()
    } else {
      expect(wrapper.find(SceneVariantSwitch.DayNight).exists()).toBe(false)
    }
  })
})
