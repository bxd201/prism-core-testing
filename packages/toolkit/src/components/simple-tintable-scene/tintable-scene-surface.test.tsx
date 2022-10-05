import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { SCENE_TYPES } from '../../constants'
import TintableSceneSurface, { getStyleValues, TEST_ID,TintableSceneSurfaceProps } from './tintable-scene-surface'

const surfaceProps: TintableSceneSurfaceProps = {
  image: 'foo-img',
  maskId: 'foo-mask',
  filterId: 'foo-filter',
  type: SCENE_TYPES.ROOM,
  children: null
}

describe('TintableSceneSurface', () => {
  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  describe('getStyleValues()', () => {
    test('should return NULL when shouldScale AND shouldAdjustSvgHeight are FALSE', () => {
      // ARRANGE
      // ACT
      const ret = getStyleValues(false, false, '300', '100')
      // ASSERT
      expect(ret).toBeNull()
    })

    test('should return passed height and width when shouldScale is TRUE', () => {
      // ARRANGE
      const width = '300'
      const height = '100'

      // ACT
      const ret = getStyleValues(true, false, width, height)

      // ASSERT
      expect(ret.height).toEqual(height)
      expect(ret.width).toEqual(width)
    })

    test("should return height of 'auto' when shouldAdjustSvgHeight is TRUE", () => {
      // ARRANGE
      const width = '300'
      const height = '100'

      // ACT
      const ret = getStyleValues(false, true, width, height)

      // ASSERT
      expect(ret.height).toEqual('auto')
    })
  })

  describe('Component', () => {
    test('should render children', async () => {
      // ARRANGE
      const ID = 'foo-children'
      const children = <div data-testid={ID}>Foo</div>

      // ACT
      const { getByTestId } = await render(<TintableSceneSurface {...surfaceProps}>{children}</TintableSceneSurface>)
      const foundChildren = getByTestId(ID)

      // ASSERT
      expect(foundChildren).toBeTruthy()
    })

    test('should render correct contents for SCENE_TYPES.FAST_MASK', async () => {
      // ARRANGE

      // ACT
      const { getByTestId } = await render(<TintableSceneSurface {...surfaceProps} type={SCENE_TYPES.FAST_MASK} />)
      const contents = getByTestId(TEST_ID.CONTENTS_IMAGE)

      // ASSERT
      expect(contents).toBeTruthy()
    })

    test('should render correct contents for SCENE_TYPES.ROOM', async () => {
      // ARRANGE

      // ACT
      const { getByTestId } = await render(<TintableSceneSurface {...surfaceProps} type={SCENE_TYPES.ROOM} />)
      const contents = getByTestId(TEST_ID.CONTENTS_IMAGE)

      // ASSERT
      expect(contents).toBeTruthy()
    })

    test('should render correct contents for SCENE_TYPES.OBJECT', async () => {
      // ARRANGE

      // ACT
      const { getByTestId } = await render(<TintableSceneSurface {...surfaceProps} type={SCENE_TYPES.OBJECT} />)
      const contents = getByTestId(TEST_ID.CONTENTS_RECT)

      // ASSERT
      expect(contents).toBeTruthy()
    })

    test('should render correct contents for SCENE_TYPES.AUTOMOTIVE', async () => {
      // ARRANGE

      // ACT
      const { getByTestId } = await render(<TintableSceneSurface {...surfaceProps} type={SCENE_TYPES.AUTOMOTIVE} />)
      const contents = getByTestId(TEST_ID.CONTENTS_RECT)

      // ASSERT
      expect(contents).toBeTruthy()
    })
  })
})
