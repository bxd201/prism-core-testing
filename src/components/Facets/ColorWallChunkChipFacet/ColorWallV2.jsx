// @flow
import React, { useState } from 'react'
import noop from 'lodash/noop'
import AutoSizer from 'react-virtualized-auto-sizer'
import WallRenderer from './WallRenderer'

import './ColorWallV2.scss'

type ColorWallV2Props = {
  onChunkClicked?: Function
}

function ColorWallV2 ({ onChunkClicked }: ColorWallV2Props) {
  const [w, setW] = useState(0)

  return <div>
    <article style={{ width: '100%' }}>
      <AutoSizer style={{ width: '100%' }} onResize={dims => setW(dims.width)}>{noop}</AutoSizer>
      {w > 0 ? <WallRenderer maxWidth={w} onChunkClicked={onChunkClicked} /> : null}
    </article>
  </div>
}

export default ColorWallV2
