import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import ImageUploader from './image-uploader'

describe('ImageUploader Component', () => {
  test('If image uploads and returns image metadata', () => {
    const mockProcessedImageMetadataCallBack = jest.fn()
    global.URL.createObjectURL = jest.fn()
    global.Image = mockProcessedImageMetadataCallBack

    render(<ImageUploader processedImageMetadata={() => {}} />)

    const upload = screen.getByTestId('input')
    const file = new File(['image'], 'landscape.jpg', { type: 'image/jpg' })

    Object.defineProperty(upload, 'files', { value: [file] })

    fireEvent.change(upload)

    expect(screen.getByText('loading...')).toBeInTheDocument()

    expect(mockProcessedImageMetadataCallBack).toHaveBeenCalled()
  })
})
