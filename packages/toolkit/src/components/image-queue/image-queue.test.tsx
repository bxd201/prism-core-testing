import React, { SyntheticEvent } from 'react'
import { fireEvent,render, screen, waitFor } from '@testing-library/react'
import { urls } from '../../test-utils/mock-data'
import ImageQueue from './image-queue'

describe('Image Queue', () => {
  test('The callback should be fired for each url passed to the image queue', async () => {
    const mockCallback = jest.fn((image: SyntheticEvent, i: number) => undefined)

    render(<ImageQueue dataUrls={urls} addToQueue={mockCallback} />)

    const images = await screen.findAllByAltText('')
    images.forEach((img) => {
      fireEvent.load(img)
    })
    await waitFor(() => expect(images).toHaveLength(urls.length))
    await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(urls.length))
  })
})
