// @flow
import React from 'react'
import './BrushTypes.scss'

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

const largeSize = 38
const mediumSize = 30
const smallSize = 22
const tinySize = 14

const roundShape = 'round'
const squareShape = 'square'

type Props = {
  activeWidth: number,
  activeShape: string,
  setBrushShapeSize: Function
}

export function BrushTypes ({ activeWidth, activeShape, setBrushShapeSize }: Props) {
  return (
    <div className={`${wrapperClass}`}>
      <div className={`${circleShapesContainerClass}`}>
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonLargeClass} ${(activeWidth === largeSize && activeShape === roundShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(roundShape, largeSize)} />
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonMediumClass} ${(activeWidth === mediumSize && activeShape === roundShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(roundShape, mediumSize)} />
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonSmallClass} ${(activeWidth === smallSize && activeShape === roundShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(roundShape, smallSize)} />
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonTinyClass} ${(activeWidth === tinySize && activeShape === roundShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(roundShape, tinySize)} />
      </div>
      <div className={`${squareShapesContainerClass}`}>
        <button className={`${brushButtonClass} ${brushButtonLargeClass} ${(activeWidth === largeSize && activeShape === squareShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(squareShape, largeSize)} />
        <button className={`${brushButtonClass} ${brushButtonMediumClass} ${(activeWidth === mediumSize && activeShape === squareShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(squareShape, mediumSize)} />
        <button className={`${brushButtonClass} ${brushButtonSmallClass} ${(activeWidth === smallSize && activeShape === squareShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(squareShape, smallSize)} />
        <button className={`${brushButtonClass} ${brushButtonTinyClass} ${(activeWidth === tinySize && activeShape === squareShape) ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize(squareShape, tinySize)} />
      </div>
    </div>
  )
}

export default BrushTypes
