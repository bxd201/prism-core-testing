import React from 'react'
import { render, screen } from '@testing-library/react'
import Propper from './propper'

describe('Propper Component', () => {
  test('Should render children in the DOM', async () => {})
  const helloWorld = 'hello world'

  render(
    <Propper>
      <div>{helloWorld}</div>
    </Propper>
  )

  expect(screen.getByText(helloWorld)).toBeInTheDocument()
})
