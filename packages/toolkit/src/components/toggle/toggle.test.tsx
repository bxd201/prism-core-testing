import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoonStars } from '@fortawesome/pro-solid-svg-icons'
import { render, fireEvent, screen } from '@testing-library/react'

import Toggle from './toggle'

describe('Toggle Component', () => {
  test('Toggle component can be checked', async () => {
    // ARRANGE
    const Option = ({ icon, label }: any): JSX.Element => (
      <span className='flex flex-col items-center'>
        <FontAwesomeIcon icon={icon} size='lg' />
        {label}
      </span>
    )

    render(
      <Toggle
        uncheckedOptionRenderer={() => <Option icon={faSun} label='day' />}
        checkedOptionRenderer={() => <Option icon={faMoonStars} label='night' />}
        className={`text-black`}
      />
    )

    // ACT
    const button = screen.getByRole('switch')
    fireEvent.click(button)

    // ASSERT
    expect(button).toBeChecked()
  })

  test('Toggle component initial checked', async () => {
    // ARRANGE
    const Option = ({ icon, label }: any): JSX.Element => (
      <span className='flex flex-col items-center'>
        <FontAwesomeIcon icon={icon} size='lg' />
        {label}
      </span>
    )

    render(
      <Toggle
        initialChecked
        uncheckedOptionRenderer={() => <Option icon={faSun} label='day' />}
        checkedOptionRenderer={() => <Option icon={faMoonStars} label='night' />}
        className={`text-black`}
      />
    )
    const button = screen.getByRole('switch')

    expect(button).toBeChecked()
  })

  test('Toggle component has correct text color', async () => {
    // ARRANGE
    const Option = ({ icon, label }: any): JSX.Element => (
      <span className='flex flex-col items-center'>
        <FontAwesomeIcon icon={icon} size='lg' />
        {label}
      </span>
    )

    const { rerender } = render(
      <Toggle
        uncheckedOptionRenderer={() => <Option icon={faSun} label='day' />}
        checkedOptionRenderer={() => <Option icon={faMoonStars} label='night' />}
        className={`text-white`}
        style={{
          backgroundColor: '#d4966e'
        }}
      />
    )

    // ACT
    const button = screen.getByRole('switch')

    // ASSERT
    expect(button).toHaveClass('bg-white')

    // ACT
    rerender(
      <Toggle
        uncheckedOptionRenderer={() => <Option icon={faSun} label='day' />}
        checkedOptionRenderer={() => <Option icon={faMoonStars} label='night' />}
        style={{
          backgroundColor: '#e3ddd3'
        }}
      />
    )
    const darkButton = screen.getByRole('switch')

    // ASSERT
    expect(darkButton).toHaveClass('bg-black')
  })
})
