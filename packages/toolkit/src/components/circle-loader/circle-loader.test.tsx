import React from 'react'
import { render, screen } from '@testing-library/react'
import { TEST_ID } from '../spinner-loader/spinner-loader'
import CircleLoader, { TEST_ID_INNER,TEST_ID_OUTER } from './circle-loader'

describe('CircleLoader', () => {
  test('when rendered without arguments, a loader is shown', () => {
    expect(render(<CircleLoader />)).not.toBeNull()
  })

  test('has a stroke width of 6 by default', () => {
    render(<CircleLoader />)
    const element = screen.getByTestId(TEST_ID_INNER)
    expect(element).toHaveAttribute('stroke-width', '6')
  })

  test('is rendered with a stroke width that reflects the strokeWidth prop it is given', () => {
    render(<CircleLoader strokeWidth={1} />)
    const element = screen.getByTestId(TEST_ID_INNER)
    expect(element).toHaveAttribute('stroke-width', '1')
  })

  test('font size not present when inheritSize is provided as a prop', () => {
    render(<CircleLoader inheritSize />)
    const element = screen.getByTestId(TEST_ID_OUTER)
    expect(element).toHaveAttribute('style', expect.not.stringContaining('font-size: 30px'))
  })

  test('font size is 30px when inheritSize is NOT provided as a prop', () => {
    render(<CircleLoader />)
    const element = screen.getByTestId(TEST_ID_OUTER)
    expect(element).toHaveAttribute('style', expect.stringContaining('font-size: 30px'))
  })

  test('inner circle has cy, cx, and r values of 50', () => {
    render(<CircleLoader />)
    const element = screen.getByTestId(TEST_ID_INNER)
    expect(element).toHaveAttribute('cy', '50')
    expect(element).toHaveAttribute('cx', '50')
    expect(element).toHaveAttribute('r', '50')
  })

  test('spinner loaded is rendered when brandId is lowes', () => {
    render(<CircleLoader brandId='lowes' />)
    screen.getByTestId(TEST_ID)
  })

  test('className is applied to outer element when provided as a prop', () => {
    const testClass = 'I-am-the-test-class'
    render(<CircleLoader className={testClass} />)
    const element = screen.getByTestId(TEST_ID_OUTER)
    expect(element).toHaveAttribute('class', expect.stringContaining(testClass))
  })
})
