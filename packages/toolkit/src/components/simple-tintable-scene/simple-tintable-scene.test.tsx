import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { colorOptions } from '../../test-utils/test-utils'
import SimpleTintableScene, { SimpleTintableSceneProps, TEST_ID } from './simple-tintable-scene'
import { TEST_ID as HIT_AREA_TEST_ID } from './simple-tintable-scene-hit-area'
import { TEST_ID as SURFACE_TEST_ID } from './tintable-scene-surface'

const sceneProps: SimpleTintableSceneProps = {
  sceneType: 'rooms',
  sceneName: 'Rooms',
  background: 'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311)&qlt=92',
  surfaceColors: Object.values(colorOptions),
  surfaceIds: [1, 2, 3],
  surfaceHitAreas: [
    'https://prism.sherwin-williams.com/prism/images/scenes/rooms/livingroom/main.svg',
    'https://prism.sherwin-williams.com/prism/images/scenes/rooms/livingroom/accent.svg',
    'https://prism.sherwin-williams.com/prism/images/scenes/rooms/livingroom/trim.svg'
  ],
  surfaceUrls: [
    'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=wall&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1',
    'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=accent&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1',
    'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=trim&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1'
  ],
  highlights: [null, null, null],
  width: 1311,
  height: 792,
  interactive: true
}

describe('SimpleTintableScene', () => {
  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  test('Should render component', async () => {
    // ARRANGE
    const { getByTestId } = await render(<SimpleTintableScene {...sceneProps} />)
    const container = getByTestId(TEST_ID.SURFACES_CONTAINER)

    // ACT
    // ASSERT
    expect(container).toBeTruthy()
  })

  test('Should render all surfaces', async () => {
    // ARRANGE
    const { getAllByTestId } = await render(<SimpleTintableScene {...sceneProps} />)
    const surfaces = getAllByTestId(SURFACE_TEST_ID.CONTAINER)

    // ACT
    // ASSERT
    expect(surfaces).toHaveLength(3)
  })

  test('Should render all hit areas', async () => {
    // ARRANGE
    const { getAllByTestId } = await render(<SimpleTintableScene {...sceneProps} />)
    const surfaces = getAllByTestId(HIT_AREA_TEST_ID.CONTAINER)

    // ACT
    // ASSERT
    expect(surfaces).toHaveLength(4)
  })

  test('Should not render surface when color is not set', async () => {
    // ARRANGE
    const { queryAllByTestId } = await render(<SimpleTintableScene {...sceneProps} surfaceColors={[]} />)
    const surfaces = await queryAllByTestId(SURFACE_TEST_ID.CONTAINER)

    // ACT
    // ASSERT
    expect(surfaces).toHaveLength(0)
  })

  test('Should call handleSurfaceInteraction() when a hit area is clicked', async () => {
    // ARRANGE
    const handleClick = jest.fn()

    // ACT
    const { getAllByTestId } = await render(
      <SimpleTintableScene {...sceneProps} handleSurfaceInteraction={handleClick} />
    )
    const hitArea = getAllByTestId(HIT_AREA_TEST_ID.MOUSE_LISTENER)[0]
    fireEvent.click(hitArea)

    // ASSERT
    expect(handleClick).toHaveBeenCalled()
  })
})
