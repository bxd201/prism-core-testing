import React, { useContext, useMemo } from 'react'
import ColorSwatch from '../color-swatch/color-swatch'
import { ColorWallPropsContext } from './color-wall-props-context'
import {SwatchInteractiveInternalProps} from "./types"

const SwatchFgRenderer = (internalProps: SwatchInteractiveInternalProps): JSX.Element => {
  const { handleMakeActive, active, className = '', lifted, style, color, activeSwatchContentRenderer, id, overlayRenderer, width, height } = internalProps
  const { chunkClickable } = useContext(ColorWallPropsContext)
  const addlProps = useMemo(() => {
    if (typeof activeSwatchContentRenderer === 'function') {
      return {
        renderer: (props = {}) => activeSwatchContentRenderer({
          color,
          id,
          ...props
        })
      }
    }
    return {}
  }, [activeSwatchContentRenderer, color])

  return <section
    style={style}
    data-test-id='swatch-fg'
    className={`${className} ${color.isDark ? 'text-white' : 'text-black'}`}>

    {/* NOTE: intentionally NOT using ColorSwatch's flagged prop; setting in SwatchBgRenderer instead */}
    <ColorSwatch
      color={color}
      active={active}
      flagged={false}
      transparentBg
      id={id}
      onClick={handleMakeActive}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      className={`${chunkClickable ? '' : 'focus:ring-2 '}!outline-none`}
      {...addlProps} />

    {overlayRenderer?.({
      active,
      color,
      height,
      id,
      lifted,
      width
    }) ?? null}
  </section>
}

export default SwatchFgRenderer
