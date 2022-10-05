import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { SCENE_TYPES } from '../../constants'
import TintableSceneSVGDefs, { TEST_ID,TintableSceneSVGDefsProps } from './tintable-scene-svg-defs'

const defsProps: TintableSceneSVGDefsProps = {
  maskImage:
    'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=wall&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1',
  maskId: '',
  filterId: '',
  type: SCENE_TYPES.ROOM
}

describe('TintableSceneSVGDefs', () => {
  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  test('Renders correct defs for SCENE_TYPES.FAST_MASK', async () => {
    // ARRANGE
    const { getByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} type={SCENE_TYPES.FAST_MASK} />
      </svg>
    )
    const filter = getByTestId(TEST_ID.FILTER_ROOM)

    // ACT
    // ASSERT
    expect(filter).toBeTruthy()
  })

  test('Renders correct defs for SCENE_TYPES.ROOM', async () => {
    // ARRANGE
    const { getByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} type={SCENE_TYPES.ROOM} />
      </svg>
    )
    const filter = getByTestId(TEST_ID.FILTER_ROOM)

    // ACT
    // ASSERT
    expect(filter).toBeTruthy()
  })

  test('Renders correct defs for SCENE_TYPES.AUTOMOTIVE', async () => {
    // ARRANGE
    const { getByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} type={SCENE_TYPES.AUTOMOTIVE} />
      </svg>
    )
    const filter = getByTestId(TEST_ID.FILTER_AUTOMOTIVE)

    // ACT
    // ASSERT
    expect(filter).toBeTruthy()
  })

  test('Renders correct defs for SCENE_TYPES.OBJECT', async () => {
    // ARRANGE
    const { getByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} type={SCENE_TYPES.OBJECT} />
      </svg>
    )
    const filter = getByTestId(TEST_ID.FILTER_AUTOMOTIVE)

    // ACT
    // ASSERT
    expect(filter).toBeTruthy()
  })

  test('Correctly handles prop: filterImageValueCurve', async () => {
    // ARRANGE
    const { getAllByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} filterImageValueCurve={'fooCurve'} />
      </svg>
    )
    const funcs = getAllByTestId(TEST_ID.CURVE_FUNC)

    // ACT
    // ASSERT
    expect(funcs).toHaveLength(3)
  })

  test('Correctly handles prop: highlightMap', async () => {
    // ARRANGE
    const { getByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} type={SCENE_TYPES.AUTOMOTIVE} highlightMap={'fooMap'} />
      </svg>
    )
    const highlight = getByTestId(TEST_ID.HIGHLIGHT_MAP)

    // ACT
    // ASSERT
    expect(highlight).toBeTruthy()
  })

  test('Correctly handles prop: shadowMap', async () => {
    // ARRANGE
    const { getByTestId } = await render(
      <svg>
        <TintableSceneSVGDefs {...defsProps} type={SCENE_TYPES.AUTOMOTIVE} shadowMap={'fooMap'} />
      </svg>
    )
    const shadow = getByTestId(TEST_ID.SHADOW_MAP)

    // ACT
    // ASSERT
    expect(shadow).toBeTruthy()
  })
})
