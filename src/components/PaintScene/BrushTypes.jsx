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
const mediumSize = 34
const smallSize = 30
const tinySize = 26

type Props = {
  activeWidth: number,
  activeShape: string,
  setBrushShapeSize: Function
}

export function BrushTypes ({ activeWidth, activeShape, setBrushShapeSize }: Props) {
  return (
    <div className={`${wrapperClass}`}>
      <div className={`${circleShapesContainerClass}`}>
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonLargeClass} ${(activeWidth === largeSize && activeShape === 'round') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('round', largeSize)} />
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonMediumClass} ${(activeWidth === mediumSize && activeShape === 'round') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('round', mediumSize)} />
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonSmallClass} ${(activeWidth === smallSize && activeShape === 'round') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('round', smallSize)} />
        <button className={`${brushButtonClass} ${brushButtonCircleClass} ${brushButtonTinyClass} ${(activeWidth === tinySize && activeShape === 'round') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('round', tinySize)} />
      </div>
      <div className={`${squareShapesContainerClass}`}>
        <button className={`${brushButtonClass} ${brushButtonLargeClass} ${(activeWidth === largeSize && activeShape === 'square') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('square', largeSize)} />
        <button className={`${brushButtonClass} ${brushButtonMediumClass} ${(activeWidth === mediumSize && activeShape === 'square') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('square', mediumSize)} />
        <button className={`${brushButtonClass} ${brushButtonSmallClass} ${(activeWidth === smallSize && activeShape === 'square') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('square', smallSize)} />
        <button className={`${brushButtonClass} ${brushButtonTinyClass} ${(activeWidth === tinySize && activeShape === 'square') ? brushButtonActiveClass : ``}`} onClick={() => setBrushShapeSize('square', tinySize)} />
      </div>
    </div>
  )
}

export default BrushTypes
