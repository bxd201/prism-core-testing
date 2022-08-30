import React, { SyntheticEvent } from 'react'
import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import ImageQueue from './image-queue'

const darkSlateBlueImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj8LDt/g8AA/ECECH+M/0AAAAASUVORK5CYII='
const darkTurquoiseImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjYDh38T8ABRACn4HmvcQAAAAASUVORK5CYII='
const cornflowerBlueImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjSJn69j8ABi0C5jT11n8AAAAASUVORK5CYII='
const urls = [darkSlateBlueImage, darkTurquoiseImage, cornflowerBlueImage]

describe('Image Queue', () => {
  test('The callback should be fired for each url passed to the image queue', async () => {
    const mockCallback = jest.fn((image: SyntheticEvent, i: number) => undefined)

    render(<ImageQueue dataUrls={urls} addToQueue={mockCallback} />)

    const images = await screen.findAllByAltText('')
    screen.debug(images)
    images.forEach((img) => {
      fireEvent.load(img)
    })
    await waitFor(() => expect(images).toHaveLength(urls.length))
    await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(urls.length))
  })
})
