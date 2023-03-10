// @flow
import React, { useCallback, useContext,useState } from 'react'
import { useIntl } from 'react-intl'
import { type Color,type RGBArr } from 'src/shared/types/Colors.js.flow'
import { CircleLoader } from '../../ToolkitComponents'
import Card from './Card'
import ColorMatches from './ColorMatches'
import { ColorCollector } from './RoomTypeDetector'
import Swatch from './Swatch'
import SWMatchSwatch from './SWMatchSwatch'
import './RoomPiece.scss'

type Props = {
  label: string,
  image: string,
  palette: RGBArr[],
  swPalette: (Color[] | typeof undefined)[],
  swRecommendations: Color[],
  suggestedColors?: Color[],
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
  const { formatMessage } = useIntl()

  const handleSetColor = useCallback((color: string) => {
    if (color && color === imageBg) {
      setImageBg()
    } else if (color) {
      setImageBg(color)
      update(color)
    }
  }, [imageBg])

  return (
    <>
      {!image
        ? <Card title={label}><CircleLoader inheritSize /></Card>
        : (
        <Card title={label} image={image} imageBg={imageBg} titleBg={`rgb(${legendColor.join(',')})`}>
          {swRecommendations && swRecommendations.length
            ? (
            <ColorMatches title={`SW ${formatMessage({ id: 'RECOMMENDATIONS' })}`}>
              {swRecommendations.map((color: Color, i) => {
                return <Swatch key={i} color={color.hex} name={color.name} onClick={() => handleSetColor(color.hex)} />
              })}
            </ColorMatches>
              )
            : null}
          {suggestedColors && suggestedColors.length
            ? (
            <ColorMatches title={`SW ${formatMessage({ id: 'RECOMMENDATIONS' })}`}>
              {suggestedColors.map((color: Color, i) => {
                return <Swatch key={i} color={color.hex} name={color.name} onClick={() => handleSetColor(color)} />
              })}
            </ColorMatches>
              )
            : null}
          {palette && palette.length
            ? (
            <ColorMatches title={`SW ${formatMessage({ id: 'IDENTIFIED_COLORS' })} , SW ${formatMessage({ id: 'MATCHES' })}`}>
              {palette.map((color, i) => {
                return <SWMatchSwatch key={i} color={color} swPalette={swPalette[i]} />
              })}
            </ColorMatches>
              )
            : null}
        </Card>
          )}
    </>

  )
}

export default RoomPiece
