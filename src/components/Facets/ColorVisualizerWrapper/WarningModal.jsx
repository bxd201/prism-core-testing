// @flow
import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import MergeCanvas from '../../MergeCanvas/MergeCanvas'

type CVWWarningModalProps = {
  miniImage: any,
  confirm: Function,
  cancel: Function
}

const CVWWarningModal = (props: CVWWarningModalProps) => {
  const intl = useIntl()
  const { miniImage, confirm, cancel } = props
  const canvasRef = useRef()

  const applyZoomPan = (ref: any) => {
    if (ref && ref.current) {
      ref.current.style = 'width: 120px'
    }
  }

  return (
    <div className='cvw__modal'>
      <div className='cvw__modal__title'>{intl.messages['CVW.WARNING_REPLACEMENT']}</div>
      {miniImage && !miniImage.dataUrls ? <div className='cvw__modal__mini-image'>{miniImage}</div> : null}
      {miniImage && miniImage.dataUrls
        ? <div className='cvw__modal__mini-image'>
          <MergeCanvas
            ref={canvasRef}
            applyZoomPan={applyZoomPan}
            layers={miniImage.dataUrls}
            width={miniImage.width}
            height={miniImage.height}
            colorOpacity={0.8} />
        </div> : null}
      <div className='cvw__modal__action--btn'>
        <div role='presentation' onClick={confirm}>Yes</div>
        <div role='presentation' onClick={cancel}>No</div>
      </div>
    </div>
  )
}

export default CVWWarningModal
