import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Carousel, { CarouselProps, TEST_ID } from './carousel'

const mockBaseComponent = ({ itemNumber, onKeyDown }: { itemNumber: number; onKeyDown: () => void }): JSX.Element => {
  return (
    <div data-testid={'mock-slide'} onKeyDown={onKeyDown}>
      {`Slide #${itemNumber + 1}`}
    </div>
  )
}

const carouselProps: CarouselProps = {
  BaseComponent: mockBaseComponent,
  defaultItemsPerView: 1,
  isInfinity: false,
  showPageIndicators: false,
  data: []
}

const makeData = (len: number): Array<Record<string, unknown>> => new Array(len).fill({})

describe('Carousel', () => {
  beforeEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  describe('Keyboard events', () => {
    test('should handle next with [Tab]', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const setTabId = jest.fn()
      const data = makeData(3)
      const tabMap = ['tab1', 'tab2', 'tab3']
      const { getAllByTestId } = await render(
        <Carousel {...carouselProps} data={data} tabMap={tabMap} setTabId={setTabId} showPageIndicators={true} />
      )

      // ACT
      getAllByTestId('mock-slide')[0].focus()
      await user.keyboard('{Tab}{Enter}')

      // ASSERT
      expect(setTabId).toHaveBeenCalledWith('tab2')
    })

    test('should handle previous with [Shift+Tab]', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const setTabId = jest.fn()
      const data = makeData(3)
      const tabMap = ['tab1', 'tab2', 'tab3']
      const { getAllByTestId, getByTestId } = await render(
        <Carousel {...carouselProps} data={data} tabMap={tabMap} setTabId={setTabId} showPageIndicators={true} />
      )
      const nextButton = getByTestId(TEST_ID.NEXT)

      // ACT
      fireEvent.click(nextButton)
      getAllByTestId('mock-slide')[0].focus()
      await user.keyboard('{Shift}{Tab}{/Shift}{Enter}')

      // ASSERT
      expect(setTabId).toHaveBeenCalledWith('tab1')
    })
  })

  describe('tabMap and setTabId props', () => {
    test('should call setTabId when tabMap is passed', async () => {
      // ARRANGE
      const setTabId = jest.fn()
      const data = makeData(3)
      const tabMap = ['tab1', 'tab2', 'tab3']
      const { queryByTestId } = await render(
        <Carousel {...carouselProps} data={data} tabMap={tabMap} setTabId={setTabId} showPageIndicators={true} />
      )
      const nextButton = queryByTestId(TEST_ID.NEXT)

      // ACT
      fireEvent.click(nextButton) // go to page 2

      // ASSERT
      expect(setTabId).toHaveBeenCalledWith('tab2')
    })
  })

  describe('showPageIndicators prop', () => {
    test('should NOT render page indicators when false', async () => {
      // ARRANGE
      const data = makeData(5)
      const { queryAllByTestId } = await render(<Carousel {...carouselProps} data={data} />)
      const indicators = queryAllByTestId(TEST_ID.INDICATOR)

      // ACT
      // ASSERT
      expect(indicators).toHaveLength(0)
    })

    test('should render page indicators when true', async () => {
      // ARRANGE
      const data = makeData(5)
      const { queryAllByTestId } = await render(<Carousel {...carouselProps} data={data} showPageIndicators={true} />)
      const indicators = queryAllByTestId(TEST_ID.INDICATOR)

      // ACT
      // ASSERT
      expect(indicators).toHaveLength(6)
    })

    test('should NOT render page indicators when true, when there are less than 2 pages of data', async () => {
      // ARRANGE
      const data = makeData(0)
      const { queryAllByTestId } = await render(<Carousel {...carouselProps} data={data} showPageIndicators={true} />)
      const indicators = queryAllByTestId(TEST_ID.INDICATOR)

      // ACT
      // ASSERT
      expect(indicators).toHaveLength(0)
    })
  })

  describe('Finite mode', () => {
    let props: CarouselProps
    beforeEach(() => {
      props = { ...carouselProps }
    })

    test('should NOT render Previous button when on first slide', async () => {
      // ARRANGE
      const data = makeData(5)
      const { queryByTestId, findByTestId } = await render(<Carousel {...props} data={data} />)
      const prevButtonInitial = queryByTestId(TEST_ID.PREV)
      const nextButton = queryByTestId(TEST_ID.NEXT)

      // ACT
      fireEvent.click(nextButton)
      const prevButton = await findByTestId(TEST_ID.PREV)

      // ASSERT
      expect(prevButtonInitial).toBeNull()
      expect(prevButton).toBeTruthy()
    })

    test('should NOT render Next button when on last slide', async () => {
      // ARRANGE
      const data = makeData(3)
      const { queryByTestId } = await render(<Carousel {...props} data={data} />)
      const nextButtonInitial = queryByTestId(TEST_ID.NEXT)

      // ACT
      fireEvent.click(nextButtonInitial) // go to page 2 of 3
      fireEvent.click(nextButtonInitial) // go to page 3 of 3
      const nextButton = queryByTestId(TEST_ID.NEXT)

      // ASSERT
      expect(nextButton).toBeNull()
    })
  })

  describe('Infinite mode', () => {
    let props: CarouselProps
    beforeEach(() => {
      props = { ...carouselProps, isInfinity: true }
    })

    test('should render Previous button, even on first slide', async () => {
      // Arrange
      const data = makeData(5)
      const { queryByTestId } = await render(<Carousel {...props} data={data} />)
      const prevButton = queryByTestId(TEST_ID.PREV)

      // ACT
      // ASSERT
      expect(prevButton).toBeTruthy()
    })

    test('should render Next button, even on last slide', async () => {
      // ARRANGE
      const data = makeData(3)
      const { queryByTestId } = await render(<Carousel {...props} data={data} />)
      const nextButtonInitial = queryByTestId(TEST_ID.NEXT)

      // ACT
      fireEvent.click(nextButtonInitial) // go to page 2 of 3
      fireEvent.click(nextButtonInitial) // go to page 3 of 3
      const nextButton = queryByTestId(TEST_ID.NEXT)

      // ASSERT
      expect(nextButton).toBeTruthy()
    })

    test('Next button should go back to the start when pressed on last side', async () => {
      // ARRANGE
      const data = makeData(3)
      const setTabId = jest.fn()
      const tabMap = ['tab1', 'tab2', 'tab3']
      const { queryByTestId } = await render(<Carousel {...props} data={data} tabMap={tabMap} setTabId={setTabId} />)
      const nextButton = queryByTestId(TEST_ID.NEXT)

      // ACT
      fireEvent.click(nextButton) // go to page 2 of 3
      fireEvent.click(nextButton) // go to page 3 of 3
      fireEvent.click(nextButton) // go to page 1 of 3

      // ASSERT
      expect(setTabId).toHaveBeenCalledWith('tab1')
    })

    test('Previous button should go back to the end when pressed on first side', async () => {
      // ARRANGE
      const data = makeData(3)
      const setTabId = jest.fn()
      const tabMap = ['tab1', 'tab2', 'tab3']
      const { queryByTestId } = await render(<Carousel {...props} data={data} tabMap={tabMap} setTabId={setTabId} />)
      const prevButton = queryByTestId(TEST_ID.PREV)

      // ACT
      fireEvent.click(prevButton) // go to page 3 of 3

      // ASSERT
      expect(setTabId).toHaveBeenCalledWith('tab3')
    })
  })
})
