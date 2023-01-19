import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Color } from '../../interfaces/colors'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import {
  mockColWithChunksShape,
  mockColWithNoChildShape,
  mockWallShape
} from '../../test-utils/mocked-endpoints/mock-shape'
import ColorSwatch from '../color-swatch/color-swatch'
import ColorWall, { WallProps } from './color-wall'
import Column from './column'

const setActiveColorId = jest.fn()
const colorMap = colors.reduce((map, c) => {
  map[c.id] = c
  return map
}, {})

const mockColorResolver = (id: string | number): Color => colorMap[id]

const colorWallConfig = {
  bloomEnabled: true,
  colorWallBgColor: 'blue'
}

const wallProps: WallProps = {
  shape: mockWallShape,
  colorResolver: mockColorResolver,
  colorWallConfig: colorWallConfig,
  activeSwatchContentRenderer: (props) => {
    const { color } = props

    return (
      <>
        <ColorSwatch.Title number={`${color.brandKey} ${color.colorNumber}`} name={color.name} />

        <div className={'mt-auto'}>
          <button>View details</button>
        </div>
      </>
    )
  },
  activeColorId: null,
  onActivateColor: (id) => setActiveColorId(id),
  width: 1000
}

describe('Color Wall', () => {
  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  test('should render the correct amount of columns, rows, chunks and titles when rendered at desktop size', async () => {
    // ARRANGE
    const { getAllByTestId } = await render(<ColorWall {...wallProps} />)

    // ACT
    const column = getAllByTestId('wall-column')
    const row = getAllByTestId('wall-row')
    const chunk = getAllByTestId('wall-chunk')
    const title = getAllByTestId('wall-title')

    // ASSERT
    expect(column).toHaveLength(5)
    expect(row).toHaveLength(12)
    expect(chunk).toHaveLength(9)
    expect(title).toHaveLength(11)
  })

  test('should render the correct amount of columns, rows, chunks and titles when rendered at narrow size', async () => {
    // ARRANGE
    const { getAllByTestId } = await render(<ColorWall {...wallProps} width={320} />)

    // ACT
    const column = getAllByTestId('wall-column')
    const row = getAllByTestId('wall-row')
    const chunk = getAllByTestId('wall-chunk')
    const title = getAllByTestId('wall-title')

    // ASSERT
    expect(column).toHaveLength(5)
    expect(row).toHaveLength(12)
    expect(chunk).toHaveLength(9)
    expect(title).toHaveLength(10) // one less title on wrapped view, since we're hiding one title there
  })

  test('should have the correct user defined styles', async () => {
    // ARRANGE
    const { getAllByTestId } = await render(<ColorWall {...wallProps} height={100} />)

    // ACT
    const div = getAllByTestId('wall-height-div')[0]

    // ASSERT
    expect(div).toHaveStyle({ height: '100px', 'background-color': 'blue' })
  })

  test('should call the user defined function when a swatch is clicked (onActivateColor)', async () => {
    // ARRANGE
    const { getByTestId } = await render(<ColorWall {...wallProps} />)

    // ACT
    const button = getByTestId('wall-color-swatch-11346')
    fireEvent.click(button)

    // ASSERT
    expect(button)
    expect(setActiveColorId).toHaveBeenCalledWith(11346)
  })

  test('should activate the correct swatch if an initialActiveColorId is passed in', () => {
    // ARRANGE
    const { getByTestId } = render(<ColorWall {...wallProps} activeColorId={11348} />)

    // ACT
    const activeSwatch = getByTestId('inner-swatch-11348')

    // ASSERT
    expect(activeSwatch)
  })

  test('should have a default text for the Zoom Button and allow user defined text to be passed in', async () => {
    // ARRANGE
    const zoomProps = {
      ...wallProps,
      colorWallConfig: {
        zoomOutTitle: 'helloWorld'
      },
      activeColorId: 11348
    }
    const { getByTestId, rerender } = await render(<ColorWall {...wallProps} activeColorId={11348} />)

    // ACT
    let zoomButton = getByTestId('wall-zoom-btn')

    // ASSERT
    expect(zoomButton).toHaveAttribute('title', 'Zoom out')
    rerender(<ColorWall {...zoomProps} />)
    zoomButton = getByTestId('wall-zoom-btn')
    expect(zoomButton).toHaveAttribute('title', 'helloWorld')
  })

  test('should tab into the first swatch and activate on enter', async () => {
    const user = userEvent.setup()
    // ARRANGE
    render(<ColorWall {...wallProps} />)

    // ACT
    await user.keyboard('{Tab}{Enter}')

    // ASSERT
    expect(setActiveColorId).toHaveBeenCalledWith(11346)
  })

  test('should zoom out if escape is pressed and focus is off of active swatch', async () => {
    const user = userEvent.setup()
    // ARRANGE
    const { getByTestId } = render(<ColorWall {...wallProps} />)

    // ACT
    const button = getByTestId('wall-color-swatch-11346')
    await user.click(button)
    await user.keyboard('{Tab>2/}{Escape}')

    // ASSERT
    expect(setActiveColorId).toHaveBeenLastCalledWith(null)
  })

  test('should shift tab into the last swatch and activate on enter', async () => {
    // ARRANGE
    const user = userEvent.setup()
    const { getByTestId } = render(<ColorWall {...wallProps} />)

    // ACT
    getByTestId('wall-handleTabInEnd-btn')
    await user.keyboard('{Shift>}{Tab}{/Shift}{Enter}')

    // ASSERT
    expect(setActiveColorId).toHaveBeenCalledWith(30040)
  })

  test('Tabbing should take the user to the next chunk', async () => {
    // ARRANGE
    const user = userEvent.setup()
    render(<ColorWall {...wallProps} />)

    // ACT
    await user.keyboard('{Tab}{Tab}{Tab}{Enter}')

    // ASSERT
    expect(setActiveColorId).toHaveBeenCalledWith(1995)
  })

  test('Tabbing at the last Chunk should take focus out of the wall', async () => {
    // ARRANGE
    const user = userEvent.setup()
    const { getByTestId } = render(<ColorWall {...wallProps} />)

    // ACT
    await user.keyboard('{Tab}')
    const hiddenButton = getByTestId('wall-focusOutEndHelper-btn')
    expect(hiddenButton)
    getByTestId('wall-color-swatch-30040')
    await user.keyboard('{Tab>9/}') // Tabbing all the way out
    const hiddenButton2 = getByTestId('wall-handleTabInEnd-btn')

    // ASSERT
    expect(hiddenButton2)
  })

  test('should allow the arrow keys to navigate unactivated swatches', async () => {
    const user = userEvent.setup()
    // ARRANGE
    render(<ColorWall {...wallProps} />)

    // ACT
    await user.keyboard('{Tab}{ArrowDown>3/}{ArrowRight>3/}{ArrowUp>2/}{ArrowLeft}{Enter}')

    // ASSERT
    expect(setActiveColorId).toHaveBeenCalledWith(2745)
  })

  test('should click in to the wall', async () => {
    // ARRANGE
    const { getByTestId } = await render(<ColorWall {...wallProps} />)

    // ACT
    const hiddenButton = getByTestId('wall-handleTabInEnd-btn')
    expect(hiddenButton)
    const button = getByTestId('wall-color-swatch-11346')
    fireEvent.click(button)

    // ASSERT
    expect(button)
    const hiddenButton2 = getByTestId('wall-focusOutEndHelper-btn')
    expect(hiddenButton2)
  })

  test('should render both row and chunks as children', () => {
    // ARRANGE
    const colProps = {
      ...wallProps,
      shape: mockColWithChunksShape
    }
    const { getAllByTestId } = render(<ColorWall {...colProps} />)

    // ACT
    const column = getAllByTestId('wall-column')
    const row = getAllByTestId('wall-row')
    const chunk = getAllByTestId('wall-chunk')
    const title = getAllByTestId('wall-title')

    // ASSERT
    expect(column).toHaveLength(1)
    expect(row).toHaveLength(1)
    expect(chunk).toHaveLength(2)
    expect(title).toHaveLength(3)
  })

  test('should render nothing if no children are passed', () => {
    // ARRANGE
    const { getByTestId } = render(<Column id={1} data={mockColWithNoChildShape} />)

    // ACT
    const column = getByTestId('wall-column')

    // ASSERT
    expect(column.childElementCount).toEqual(0)
  })
})
