// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './FileInput.scss'

type Props = {
  onChange: Function,
  id: string,
  disabled: boolean,
  placeholder: string,
  statusText?: string
}

const baseClass = 'prism-file-input'

const FileInput = (props: Props) => {
  const { onChange, id, disabled, placeholder, statusText } = props

  return (
    <div className={baseClass}>
      <input
        className={`${baseClass}__file visually-hidden`}
        disabled={disabled || statusText}
        tabIndex='0'
        data-noshow
        type='file'
        accept={null} // this is what types of files it can accept
        onChange={onChange}
        id={id}
      />

      <label htmlFor={id}
        tabIndex='-1'
        className={`${baseClass}__label overflow-ellipsis clickable`}>
        <span className={`${baseClass}__label-text`}>
          <FontAwesomeIcon icon={['fa', 'image']} />
          {' '}
          {statusText || placeholder}
        </span>
      </label>

    </div>
  )
}

FileInput.defaultProps = {
  disabled: false,
  placeholder: 'Select your image...'
}

export default FileInput
