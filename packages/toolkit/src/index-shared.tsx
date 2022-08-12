/* istanbul ignore file */
import React, { CSSProperties } from 'react'

export * from './constants'

export { default as Canvas } from './components/canvas/canvas'
export { default as CircleLoader } from './components/circle-loader/circle-loader'
export { default as ColorPin } from './components/color-pin/color-pin'
export { default as ColorsIcon } from './components/colors-icon/colors-icon'
export { default as ColorSwatch } from './components/color-swatch/color-swatch'
export { default as ImageColorPicker } from './components/image-color-picker/image-color-picker'
export { default as ImageRotator } from './components/image-rotator/image-rotator'
export { default as ImageUploader } from './components/image-uploader/image-uploader'
export { default as Menu } from './components/menu/menu'
export { default as LivePalette } from './components/live-palette/live-palette'
export { default as Select } from './components/select/select'
export { default as Toggle } from './components/toggle/toggle'
export { default as SpinnerLoader } from './components/spinner-loader/spinner-loader'
export { default as GenericOverlay } from './components/generic-overlay/generic-overlay'
export { default as SimpleTintableScene } from './components/simple-tintable-scene/simple-tintable-scene'
// ----- future component exports -----
export { default as ColorStripButton } from './components/color-strip-button/color-strip-button'
export { default as ColorWall } from './components/color-wall/color-wall'
export * from './types'

export interface PrismProps {
  children: JSX.Element
  theme?: CSSProperties
  className?: string
  style?: CSSProperties
  other?: any
}

const Prism = ({ children, theme = {}, className, style, ...other }: PrismProps): JSX.Element => (
  <div className={`${className ?? ''}`} style={{ ...theme, ...style }} {...other}>
    {children}
  </div>
)

export default Prism
