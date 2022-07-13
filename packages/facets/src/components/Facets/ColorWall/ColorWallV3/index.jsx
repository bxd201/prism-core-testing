// NOTE
// Wall does NOT care what family or section is selected.
// Wall ONLY cares about:
// - the structure data to form its shape,
// - a map for mapping IDs to color data
// - current activeColorId
// - a function to call when activating a new color. nothing will happen inside Wall unless
//   this updates activeColorId
// - (optional) height number to constrain the height of the wall; otherwise it will use the height of the data

// TODO
// [x] Connect ColorWallV3 to redux for color data, which should be passed into Wall as a new colormap prop
// [x] Connect to new redux for new structure API data for structuring the wall, to be passed into Wall as structure prop
//     (see dataHgsw.js and dataValspar.js for how that data shape should look)
// [x] connect ColorWallV3 to react router for determining section, and for setting active color based on the onActivateColor callback

// @flow
import React, { useCallback } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Wall from './Wall/Wall'
import { fullColorName, generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import WallRouteReduxConnector from './WallRouteReduxConnector'
import useColors from '../../../../shared/hooks/useColors'

const WALL_HEIGHT = 475

function ColorWallV3 () {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const [colors, status, shape] = useColors()
  const { push } = useHistory()
  const { params } = useRouteMatch()
  const { colorId, family, section } = params

  const handleActiveColorId = useCallback((id) => {
    const { brandKey, colorNumber, name } = colors.colorMap[id] || {}
    push(generateColorWallPageUrl(section, family, id, fullColorName(brandKey, colorNumber, name)))
  }, [section, family, colors.colorMap])

  return (
    <div style={{ height: WALL_HEIGHT }}>
      <WallRouteReduxConnector>
        {!status.loading && shape ? <Wall structure={shape.shape} height={WALL_HEIGHT} key={shape.id} activeColorId={colorId} onActivateColor={handleActiveColorId} /> : null}
      </WallRouteReduxConnector>
    </div>
  )
}

export default ColorWallV3
