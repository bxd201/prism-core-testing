// @flow
import React, { useState, useCallback, useContext } from 'react'

import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'
import Swatches from './Swatches'
import Card from './Card'
import { ColorCollector } from './RoomTypeDetector'
import { type RGBArr, type Color } from 'src/shared/types/Colors.js.flow'

import './RoomPiece.scss'

type Props = {
  label: string,
  image: string,
  palette: RGBArr[],
  swPalette: (Color[] | typeof undefined)[],
  swRecommendations: Color[],
  legendColor: RGBArr
}

const RoomPiece = (props: Props) => {
  const {
    legendColor,
    image,
    label,
    palette,
    swPalette,
    swRecommendations
  } = props

  const [imageBg, setImageBg] = useState()
  const { update } = useContext(ColorCollector)

  const handleSetColor = useCallback((color: string) => {
    if (color && color === imageBg) {
      setImageBg()
    } else if (color) {
      setImageBg(color)
      update(color)
    }
  }, [ imageBg ])

  return (
    <>
      {!image ? <Card title={label}><CircleLoader inheritSize /></Card> : (
        <Card title={label} image={image} imageBg={imageBg} titleBg={`rgb(${legendColor.join(',')})`}>
          <Swatches palette={palette} swPalette={swPalette} swRecommendations={swRecommendations} onSetColor={handleSetColor} />
        </Card>
      )}
    </>

  )
}

export default RoomPiece
