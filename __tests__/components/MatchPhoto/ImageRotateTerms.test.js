import React from 'react'
import ImageRotateTerms from 'src/components/ImageIngestView/ImageRotateTerms'
import { fireEvent } from '@testing-library/dom'

test('ImageRotateTerms', async () => {
  const { getByText, getByLabelText } = render(
    <ImageRotateTerms
      rotateImage={jest.fn()}
      createColorPins={jest.fn()}
      imageData={{}}
    />
  )

  getByText('Use these arrows to rotate your image.')
  getByText('I accept', { exact: false })
  getByText('Terms of Use', { exact: false })
  getByText('Done', { exact: false })
  getByLabelText('rotate image 90 degree anticlockwise')
  getByLabelText('rotate image 90 degree clockwise')
  await fireEvent.click(getByLabelText('Accept terms'))
  getByLabelText('done')
})
