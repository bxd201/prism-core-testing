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
// [ ] connect ColorWallV3 to react router for determining section, and for setting active color based on the onActivateColor callback

// @flow
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import Wall from './Wall/Wall'
import dataHgsw from './dataHgsw'

function ColorWallV3 () {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const { items: { wall } }: ColorsState = useSelector(state => state.colors)
  const [activeColorId, setActiveColorId] = useState()

  return <div>
    <Wall structure={wall} activeColorId={activeColorId} onActivateColor={setActiveColorId} />
    <Wall structure={dataHgsw} activeColorId={activeColorId} onActivateColor={setActiveColorId} />
  </div>
}

export default ColorWallV3
