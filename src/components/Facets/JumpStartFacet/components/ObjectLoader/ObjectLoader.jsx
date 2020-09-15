// @flow
import React from 'react'

import { type SegmentationResults } from 'src/shared/hooks/useDeepLabModelForSegmentation'

import './ObjectLoader.scss'
import CircleLoader from '../../../../Loaders/CircleLoader/CircleLoader'

type ObjectLoaderProps = {
  roomData: SegmentationResults,
  img: Image
}

function ObjectLoader ({ roomData, img }: ObjectLoaderProps) {
  return (
    <div className='ObjectLoader'>
      {roomData ? roomData.pieces.map((piece, i) => (
        <div key={i} className='ObjectLoader__piece fade-in' style={{ left: `${piece.left}px`, top: `${piece.top}px` }}>
          <img src={piece.img} alt={piece.label} />
        </div>
      )) : <CircleLoader />}
      <img src={img} className='ObjectLoader__src' alt='user upload' />
    </div>
  )
}

export default ObjectLoader
