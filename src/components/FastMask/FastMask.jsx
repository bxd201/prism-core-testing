// @flow
import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import isNull from 'lodash/isNull'

import FastMaskSVGDef from './FastMaskSVGDef'

import { loadImage } from './FastMaskUtils'

import { uploadImage } from '../../store/actions/user-uploads'

import type { Color } from '../../shared/types/Colors'

import './FastMask.scss'

type Props = {
  color: Color,
  uploadImage: Function,
  uploads: Object
}

export function FastMask ({ color, uploadImage, uploads }: Props) {
  const [userImage, setUserImage] = useState(null)
  const [masks, setMasks] = useState([])
  const wrapperRef = useRef(null)

  function handleChange (e) {
    uploadImage(e.target.files[0])
  }

  useEffect(() => {
    if (!isNull(uploads) && uploads.source && uploads.masks.length) {
      // load source image
      loadImage(uploads.source).then(image => setUserImage(image))

      // load masks
      Promise
        .all(uploads.masks.map(mask => loadImage(mask)))
        .then(images => setMasks(images))
    }
  }, [uploads])

  return (
    <React.Fragment>
      <input type='file' onChange={handleChange} />
      <hr />
      {(uploads && uploads.uploading === true) && (
        <div>Loading...</div>
      )}
      {(!isNull(userImage) && masks.length > 0) && (
        <div className='fm-wrapper' ref={wrapperRef} style={{ width: 1000 }}>
          <div className='svg-defs-wrapper'>
            {masks.map((mask, maskIndex) => (
              <FastMaskSVGDef
                key={mask.src}
                width={userImage.naturalWidth}
                height={userImage.naturalHeight}
                color={color}
                maskId={`mask_${maskIndex}`}
                filterId={`filter_${maskIndex}`}
                source={userImage}
                mask={mask}
              />
            ))}
          </div>
          <img className='image-natural' src={userImage.src} alt='' />
          {masks.map((mask, maskIndex) => (
            <svg key={mask.src} className='image-tinted' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${userImage.naturalWidth * 2} ${userImage.naturalHeight * 2}`} preserveAspectRatio='none'>
              <rect fill='rgba(0,0,0,0)' x='0' y='0' width='100%' height='100%' mask={`url(#mask_${maskIndex})`} filter={`url(#filter_${maskIndex})`} />
            </svg>
          ))}
        </div>
      )}
    </React.Fragment >
  )
}

const mapStateToProps = (state, props) => {
  return {
    color: state.lp.activeColor || { hex: '#aeaeae' },
    uploads: state.uploads
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    uploadImage: (file: any) => {
      dispatch(uploadImage(file))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FastMask)
