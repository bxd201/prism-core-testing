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
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWall/ColorWallContext'
import { Swatch } from './Swatch/Swatch'
import WallRouteReduxConnector from './WallRouteReduxConnector'

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
  const {
    colorWall: { bloomEnabled = true },
    brandKeyNumberSeparator
  }: ConfigurationContextType = useContext(ConfigurationContext)
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
  const swatchRenderer = (internalProps): JSX.Element => {
    const { id, onRefMount } = internalProps
    const color = colors.colorMap[id]
    return (
      <Swatch
        {...internalProps}
        key={id}
        enabled={colorStatuses[id]?.status !== 0}
        message={colorStatuses[id]?.message}
        aria-label={color?.name}
        color={color}
        ref={onRefMount}
      />
    )
  }
  const colorWallConfig = {
    bloomEnabled,
    colorWallBgColor
  }
  return (
    <div style={{ height: WALL_HEIGHT }}>
      <WallRouteReduxConnector>
        {!status.loading && shape ? (
          <Prism>
            <ColorWall
              shape={shape.shape}
              height={WALL_HEIGHT}
              key={shape.id}
              colorWallConfig={colorWallConfig}
              swatchRenderer={swatchRenderer}
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
