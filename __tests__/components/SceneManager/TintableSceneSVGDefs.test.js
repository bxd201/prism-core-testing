import React from 'react'
import renderer from 'react-test-renderer'

import TintableSceneSVGDefs from '../../../src/components/SceneManager/TintableSceneSVGDefs'
import { SCENE_TYPES } from 'constants/globals'

const tintColors = [
  '#FF0000',
  '#0000FF'
]

describe('<TintableSceneSVGDefs />', () => {
  test('render empty without provided type', () => {
    const component = renderer.create(
      <TintableSceneSVGDefs />
    ).toJSON()

    expect(component).toEqual(null)
  })

  describe(`${SCENE_TYPES.ROOM} SVG filters and masks`, () => {
    test('render', () => {
      const component = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.ROOM} />
      ).toJSON()

      expect(component).toMatchSnapshot()
    })

    test('does not respond to shadow and highlight maps', () => {
      const component1 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.ROOM} shadowMap={'shadows'} highlightMap={'highlights'}  />
      ).toJSON()

      const component2 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.ROOM} shadowMap={'other shadows'} highlightMap={'highlights'}  />
      ).toJSON()

      const component3 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.ROOM} shadowMap={'other shadows'} highlightMap={'other highlights'}  />
      ).toJSON()

      expect(component1).toEqual(component2)
      expect(component1).toEqual(component3)
      expect(component2).toEqual(component3)
    })

    test('feFlood is set to filterColor', () => {
      const component1 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.ROOM} filterColor={tintColors[0]}  />
      )

      const colorObject = component1.root.findAll((el) => {
        return el.type === 'feFlood' && el.props.floodColor === tintColors[0]
      })

      expect(colorObject).toHaveLength(1)
    })
  })

  describe(`${SCENE_TYPES.OBJECT} SVG filters and masks`, () => {
    test('render', () => {
      const component = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.OBJECT}  />
      ).toJSON()

    })

    test('responds to shadow and highlight maps', () => {
      const component1 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.OBJECT} shadowMap={'shadows'} highlightMap={'highlights'}  />
      ).toJSON()

      const component2 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.OBJECT} shadowMap={'other shadows'} highlightMap={'highlights'}  />
      ).toJSON()

      const component3 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.OBJECT} shadowMap={'other shadows'} highlightMap={'other highlights'}  />
      ).toJSON()

      expect(component1).not.toEqual(component2)
      expect(component1).not.toEqual(component3)
      expect(component2).not.toEqual(component3)
    })

    test('feFlood is set to filterColor', () => {
      const component1 = renderer.create(
        <TintableSceneSVGDefs type={SCENE_TYPES.OBJECT} filterColor={tintColors[0]}  />
      )

      const colorObject = component1.root.findAll((el) => {
        return el.type === 'feFlood' && el.props.floodColor === tintColors[0]
      })

      expect(colorObject).toHaveLength(1)
    })
  })
})
