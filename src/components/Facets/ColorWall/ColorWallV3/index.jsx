// NOTE
// This is just an example component for how to implement Wall
// Wall does NOT care what family or section is selected.
// Wall ONLY cares about:
// - the structure data to form its shape,
// - a map for mapping IDs to color data
// - current activeColorId
// - a function to call when activating a new color. nothing will happen inside Wall unless
//   this updates activeColorId
// - (optional) height number to constrain the height of the wall; otherwise it will use the height of the data

import React, { useState } from 'react'
import dataHgsw from './dataHgsw'
// import dataValspar from './dataValspar'
import Wall from './Wall/Wall'

function ColorWallV3 () {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const [activeColorId, setActiveColorId] = useState()
  return <div>
    <Wall structure={dataHgsw} activeColorId={activeColorId} onActivateColor={setActiveColorId} />
    {/* <Wall structure={dataValspar} activeColorId={activeColorId} onActivateColor={setActiveColorId} /> */}
  </div>
}

export default ColorWallV3
