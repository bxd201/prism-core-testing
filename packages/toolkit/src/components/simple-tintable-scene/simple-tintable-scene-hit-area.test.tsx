import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import SimpleTintableSceneHitArea, {
  makeHandleSvgLoaded,
  SimpleTintableSceneHitAreaProps,
  TEST_ID
} from './simple-tintable-scene-hit-area'

const hitAreaProps: SimpleTintableSceneHitAreaProps = {
  surfaceIndex: 1,
  svgSource: 'foo',
  connectDropTarget: () => {},
  onLoadingSuccess: () => {},
  onLoadingError: () => {},
  interactionHandler: () => {}
}

describe('SimpleTintableSceneHitArea', () => {
  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  describe('Component', () => {
    test('should call interactionHandler() on click AND touch', async () => {
      // ARRANGE
      const handle = jest.fn()

      // ACT
      const { getByTestId } = await render(<SimpleTintableSceneHitArea {...hitAreaProps} interactionHandler={handle} />)
      const dom = getByTestId(TEST_ID.MOUSE_LISTENER)
      fireEvent.click(dom)
      fireEvent.touchStart(dom)

      // ASSERT
      expect(handle).toHaveBeenCalledTimes(2)
    })

    describe('opacity', () => {
      test('should be ZERO when loaded by default', async () => {
        // ARRANGE

        // ACT
        const { getByTestId } = await render(<SimpleTintableSceneHitArea {...hitAreaProps} />)
        const dom = getByTestId(TEST_ID.MOUSE_LISTENER)

        // ASSERT
        expect(dom.style.opacity).toEqual('0')
      })

      test('should be ONE when moused over', async () => {
        // ARRANGE

        // ACT
        const { getByTestId } = await render(<SimpleTintableSceneHitArea {...hitAreaProps} />)
        const dom = getByTestId(TEST_ID.MOUSE_LISTENER)
        fireEvent.mouseEnter(dom)

        // ASSERT
        expect(dom.style.opacity).toEqual('1')
      })

      test('should be ZERO when moused out', async () => {
        // ARRANGE

        // ACT
        const { getByTestId } = await render(<SimpleTintableSceneHitArea {...hitAreaProps} />)
        const dom = getByTestId(TEST_ID.MOUSE_LISTENER)
        fireEvent.mouseEnter(dom)
        fireEvent.mouseLeave(dom)

        // ASSERT
        expect(dom.style.opacity).toEqual('0')
      })
    })
  })

  describe('makeHandleSvgLoaded()', () => {
    let handleSvgLoaded
    const onSuccess = jest.fn()
    const onError = jest.fn()

    beforeEach(() => {
      handleSvgLoaded = makeHandleSvgLoaded(onSuccess, onError)
    })

    test('should call onSuccess when not failed', () => {
      // ARRANGE

      // ACT
      handleSvgLoaded(false)

      // ASSERT
      expect(onSuccess).toHaveBeenCalled()
    })

    test('should call onError when failed', () => {
      // ARRANGE

      // ACT
      handleSvgLoaded(true)

      // ASSERT
      expect(onError).toHaveBeenCalled()
    })
  })
})
