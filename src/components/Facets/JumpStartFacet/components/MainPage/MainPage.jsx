// @flow
import React, { useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/pro-solid-svg-icons'
import { faLongArrowUp } from '@fortawesome/pro-regular-svg-icons'
import 'src/scss/convenience/visually-hidden.scss'
import './MainPage.scss'

type MainPageProps = { onSelectFile: Function, imageRef: Ref }

function MainPage ({ onSelectFile, imageRef }: MainPageProps) {
  const hiddenFileInput: { current: ?HTMLInputElement } = useRef()
  const [file, setFile] = useState()
  const { getRootProps, getInputProps } = useDropzone({ onDrop: (files = []) => files.length && setFile(files[0]) })

  return (
    <div className='jumpstart-image-upload'>
      <input className='visually-hidden' type='file' ref={hiddenFileInput} onChange={e => e.target.files.length && setFile(e.target.files[0])} />
      <div className='centered-content'>
        <div className={'jumpstart__logo'}><img src={require('src/images/jumpstart/jumpstartlogo.png')} alt='jumpstart logo' /></div>
        <p className='jumpstart_intro'>You're just a few moments away from our best recommendations— customized to your space</p>
        <h2>To get started, let's see your space.</h2>
        {file
          ? (
            <>
              <img src={URL.createObjectURL(file)} alt='user uploaded' />
              <button className='upload-new-image' onClick={() => hiddenFileInput.current && hiddenFileInput.current.click()}>
                <FontAwesomeIcon icon={faLongArrowUp} size='2x' transform='shrink-7' mask={faCircle} />
                <strong>Upload new image</strong>
              </button>
            </>
          )
          : (
            <>
              <form {...getRootProps({ onClick: event => event.stopPropagation() })}>
                <input {...getInputProps({ multiple: false })} />
                <div>
                  <FontAwesomeIcon icon={faLongArrowUp} size='3x' transform='shrink-7' mask={faCircle} />
                  <p><strong>Drag and drop your image here</strong></p>
                  <p>or</p>
                  <button onClick={() => hiddenFileInput.current && hiddenFileInput.current.click()}><strong>Select a file</strong></button>
                </div>
              </form>
              <p className='note'><strong>Note:</strong> Jumpstart performs best on photos with ample, even lighting</p>
            </>
          )
        }
        <button className='submit-button' disabled={file === undefined} onClick={() => onSelectFile(file)}>Submit</button>
      </div>
    </div>
  )
}

export default MainPage
