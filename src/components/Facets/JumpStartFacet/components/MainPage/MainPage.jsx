// @flow
import React, { useMemo, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import uniqueId from 'lodash/uniqueId'

import StyledFileBtn from '../StyledFileBtn/StyledFileBtn'

import 'src/scss/convenience/visually-hidden.scss'
import './MainPage.scss'

const baseClass = 'JSFMainPage'

type MainPageProps = { onSelectFile: Function }

function MainPage (props: MainPageProps) {
  const { onSelectFile } = props
  const id = useMemo(() => uniqueId('jsf-main-file-upload'), [])

  const handleFiles = useCallback((files = []) => {
    if (files.length) {
      onSelectFile(files[0])
    }
  }, [])

  const handleChangeFiles = useCallback(e => {
    const { target: { files = [] } } = e
    e.stopPropagation()
    handleFiles(Array.from(files))
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleFiles })

  return <div className={baseClass}>
    <div className='JSFCommon__band JSFCommon__band--pad'>
      <div className='JSFCommon__content JSFCommon__content--centered JSFCommon__text'>
        <p>We'll recommend colors that look good in your space and products that perform the way that you need.</p>
        <p>All we need from you is one image.</p>
      </div>
    </div>
    <div className='JSFCommon__band JSFCommon__band--dark'>
      <form {...getRootProps({
        tabIndex: -1,
        onClick: event => event.stopPropagation(),
        className: `${baseClass}__dropzone ${isDragActive ? `${baseClass}__dropzone--active` : ''}`
      })}>
        <input multiple={false} className='visually-hidden' onChange={handleChangeFiles} id={id} tabIndex='0' type='file' accept={null} data-noshow />
        <input {...getInputProps({ multiple: false })} />

        <p>Drag your image here</p>
        <p>or <StyledFileBtn id={id} text='select a file' /> to upload</p>
      </form>
    </div>
  </div>
}

export default MainPage
