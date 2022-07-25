import React from 'react'
import { render, screen } from '@testing-library/react'
import SpinnerLoader, { TEST_ID } from '../spinner-loader/spinner-loader'

describe('SpinnerLoader', () => {
  test('when rendered without arguments, a loader is shown', () => {
    expect(render(<SpinnerLoader />)).not.toBeNull()
  })

  test('font size not present when inheritSize is provided as a prop', () => {
    render(<SpinnerLoader inheritSize />)
    const element = screen.getByTestId(TEST_ID)
    expect(element).toHaveAttribute('style', expect.not.stringContaining('font-size: 40px'))
  })

  test('font size is 40px when inheritSize is NOT provided as a prop', () => {
    render(<SpinnerLoader />)
    const element = screen.getByTestId(TEST_ID)
    expect(element).toHaveAttribute('style', expect.stringContaining('font-size: 40px'))
  })
})
