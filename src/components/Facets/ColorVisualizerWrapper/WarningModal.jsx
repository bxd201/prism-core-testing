// @flow
import React, { useRef, useEffect, useCallback } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import MergeCanvas from '../../MergeCanvas/MergeCanvas'
import { mouseDownPreventDefault } from 'src/shared/helpers/MiscUtils'

type CVWWarningModalProps = {
  miniImage: any,
  confirm: Function,
  cancel: Function
}

const CVWWarningModal = (props: CVWWarningModalProps) => {
  const intl = useIntl()
  const { miniImage, confirm, cancel } = props
  const canvasRef = useRef()
  const btnYesRef = useRef()
  const btnNoRef = useRef()

  useEffect(() => {
    if (btnYesRef && btnYesRef.current) btnYesRef.current.focus()
  }, [])

  const applyZoomPan = (ref: any) => {
    if (ref && ref.current) {
      ref.current.style = 'width: 120px'
    }
  }

  const blurHandler = useCallback((e: SyntheticEvent, ref: any) => {
    if (ref.current === btnYesRef.current) {
      btnNoRef.current.focus()
    } else if (ref.current === btnNoRef.current) {
      btnYesRef.current.focus()
    }
  }, [btnYesRef, btnNoRef])

  return (
    <div className='cvw__modal' role='presentation' onMouseDown={mouseDownPreventDefault}>
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
      <div className='cvw__modal__action-wrapper'>
        <button className='cvw__modal__action-btn' ref={btnYesRef} onBlur={(e) => blurHandler(e, btnYesRef)} onClick={confirm}><FormattedMessage id='YES' /></button>
        <button className='cvw__modal__action-btn' ref={btnNoRef} onBlur={(e) => blurHandler(e, btnNoRef)} onClick={cancel}><FormattedMessage id='NO' /></button>
      </div>
    </div>
  )
}

export default CVWWarningModal
