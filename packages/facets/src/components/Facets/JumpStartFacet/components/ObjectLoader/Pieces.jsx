// @flow
import React, { memo,useEffect, useState } from 'react'
import { type SegmentationResults } from 'src/shared/hooks/useDeepLabModelForSegmentation'

type PiecesProps = {
  roomData: SegmentationResults
}

const Pieces = (props: PiecesProps) => {
  const { roomData } = props

  const [data, setData] = useState(null)

  useEffect(() => {
    if (roomData && !data) {
      setData(roomData)
    }
  }, [data, roomData])

  const getPieces = (roomData: SegmentationResults) => {
    return (roomData.pieces.map((piece, i) => {
      const pieceKey = i

      const styles = {
        left: `${piece.left}px`,
        top: `${piece.top}px`,
        animationDelay: `${(i + 1) * 2}s`
      }

      return (
        <div key={pieceKey} className='ObjectLoader__piece fade-in' style={styles}>
          <img src={piece.img} alt={piece.label} />
        </div>
      )
    }))
  }

  return (data ? getPieces(data) : null)
}

export default memo(Pieces)
