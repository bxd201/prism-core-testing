import React from 'react'
import dataHgsw from './dataHgsw'
import dataValspar from './dataValspar'
import Wall from './Wall/Wall'

function ColorWallV3 () {
  return <div>
    <button>I AM BEFORE THE WALLS</button>
    <Wall data={dataHgsw} />
    <Wall data={dataValspar} />
    <button>I AM AFTER THE WALLS</button>
  </div>
}

export default ColorWallV3
