import React from 'react'
import { fireEvent,render, screen, waitFor } from '@testing-library/react'
import { urls } from '../../test-utils/mock-data'
import BatchImageLoader, { OrderedImageItem } from './batch-image-loader'

function checkCallOrder(images: OrderedImageItem[]): string {
  return images.map((item) => item.index).join()
}

describe('batch Image Loader', () => {
  test('The callback should be fired after all the urls have loaded.', async () => {
    const mockCallback = jest.fn((images: OrderedImageItem[]) => undefined)

    render(<BatchImageLoader urls={urls} handleImagesLoaded={mockCallback} />)

    // There are/should be 3 images in this array
    const images = await screen.findAllByAltText('')
    images.forEach((img) => {
      fireEvent.load(img)
    })

    await waitFor(() => expect(images).toHaveLength(urls.length))
    await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(checkCallOrder(mockCallback.mock.calls[0][0])).toBe('0,1,2'))

    // Quiet expected output
    const consoleErrorSpy = jest.spyOn(console, 'error')
    consoleErrorSpy.mockImplementation(() => undefined)
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    consoleWarnSpy.mockImplementation(() => undefined)
  })
})
