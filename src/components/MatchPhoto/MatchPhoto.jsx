// @flow
import React from 'react'
import ConfirmationModal from './ConfirmationModal'
import DynamicColorFromImage from '../InspirationPhotos/DynamicColorFromImage'

type Props = {
  imageUrl: string,
  wrapperWidth: number,
  isPortrait: boolean,
  imageDims: Object,
  pins: Array<Object>,
  isConfirmationModalActive: boolean,
  onClickNo: Function,
  maxHeight: number
}

export function MatchPhoto ({ imageUrl, wrapperWidth, isPortrait, imageDims, pins, isConfirmationModalActive, onClickNo, maxHeight }: Props) {
  return (
    <>
      {
        (imageUrl && pins.length > 0)
          ? (
            <>
              <DynamicColorFromImage
                originalImageWidth={imageDims.originalImageWidth}
                originalImageHeight={imageDims.originalImageHeight}
                originalIsPortrait={imageDims.originalIsPortrait}
                imageUrl={imageUrl}
                width={wrapperWidth}
                maxHeight={maxHeight}
                isPortrait={isPortrait}
                pins={pins}
                isActive
              />
              {isConfirmationModalActive && <ConfirmationModal onClickNo={onClickNo} />}
            </>
          )
          : ''
      }
    </>
  )
}

export default MatchPhoto
