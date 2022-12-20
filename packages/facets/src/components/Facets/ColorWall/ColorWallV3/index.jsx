// @flow
import React, { useCallback, useContext } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Prism, { ColorWall } from '@prism/toolkit'
import { fullColorName, generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import ConfigurationContext, {
  type ConfigurationContextType
} from '../../../../contexts/ConfigurationContext/ConfigurationContext'
import useColors from '../../../../shared/hooks/useColors'
import type { ColorsState } from '../../../../shared/types/Actions'
import ColorSwatchContent from '../../../ColorSwatchContent/ColorSwatchContent'
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWall/ColorWallContext'
import { SwatchContent } from './Swatch/Swatch'
import WallRouteReduxConnector from './WallRouteReduxConnector'
import './color-wall-overrides.scss'

const WALL_HEIGHT = 475
function ColorWallV3() {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const [colors, status, shape] = useColors()
  const {
    items: { colorStatuses = {} }
  }: ColorsState = useSelector((state) => state.colors)
  const { colorWallBgColor }: ColorWallContextProps = useContext(ColorWallContext)
  const { addButtonText, displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = useContext(ColorWallContext)

  const {
    colorWall: { bloomEnabled = true, colorSwatch = {} },
    brandKeyNumberSeparator
  }: ConfigurationContextType = useContext(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const { push } = useHistory()
  const { params } = useRouteMatch()
  const { colorId, family, section } = params
  const handleActiveColorId = useCallback(
    (id) => {
      const { brandKey, colorNumber, name } = colors.colorMap[id] || {}
      push(
        generateColorWallPageUrl(
          section,
          family,
          id,
          fullColorName(brandKey, colorNumber, name, brandKeyNumberSeparator)
        )
      )
    },
    [section, family, colors.colorMap]
  )

  const colorWallConfig = {
    bloomEnabled,
    colorWallBgColor
  }

  return (
    <div style={{ height: WALL_HEIGHT }} className={'color-wall-overrides'}>
      <WallRouteReduxConnector>
        {!status.loading && shape ? (
          <Prism>
            <ColorWall
              colorResolver={(id) => colors.colorMap[id]}
              shape={shape.shape}
              key={shape.id}
              height={WALL_HEIGHT}
              swatchBgRenderer={(props) => ColorWall.DefaultSwatchBackgroundRenderer({
                ...props,
                style: {
                  ...props.style,
                  // overrides specifically for HGTV house-shaped swatches in color wall
                  filter: houseShaped ? 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))' : null,
                  boxShadow: houseShaped ? 'none' : null
                },
                overlayRenderer: ({ color, id, active }) => {
                  // flag these when disabled
                  const enabled = colorStatuses[props.id]?.status !== 0

                  // overrides specifically for HGTV house-shaped swatches in color wall
                  if (houseShaped && active) {
                    return <div
                      className={'house-top'}
                      style={{ position: 'absolute', background: color.hex, width: '100%', height: '100%', top: 0, left: 0 }} />
                  }

                  // return color swatch flag if color is not enabled
                  return !enabled ?
                    <ColorSwatch.Dogear /> :
                    null
                }
              })}
              colorWallConfig={colorWallConfig}
              activeSwatchContentRenderer={(props) => {
                const {color, id} = props
                const enabled = colorStatuses[props.id]?.status !== 0
                const message = colorStatuses[id]?.message
                return <>
                  {houseShaped ?
                    <ColorSwatchContent color={color} className={'house-shaped-swatch-positioner'} message={message} /> :
                    <SwatchContent color={color} enabled={enabled} message={message} />
                  }
                </>
              }}
              activeColorId={colorId}
              onActivateColor={handleActiveColorId}
            />
          </Prism>
        ) : null}
      </WallRouteReduxConnector>
    </div>
  )
}
export default ColorWallV3
