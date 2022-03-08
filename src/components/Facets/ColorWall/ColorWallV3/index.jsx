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
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import Wall from './Wall/Wall'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import { fullColorName, generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import { ROUTES_ENUM } from '../../ColorVisualizerWrapper/routeValueCollections'

function ColorWallV3 () {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const { items: { colorMap, wall } } = useSelector<ColorsState>(state => state.colors)
  const { push } = useHistory()
  const { params } = useRouteMatch()
  const { colorId, family, section } = params
  const [activeColorId, setActiveColorId] = useState()
  const [structure, setStructure] = useState([])

  useEffect(() => {
    const familyStructure = wall.filter(structure => structure.type.toLowerCase() === family)
    setStructure(familyStructure.length > 0 ? familyStructure : wall.filter(structure => structure.type === 'WALL'))
    setActiveColorId()
  }, [family])

  useEffect(() => {
    colorId && setTimeout(() => {
      setActiveColorId(+colorId)
    }, 100)
  }, [])

  useEffect(() => {
    const { brandKey, colorNumber, name } = colorMap[activeColorId] || {}
    colorNumber && push(generateColorWallPageUrl(section, family, activeColorId, fullColorName(brandKey, colorNumber, name)))
  }, [activeColorId])

  const WallComponent = () => <Wall structure={structure[0]} activeColorId={activeColorId} onActivateColor={setActiveColorId} />

  return (
    <>
      <Switch>
        <Route exact path={ROUTES_ENUM.COLOR_WALL + '/section/:section'} render={WallComponent} />
        <Route exact path={ROUTES_ENUM.COLOR_WALL + '/section/:section/color/:color/:colorName'} render={WallComponent} />
      </Switch>
      <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/family/:family'} render={WallComponent} />
    </>
  )
}

export default ColorWallV3
