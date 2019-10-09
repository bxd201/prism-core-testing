// @flow
import React from 'react'
import './ZoomTool.scss'

const baseClass = 'zoom-tool'
const wrapperClass = `${baseClass}__wrapper`
const inputRangeClass = `${baseClass}__input-range`

type Props = {
  applyZoom: Function,
  zoomRange: number
}
export function ZoomTool ({ applyZoom, zoomRange }: Props) {
  const [zoomFactor, setZoomFactor] = React.useState(zoomRange)

  function changeHandler (e: Object) {
    const { target: { value } } = e
    setZoomFactor(value)
    applyZoom(value)
  }

  return (
    <div className={`${wrapperClass}`}>
      <input className={`${inputRangeClass}`} type='range' value={zoomFactor} min='0' max='9' step='1' onChange={changeHandler} />
    </div>
  )
}

export default ZoomTool
