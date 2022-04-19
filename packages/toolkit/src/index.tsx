import React, { CSSProperties } from 'react'
import './styles.css'

export { default as Canvas } from './components/canvas/canvas'
export { default as ColorPin } from './components/color-pin/color-pin'
export { default as ColorsIcon } from './components/colors-icon/colors-icon'
export { default as ColorSwatch } from './components/color-swatch/color-swatch'
export { default as ImageColorPicker } from './components/image-color-picker/image-color-picker'
export { default as Menu } from './components/menu/menu'
export { default as Palette } from './components/palette/palette'
export { default as Select } from './components/select/select'
export { default as Toggle } from './components/toggle/toggle'
export { default as CircleLoader } from './components/circle-loader/circle-loader'
export { default as SpinnerLoader } from './components/spinner-loader/spinner-loader'
// ----- future component exports -----
export { default as ColorStripButton } from './components/color-strip-button/color-strip-button'
export { default as ColorWall } from './components/color-wall/color-wall'

interface PrismProps {
  children: JSX.Element
  theme?: CSSProperties
  className?: string
  style?: CSSProperties
  other?: any
}

const Prism = ({ children, theme = {}, className, style, ...other }: PrismProps): JSX.Element => {
  const themeVariablesOverrided = Object.entries(theme)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ')
  themeVariablesOverrided.length > 0 && console.log('prism theme variables overrided:', themeVariablesOverrided)
  return (
      <div className={`prism ${className ?? ''}`} style={{ ...theme, ...style }} {...other}>
        {children}
      </div>
  )
}

export default Prism
