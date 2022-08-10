import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ImageRotator from './image-rotator'

describe('ImageRotator Component', () => {
  const landscapeImageMetadata = {
    landscapeHeight: 640,
    landscapeWidth: 1059,
    originalImageHeight: 725,
    originalImageWidth: 1200,
    originalIsPortrait: false,
    portraitHeight: 640,
    portraitWidth: 387,
    url: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200}&qlt=92'
  }

  const portraitImageMetadata = {
    landscapeHeight: 640,
    landscapeWidth: 926,
    originalImageHeight: 800,
    originalImageWidth: 553,
    originalIsPortrait: true,
    portraitHeight: 640,
    portraitWidth: 442,
    url: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200}&qlt=92'
  }

  const getRotateAngle = (style: string): number => +style.slice(style.search(/\(/) + 1, style.search(/d/))

  test('If image loads', () => {
    render(<ImageRotator imageMetadata={landscapeImageMetadata}><ImageRotator.Image /></ImageRotator>)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', landscapeImageMetadata.url)
    expect(getRotateAngle(img.getAttribute('style'))).toBe(0)
  })

  test('When image rotates', () => {
    render(
      <ImageRotator imageMetadata={portraitImageMetadata}>
        <ImageRotator.Image />
        <ImageRotator.RotateControls>
          {(onRotateLeftClick, onRotateRightClick) => (
            <>
              <button aria-label='anticlockwise' onClick={onRotateLeftClick} />
              <button aria-label='clockwise' onClick={onRotateRightClick} />
            </>
          )}
        </ImageRotator.RotateControls>
      </ImageRotator>
    )

    const img = screen.getByRole('img')
    fireEvent.click(screen.getByLabelText('clockwise'))
    expect(getRotateAngle(img.getAttribute('style'))).toBe(90)
    fireEvent.click(screen.getByLabelText('anticlockwise'))
    expect(getRotateAngle(img.getAttribute('style'))).toBe(0)
  })

  test('When "done" button is clicked', () => {
    const mockOnClickButton = jest.fn()

    render(
      <ImageRotator imageMetadata={landscapeImageMetadata}>
        <ImageRotator.Image />
        <ImageRotator.Button onClick={mockOnClickButton}>
          done
        </ImageRotator.Button>
      </ImageRotator>
    )

    fireEvent.click(screen.getByText('done'))
    expect(mockOnClickButton).toHaveBeenCalled()
  })
})
