import React, { useContext } from 'react'
import { ColorWallPropsContext } from './color-wall-props-context';
import { SwatchInternalProps } from "./types";

const SwatchBgRenderer = (internalProps: SwatchInternalProps): JSX.Element => {
  const { className = '', color, lifted, overlayRenderer, id, active, style = {}, width, height } = internalProps
  const { chunkClickable } = useContext(ColorWallPropsContext)

  return <div
    data-test-id='swatch-bg'
    className={`${className} ${lifted ? 'shadow-[0_0_2px_0_rgba(0,0,0,0.25)]' : ''}`}
    style={{ background: color.hex, ...style }}>

    <div className={`absolute inset-0 border ${chunkClickable ? 'border-0.4 sm:border' : ''} border-white`}></div>

    {overlayRenderer?.({
      active,
      color,
      height,
      id,
      lifted,
      width
    }) ?? null}
  </div>
}

export default SwatchBgRenderer