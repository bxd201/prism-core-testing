// @flow
import React from 'react'
import './BrushTypes.scss'
import { brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize, brushRoundShape, brushSquareShape, brushTypes } from './data'

const baseClass = 'brush-types'
const wrapperClass = `${baseClass}__wrapper`
const circleShapesContainerClass = `${baseClass}__circle-shapes-container`
const squareShapesContainerClass = `${baseClass}__square-shapes-container`
const brushButtonClass = `${baseClass}__brush-button`
const brushButtonCircleClass = `${brushButtonClass}--circle`
const brushButtonLargeClass = `${brushButtonClass}--large`
const brushButtonMediumClass = `${brushButtonClass}--medium`
const brushButtonSmallClass = `${brushButtonClass}--small`
const brushButtonTinyClass = `${brushButtonClass}--tiny`
const brushButtonActiveClass = `${brushButtonClass}--active`

type Props = {
  activeWidth: number,
  activeShape: string,
  setBrushShapeSize: Function
}

export function BrushTypes ({ activeWidth, activeShape, setBrushShapeSize }: Props) {
  const getBrushTypes = (brushShape: string, activeWidth: number, activeShape: string) => {
    return (
      brushTypes.map((brushType: number) => {
        let brushClass = `${brushButtonClass}`

        if (brushShape === brushRoundShape) {
          brushClass += ` ${brushButtonCircleClass}`
        }

        if (brushType === brushLargeSize) {
          brushClass += ` ${brushButtonLargeClass}`
        } else if (brushType === brushMediumSize) {
          brushClass += ` ${brushButtonMediumClass}`
        } else if (brushType === brushSmallSize) {
          brushClass += ` ${brushButtonSmallClass}`
        } else if (brushType === brushTinySize) {
          brushClass += ` ${brushButtonTinyClass}`
        }

        if ((activeWidth === brushType && activeShape === brushShape)) {
          brushClass += ` ${brushButtonActiveClass}`
        }

        return <button key={`${brushShape}-${brushType}`} className={`${brushClass}`} onClick={() => setBrushShapeSize(brushShape, brushType)} />
      })
    )
  }

  return (
    <div className={`${wrapperClass}`}>
      <div className={`${circleShapesContainerClass}`}>
        {getBrushTypes(brushRoundShape, activeWidth, activeShape)}
      </div>
      <div className={`${squareShapesContainerClass}`}>
        {getBrushTypes(brushSquareShape, activeWidth, activeShape)}
      </div>
    </div>
  )
}

export default BrushTypes
