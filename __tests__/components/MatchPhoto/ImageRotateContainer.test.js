import React from 'react'
import ImageRotateContainer from 'src/components/MatchPhoto/ImageRotateContainer'
import { fireEvent } from '@testing-library/dom'
import { RouteContext } from 'src/contexts/RouteContext/RouteContext'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

test('ImageRotateContainer', async () => {
  const setActiveComponent = jest.fn()
  const { getByText, getByLabelText, history } = render(
    <RouteContext.Provider value={{ setActiveComponent: setActiveComponent }}>
      <ImageRotateContainer
        imgUrl='test.png'
      />
    </RouteContext.Provider>
  )
  const spy = jest.spyOn(history, 'goBack')
  getByText('back', { exact: false })
  getByText('close', { exact: false })
  await fireEvent.click(getByLabelText('rotate image 90 degree clockwise'))
  getByText('Image rotated 90 degree', { exact: false })
  await fireEvent.click(getByLabelText('rotate image 90 degree clockwise'))
  getByText('Image rotated 180 degree', { exact: false })
  await fireEvent.click(getByText('close', { exact: false }))
  expect(setActiveComponent).toHaveBeenCalled()
  await fireEvent.click(getByText('back', { exact: false }))
  expect(spy).toHaveBeenCalled()
})

it('ImageRotateContainer rendering paintscene', async () => {
  const setIsPaintSceneActive = jest.fn()
  const setActiveComponent = jest.fn()
  const unsetIsPaintSceneActive = jest.fn()
  const unSetIsPaintScenePolluted = jest.fn()
  const { getByText, getByLabelText } = render(
    <RouteContext.Provider value={{
      setActiveComponent: setActiveComponent,
      setIsPaintSceneActive: setIsPaintSceneActive,
      unsetIsPaintSceneActive: unsetIsPaintSceneActive,
      unSetIsPaintScenePolluted: unSetIsPaintScenePolluted
    }}>
      <ImageRotateContainer
        imgUrl='test.png'
        isPaintScene
      />
    </RouteContext.Provider>
  )
  await fireEvent.click(getByLabelText('Accept terms'))
  await fireEvent.click(getByLabelText('done'))
  getByText('Delete the group')
})
