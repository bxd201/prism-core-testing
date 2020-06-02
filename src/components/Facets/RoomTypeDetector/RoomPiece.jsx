// @flow
import React, { useState, useCallback, useContext } from 'react'

import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'
import ColorMatches from './ColorMatches'
import Card from './Card'
import SWMatchSwatch from './SWMatchSwatch'
import Swatch from './Swatch'
import { ColorCollector } from './RoomTypeDetector'
import { type RGBArr, type Color } from 'src/shared/types/Colors.js.flow'

import './RoomPiece.scss'

type Props = {
  label: string,
  image: string,
  palette: RGBArr[],
  swPalette: (Color[] | typeof undefined)[],
  swRecommendations: Color[],
  suggestedColors?: string[],
  legendColor: RGBArr
}

const RoomPiece = (props: Props) => {
  const {
    legendColor,
    image,
    label,
    palette,
    swPalette,
    swRecommendations,
    suggestedColors
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
          {swRecommendations && swRecommendations.length ? (
            <ColorMatches title='SW Recommendations'>
              {swRecommendations.map((color: Color, i) => {
                return <Swatch key={i} color={color.hex} name={color.name} onClick={() => handleSetColor(color.hex)} />
              })}
            </ColorMatches>
          ) : null}
          {suggestedColors && suggestedColors.length ? (
            <ColorMatches title='Recommendations'>
              {suggestedColors.map((color: string, i) => {
                return <Swatch key={i} color={color} name={color} onClick={() => handleSetColor(color)} />
              })}
            </ColorMatches>
          ) : null}
          {palette && palette.length ? (
            <ColorMatches title='Identified Colors, SW Matches'>
              {palette.map((color, i) => {
                return <SWMatchSwatch key={i} color={color} swPalette={swPalette[i]} />
              })}
            </ColorMatches>
          ) : null}
        </Card>
      )}
    </>

  )
}

export default RoomPiece
