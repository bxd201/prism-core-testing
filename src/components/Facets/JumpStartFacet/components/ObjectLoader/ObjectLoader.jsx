// @flow
import React from 'react'

import './ObjectLoader.scss'

function ObjectLoader ({ roomData, img }) {
  const { pieces } = roomData
  console.log(img, '####')
  console.log(roomData, '####')

  return (
    <div className='ObjectLoader'>
      {pieces.map(piece => (
        <div className='ObjectLoader__piece fade-in' style={{ left: `${piece.left}px`, top: `${piece.top}px` }}>
          <img src={piece.img} alt={piece.label} />
        </div>
      ))}
      <img src={img} className='ObjectLoader__src' alt='user upload' />
    </div>
  )
}

export default ObjectLoader
