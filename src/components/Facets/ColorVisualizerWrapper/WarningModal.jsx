import React, { Component } from 'react'

export class CVWWarningModal extends Component<Props> {
  render () {
    const { miniImage, confirm, cancel } = this.props
    return (
      <div className='cvw__modal'>
        <div className='cvw__modal__title'>Opening this scene will replace the current scene you are working on. Would you like to continue?</div>
        <div className='cvw__modal__mini-image'>{miniImage}</div>
        <div className='cvw__modal__action--btn'>
          <div role='presentation' onClick={confirm}>Yes</div>
          <div role='presentation' onClick={cancel}>No</div>
        </div>
      </div>
    )
  }
}
