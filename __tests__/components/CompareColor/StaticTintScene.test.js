/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { StaticTintScene } from 'src/components/CompareColor/StaticTintScene'
import * as Colors from '__mocks__/data/color/Colors'
import { Scene } from 'src/components/CompareColor/data'
import ImagePreloader from 'src/helpers/ImagePreloader'

const color = Colors.getColor()

const getStaticTintScene = props => {
  let defaultProps = {
    color: color,
    scene: Scene
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<StaticTintScene {...newProps} />)
}

describe('StaticTintScene with props', () => {
  let staticTintScene
  beforeEach(() => {
    if (!staticTintScene) {
      staticTintScene = getStaticTintScene()
    }
  })

  it('should render ImagePreloader', () => {
    expect(staticTintScene.find(ImagePreloader).exists()).toBe(true)
  })
})
