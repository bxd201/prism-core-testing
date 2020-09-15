// @flow
import React, { useEffect, useState, memo } from 'react'
import { type SegmentationResults } from 'src/shared/hooks/useDeepLabModelForSegmentation'

type PiecesProps = {
  roomData: SegmentationResults
}

const createCSSFilters = (hue: number) => {
  const css = {
    filter: `grayscale(100%) brightness(30%) sepia(100%) hue-rotate(${Math.floor(hue)}deg) saturate(700%) contrast(0.8)`
  }

  return css
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
      const dominantColor: TinyColor = roomData.piecesData[i].palette[0]
      // eslint-disable-next-line no-unused-vars
      const { h: hue } = dominantColor.toHsl()
      const cssFilters = createCSSFilters(hue)

      const styles = {
        left: `${piece.left}px`,
        top: `${piece.top}px`,
        animationDelay: `${(i + 1) * 2}s`,
        ...cssFilters
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
