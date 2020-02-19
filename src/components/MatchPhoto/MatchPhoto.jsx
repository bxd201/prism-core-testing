// @flow
import React, { useEffect } from 'react'
import ConfirmationModal from './ConfirmationModal'
import DynamicColorFromImage from '../InspirationPhotos/DynamicColorFromImage'
import { useSelector, useDispatch } from 'react-redux'
import { loadBrandColors } from '../../store/actions/brandColors'

type Props = {
  imageUrl: string,
  wrapperWidth: number,
  isPortrait: boolean,
  imageDims: Object,
  pins: Array<Object>,
  isConfirmationModalActive: boolean,
  onClickNo: Function
}

export function MatchPhoto ({ imageUrl, wrapperWidth, isPortrait, imageDims, pins, isConfirmationModalActive, onClickNo }: Props) {
  const dispatch = useDispatch()
  useEffect(() => { dispatch(loadBrandColors()) }, [])

  const brandColors = useSelector(state => state.brandColors.data)

  return (
    <React.Fragment>
      {
        (imageUrl && pins.length > 0)
          ? (<React.Fragment>
            <DynamicColorFromImage
              brandColors={brandColors}
              originalImageWidth={imageDims.originalImageWidth}
              originalImageHeight={imageDims.originalImageHeight}
              originalIsPortrait={imageDims.originalIsPortrait}
              imageUrl={imageUrl}
              width={wrapperWidth}
              isPortrait={isPortrait}
              pins={pins}
              isActive />
            <ConfirmationModal isActive={isConfirmationModalActive} onClickNo={onClickNo} />
          </React.Fragment>)
          : ''
      }
    </React.Fragment>
  )
}

export default MatchPhoto
