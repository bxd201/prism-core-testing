// @flow
import React, { useCallback, useContext } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Prism, { ColorSwatch, ColorWall } from '@prism/toolkit'
import { fullColorName, generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import { GA_TRACKER_NAME_BRAND } from '../../../../constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from '../../../../contexts/ConfigurationContext/ConfigurationContext'
import useColors from '../../../../shared/hooks/useColors'
import type { ColorsState } from '../../../../shared/types/Actions'
import ColorSwatchContent from '../../../ColorSwatchContent/ColorSwatchContent'
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWall/ColorWallContext'
import ColorChipLocator from '../ColorChipLocator/ColorChipLocator.jsx'
import minimapDict from '../minimap-dict'
import { SwatchContent } from './Swatch/Swatch'
import WallRouteReduxConnector from './WallRouteReduxConnector'
import './color-wall-overrides.scss'

const WALL_HEIGHT = 475
function ColorWallV3() {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const [colors, group, status, shape] = useColors()
  const {
    items: { colorStatuses = {} }
  }: ColorsState = useSelector((state) => state.colors)
  const {
    addButtonText,
    autoHeight,
    chunkClickable,
    colorDetailPageRoot,
    colorWallBgColor,
    displayAddButton,
    displayInfoButton,
    displayDetailsLink,
    isChipLocator,
    leftHandDisplay
  }: ColorWallContextProps = useContext(ColorWallContext)
  const {
    brandId,
    brandKeyNumberSeparator,
    colorWall: { bloomEnabled = true, colorSwatch = {}, minWallSize }
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
    colorWallBgColor,
    forceWrap: isChipLocator || undefined,
    minWallSize,
    titleImage: minimapDict[`${brandId}${leftHandDisplay ? 'LeftHand' : ''}`]?.[section]
  }

  const selectedColor = colors.colorMap[colorId || '']

  return (
    <div style={{ height: autoHeight ? 'auto' : WALL_HEIGHT }} className={'color-wall-overrides'}>
      <WallRouteReduxConnector>
        {!status.loading && shape ? (
          <Prism>
            <ColorWall
              colorResolver={(id) => colors.colorMap[id]}
              shape={shape.shape}
              key={shape.id}
              height={autoHeight ? 'auto' : WALL_HEIGHT}
              swatchBgRenderer={(props) =>
                ColorWall.DefaultSwatchBackgroundRenderer({
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
                      return (
                        <div
                          className={'house-top'}
                          style={{
                            position: 'absolute',
                            background: color.hex,
                            width: '100%',
                            height: '100%',
                            top: 0,
                            left: 0
                          }}
                        />
                      )
                    }

                    // return color swatch flag if color is not enabled
                    return !enabled ? <ColorSwatch.Dogear /> : null
                  }
                })
              }
              chunkClickable={
                chunkClickable &&
                group.prime &&
                ((chunkId) => {
                  const section = shape.shape.children
                    .filter((col, i) => i === +chunkId.split('_')[0])[0]
                    .children.filter((chunk, i) => i === +chunkId.split('_')[1])[0].name
                  push(generateColorWallPageUrl(section))
                  GA.event(
                    { category: 'Color Wall', action: 'Color Chunk', label: section },
                    GA_TRACKER_NAME_BRAND[brandId]
                  )
                })
              }
              colorWallConfig={colorWallConfig}
              activeSwatchContentRenderer={(props) => {
                const { color, id } = props
                const enabled = colorStatuses[props.id]?.status !== 0
                const message = colorStatuses[id]?.message
                return (
                  <>
                    {houseShaped ? (
                      <ColorSwatchContent
                        color={color}
                        className={'house-shaped-swatch-positioner'}
                        message={message}
                      />
                    ) : (
                      <SwatchContent color={color} enabled={enabled} message={message} />
                    )}
                  </>
                )
              }}
              activeColorId={colorId}
              onActivateColor={handleActiveColorId}
            />
          </Prism>
        ) : null}
        {isChipLocator && selectedColor && (
          <ColorChipLocator color={selectedColor} onActivateColor={handleActiveColorId} />
        )}
      </WallRouteReduxConnector>
    </div>
  )
}
export default ColorWallV3
